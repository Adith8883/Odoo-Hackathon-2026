import { supabase } from '../lib/supabase';
import { LeaveRequest, LeaveStatus, LeaveType } from '../types/database';

export const leaveService = {
  async applyLeave(data: {
    employee_id: string;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    remarks?: string;
  }): Promise<LeaveRequest> {
    if (new Date(data.start_date) > new Date(data.end_date)) {
      throw new Error('End date cannot be earlier than start date.');
    }

    const { data: result, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: data.employee_id,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        remarks: data.remarks || '',
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result as LeaveRequest;
  },

  async getOwnLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as LeaveRequest[];
  },

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profile:profiles (
          id,
          employee_id,
          full_name,
          email,
          job_title,
          department
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as LeaveRequest[];
  },

  async updateLeaveStatus(
    leaveId: number,
    status: 'APPROVED' | 'REJECTED',
    adminComment?: string
  ): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status,
        admin_comment: adminComment || null,
      })
      .eq('id', leaveId)
      .select(`
        *,
        profile:profiles (
          id,
          employee_id,
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as LeaveRequest;
  },

  async getPendingLeavesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    if (error) {
      return 0;
    }

    return count || 0;
  },
};
