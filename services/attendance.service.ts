import { createClient } from '@/lib/supabase';

export async function getTodayAttendance(employeeId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

export async function checkIn(employeeId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const existing = await getTodayAttendance(employeeId);
  if (existing?.check_in) {
    throw new Error('Already checked in today.');
  }

  const { data, error } = await supabase
    .from('attendance')
    .upsert({
      employee_id: employeeId,
      date: today,
      check_in: now,
      status: 'present',
    }, { onConflict: 'employee_id, date' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function checkOut(employeeId: string) {
  const supabase = createClient();
  const now = new Date().toISOString();

  const existing = await getTodayAttendance(employeeId);
  if (!existing?.check_in) {
    throw new Error('No check-in found for today.');
  }

  const { data, error } = await supabase
    .from('attendance')
    .update({ check_out: now })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getWeeklyAttendance(employeeId: string) {
  const supabase = createClient();
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0];
  const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7)).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAttendanceHistory(employeeId: string, page = 1, limit = 10) {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('attendance')
    .select('*', { count: 'exact' })
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data || [], count, page, limit };
}

export async function getOrganizationAttendance(date?: string) {
  const supabase = createClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('*, employees(*, profiles(*))')
    .eq('date', targetDate);

  if (error) throw new Error(error.message);
  return data || [];
}
