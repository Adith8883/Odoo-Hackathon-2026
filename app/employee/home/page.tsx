'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmployee } from '@/hooks/useEmployee';
import { useAttendance } from '@/hooks/useAttendance';
import { useLeave } from '@/hooks/useLeave';
import { useRealtimeLeave } from '@/hooks/useRealtimeLeave';
import { getGreeting, formatTime, getWeekDates, isToday, isWeekend, formatDate, formatRelativeDate } from '@/utils/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Calendar,
  CheckCircle2,
  CalendarCheck,
  Zap,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  CircleDot,
  Minus,
  Loader2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

export default function EmployeeHomePage() {
  useAuth();

  const { employee, isLoading: isEmpLoading } = useEmployee();
  const {
    todayAttendance,
    weeklyAttendance,
    isLoading: isAttLoading,
    checkIn,
    checkOut,
  } = useAttendance(employee?.id);

  const {
    leaveRequests,
    refreshLeave,
  } = useLeave(employee?.id);

  useRealtimeLeave(() => {
    refreshLeave();
  });

  // Live Clock State
  const [currentTime, setCurrentTime] = useState({
    formattedTime: '--:--',
    seconds: '00',
    period: 'AM',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const s = d.getSeconds().toString().padStart(2, '0');
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const hoursStr = h.toString().padStart(2, '0');
      setCurrentTime({
        formattedTime: `${hoursStr}:${m}`,
        seconds: s,
        period,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCheckedIn = !!todayAttendance?.check_in;
  const isCheckedOut = !!todayAttendance?.check_out;

  const handleAction = async (action: 'in' | 'out') => {
    setActionLoading(true);
    try {
      if (action === 'in') {
        await checkIn();
        toast.success('Check-in Recorded!', {
          description: `Arrival logged at ${formatTime(new Date())}. Have a productive shift!`,
        });
      } else {
        await checkOut();
        toast.success('Check-out Recorded!', {
          description: `Departure logged at ${formatTime(new Date())}. See you tomorrow!`,
        });
      }
    } catch (err: any) {
      toast.error('Action Failed', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // User details
  const greeting = getGreeting();
  const rawName =
    employee?.profile?.full_name ||
    employee?.full_name ||
    (employee?.first_name ? `${employee.first_name}` : 'Team Member');
  const firstName = rawName.trim().split(' ')[0] || 'Member';
  const empId = employee?.employee_id || 'EMP-001';
  const dept = employee?.department || 'Engineering';
  const todayDateFormatted = formatDate(new Date(), 'EEEE, d MMMM yyyy');

  // Elapsed duration if working
  let durationText = '';
  if (isCheckedIn && todayAttendance?.check_in) {
    const start = new Date(todayAttendance.check_in).getTime();
    const end = isCheckedOut && todayAttendance?.check_out ? new Date(todayAttendance.check_out).getTime() : Date.now();
    const diffMins = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    durationText = `${hours}h ${mins}m`;
  }

  // Week Days (Mon to Fri) Calendar
  const weekDays = getWeekDates(new Date()).slice(0, 5);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const getDayStatus = (date: Date) => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    const rec = (weeklyAttendance || []).find(
      (r: any) => formatDate(new Date(r.date), 'yyyy-MM-dd') === dateStr
    );

    if (rec) {
      if (rec.status === 'present') return { type: 'present', label: 'Present', color: 'bg-emerald-500 text-white' };
      if (rec.status === 'half_day') return { type: 'half_day', label: 'Half Day', color: 'bg-amber-500 text-white' };
      if (rec.status === 'leave') return { type: 'leave', label: 'On Leave', color: 'bg-blue-500 text-white' };
      if (rec.status === 'absent') return { type: 'absent', label: 'Absent', color: 'bg-destructive text-white' };
    }

    if (isToday(date)) {
      if (isCheckedIn) return { type: 'present', label: 'Present', color: 'bg-emerald-500 text-white' };
      return { type: 'today', label: 'Today', color: 'bg-primary/10 text-primary border-2 border-primary' };
    }

    if (date > new Date()) return { type: 'future', label: 'Upcoming', color: 'bg-muted text-muted-foreground/40' };
    return { type: 'unmarked', label: 'Not Marked', color: 'bg-muted text-muted-foreground/50' };
  };

  const presentDaysCount =
    (weeklyAttendance || []).filter((r: any) => r.status === 'present').length +
    (isCheckedIn && !(weeklyAttendance || []).some((r: any) => formatDate(new Date(r.date), 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd')) ? 1 : 0);

  const weeklyPercentage = Math.round((presentDaysCount / 5) * 100);

  // Activity List
  const activities: Array<{ id: string; title: string; subtitle: string; icon: any; color: string }> = [];

  if (isCheckedIn && todayAttendance?.check_in) {
    activities.push({
      id: 'att-today',
      title: isCheckedOut ? 'Workday shift completed' : 'Attendance recorded',
      subtitle: `Today · ${formatTime(todayAttendance.check_in)}`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    });
  }

  (leaveRequests || []).slice(0, 3).forEach((req: any) => {
    if (req.status === 'approved') {
      activities.push({
        id: `leave-${req.id}`,
        title: `${req.leave_types?.name || 'Leave'} approved`,
        subtitle: formatRelativeDate(req.updated_at || req.created_at),
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      });
    } else if (req.status === 'pending') {
      activities.push({
        id: `leave-${req.id}`,
        title: `${req.leave_types?.name || 'Leave'} requested`,
        subtitle: `${formatRelativeDate(req.created_at)} · Awaiting review`,
        icon: CalendarCheck,
        color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      });
    }
  });

  if (isEmpLoading && !employee) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-border/80">
                {empId}
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {dept}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent">{firstName}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{todayDateFormatted}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={ROUTES.EMPLOYEE.LEAVE}>
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 rounded-xl shadow-xs">
                <span>Leave Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href={ROUTES.EMPLOYEE.PROFILE}>
              <Button size="sm" className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground rounded-xl shadow-xs">
                <span>My Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workday Pulse (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b border-border/40 flex items-center justify-between">
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
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    isCheckedOut
                      ? 'bg-slate-400'
                      : isCheckedIn
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                {isCheckedOut ? 'Shift Completed' : isCheckedIn ? 'Currently Working' : 'Not Checked In'}
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-7 space-y-6">
              {/* Digital Clock */}
              <div className="flex flex-col items-center justify-center py-4 bg-muted/25 rounded-2xl border border-border/40">
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
                    {currentTime.formattedTime}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    :{currentTime.seconds}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase ml-1">
                    {currentTime.period}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {isCheckedIn && todayAttendance?.check_in
                    ? `Arrived at ${formatTime(todayAttendance.check_in)} ${durationText ? `• ${durationText} logged` : ''}`
                    : isCheckedOut && todayAttendance?.check_out
                    ? `Shift completed at ${formatTime(todayAttendance.check_out)}`
                    : 'Ready for today? Click Check In to start your workday.'}
                </p>
              </div>

              {/* Action Button */}
              <div>
                {!isCheckedIn ? (
                  <Button
                    onClick={() => handleAction('in')}
                    disabled={isAttLoading || actionLoading}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 transition-all uppercase tracking-wider"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 mr-2" />
                    )}
                    Check In Now
                  </Button>
                ) : !isCheckedOut ? (
                  <Button
                    onClick={() => handleAction('out')}
                    disabled={isAttLoading || actionLoading}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-primary/40 hover:bg-primary/5 text-primary font-semibold text-sm shadow-xs transition-all uppercase tracking-wider"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 mr-2" />
                    )}
                    Check Out for Today
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Great work today! Shift record completed.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calendar Matrix & Activity (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Modern Weekly Calendar Card */}
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-muted/50 via-muted/20 to-transparent px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Your Week Calendar
                  </span>
                  <span className="text-[11px] text-muted-foreground">Monday – Friday Track</span>
                </div>
              </div>

              <Badge variant="secondary" className="text-xs font-semibold">
                {presentDaysCount}/5 Days ({weeklyPercentage}%)
              </Badge>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-5 gap-2 text-center">
                {weekDays.map((day, idx) => {
                  const status = getDayStatus(day);
                  const isCurrent = isToday(day);

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between gap-2 ${
                        isCurrent
                          ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                          : 'border-border/40 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        {dayNames[idx]}
                      </span>

                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                        {status.type === 'present' ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : status.type === 'half_day' ? (
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <CircleDot className="w-3.5 h-3.5" />
                          </div>
                        ) : status.type === 'leave' ? (
                          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                            L
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground/40 flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <span className={`text-[11px] font-mono ${isCurrent ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                        {formatDate(day, 'd MMM')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Weekly Target Completion</span>
                  <span className="font-semibold text-foreground">{presentDaysCount} of 5 Workdays</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${weeklyPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stream Card */}
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Recent Activity
              </span>
              <Link href={ROUTES.EMPLOYEE.ATTENDANCE}>
                <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary/80 px-2 -mr-2 gap-1">
                  <span>Full Log</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            <CardContent className="p-0 divide-y divide-border/40">
              {activities.length > 0 ? (
                activities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${act.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{act.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{act.subtitle}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No recent activity logged. Check in above to start your shift.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
