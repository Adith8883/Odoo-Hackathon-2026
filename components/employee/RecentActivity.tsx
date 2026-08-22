'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle2, Clock, CalendarCheck, Ban, Zap, FileText } from 'lucide-react';
import { formatRelativeDate } from '@/utils/date';
import type { AttendanceRecord } from '@/types/attendance.types';
import type { LeaveRequest } from '@/types/leave.types';

interface RecentActivityProps {
  todayAttendance?: AttendanceRecord | any | null;
  recentLeaves?: LeaveRequest[] | any[];
}

export function RecentActivity({
  todayAttendance = null,
  recentLeaves = [],
}: RecentActivityProps) {
  const activities: Array<{
    id: string | number;
    title: string;
    desc: string;
    time: string | Date;
    icon: any;
    color: string;
  }> = [];

  if (todayAttendance?.check_in || todayAttendance?.checkIn) {
    activities.push({
      id: 'att-in',
      title: 'Checked in today',
      desc: todayAttendance?.check_out || todayAttendance?.checkOut
        ? 'Full workday shift completed'
        : 'Active shift in progress',
      time: todayAttendance?.check_in || todayAttendance?.checkIn || new Date(),
      icon: Clock,
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    });
  }

  (recentLeaves || []).slice(0, 4).forEach((req: any) => {
    if (req.status === 'approved') {
      activities.push({
        id: `leave-${req.id}`,
        title: 'Leave request approved',
        desc: `${req.total_days} day(s) • ${req.leave_types?.name || req.leave_type?.name || 'Leave'}`,
        time: req.updated_at || req.created_at || new Date(),
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      });
    } else if (req.status === 'pending') {
      activities.push({
        id: `leave-${req.id}`,
        title: 'Leave request submitted',
        desc: `${req.total_days} day(s) awaiting HR review`,
        time: req.created_at || new Date(),
        icon: CalendarCheck,
        color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      });
    } else if (req.status === 'rejected') {
      activities.push({
        id: `leave-${req.id}`,
        title: 'Leave request reviewed',
        desc: req.reviewer_comment || 'Actioned by HR Officer',
        time: req.updated_at || req.created_at || new Date(),
        icon: Ban,
        color: 'text-destructive bg-destructive/10 border-destructive/20',
      });
    }
  });

  return (
    <Card className="relative overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card flex flex-col justify-between">
      <div>
        <div className="bg-gradient-to-r from-muted/50 via-muted/20 to-transparent px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Activity Stream
              </span>
              <span className="text-[11px] text-muted-foreground">Recent work events & updates</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
            Live
          </span>
        </div>

        <CardContent className="p-5 sm:p-6">
          {activities.length > 0 ? (
            <div className="space-y-3.5">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${act.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground text-xs">{act.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          {formatRelativeDate(act.time)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="font-semibold text-foreground">No recent activity</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Check in or submit a leave request to see updates here.
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
