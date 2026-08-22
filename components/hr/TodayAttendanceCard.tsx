'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle2, UserX, Calendar } from 'lucide-react';

interface TodayAttendanceCardProps {
  present: number;
  absent: number;
  onLeave: number;
  total: number;
}

export function TodayAttendanceCard({
  present,
  absent,
  onLeave,
  total,
}: TodayAttendanceCardProps) {
  const safeTotal = total > 0 ? total : 1;
  const presentPercent = Math.round((present / safeTotal) * 100);
  const absentPercent = Math.round((absent / safeTotal) * 100);
  const onLeavePercent = Math.round((onLeave / safeTotal) * 100);

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Today's Attendance Overview
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
            {present} of {total} Present
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* Present Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Present
            </span>
            <span className="font-mono text-muted-foreground">
              {present} ({presentPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${presentPercent}%` }}
            />
          </div>
        </div>

        {/* On Leave Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              On Leave
            </span>
            <span className="font-mono text-muted-foreground">
              {onLeave} ({onLeavePercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${onLeavePercent}%` }}
            />
          </div>
        </div>

        {/* Absent Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <UserX className="w-3.5 h-3.5 text-amber-500" />
              Absent / Unmarked
            </span>
            <span className="font-mono text-muted-foreground">
              {absent} ({absentPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${absentPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
