import { createClient } from '@/lib/supabase';
import type { AppNotification } from '@/types/collaboration.types';

export async function getMyNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.warn('Error loading notifications:', error);
    return [];
  }
  return data || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
}
