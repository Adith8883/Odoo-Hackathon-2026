import { createClient } from '@/lib/supabase';
import { sendEmailNotification } from './email.service';
import { formatDate } from '@/utils/date';

export async function getLeaveTypes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getMyLeaveRequests(employeeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, leave_types(*)')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function applyLeave(request: {
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('leave_requests')
    .insert([{ ...request, status: 'pending' }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getLeaveBalance(employeeId: string) {
  const supabase = createClient();
  const leaveTypes = await getLeaveTypes();

  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const { data: approvedLeaves, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('status', 'approved')
    .gte('start_date', startOfYear)
    .lte('end_date', endOfYear);

  if (error) throw new Error(error.message);

  return leaveTypes.map((type) => {
    const usedDays =
      approvedLeaves
        ?.filter((leave) => leave.leave_type_id === type.id)
        .reduce((acc, curr) => acc + curr.total_days, 0) || 0;

    return {
      leave_type_id: type.id,
      leave_type_name: type.name,
      total_days: type.default_days,
      used_days: usedDays,
      remaining_days: Math.max(0, type.default_days - usedDays),
    };
  });
}

export async function getPendingLeaveRequests() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, leave_types(*), employees(*, profiles(*))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function reviewLeave(
  requestId: string,
  status: 'approved' | 'rejected',
  comment?: string,
  reviewerId?: string
) {
  const supabase = createClient();
  let revId = reviewerId;

  // Auto-resolve reviewer UUID from currently logged-in auth user if not supplied
  if (!revId) {
    const { data: { user } } = await supabase.auth.getUser();
    revId = user?.id;
  }

  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status,
      reviewed_by: revId || null,
      reviewer_comment: comment || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select('*, leave_types(*), employees(*, profiles(*))')
    .single();

  if (error) throw new Error(error.message);

  // Dispatch Email Notification to the Employee
  try {
    const empEmail = data?.employees?.profiles?.email || 'abhilash998575@gmail.com';
    const empName = data?.employees?.profiles?.full_name || 'Team Member';
    const typeName = data?.leave_types?.name || 'Leave';

    await sendEmailNotification({
      to: empEmail,
      subject: `Leave Request ${status === 'approved' ? 'Approved ✓' : 'Declined ✗'} — ${typeName}`,
      template: 'leave_status',
      recipientName: empName,
      data: {
        leaveType: typeName,
        startDate: formatDate(new Date(data.start_date), 'd MMM yyyy'),
        endDate: formatDate(new Date(data.end_date), 'd MMM yyyy'),
        totalDays: data.total_days,
        status,
        comment,
      },
    });
  } catch (emailErr) {
    console.warn('Failed to send leave decision email:', emailErr);
  }

  return data;
}

export async function getAllLeaveRequests(status?: string) {
  const supabase = createClient();
  let query = supabase
    .from('leave_requests')
    .select('*, leave_types(*), employees(*, profiles(*))')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}
