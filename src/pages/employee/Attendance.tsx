import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceRecord } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/helpers';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [todayRecord, historyRecords] = await Promise.all([
        attendanceService.getTodayAttendance(user.id),
        attendanceService.getEmployeeAttendanceHistory(user.id),
      ]);
      setTodayAttendance(todayRecord);
      setHistory(historyRecords);
    } catch (err: any) {
      console.error('Error loading attendance:', err);
      showError(err.message || 'Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCheckIn = async () => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      const record = await attendanceService.checkIn(user.id);
      setTodayAttendance(record);
      showSuccess('Checked in successfully!');
      loadData();
    } catch (err: any) {
      showError(err.message || 'Could not check in.');
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
      loadData();
    } catch (err: any) {
      showError(err.message || 'Could not check out.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading attendance history..." />;
  }

  const isCheckedIn = Boolean(todayAttendance?.check_in);
  const isCheckedOut = Boolean(todayAttendance?.check_out);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Attendance Log
        </h2>
        <p className="text-sm text-slate-500">
          Mark your daily working hours and review your past attendance timeline.
        </p>
      </div>

      {/* Today's Punch Clock Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Today's Punch Status</h3>
                {todayAttendance && <StatusBadge status={todayAttendance.status} size="sm" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500" />
                Check In
              </div>
              <div className="text-sm font-bold text-slate-800">
                {formatTime(todayAttendance?.check_in)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <ArrowUpCircle className="w-3.5 h-3.5 text-rose-500" />
                Check Out
              </div>
              <div className="text-sm font-bold text-slate-800">
                {formatTime(todayAttendance?.check_out)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isCheckedIn && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckIn}
                isLoading={actionLoading}
                className="w-full lg:w-auto"
                leftIcon={<Clock className="w-4 h-4" />}
              >
                Punch In Now
              </Button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <Button
                variant="danger"
                size="lg"
                onClick={handleCheckOut}
                isLoading={actionLoading}
                className="w-full lg:w-auto"
                leftIcon={<Clock className="w-4 h-4" />}
              >
                Punch Out
              </Button>
            )}

            {isCheckedOut && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Attendance Completed Today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Attendance History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of your working days.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {history.length} Record{history.length !== 1 ? 's' : ''}
          </span>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Attendance Logs Yet"
            description="When you check in each workday, your punch timestamps and status will be archived here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Total Time</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => {
                  let duration = '—';
                  if (record.check_in && record.check_out) {
                    const diffMs =
                      new Date(record.check_out).getTime() -
                      new Date(record.check_in).getTime();
                    const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(1);
                    duration = `${diffHours} hrs`;
                  }

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="py-3.5 px-4">{formatTime(record.check_in)}</td>
                      <td className="py-3.5 px-4">{formatTime(record.check_out)}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {duration}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
