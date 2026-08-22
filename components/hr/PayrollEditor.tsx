'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { formatCurrency, formatAnnualCTC } from '@/utils/currency';
import { updatePayroll, getMyPayroll } from '@/services/payroll.service';
import { toast } from 'sonner';
import { Loader2, Wallet, Calculator, Calendar } from 'lucide-react';

interface PayrollEditorProps {
  employeeId: string;
  initialBase?: number;
  initialAllowances?: number;
  initialBenefits?: number;
  initialDeductions?: number;
  onSaved?: () => void;
}

export function PayrollEditor({
  employeeId,
  initialBase = 45000,
  initialAllowances = 12000,
  initialBenefits = 4000,
  initialDeductions = 2500,
  onSaved,
}: PayrollEditorProps) {
  const [baseSalary, setBaseSalary] = useState(initialBase);
  const [allowances, setAllowances] = useState(initialAllowances);
  const [benefits, setBenefits] = useState(initialBenefits);
  const [deductions, setDeductions] = useState(initialDeductions);
  const [leaveDaysTaken, setLeaveDaysTaken] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (employeeId) {
      getMyPayroll(employeeId).then((data) => {
        if (data) {
          setBaseSalary(Number(data.base_salary) || initialBase);
          setAllowances(Number(data.allowances) || initialAllowances);
          setBenefits(Number(data.benefits) || initialBenefits);
          setDeductions(Number(data.deductions) || initialDeductions);
          setLeaveDaysTaken(Number(data.leave_days_taken) || 0);
        }
      }).catch(() => {});
    }
  }, [employeeId, initialBase, initialAllowances, initialBenefits, initialDeductions]);

  const grossSalary = baseSalary + allowances + benefits;
  const perDayRate = Math.round((grossSalary / 30) * 100) / 100;
  const leaveDeduction = Math.round(leaveDaysTaken * perDayRate);
  const totalDeductions = deductions + leaveDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);
  const annualCtc = grossSalary * 12;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePayroll(employeeId, {
        base_salary: baseSalary,
        allowances,
        benefits,
        deductions,
      });
      toast.success('Salary Structure Updated', {
        description: `Net Monthly: ${formatCurrency(netSalary)} • Per-Day Rate: ${formatCurrency(perDayRate)} • Annual CTC: ${formatAnnualCTC(grossSalary)}`,
      });
      onSaved?.();
    } catch (err: any) {
      toast.error('Failed to update salary', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="base" className="text-xs font-semibold">Base Salary (Monthly ₹)</Label>
          <Input 
            id="base" 
            type="number" 
            value={baseSalary} 
            onChange={(e) => setBaseSalary(Number(e.target.value))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="allowances" className="text-xs font-semibold">Allowances (HRA/Special ₹)</Label>
          <Input 
            id="allowances" 
            type="number" 
            value={allowances} 
            onChange={(e) => setAllowances(Number(e.target.value))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="benefits" className="text-xs font-semibold">Benefits & Perks (Monthly ₹)</Label>
          <Input 
            id="benefits" 
            type="number" 
            value={benefits} 
            onChange={(e) => setBenefits(Number(e.target.value))}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deductions" className="text-xs font-semibold">Standard Deductions (TDS/PF ₹)</Label>
          <Input 
            id="deductions" 
            type="number" 
            value={deductions} 
            onChange={(e) => setDeductions(Number(e.target.value))}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Calculated Breakdown Callout */}
      <div className="space-y-2 border border-border/40 p-4 rounded-xl bg-muted/25">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Monthly Gross Salary:</span>
          <span className="font-semibold text-foreground">{formatCurrency(grossSalary)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Daily Leave Deduction Rate (Gross ÷ 30):</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(perDayRate)} / day</span>
        </div>
        {leaveDaysTaken > 0 && (
          <div className="flex justify-between text-xs text-destructive">
            <span>Approved Leaves Deduction ({leaveDaysTaken} days):</span>
            <span className="font-semibold">-{formatCurrency(leaveDeduction)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Standard Deductions:</span>
          <span className="font-semibold text-destructive">-{formatCurrency(deductions)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-border/40 pt-2 text-foreground">
          <span>Estimated Net Monthly:</span>
          <span className="text-emerald-600">{formatCurrency(netSalary)}</span>
        </div>
        <div className="flex justify-between text-xs pt-1 text-muted-foreground">
          <span>Annual Cost to Company (CTC):</span>
          <span className="font-semibold text-foreground">{formatAnnualCTC(grossSalary)}</span>
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <Button onClick={handleSave} disabled={isSaving} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl h-10 shadow-sm">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Salary Structure
        </Button>
      </div>
    </div>
  );
}
