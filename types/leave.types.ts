export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  daysPerYear: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  leaveTypeId: string;
  total: number;
  used: number;
  available: number;
}

export interface LeaveApplication {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}
