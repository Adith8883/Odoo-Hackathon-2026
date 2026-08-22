import { createClient } from '@/lib/supabase';
import type { Meeting, RsvpStatus } from '@/types/collaboration.types';
import { sendEmailNotification } from './email.service';

export async function getMeetings(userId: string): Promise<Meeting[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      creator:profiles!meetings_created_by_fkey(*),
      meeting_participants(*, profiles(*))
    `)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.warn('Error fetching meetings:', error);
    return [];
  }

  return (data || []).map((m: any) => {
    const userPart = (m.meeting_participants || []).find((p: any) => p.user_id === userId);
    return {
      ...m,
      creator: m.creator,
      participants: m.meeting_participants,
      user_rsvp: userPart?.status || (m.created_by === userId ? 'accepted' : 'pending'),
    };
  });
}

export async function scheduleMeeting(
  meetingData: {
    title: string;
    description?: string;
    date: string;
    start_time: string;
    end_time: string;
    location?: string;
    meeting_link?: string;
    created_by: string;
  },
  participantIds: string[]
) {
  const supabase = createClient();

  const { data: newMeeting, error: meetError } = await supabase
    .from('meetings')
    .insert([
      {
        title: meetingData.title,
        description: meetingData.description || null,
        date: meetingData.date,
        start_time: meetingData.start_time,
        end_time: meetingData.end_time,
        location: meetingData.location || null,
        meeting_link: meetingData.meeting_link || null,
        created_by: meetingData.created_by,
        status: 'scheduled',
      },
    ])
    .select()
    .single();

  if (meetError) throw new Error(meetError.message);

  // Add creator as accepted participant
  const allParticipantIds = Array.from(new Set([meetingData.created_by, ...participantIds]));

  const participantRows = allParticipantIds.map((uid) => ({
    meeting_id: newMeeting.id,
    user_id: uid,
    status: uid === meetingData.created_by ? ('accepted' as const) : ('pending' as const),
  }));

  await supabase.from('meeting_participants').insert(participantRows);

  // Send in-app notifications to invited participants
  const notifications = participantIds
    .filter((uid) => uid !== meetingData.created_by)
    .map((uid) => ({
      user_id: uid,
      title: '📅 New Meeting Invitation',
      content: `You've been invited to "${meetingData.title}" on ${meetingData.date} at ${meetingData.start_time}.`,
      type: 'meeting' as const,
      link: '/employee/meetings',
    }));

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications);
  }

  // Fetch participant email addresses and dispatch email invitation
  try {
    const { data: inviteeProfiles } = await supabase
      .from('profiles')
      .select('email, full_name')
      .in('id', participantIds);

    const inviteeEmails = (inviteeProfiles || [])
      .map((p) => p.email)
      .filter((e): e is string => !!e);

    if (inviteeEmails.length > 0) {
      await sendEmailNotification({
        to: inviteeEmails,
        subject: `📅 Meeting Invitation: "${meetingData.title}" (${meetingData.date})`,
        template: 'meeting_invite',
        recipientName: 'Team Member',
        data: {
          title: meetingData.title,
          description: meetingData.description,
          date: meetingData.date,
          startTime: meetingData.start_time,
          endTime: meetingData.end_time,
          location: meetingData.location,
          meetingLink: meetingData.meeting_link,
        },
      });
    }
  } catch (emailErr) {
    console.warn('Failed to send meeting invite email:', emailErr);
  }

  return newMeeting;
}

export async function updateRsvp(meetingId: string, userId: string, status: RsvpStatus) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('meeting_participants')
    .upsert(
      {
        meeting_id: meetingId,
        user_id: userId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'meeting_id,user_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function cancelMeeting(meetingId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('meetings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
