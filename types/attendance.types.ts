export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

export interface AttendanceRecord {
  id: string;
  employee_id?: string;
  employeeId?: string;
  date: string;
  check_in?: string | null;
  checkIn?: string | null;
  check_out?: string | null;
  checkOut?: string | null;
  status: AttendanceStatus | string;
  notes?: string | null;
  created_at?: string;
}

export interface TodayAttendance {
  checkedIn: boolean;
  checkedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
}

export interface WeeklyAttendance {
  records: AttendanceRecord[];
  totalWorkHours?: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
}
