import React, { useState, useEffect } from 'react';
import {
  CalendarRange,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { leaveService } from '../../services/leaveService';
import { LeaveRequest, LeaveType } from '../../types/database';
import { LEAVE_TYPES } from '../../utils/constants';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, getTodayDateString } from '../../utils/helpers';

export const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('PAID');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [remarks, setRemarks] = useState('');

  const loadLeaves = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await leaveService.getOwnLeaveRequests(user.id);
      setLeaves(data);
    } catch (err: any) {
      console.error('Error loading leaves:', err);
      showError(err.message || 'Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [user?.id]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!startDate || !endDate) {
      showError('Please select valid start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showError('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    try {
      await leaveService.applyLeave({
        employee_id: user.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        remarks: remarks.trim() || undefined,
      });

      showSuccess('Leave request submitted successfully.');
      setIsModalOpen(false);
      // Reset form
      setRemarks('');
      setStartDate(getTodayDateString());
      setEndDate(getTodayDateString());
      loadLeaves();
    } catch (err: any) {
      console.error('Error submitting leave:', err);
      showError(err.message || 'Unable to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading leave requests..." />;
  }

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave Requests
          </h2>
          <p className="text-sm text-slate-500">
            Submit time-off applications and track their approval progress.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Leave Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{approvedCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{rejectedCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Leave Applications History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">Application History</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {leaves.length} Total
          </span>
        </div>

        {leaves.length === 0 ? (
          <EmptyState
            icon={CalendarRange}
            title="No Leave Requests Yet"
            description="When you need time off for vacation, health reasons, or personal business, create a request above."
            actionLabel="Apply for Leave"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Reason / Remarks</th>
                  <th className="py-3 px-4">Admin Comment</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {leave.leave_type} Leave
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {formatDate(leave.start_date)}
                      </div>
                      <div className="text-xs text-slate-400">
                        to {formatDate(leave.end_date)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {leave.remarks || <span className="text-slate-400 italic">None provided</span>}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {leave.admin_comment ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span>{leave.admin_comment}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={leave.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave"
        description="Select the type and duration of your leave request."
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Leave Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {LEAVE_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>
                  {lt.label} - {lt.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Brief reason for your leave request..."
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
