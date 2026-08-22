'use client';

import { useEmployee } from '@/hooks/useEmployee';
import { useLeave } from '@/hooks/useLeave';
import { useRealtimeLeave } from '@/hooks/useRealtimeLeave';
import { LeaveBalanceCard } from '@/components/employee/LeaveBalanceCard';
import { LeaveApplicationForm } from '@/components/employee/LeaveApplicationForm';
import { LeaveRequestCard } from '@/components/employee/LeaveRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Inbox } from 'lucide-react';

export default function EmployeeLeavePage() {
  const { employee, isLoading: isEmpLoading } = useEmployee();
  const {
    leaveRequests,
    leaveBalance,
    leaveTypes,
    isLoading: isLeaveLoading,
    applyLeave,
    refreshLeave,
  } = useLeave(employee?.id);

  // Realtime hook for immediate UI feedback on leave approvals
  useRealtimeLeave(() => {
    refreshLeave();
  });

  const pendingRequests = leaveRequests.filter((r) => r.status === 'pending');
  const pastRequests = leaveRequests.filter((r) => r.status !== 'pending');

  if (isEmpLoading && !employee) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Apply Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Leave & Time Off
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submit time off requests and monitor approval status in realtime
          </p>
        </div>

        <LeaveApplicationForm
          leaveTypes={leaveTypes}
          balances={leaveBalance}
          onSubmitLeave={applyLeave}
        />
      </div>

      {/* Balances Card (display only — single Apply button is in the header above) */}
      <LeaveBalanceCard balances={leaveBalance} />

      {/* Tabs for Pending vs All History */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="all" className="text-xs">
            All Requests ({leaveRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            Resolved ({pastRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {leaveRequests.length > 0 ? (
            leaveRequests.map((req) => (
              <LeaveRequestCard key={req.id} request={req} />
            ))
          ) : (
            <div className="py-16 text-center border border-dashed rounded-xl bg-card">
              <Inbox className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No leave requests yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Your submitted leave requests will appear here once applied.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <LeaveRequestCard key={req.id} request={req} />
            ))
          ) : (
            <div className="py-12 text-center border border-dashed rounded-xl bg-card">
              <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No pending requests</p>
              <p className="text-xs text-muted-foreground mt-1">
                You have no requests currently awaiting HR review.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {pastRequests.length > 0 ? (
            pastRequests.map((req) => (
              <LeaveRequestCard key={req.id} request={req} />
            ))
          ) : (
            <div className="py-12 text-center border border-dashed rounded-xl bg-card">
              <Inbox className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No resolved requests</p>
              <p className="text-xs text-muted-foreground mt-1">
                Approved and rejected leave history will be listed here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
