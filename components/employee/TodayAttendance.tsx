'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/utils/date';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Loader2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import type { AttendanceRecord } from '@/types/attendance.types';
import { toast } from 'sonner';

interface TodayAttendanceProps {
  todayRecord?: AttendanceRecord | null;
  isLoading?: boolean;
  onCheckIn?: () => Promise<void>;
  onCheckOut?: () => Promise<void>;
}

export function TodayAttendance({
  todayRecord = null,
  isLoading = false,
  onCheckIn,
  onCheckOut,
}: TodayAttendanceProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentSeconds, setCurrentSeconds] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCurrentSeconds(d.getSeconds().toString().padStart(2, '0'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

  // Calculate elapsed time if checked in
  let durationText = '';
  if (isCheckedIn && todayRecord?.check_in) {
    const start = new Date(todayRecord.check_in).getTime();
    const end = isCheckedOut && todayRecord?.check_out ? new Date(todayRecord.check_out).getTime() : Date.now();
    const diffMins = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    durationText = `${hours}h ${mins}m logged`;
  }

  const handleAction = async (action: 'in' | 'out') => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      if (action === 'in' && onCheckIn) {
        await onCheckIn();
        toast.success('Arrival Recorded!', {
          description: `Checked in at ${formatTime(new Date())}. Have a great shift!`,
        });
      } else if (action === 'out' && onCheckOut) {
        await onCheckOut();
        toast.success('Departure Recorded!', {
          description: `Checked out at ${formatTime(new Date())}. See you tomorrow!`,
        });
      }
    } catch (err: any) {
      const msg = err?.message || 'Action failed. Please try again.';
      setErrorMessage(msg);
      toast.error('Attendance Action Failed', { description: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card flex flex-col justify-between">
      {/* Header bar */}
      <div>
        <div className="bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Workday Pulse
              </span>
              <span className="text-[11px] text-muted-foreground">Standard 9:00 AM – 6:00 PM</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1 bg-background/90 px-3 py-1.5 rounded-xl border border-border/60 font-mono shadow-xs">
            <span className="text-sm font-bold text-foreground">{currentTime || '--:-- --'}</span>
            <span className="text-[10px] text-primary font-bold">:{currentSeconds || '00'}</span>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status Display Bento */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    isCheckedOut
                      ? 'bg-muted-foreground'
                      : isCheckedIn
                      ? 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-base font-bold text-foreground">
                  {isCheckedOut
                    ? 'Shift Completed'
                    : isCheckedIn
                    ? 'Currently Working'
                    : 'Not Checked In'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isCheckedIn && todayRecord?.check_in
                  ? `Arrived at ${formatTime(todayRecord.check_in)} ${durationText ? `• ${durationText}` : ''}`
                  : 'Tap check-in to begin logging your workday hours'}
                {isCheckedOut && todayRecord?.check_out
                  ? ` • Left at ${formatTime(todayRecord.check_out)}`
                  : ''}
              </p>
            </div>

            <Badge
              variant="outline"
              className={`capitalize font-semibold text-xs px-3 py-1 rounded-full ${
                isCheckedOut
                  ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                  : isCheckedIn
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}
            >
              {isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Active' : 'Pending'}
            </Badge>
          </div>

          {/* Action Trigger */}
          <div>
            {!isCheckedIn ? (
              <Button
                onClick={() => handleAction('in')}
                disabled={isLoading || actionLoading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all h-12 rounded-xl text-sm"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Check In Now
              </Button>
            ) : !isCheckedOut ? (
              <Button
                onClick={() => handleAction('out')}
                disabled={isLoading || actionLoading}
                variant="outline"
                className="w-full border-primary/40 hover:bg-primary/5 text-primary font-semibold h-12 rounded-xl text-sm transition-all"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Check Out for Today
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Great work today! Your attendance record is complete.</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
