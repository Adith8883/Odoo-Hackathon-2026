import { supabase } from '../lib/supabase';
import { AttendanceRecord, AttendanceStatus } from '../types/database';
import { getTodayDateString } from '../utils/helpers';

export const attendanceService = {
  async getTodayAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    const today = getTodayDateString();
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('attendance_date', today)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as AttendanceRecord | null;
  },

  async getEmployeeAttendanceHistory(employeeId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('attendance_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as AttendanceRecord[];
  },

  async getAllAttendance(filters?: {
    employeeId?: string;
    date?: string;
    status?: string;
  }): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance')
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
      .order('attendance_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }

    if (filters?.date) {
      query = query.eq('attendance_date', filters.date);
    }

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as AttendanceRecord[];
  },

  async checkIn(employeeId: string): Promise<AttendanceRecord> {
    const today = getTodayDateString();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        attendance_date: today,
        check_in: nowIso,
        status: 'PRESENT',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Attendance already recorded for today.');
      }
      throw new Error(error.message);
    }

    return data as AttendanceRecord;
  },

  async checkOut(attendanceId: number): Promise<AttendanceRecord> {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out: nowIso,
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as AttendanceRecord;
  },

  async getAttendanceStats(): Promise<{ presentToday: number }> {
    const today = getTodayDateString();
    const { count, error } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('attendance_date', today)
      .eq('status', 'PRESENT');

    if (error) {
      return { presentToday: 0 };
    }

    return { presentToday: count || 0 };
  },
};
