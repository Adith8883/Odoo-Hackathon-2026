'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Inbox, Sparkles } from 'lucide-react';
import { formatDate, getInitials } from '@/utils/formatters';

interface LeaveRequest {
  id: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  totalDays?: number;
}

interface PendingLeaveListProps {
  requests: LeaveRequest[];
  onReview: (request: LeaveRequest, action: 'approve' | 'reject') => void;
}

export function PendingLeaveList({ requests, onReview }: PendingLeaveListProps) {
  if (requests.length === 0) {
    return (
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" />
            Approval Inbox (0 Pending)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-foreground">All caught up!</p>
          <p className="text-xs text-muted-foreground mt-1">
            No pending leave requests awaiting approval at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Inbox className="w-4 h-4 text-primary" />
          Approval Inbox
        </CardTitle>
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
          {requests.length} Pending
        </Badge>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-4 divide-y divide-border/30">
        {requests.map((request) => (
          <div key={request.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <Avatar className="h-10 w-10 border border-border/50 shrink-0 mt-0.5">
                <AvatarImage src={request.avatarUrl} alt={request.employeeName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {getInitials(request.employeeName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm text-foreground">{request.employeeName}</h4>
                  <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/20 text-primary">
                    {request.department}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-medium text-foreground">{request.leaveType}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-muted-foreground/60" />
                    {formatDate(request.startDate)} – {formatDate(request.endDate)}
                  </span>
                </div>
                {request.reason && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic bg-muted/30 p-2 rounded-md border border-border/20 mt-1">
                    "{request.reason}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs gap-1"
                onClick={() => onReview(request, 'reject')}
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
              <Button
                size="sm"
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 shadow-xs"
                onClick={() => onReview(request, 'approve')}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
