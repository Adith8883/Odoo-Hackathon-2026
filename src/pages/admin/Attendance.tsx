import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Filter,
  Search,
  Calendar,
  Users,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { profileService } from '../../services/profileService';
import { AttendanceRecord, Profile } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/helpers';

export const Attendance: React.FC = () => {
  const { showError } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allAttendance, allProfiles] = await Promise.all([
        attendanceService.getAllAttendance({
          employeeId: selectedEmployeeId || undefined,
          date: selectedDate || undefined,
          status: selectedStatus,
        }),
        profileService.getAllProfiles(),
      ]);

      setRecords(allAttendance);
      setEmployees(allProfiles);
    } catch (err: any) {
      console.error('Error loading attendance logs:', err);
      showError(err.message || 'Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEmployeeId, selectedDate, selectedStatus]);

  const handleResetFilters = () => {
    setSelectedEmployeeId('');
    setSelectedDate('');
    setSelectedStatus('ALL');
  };

  if (loading && records.length === 0) {
    return <LoadingSpinner fullPage label="Loading organization attendance records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Attendance Records
        </h2>
        <p className="text-sm text-slate-500">
          Monitor and filter daily punch records across all company departments and personnel.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          {/* Employee Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>

        {/* Reset button */}
        {(selectedEmployeeId || selectedDate || selectedStatus !== 'ALL') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">Attendance Log</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {records.length} Record{records.length !== 1 ? 's' : ''}
          </span>
        </div>

        {records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No Attendance Logs Found"
            description="No records match the selected filter conditions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => {
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
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {record.profile?.full_name || 'Employee'}
                        <span className="block text-xs font-mono text-slate-400">
                          {record.profile?.employee_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {record.profile?.department || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="py-3.5 px-4 text-xs">{formatTime(record.check_in)}</td>
                      <td className="py-3.5 px-4 text-xs">{formatTime(record.check_out)}</td>
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
