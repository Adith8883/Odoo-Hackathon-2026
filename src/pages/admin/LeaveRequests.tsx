import React, { useState, useEffect } from 'react';
import {
  CalendarRange,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import { LeaveRequest, LeaveStatus } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

export const LeaveRequests: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getAllLeaveRequests();
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
  }, []);

  const handleOpenReview = (leave: LeaveRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setAdminComment('');
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setProcessing(true);
    try {
      await leaveService.updateLeaveStatus(
        selectedLeave.id,
        reviewAction,
        adminComment.trim() || undefined
      );

      showSuccess(`Leave request ${reviewAction.toLowerCase()} successfully.`);
      setSelectedLeave(null);
      loadLeaves();
    } catch (err: any) {
      console.error('Error reviewing leave:', err);
      showError(err.message || 'Failed to update leave status.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === 'ALL') return true;
    return leave.status === statusFilter;
  });

  if (loading && leaves.length === 0) {
    return <LoadingSpinner fullPage label="Loading organization leave requests..." />;
  }

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Leave Approvals
        </h2>
        <p className="text-sm text-slate-500">
          Review, approve, or reject employee leave requests and provide administrative feedback.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''} Awaiting Action
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending Only</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">Leave Applications</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {filteredLeaves.length} Applications
          </span>
        </div>

        {filteredLeaves.length === 0 ? (
          <EmptyState
            icon={CalendarRange}
            title="No Leave Requests Found"
            description="No applications match the current filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reason / Remarks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Comment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {leave.profile?.full_name || 'Staff Member'}
                      <span className="block text-xs font-mono text-slate-400">
                        {leave.profile?.employee_id} • {leave.profile?.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {leave.leave_type}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div>{formatDate(leave.start_date)}</div>
                      <div className="text-slate-400">to {formatDate(leave.end_date)}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {leave.remarks || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-xs text-slate-600">
                      {leave.admin_comment ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span>{leave.admin_comment}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleOpenReview(leave, 'APPROVED')}
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenReview(leave, 'REJECTED')}
                            leftIcon={<X className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleOpenReview(
                              leave,
                              leave.status === 'APPROVED' ? 'REJECTED' : 'APPROVED'
                            )
                          }
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Modify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Comment Modal */}
      <Modal
        isOpen={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title={`${reviewAction === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
        description={`Confirm decision for ${selectedLeave?.profile?.full_name || 'employee'}.`}
      >
        <form onSubmit={handleConfirmReview} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Employee:</span>
              <span className="font-semibold text-slate-800">
                {selectedLeave?.profile?.full_name} ({selectedLeave?.profile?.employee_id})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duration:</span>
              <span className="font-medium text-slate-800">
                {formatDate(selectedLeave?.start_date)} to {formatDate(selectedLeave?.end_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="font-semibold text-indigo-600">{selectedLeave?.leave_type} Leave</span>
            </div>
            {selectedLeave?.remarks && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block mb-0.5">Employee Remarks:</span>
                <p className="text-slate-700 italic">{selectedLeave.remarks}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Comment / Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="e.g., Approved as per annual PTO balance..."
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedLeave(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewAction === 'APPROVED' ? 'success' : 'danger'}
              isLoading={processing}
            >
              Confirm {reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
