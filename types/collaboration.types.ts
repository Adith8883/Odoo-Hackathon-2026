export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type ConversationType = 'direct' | 'group' | 'announcement';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string | null;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message | null;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  last_read_at: string;
  joined_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  is_announcement?: boolean;
  created_at: string;
  sender?: Profile;
}

export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  meeting_link?: string | null;
  created_by: string;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  participants?: MeetingParticipant[];
  user_rsvp?: RsvpStatus;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  status: RsvpStatus;
  updated_at: string;
  profile?: Profile;
}

export type NotificationType = 'message' | 'meeting' | 'group' | 'announcement' | 'leave';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: NotificationType;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}
