'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatAnnualCTC } from '@/utils/currency';
import { Wallet, ShieldCheck, Lock, TrendingUp, Calendar, MinusCircle, Calculator, Sparkles } from 'lucide-react';
import type { PayrollRecord } from '@/types/payroll.types';

interface PayrollBreakdownProps {
  payroll?: PayrollRecord | any;
  isLoading?: boolean;
}

export function PayrollBreakdown({ payroll = null, isLoading = false }: PayrollBreakdownProps) {
  const base = Number(payroll?.base_salary) || 45000;
  const allowances = Number(payroll?.allowances) || 12000;
  const benefits = Number(payroll?.benefits) || 4000;
  const standardDeductions = Number(payroll?.deductions) || 2500;

  const grossSalary = base + allowances + benefits;
  const perDayRate = payroll?.per_day_rate || Math.round((grossSalary / 30) * 100) / 100;
  const leaveDaysTaken = Number(payroll?.leave_days_taken) || 0;
  const leaveDeduction = payroll?.leave_deduction ?? Math.round(leaveDaysTaken * perDayRate);

  const totalDeductions = standardDeductions + leaveDeduction;
  const monthlyNet = Math.max(0, grossSalary - totalDeductions);
  const annualCTC = grossSalary * 12;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="border-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-lg overflow-hidden relative rounded-2xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-2.5 py-1 backdrop-blur-xs">
                  <Lock className="w-3 h-3 mr-1 text-emerald-400" />
                  Read-Only • Managed by HR
                </Badge>
                {leaveDaysTaken > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs px-2.5 py-1">
                    {leaveDaysTaken} leave {leaveDaysTaken === 1 ? 'day' : 'days'} deducted
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-indigo-200">Net Take-Home Salary</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-1">
                {formatCurrency(monthlyNet)}
              </h2>
              <p className="text-xs text-indigo-300/80 mt-1">
                Gross: {formatCurrency(grossSalary)} • Deductions: -{formatCurrency(totalDeductions)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md self-start md:self-auto min-w-[210px]">
              <p className="text-xs text-indigo-200 font-medium">Annual CTC (Cost to Company)</p>
              <p className="text-2xl font-bold text-white mt-0.5">
                {formatAnnualCTC(grossSalary)}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Base + Allowances + Benefits</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Deduction Policy Callout Banner */}
      <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-xs overflow-hidden">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Paid Leave Deduction Formula</span>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30">
                  Rate = Gross / 30
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Daily Salary Rate = <strong className="text-foreground">{formatCurrency(grossSalary)} / 30 = {formatCurrency(perDayRate)} / day</strong>.
                {leaveDaysTaken > 0 ? (
                  <span> You have taken <strong className="text-amber-600">{leaveDaysTaken} approved leave day(s)</strong>, deducting <strong className="text-destructive">-{formatCurrency(leaveDeduction)}</strong>.</span>
                ) : (
                  <span> No leave deductions applied for current cycle.</span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-muted-foreground block">Leave Deductions</span>
            <span className="text-base font-bold text-destructive font-mono">
              -{formatCurrency(leaveDeduction)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Salary Components Grid */}
      <Card className="border border-border/60 shadow-sm rounded-2xl">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wallet className="w-4 h-4 text-primary" />
            <span>Earnings & Deductions Breakdown</span>
          </div>
          <span className="text-xs text-muted-foreground">Currency: INR (₹)</span>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Base Monthly Salary</span>
              <p className="text-xl font-bold text-foreground font-mono">{formatCurrency(base)}</p>
              <p className="text-[11px] text-muted-foreground">Core guaranteed monthly compensation</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Allowances (HRA & Special)</span>
              <p className="text-xl font-bold text-emerald-600 font-mono">+{formatCurrency(allowances)}</p>
              <p className="text-[11px] text-muted-foreground">Housing, conveyance & flexible stipends</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Company Benefits & Perks</span>
              <p className="text-xl font-bold text-blue-600 font-mono">+{formatCurrency(benefits)}</p>
              <p className="text-[11px] text-muted-foreground">Health insurance, wellness & allowances</p>
            </div>

            {/* Deductions */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Standard Deductions (TDS / PF)</span>
              <p className="text-xl font-bold text-amber-600 font-mono">-{formatCurrency(standardDeductions)}</p>
              <p className="text-[11px] text-muted-foreground">Statutory taxes & provident fund</p>
            </div>

            {/* Leave Deduction Card */}
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Paid Leave Deduction ({leaveDaysTaken} days @ {formatCurrency(perDayRate)}/day)
                </span>
                <span className="text-lg font-bold text-destructive font-mono">
                  -{formatCurrency(leaveDeduction)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Deducted based on verified time-off days: ({formatCurrency(grossSalary)} Gross ÷ 30) × {leaveDaysTaken} days = {formatCurrency(leaveDeduction)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>
              Per company policy, each approved paid leave day is deducted at <strong className="text-foreground">(Monthly Gross Salary ÷ 30)</strong>. Salary updates and tax exemptions are configured by HR.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
