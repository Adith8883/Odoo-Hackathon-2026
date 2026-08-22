'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/utils/date';
import { Clock, ArrowRight, FileSpreadsheet } from 'lucide-react';
import type { AttendanceRecord } from '@/types/attendance.types';
import { useAttendance } from '@/hooks/useAttendance';

interface AttendanceTimelineProps {
  records?: AttendanceRecord[] | any[];
  isLoading?: boolean;
}

export function AttendanceTimeline({
  records: propRecords,
  isLoading: propLoading,
}: AttendanceTimelineProps) {
  const { attendanceHistory, isLoading: hookLoading } = useAttendance();
  const [filter, setFilter] = useState<'all' | 'present' | 'leave'>('all');

  const rawRecords = propRecords || attendanceHistory || [];
  const loading = propLoading !== undefined ? propLoading : hookLoading;

  const filtered = rawRecords.filter((r: any) => {
    if (filter === 'all') return true;
    if (filter === 'present') return r.status === 'present';
    if (filter === 'leave') return r.status === 'leave';
    return true;
  });

  return (
    <Card className="border border-border/60 shadow-sm">
      <div className="px-5 py-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Attendance History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log of your past work hours and marked days
          </p>
        </div>

        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 self-start sm:self-auto">
          <Button
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs h-7 px-2.5"
          >
            All
          </Button>
          <Button
            variant={filter === 'present' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('present')}
            className="text-xs h-7 px-2.5"
          >
            Present
          </Button>
          <Button
            variant={filter === 'leave' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('leave')}
            className="text-xs h-7 px-2.5"
          >
            Leave
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        {loading && rawRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading attendance records...
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-border/40">
            {filtered.map((record: any) => {
              const recDate = new Date(record.date);
              const checkInVal = record.check_in || record.checkIn || record.check_in_time;
              const checkOutVal = record.check_out || record.checkOut || record.check_out_time;

              return (
                <div
                  key={record.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 flex flex-col items-center justify-center font-mono border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase leading-none font-sans font-semibold">
                        {formatDate(recDate, 'MMM')}
                      </span>
                      <span className="text-sm font-bold text-foreground leading-none mt-1">
                        {formatDate(recDate, 'd')}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {formatDate(recDate, 'EEEE, d MMMM yyyy')}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 capitalize ${
                            record.status === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : record.status === 'half_day'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {record.status?.replace('_', ' ') || 'Present'}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        {checkInVal ? (
                          <>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-muted-foreground/70" />
                              {formatTime(checkInVal)}
                            </span>
                            {checkOutVal && (
                              <>
                                <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
                                <span className="font-mono">{formatTime(checkOutVal)}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>Full day leave applied</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {record.notes && (
                    <span className="text-xs text-muted-foreground italic sm:text-right">
                      "{record.notes}"
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No attendance records found</p>
            <p className="text-xs mt-1">
              {filter === 'all'
                ? 'Check in to create your first attendance record.'
                : `No records matching the '${filter}' filter.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
