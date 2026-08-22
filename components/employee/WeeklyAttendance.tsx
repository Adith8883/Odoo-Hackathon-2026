'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Check, CircleDot, Minus, Sun, Sparkles } from 'lucide-react';
import type { AttendanceRecord } from '@/types/attendance.types';
import { getWeekDates, isToday, isWeekend, formatDate } from '@/utils/date';

interface WeeklyAttendanceProps {
  records?: AttendanceRecord[] | any[];
}

export function WeeklyAttendance({ records = [] }: WeeklyAttendanceProps) {
  const weekDays = getWeekDates(new Date());

  const getDayStatus = (date: Date) => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    const rec = (records || []).find(
      (r: any) => formatDate(new Date(r.date), 'yyyy-MM-dd') === dateStr
    );

    if (rec) {
      if (rec.status === 'present') return { type: 'present', label: 'Present' };
      if (rec.status === 'half_day') return { type: 'half_day', label: 'Half Day' };
      if (rec.status === 'leave') return { type: 'leave', label: 'On Leave' };
      if (rec.status === 'absent') return { type: 'absent', label: 'Absent' };
    }

    if (isWeekend(date)) return { type: 'weekend', label: 'Weekend' };
    if (date > new Date()) return { type: 'future', label: 'Upcoming' };
    return { type: 'unmarked', label: 'Not Marked' };
  };

  const presentCount = (records || []).filter((r: any) => r.status === 'present').length;
  const leaveCount = (records || []).filter((r: any) => r.status === 'leave').length;

  const dayLetters = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="relative overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card flex flex-col justify-between">
      <div>
        <div className="bg-gradient-to-r from-muted/50 via-muted/20 to-transparent px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Weekly Attendance Strip
              </span>
              <span className="text-[11px] text-muted-foreground">Current 7-Day Cycle</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium bg-background/80 px-2.5 py-1 rounded-full border border-border/60">
            <span className="text-emerald-600 font-bold">{presentCount}</span>
            <span className="text-muted-foreground">Present</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-blue-600 font-bold">{leaveCount}</span>
            <span className="text-muted-foreground">Leave</span>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {weekDays.map((day, idx) => {
              const status = getDayStatus(day);
              const current = isToday(day);

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center py-3 px-1 rounded-xl transition-all ${
                    current
                      ? 'bg-primary/10 border-2 border-primary shadow-xs'
                      : 'bg-muted/30 border border-border/30 hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`text-[10px] sm:text-xs font-bold uppercase mb-1.5 ${
                      current ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {dayLetters[idx]}
                  </span>

                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold my-0.5">
                    {status.type === 'present' && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    {status.type === 'half_day' && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <CircleDot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {status.type === 'leave' && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        L
                      </div>
                    )}
                    {status.type === 'absent' && (
                      <div className="w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        A
                      </div>
                    )}
                    {status.type === 'weekend' && (
                      <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground/60 flex items-center justify-center">
                        <Sun className="w-3 h-3" />
                      </div>
                    )}
                    {(status.type === 'future' || status.type === 'unmarked') && (
                      <div className="w-6 h-6 rounded-full bg-muted/80 text-muted-foreground/40 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] mt-1.5 font-mono ${current ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                    {formatDate(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Full weekly hours tracked automatically</span>
            </span>
            <span className="font-semibold text-foreground">5 Working Days</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
