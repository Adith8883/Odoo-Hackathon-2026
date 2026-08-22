'use client';

import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/hooks/useAuth';
import { MeetingList } from '@/components/collaboration/MeetingList';
import { ScheduleMeetingDialog } from '@/components/collaboration/ScheduleMeetingDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

export default function HRMeetingsPage() {
  const { user } = useAuth();
  const { meetings, isLoading, scheduleMeeting, updateRsvp, cancelMeeting } = useMeetings();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Meetings</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Schedule company meetings, 1-on-1s, team syncs, and manage RSVPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ScheduleMeetingDialog onSchedule={scheduleMeeting} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <MeetingList
          meetings={meetings}
          isLoading={isLoading}
          onRsvp={updateRsvp}
          onCancel={cancelMeeting}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}
