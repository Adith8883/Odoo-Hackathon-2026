import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { profileService } from '../../services/profileService';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import { payrollService } from '../../services/payrollService';
import { Profile, LeaveRequest, AttendanceRecord } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [presentTodayCount, setPresentTodayCount] = useState(0);
  const [totalPayrollAmount, setTotalPayrollAmount] = useState(0);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const [allProfiles, allAttendance, allLeaves, totalPay] = await Promise.all([
        profileService.getAllProfiles(),
        attendanceService.getAllAttendance(),
        leaveService.getAllLeaveRequests(),
        payrollService.getTotalPayrollAmount(),
      ]);

      setEmployees(allProfiles);
      setRecentAttendance(allAttendance.slice(0, 6));
      setPendingLeaves(allLeaves.filter((l) => l.status === 'PENDING').slice(0, 5));

      // Calculate present today
      const today = new Date().toISOString().split('T')[0];
      const todayPresent = allAttendance.filter(
        (a) => a.attendance_date === today && a.status === 'PRESENT'
      ).length;
      setPresentTodayCount(todayPresent);

      setTotalPayrollAmount(totalPay);
    } catch (err) {
      console.error('Error loading admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage label="Loading administrator overview..." />;
  }

  // Department distribution data for charts
  const deptCountMap: Record<string, number> = {};
  employees.forEach((emp) => {
    const dept = emp.department || 'General';
    deptCountMap[dept] = (deptCountMap[dept] || 0) + 1;
  });

  const chartData = Object.keys(deptCountMap).map((dept) => ({
    name: dept.split(' ')[0],
    fullName: dept,
    count: deptCountMap[dept],
  }));

  return (
    <div className="space-y-6">
      {/* Admin Greeting Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Organization Management Overview
          </h2>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Monitor real-time company metrics, employee attendance, pending leave approvals, and active payroll allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/leaves"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Clock className="w-4 h-4" />
            Review Leaves ({pendingLeaves.length})
          </Link>
        </div>
      </div>

      {/* 4 Key Performance Indicator (KPI) Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Employees
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{employees.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/admin/employees" className="text-indigo-600 hover:underline inline-flex items-center">
                Manage directory <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Present Today
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{presentTodayCount}</div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/admin/attendance" className="text-indigo-600 hover:underline inline-flex items-center">
                Live attendance sheet <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Leaves
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{pendingLeaves.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/admin/leaves" className="text-amber-600 font-semibold hover:underline inline-flex items-center">
                Action required <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Total Monthly Payroll */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Payroll
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalPayrollAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <Link to="/admin/payroll" className="text-indigo-600 hover:underline inline-flex items-center">
                Salary structures <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Chart & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Headcount by Department</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of registered staff across teams.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No departmental data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
                            <span className="font-semibold">{payload[0].payload.fullName}:</span>{' '}
                            {payload[0].value} employee(s)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Actionable Pending Approvals Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Pending Approvals</h3>
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {pendingLeaves.length}
              </span>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                🎉 All leave requests are up to date!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {leave.profile?.full_name || 'Employee'}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {leave.leave_type} • {formatDate(leave.start_date)}
                      </div>
                    </div>
                    <Link
                      to="/admin/leaves"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium text-[11px] hover:bg-indigo-700"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              to="/admin/leaves"
              className="w-full inline-flex justify-center items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 py-2"
            >
              View Full Leave Approval Inbox <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Organization Attendance Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Attendance Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live check-in timestamps across company.</p>
          </div>
          <Link
            to="/admin/attendance"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center"
          >
            All Logs <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No attendance logged across the company yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Check In</th>
                  <th className="py-2.5 px-4">Check Out</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {record.profile?.full_name || 'Staff Member'}
                      <span className="block text-[11px] font-mono text-slate-400">
                        {record.profile?.employee_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {record.profile?.department || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      {formatDate(record.attendance_date)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={record.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
