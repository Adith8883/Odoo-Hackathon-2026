import { createClient } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

let channelCounter = 0;

export function subscribeToTable(
  table: string,
  filter: string | undefined,
  callback: (payload: any) => void
): RealtimeChannel {
  channelCounter++;
  const supabase = createClient();
  const channelName = `${table}-changes-${channelCounter}-${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      },
      callback
    )
    .subscribe();
  return channel;
}

export function unsubscribe(channel: RealtimeChannel) {
  const supabase = createClient();
  supabase.removeChannel(channel);
}
