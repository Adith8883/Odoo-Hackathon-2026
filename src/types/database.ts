export type UserRole = 'EMPLOYEE' | 'ADMIN';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export type LeaveType = 'PAID' | 'SICK' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Profile {
  id: string; // references auth.users id
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  job_title?: string | null;
  department?: string | null;
  joining_date?: string | null;
  profile_picture_url?: string | null;
  role: UserRole;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  created_at: string;
  profile?: Profile;
}

export interface LeaveRequest {
  id: number;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  remarks?: string | null;
  status: LeaveStatus;
  admin_comment?: string | null;
  created_at: string;
  profile?: Profile;
}

export interface PayrollRecord {
  id: number;
  employee_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  updated_at: string;
  profile?: Profile;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  totalPayroll: number;
}
