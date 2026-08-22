import { createClient } from '@/lib/supabase';

export async function getAllEmployees(search?: string, department?: string) {
  const supabase = createClient();
  let query = supabase
    .from('employees')
    .select('*, profile:profiles(*)');

  if (department && department !== 'all') {
    query = query.eq('department', department);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let filteredData = data || [];
  if (search && search.trim() !== '') {
    const searchTerm = search.toLowerCase();
    filteredData = filteredData.filter((emp: any) =>
      emp.employee_id?.toLowerCase().includes(searchTerm) ||
      emp.department?.toLowerCase().includes(searchTerm) ||
      emp.job_title?.toLowerCase().includes(searchTerm) ||
      emp.profile?.full_name?.toLowerCase().includes(searchTerm) ||
      emp.profile?.email?.toLowerCase().includes(searchTerm)
    );
  }

  return filteredData;
}

export async function getEmployee(employeeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      profile:profiles(*),
      attendance(*),
      leave_requests(*, leave_types(*)),
      payroll(*)
    `)
    .eq('id', employeeId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateEmployee(
  employeeId: string,
  updates: { department?: string; job_title?: string; status?: 'active' | 'inactive' | 'on_leave' }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getEmployeeStats() {
  const supabase = createClient();

  const { data: allEmployees, error } = await supabase
    .from('employees')
    .select('status, id');

  if (error) throw new Error(error.message);

  const total = allEmployees?.length || 0;
  const active = allEmployees?.filter((emp) => emp.status === 'active').length || 0;
  const on_leave = allEmployees?.filter((emp) => emp.status === 'on_leave').length || 0;

  return { total, active, on_leave };
}
