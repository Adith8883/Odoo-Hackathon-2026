'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEmployee } from '@/hooks/useEmployee';
import { useAttendance } from '@/hooks/useAttendance';
import { TodayAttendance } from '@/components/employee/TodayAttendance';
import { AttendanceTimeline } from '@/components/employee/AttendanceTimeline';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendancePage() {
  useAuth();

  const { employee, isLoading: isEmpLoading } = useEmployee();
  const {
    todayAttendance,
    attendanceHistory,
    isLoading: isAttLoading,
    checkIn,
    checkOut,
  } = useAttendance(employee?.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Attendance & Shifts
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your daily check-ins, check-outs, and attendance history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's card — 2 cols on large screens */}
        <div className="lg:col-span-2">
          {isEmpLoading && !employee ? (
            <Skeleton className="h-52 rounded-xl" />
          ) : (
            <TodayAttendance
              todayRecord={todayAttendance}
              isLoading={isAttLoading}
              onCheckIn={checkIn}
              onCheckOut={checkOut}
            />
          )}
        </div>

        {/* History — 3 cols on large screens */}
        <div className="lg:col-span-3">
          <AttendanceTimeline
            records={attendanceHistory}
            isLoading={isAttLoading}
          />
        </div>
      </div>
    </div>
  );
}
