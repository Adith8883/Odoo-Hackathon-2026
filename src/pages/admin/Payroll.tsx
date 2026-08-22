import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Edit2,
  TrendingUp,
  CreditCard,
  Search,
  CheckCircle,
  Building,
  Save,
  Calculator,
} from 'lucide-react';
import { payrollService } from '../../services/payrollService';
import { profileService } from '../../services/profileService';
import { PayrollRecord, Profile } from '../../types/database';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const Payroll: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [allowances, setAllowances] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPay, allProfiles] = await Promise.all([
        payrollService.getAllPayroll(),
        profileService.getAllProfiles(),
      ]);

      setPayrollList(allPay);
      setEmployees(allProfiles);
    } catch (err: any) {
      console.error('Error loading payroll records:', err);
      showError(err.message || 'Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (emp: Profile) => {
    const existingPay = payrollList.find((p) => p.employee_id === emp.id);
    setSelectedEmployee(emp);
    setSelectedRecord(existingPay || null);
    setBasicSalary(existingPay?.basic_salary || 0);
    setAllowances(existingPay?.allowances || 0);
    setDeductions(existingPay?.deductions || 0);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setSaving(true);
    try {
      await payrollService.updatePayroll(selectedEmployee.id, {
        basic_salary: Number(basicSalary) || 0,
        allowances: Number(allowances) || 0,
        deductions: Number(deductions) || 0,
      });

      showSuccess(`Salary structure updated for ${selectedEmployee.full_name}.`);
      setSelectedEmployee(null);
      setSelectedRecord(null);
      loadData();
    } catch (err: any) {
      console.error('Error updating salary:', err);
      showError(err.message || 'Unable to save salary adjustments.');
    } finally {
      setSaving(false);
    }
  };

  const computedNetSalary =
    (Number(basicSalary) || 0) +
    (Number(allowances) || 0) -
    (Number(deductions) || 0);

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      (emp.full_name?.toLowerCase() || '').includes(query) ||
      (emp.employee_id?.toLowerCase() || '').includes(query) ||
      (emp.department?.toLowerCase() || '').includes(query)
    );
  });

  const totalPayrollBudget = payrollList.reduce(
    (sum, p) => sum + (Number(p.net_salary) || 0),
    0
  );

  if (loading && employees.length === 0) {
    return <LoadingSpinner fullPage label="Loading organization payroll structures..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Payroll Management
        </h2>
        <p className="text-sm text-slate-500">
          Configure employee base salaries, allowances, and statutory deductions with real-time net computation.
        </p>
      </div>

      {/* Summary Highlight Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalPayrollBudget)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Monthly Payout
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {payrollList.length} Structures
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Compensation Plans
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(
                payrollList.length > 0 ? totalPayrollBudget / payrollList.length : 0
              )}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Net Salary
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, ID, or team..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">Employee Salary Structures</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {filteredEmployees.length} Records
          </span>
        </div>

        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No Salary Records Found"
            description="No employees match your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Basic Salary</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const pay = payrollList.find((p) => p.employee_id === emp.id);
                  const basic = Number(pay?.basic_salary || 0);
                  const allow = Number(pay?.allowances || 0);
                  const ded = Number(pay?.deductions || 0);
                  const net = Number(pay?.net_salary || basic + allow - ded);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {emp.full_name}
                        <span className="block text-xs font-mono text-slate-400">
                          {emp.employee_id} • {emp.job_title || 'Staff'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {emp.department || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {formatCurrency(basic)}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-medium">
                        +{formatCurrency(allow)}
                      </td>
                      <td className="py-3.5 px-4 text-rose-600 font-medium">
                        -{formatCurrency(ded)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600 text-base">
                        {formatCurrency(net)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(emp)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Configure
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Configuration Modal */}
      <Modal
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        title="Configure Salary Structure"
        description={`Set compensation terms for ${selectedEmployee?.full_name} (${selectedEmployee?.employee_id}).`}
      >
        <form onSubmit={handleSaveSalary} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Basic Salary ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={basicSalary}
                onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Allowances ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={allowances}
                onChange={(e) => setAllowances(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Deductions ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={deductions}
                onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Real-time Calculation Card */}
          <div className="rounded-2xl bg-indigo-50/80 p-4 border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Calculated Monthly Net Salary
              </div>
              <div className="text-xs text-indigo-600 mt-0.5">
                Basic (${basicSalary}) + Allowances (${allowances}) - Deductions (${deductions})
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-700">
              {formatCurrency(computedNetSalary)}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedEmployee(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Salary Structure
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
