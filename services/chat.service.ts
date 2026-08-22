import { createClient } from '@/lib/supabase';
import type { Conversation, Message } from '@/types/collaboration.types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();

  // Fetch conversations user participates in or announcements
  const { data: participants, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (partError) {
    console.warn('Error fetching participant conversations:', partError);
    return [];
  }

  const convIds = (participants || []).map((p) => p.conversation_id);

  let query = supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants(*, profiles(*)),
      messages(*)
    `)
    .order('updated_at', { ascending: false });

  if (convIds.length > 0) {
    query = query.or(`id.in.(${convIds.join(',')}),type.eq.announcement`);
  } else {
    query = query.eq('type', 'announcement');
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Error fetching conversations:', error);
    return [];
  }

  return (data || []).map((conv: any) => {
    const userPart = (participants || []).find((p) => p.conversation_id === conv.id);
    const lastReadAt = userPart?.last_read_at ? new Date(userPart.last_read_at).getTime() : 0;

    const sortedMsgs = (conv.messages || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sortedMsgs[0] || null;

    // Count unread
    const unreadCount = (conv.messages || []).filter(
      (m: any) => m.sender_id !== userId && new Date(m.created_at).getTime() > lastReadAt
    ).length;

    return {
      ...conv,
      participants: conv.conversation_participants,
      last_message: lastMessage,
      unread_count: unreadCount,
    };
  });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map((m: any) => ({
    ...m,
    sender: m.profiles,
  }));
}

export async function sendMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  isAnnouncement?: boolean;
}) {
  const supabase = createClient();
  const { data: newMsg, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: data.conversationId,
        sender_id: data.senderId,
        content: data.content,
        file_url: data.fileUrl || null,
        file_name: data.fileName || null,
        file_type: data.fileType || null,
        file_size: data.fileSize || null,
        is_announcement: data.isAnnouncement || false,
      },
    ])
    .select('*, profiles(*)')
    .single();

  if (error) throw new Error(error.message);

  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', data.conversationId);

  // Update sender last_read_at
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', data.conversationId)
    .eq('user_id', data.senderId);

  return {
    ...newMsg,
    sender: newMsg.profiles,
  };
}

export async function createDirectConversation(currentUserId: string, targetUserId: string) {
  const supabase = createClient();

  // Check if a direct conversation already exists between both users
  const { data: myConvs } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations(type)')
    .eq('user_id', currentUserId);

  const directConvIds = (myConvs || [])
    .filter((c: any) => c.conversations?.type === 'direct')
    .map((c: any) => c.conversation_id);

  if (directConvIds.length > 0) {
    const { data: sharedPart } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', targetUserId)
      .in('conversation_id', directConvIds)
      .maybeSingle();

    if (sharedPart?.conversation_id) {
      return sharedPart.conversation_id;
    }
  }

  // Create new direct conversation
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert([{ type: 'direct', created_by: currentUserId }])
    .select()
    .single();

  if (convError) throw new Error(convError.message);

  // Add participants
  await supabase.from('conversation_participants').insert([
    { conversation_id: newConv.id, user_id: currentUserId, role: 'member' },
    { conversation_id: newConv.id, user_id: targetUserId, role: 'member' },
  ]);

  return newConv.id;
}

export async function createGroupConversation(
  name: string,
  description: string,
  creatorId: string,
  memberIds: string[]
) {
  const supabase = createClient();

  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert([
      {
        type: 'group',
        name,
        description,
        created_by: creatorId,
      },
    ])
    .select()
    .single();

  if (convError) throw new Error(convError.message);

  // Combine unique member IDs including creator
  const allMembers = Array.from(new Set([creatorId, ...memberIds]));

  const participantRows = allMembers.map((userId) => ({
    conversation_id: newConv.id,
    user_id: userId,
    role: userId === creatorId ? ('admin' as const) : ('member' as const),
  }));

  await supabase.from('conversation_participants').insert(participantRows);

  // Create notification for invited members
  const notifications = memberIds
    .filter((uid) => uid !== creatorId)
    .map((uid) => ({
      user_id: uid,
      title: 'Added to Project Group',
      content: `You were added to the group "${name}".`,
      type: 'group' as const,
      link: '/employee/groups',
    }));

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications);
  }

  return newConv;
}

export async function createAnnouncement(
  title: string,
  content: string,
  authorId: string,
  fileUrl?: string
) {
  const supabase = createClient();

  // Find or create global announcements conversation
  let { data: annConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('type', 'announcement')
    .maybeSingle();

  if (!annConv) {
    const { data: created } = await supabase
      .from('conversations')
      .insert([{ type: 'announcement', name: 'Company Announcements', created_by: authorId }])
      .select()
      .single();
    annConv = created;
  }

  if (!annConv) throw new Error('Failed to create announcement channel.');

  // Post message in announcement
  const { data: msg, error: msgError } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: annConv.id,
        sender_id: authorId,
        content: `**${title}**\n\n${content}`,
        file_url: fileUrl || null,
        is_announcement: true,
      },
    ])
    .select('*, profiles(*)')
    .single();

  if (msgError) throw new Error(msgError.message);

  // Broadcast notification to all active profiles
  const { data: allProfiles } = await supabase.from('profiles').select('id');
  if (allProfiles && allProfiles.length > 0) {
    const notifications = allProfiles.map((p) => ({
      user_id: p.id,
      title: '📢 Company Announcement',
      content: title,
      type: 'announcement' as const,
      link: '/hr/announcements',
    }));
    await supabase.from('notifications').insert(notifications);
  }

  return msg;
}

export async function markConversationAsRead(conversationId: string, userId: string) {
  const supabase = createClient();
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}
