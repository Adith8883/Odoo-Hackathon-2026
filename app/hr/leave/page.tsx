'use client';

import { useState, useEffect, useCallback } from 'react';
import { PendingLeaveList } from '@/components/hr/PendingLeaveList';
import { LeaveReviewDialog } from '@/components/hr/LeaveReviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getPendingLeaveRequests, getAllLeaveRequests, reviewLeave } from '@/services/leave.service';
import { formatDate, getInitials } from '@/utils/formatters';

export default function HRLeavePage() {
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    request: any;
    action: 'approve' | 'reject' | null;
  }>({ open: false, request: null, action: null });

  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapRequest = (req: any) => ({
    id: req.id,
    employeeName:
      req.employees?.profiles?.full_name ||
      req.employees?.profile?.full_name ||
      'Team Member',
    avatarUrl: req.employees?.profiles?.avatar_url,
    department: req.employees?.department || 'Engineering',
    leaveType: req.leave_types?.name || 'Leave',
    startDate: req.start_date,
    endDate: req.end_date,
    reason: req.reason || '',
    totalDays: req.total_days,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, all] = await Promise.allSettled([
        getPendingLeaveRequests(),
        getAllLeaveRequests(),
      ]);
      if (pending.status === 'fulfilled') setPendingLeaves((pending.value || []).map(mapRequest));
      if (all.status === 'fulfilled') setAllLeaves((all.value || []).map(mapRequest));
    } catch { } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReview = (request: any, action: 'approve' | 'reject') => {
    setReviewDialog({ open: true, request, action });
  };

  const handleConfirmReview = async (id: string, action: 'approve' | 'reject', comment: string) => {
    await reviewLeave(id, action === 'approve' ? 'approved' : 'rejected', comment);
    await fetchData();
  };

  const resolvedLeaves = allLeaves.filter((l: any) => l.status !== 'pending');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Leave Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and act on pending leave requests from your workforce.
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="pending" className="text-xs gap-2">
            Pending
            {pendingLeaves.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] px-1.5">
                {pendingLeaves.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            All History ({allLeaves.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <PendingLeaveList requests={pendingLeaves} onReview={handleReview} />
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : allLeaves.length === 0 ? (
                <div className="py-10 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-foreground">No leave history yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Approved and rejected requests will appear here.
                  </p>
                </div>
              ) : (
                allLeaves.map((req: any) => (
                  <div key={req.id} className="p-3.5 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : req.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-700'}`}>
                        {req.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : req.status === 'rejected' ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{req.employeeName}</p>
                        <p className="text-muted-foreground">{req.leaveType} · {formatDate(req.startDate)} – {formatDate(req.endDate)}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : req.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LeaveReviewDialog
        open={reviewDialog.open}
        request={reviewDialog.request}
        action={reviewDialog.action}
        onOpenChange={(open) => setReviewDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleConfirmReview}
      />
    </div>
  );
}
