'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getMeetings,
  scheduleMeeting as scheduleService,
  updateRsvp as updateRsvpService,
  cancelMeeting as cancelService,
} from '@/services/meeting.service';
import type { Meeting, RsvpStatus } from '@/types/collaboration.types';
import { subscribeToTable, unsubscribe } from '@/lib/realtime';

export function useMeetings() {
  const { user } = useAuth();
  const userId = user?.id;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getMeetings(userId);
      setMeetings(data);
    } catch (err) {
      console.warn('Failed to load meetings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Realtime subscription for meetings and RSVPs
  useEffect(() => {
    if (!userId) return;

    const channel1 = subscribeToTable('meetings', undefined, () => {
      fetchMeetings();
    });

    const channel2 = subscribeToTable('meeting_participants', undefined, () => {
      fetchMeetings();
    });

    return () => {
      unsubscribe(channel1);
      unsubscribe(channel2);
    };
  }, [userId, fetchMeetings]);

  const scheduleMeeting = async (
    meetingData: {
      title: string;
      description?: string;
      date: string;
      start_time: string;
      end_time: string;
      location?: string;
      meeting_link?: string;
    },
    participantIds: string[]
  ) => {
    if (!userId) throw new Error('User not authenticated.');
    const newMeeting = await scheduleService(
      {
        ...meetingData,
        created_by: userId,
      },
      participantIds
    );
    await fetchMeetings();
    return newMeeting;
  };

  const updateRsvp = async (meetingId: string, status: RsvpStatus) => {
    if (!userId) return;
    await updateRsvpService(meetingId, userId, status);
    await fetchMeetings();
  };

  const cancelMeeting = async (meetingId: string) => {
    await cancelService(meetingId);
    await fetchMeetings();
  };

  return {
    meetings,
    isLoading,
    scheduleMeeting,
    updateRsvp,
    cancelMeeting,
    refreshMeetings: fetchMeetings,
  };
}
