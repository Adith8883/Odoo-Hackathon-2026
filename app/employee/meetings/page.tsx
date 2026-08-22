'use client';

import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/hooks/useAuth';
import { MeetingList } from '@/components/collaboration/MeetingList';
import { ScheduleMeetingDialog } from '@/components/collaboration/ScheduleMeetingDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

export default function EmployeeMeetingsPage() {
  const { user } = useAuth();
  const {
    meetings,
    isLoading,
    scheduleMeeting,
    updateRsvp,
    cancelMeeting,
  } = useMeetings();

  if (isLoading && meetings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>

        {/* Tabs & List Skeletons */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Title and Schedule Dialog */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Meetings & Schedules
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay aligned with your team. Review upcoming sessions, update your RSVP, and schedule new meetings.
          </p>
        </div>

        <ScheduleMeetingDialog onSchedule={scheduleMeeting} />
      </div>

      {/* Meeting List Component */}
      <MeetingList
        meetings={meetings}
        isLoading={isLoading}
        onRsvp={updateRsvp}
        onCancel={cancelMeeting}
        currentUserId={user?.id}
      />
    </div>
  );
}
