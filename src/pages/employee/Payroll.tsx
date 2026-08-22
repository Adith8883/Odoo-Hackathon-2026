import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Calendar,
  Building,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { payrollService } from '../../services/payrollService';
import { PayrollRecord } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const Payroll: React.FC = () => {
  const { user, profile } = useAuth();
  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayroll = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await payrollService.getOwnPayroll(user.id);
        setPayroll(data);
      } catch (err) {
        console.error('Error loading payroll:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPayroll();
  }, [user?.id]);

  if (loading) {
    return <LoadingSpinner fullPage label="Loading payroll information..." />;
  }

  const basic = Number(payroll?.basic_salary || 0);
  const allowances = Number(payroll?.allowances || 0);
  const deductions = Number(payroll?.deductions || 0);
  const net = Number(payroll?.net_salary || basic + allowances - deductions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Salary & Payroll
        </h2>
        <p className="text-sm text-slate-500">
          Review your structured compensation breakdown and monthly net payout.
        </p>
      </div>

      {/* Net Pay Highlight Card */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            Monthly Net Compensation
          </span>
          <div className="text-3xl sm:text-5xl font-black tracking-tight">
            {formatCurrency(net)}
          </div>
          <p className="text-xs text-indigo-200 mt-2">
            Calculated as: Basic ({formatCurrency(basic)}) + Allowances ({formatCurrency(allowances)}) - Deductions ({formatCurrency(deductions)})
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right">
          <div className="text-xs text-indigo-200">Last Structure Update</div>
          <div className="text-sm font-semibold text-white mt-1">
            {formatDate(payroll?.updated_at || new Date().toISOString())}
          </div>
          <div className="mt-2 text-[11px] text-indigo-300 font-mono">
            {profile?.employee_id} • {profile?.job_title}
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Salary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Basic Salary
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(basic)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Base contractual wage before additions or withholdings.
          </p>
        </div>

        {/* Allowances */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allowances & Bonuses
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            +{formatCurrency(allowances)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Housing, travel, and standard employment allowances.
          </p>
        </div>

        {/* Deductions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Deductions
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            -{formatCurrency(deductions)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Statutory taxes, provident funds, or medical contributions.
          </p>
        </div>
      </div>

      {/* Salary Breakdown Summary Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-base font-bold text-slate-900">Payroll Calculation Details</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Official breakdown provided and regulated by HR.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
            <span className="text-slate-600">Contracted Base Pay</span>
            <span className="font-semibold text-slate-900">{formatCurrency(basic)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
            <span className="text-slate-600">House Rent & Travel Allowance (HRA)</span>
            <span className="font-semibold text-emerald-600">+{formatCurrency(allowances)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
            <span className="text-slate-600">Taxes, PF & Insurance Deductions</span>
            <span className="font-semibold text-rose-600">-{formatCurrency(deductions)}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-200 text-base font-bold">
            <span className="text-slate-900">Estimated Net Payout</span>
            <span className="text-indigo-600 font-extrabold text-lg">{formatCurrency(net)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
