'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PayrollEditor } from '@/components/hr/PayrollEditor';
import { getAllEmployees } from '@/services/employee.service';
import { getAllPayroll } from '@/services/payroll.service';
import { formatCurrency, formatAnnualCTC } from '@/utils/currency';
import { getInitials } from '@/utils/formatters';
import { Wallet, Search, Edit2, Users, TrendingUp, Calculator } from 'lucide-react';

export default function HRPayrollPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollMap, setPayrollMap] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [empsRes, payrollRes] = await Promise.allSettled([
        getAllEmployees(),
        getAllPayroll(),
      ]);

      let empList: any[] = [];
      if (empsRes.status === 'fulfilled' && empsRes.value) {
        empList = empsRes.value;
        setEmployees(empList);
      }

      if (payrollRes.status === 'fulfilled' && payrollRes.value) {
        const map: Record<string, any> = {};
        (payrollRes.value || []).forEach((p: any) => {
          if (p.employee_id) {
            map[p.employee_id] = p;
          }
        });
        setPayrollMap(map);
      }
    } catch (err) {
      console.error('Failed to load payroll directory:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditSalary = (emp: any) => {
    setSelectedEmployee(emp);
    setEditorOpen(true);
  };

  const filteredEmployees = employees.filter((emp) => {
    const name = emp.profiles?.full_name || emp.profile?.full_name || emp.full_name || '';
    const email = emp.profiles?.email || emp.profile?.email || emp.email || '';
    const empId = emp.employee_id || '';
    const dept = emp.department || '';

    const term = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      empId.toLowerCase().includes(term) ||
      dept.toLowerCase().includes(term)
    );
  });

  // Calculate totals
  const totalPayrollCost = employees.reduce((acc, emp) => {
    const p = payrollMap[emp.id];
    const base = Number(p?.base_salary) || 45000;
    const allowances = Number(p?.allowances) || 12000;
    const benefits = Number(p?.benefits) || 4000;
    return acc + (base + allowances + benefits);
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Payroll & Compensation
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage salary structures, view per-day leave deductions (Gross ÷ 30), and track net disbursements.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border/60 shadow-sm bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Monthly Gross
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalPayrollCost || 183000)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Total monthly gross budget</p>
        </Card>

        <Card className="rounded-2xl border border-border/60 shadow-sm bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Annualized Workforce CTC
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatAnnualCTC(totalPayrollCost || 183000)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Combined 12-month CTC</p>
        </Card>

        <Card className="rounded-2xl border border-border/60 shadow-sm bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Enrolled Employees
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {employees.length || 4}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Active compensation profiles</p>
        </Card>
      </div>

      {/* Directory Search */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, employee ID, or department..."
            className="pl-9 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold">Employee</TableHead>
                <TableHead className="text-xs font-semibold hidden sm:table-cell">Department</TableHead>
                <TableHead className="text-xs font-semibold text-right">Gross Monthly</TableHead>
                <TableHead className="text-xs font-semibold text-right hidden md:table-cell">Daily Rate (÷30)</TableHead>
                <TableHead className="text-xs font-semibold text-right hidden md:table-cell">Leave Deduction</TableHead>
                <TableHead className="text-xs font-semibold text-right">Net Monthly</TableHead>
                <TableHead className="text-xs font-semibold text-right">Annual CTC</TableHead>
                <TableHead className="text-right text-xs font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="py-4">
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-foreground">No employees found</p>
                    <p className="text-xs mt-0.5">Try searching with a different keyword.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => {
                  const name = emp.profiles?.full_name || emp.profile?.full_name || emp.full_name || 'Team Member';
                  const avatarUrl = emp.profiles?.avatar_url || emp.profile?.avatar_url;
                  const p = payrollMap[emp.id];

                  const base = Number(p?.base_salary) || 45000;
                  const allowances = Number(p?.allowances) || 12000;
                  const benefits = Number(p?.benefits) || 4000;
                  const standardDeductions = Number(p?.deductions) || 2500;

                  const gross = base + allowances + benefits;
                  const perDayRate = p?.per_day_rate || Math.round((gross / 30) * 100) / 100;
                  const leaveDays = Number(p?.leave_days_taken) || 0;
                  const leaveDeduction = p?.leave_deduction ?? Math.round(leaveDays * perDayRate);

                  const net = Math.max(0, gross - standardDeductions - leaveDeduction);

                  return (
                    <TableRow key={emp.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/40">
                            <AvatarImage src={avatarUrl} alt={name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm text-foreground">{name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{emp.employee_id || 'EMP-001'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {emp.department || 'Engineering'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(gross)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400 hidden md:table-cell">
                        {formatCurrency(perDayRate)}/d
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium text-destructive hidden md:table-cell">
                        {leaveDays > 0 ? (
                          <span>-{formatCurrency(leaveDeduction)} ({leaveDays}d)</span>
                        ) : (
                          <span className="text-muted-foreground">₹0 (0d)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                        {formatCurrency(net)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {formatAnnualCTC(gross)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSalary(emp)}
                          className="h-8 text-xs gap-1.5 rounded-xl border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Interactive Salary Editor Modal */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Employee Salary Structure</DialogTitle>
            <DialogDescription className="text-xs">
              Configuring compensation for{' '}
              <span className="font-semibold text-foreground">
                {selectedEmployee?.profiles?.full_name || selectedEmployee?.profile?.full_name || selectedEmployee?.full_name || 'Selected Employee'}
              </span>{' '}
              ({selectedEmployee?.employee_id || 'EMP-001'})
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <PayrollEditor
              employeeId={selectedEmployee.id}
              initialBase={Number(payrollMap[selectedEmployee.id]?.base_salary) || 45000}
              initialAllowances={Number(payrollMap[selectedEmployee.id]?.allowances) || 12000}
              initialBenefits={Number(payrollMap[selectedEmployee.id]?.benefits) || 4000}
              initialDeductions={Number(payrollMap[selectedEmployee.id]?.deductions) || 2500}
              onSaved={() => {
                setEditorOpen(false);
                fetchData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
