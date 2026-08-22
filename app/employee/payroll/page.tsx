'use client';

import { PayrollBreakdown } from '@/components/employee/PayrollBreakdown';
import { usePayroll } from '@/hooks/usePayroll';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeePayrollPage() {
  const { payroll, isLoading } = usePayroll();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Payroll & Compensation
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View your salary structure, monthly breakdown, and leave deductions in real time.
        </p>
      </div>

      {isLoading && !payroll ? (
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <PayrollBreakdown payroll={payroll} isLoading={isLoading} />
      )}
    </div>
  );
}
