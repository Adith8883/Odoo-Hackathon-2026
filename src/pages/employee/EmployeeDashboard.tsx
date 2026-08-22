import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarRange,
  DollarSign,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import { payrollService } from '../../services/payrollService';
import { AttendanceRecord, LeaveRequest, PayrollRecord } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';

export const EmployeeDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [todayAtt, attHistory, leaves, pay] = await Promise.all([
        attendanceService.getTodayAttendance(user.id),
        attendanceService.getEmployeeAttendanceHistory(user.id),
        leaveService.getOwnLeaveRequests(user.id),
        payrollService.getOwnPayroll(user.id),
      ]);

      setTodayAttendance(todayAtt);
      setRecentAttendance(attHistory.slice(0, 5));
      setRecentLeaves(leaves.slice(0, 5));
      setPayroll(pay);
    } catch (err: any) {
      console.error('Error loading employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const handleCheckIn = async () => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      const record = await attendanceService.checkIn(user.id);
      setTodayAttendance(record);
      showSuccess('Checked in successfully for today!');
      loadDashboardData();
    } catch (err: any) {
      showError(err.message || 'Unable to check in.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    setActionLoading(true);
    try {
      const record = await attendanceService.checkOut(todayAttendance.id);
      setTodayAttendance(record);
      showSuccess('Checked out successfully!');
      loadDashboardData();
    } catch (err: any) {
      showError(err.message || 'Unable to check out.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading your Dayflow dashboard..." />;
  }

  const isCheckedIn = Boolean(todayAttendance?.check_in);
  const isCheckedOut = Boolean(todayAttendance?.check_out);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>Employee Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {profile?.full_name || 'Team Member'} 👋
          </h2>
          <p className="text-sm text-indigo-100 max-w-lg">
            {profile?.job_title || 'Staff'} • {profile?.department || 'General'} (ID: {profile?.employee_id})
          </p>
        </div>

        {/* Quick Check In/Out Widget */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center sm:text-left">
            <div className="text-xs text-indigo-200 uppercase font-semibold tracking-wider">
              Today's Attendance
            </div>
            <div className="text-sm font-medium text-white flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-indigo-300" />
              {todayAttendance ? (
                <span>
                  {isCheckedOut
                    ? `Checked Out (${formatTime(todayAttendance.check_out)})`
                    : `Checked In (${formatTime(todayAttendance.check_in)})`}
                </span>
              ) : (
                <span>Not Checked In Yet</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {!isCheckedIn && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCheckIn}
                isLoading={actionLoading}
                className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-none font-semibold w-full sm:w-auto"
              >
                Check In
              </Button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleCheckOut}
                isLoading={actionLoading}
                className="bg-rose-500 hover:bg-rose-600 font-semibold w-full sm:w-auto"
              >
                Check Out
              </Button>
            )}

            {isCheckedOut && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Status
            </span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {todayAttendance ? todayAttendance.status : 'NOT MARKED'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {todayAttendance?.check_in ? `In at ${formatTime(todayAttendance.check_in)}` : 'Awaiting check-in'}
            </p>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recorded Days
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {recentAttendance.length} Logged
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/employee/attendance" className="text-indigo-600 hover:underline inline-flex items-center">
                View history <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Leave Requests
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {recentLeaves.length} Total
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/employee/leave" className="text-indigo-600 hover:underline inline-flex items-center">
                Apply / Check status <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Monthly Net Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Monthly Salary
            </span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatCurrency(payroll?.net_salary || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/employee/payroll" className="text-indigo-600 hover:underline inline-flex items-center">
                Breakdown details <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Attendance & Recent Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Activity Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Attendance</h3>
            <Link
              to="/employee/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center"
            >
              All Records <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No attendance records found yet. Check in today to start logging!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">In</th>
                    <th className="py-2.5 px-3">Out</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="py-3 px-3">{formatTime(record.check_in)}</td>
                      <td className="py-3 px-3">{formatTime(record.check_out)}</td>
                      <td className="py-3 px-3 text-right">
                        <StatusBadge status={record.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Leave Requests</h3>
            <Link
              to="/employee/leave"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center"
            >
              Manage Leaves <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {recentLeaves.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No leave requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Dates</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {leave.leave_type}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <StatusBadge status={leave.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
