'use client';
import { useEffect } from 'react';
import { subscribeToTable, unsubscribe } from '@/lib/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeLeave(onUpdate: () => void, filter?: string) {
  useEffect(() => {
    let channel: RealtimeChannel;
    channel = subscribeToTable('leave_requests', filter, (payload) => {
      onUpdate();
    });
    return () => {
      if (channel) unsubscribe(channel);
    };
  }, [onUpdate, filter]);
}
