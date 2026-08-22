import { createClient } from '@/lib/supabase';

// Checks if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function getMyPayroll(employeeId: string) {
  if (!employeeId || !isValidUUID(employeeId)) {
    return null;
  }
  const supabase = createClient();

  // 1. Fetch Payroll record
  const { data: payroll, error } = await supabase
    .from('payroll')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);

  // Default salary structure if record doesn't exist yet
  const baseSalary = Number(payroll?.base_salary) || 45000;
  const allowances = Number(payroll?.allowances) || 12000;
  const benefits = Number(payroll?.benefits) || 4000;
  const standardDeductions = Number(payroll?.deductions) || 2500;
  const grossSalary = baseSalary + allowances + benefits;

  // 2. Query approved leaves taken for this employee
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const { data: approvedLeaves } = await supabase
    .from('leave_requests')
    .select('total_days, leave_types(name)')
    .eq('employee_id', employeeId)
    .eq('status', 'approved')
    .gte('start_date', startOfYear)
    .lte('end_date', endOfYear);

  const leaveDaysTaken = (approvedLeaves || []).reduce((acc, curr) => acc + (curr.total_days || 0), 0);

  // Each leave costs (total_salary / 30)
  const perDaySalaryRate = Math.round((grossSalary / 30) * 100) / 100;
  const leaveDeduction = Math.round(leaveDaysTaken * (grossSalary / 30));
  const totalDeductions = standardDeductions + leaveDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);
  const annualCtc = grossSalary * 12;

  return {
    ...(payroll || {}),
    employee_id: employeeId,
    base_salary: baseSalary,
    allowances,
    benefits,
    deductions: standardDeductions,
    gross_salary: grossSalary,
    per_day_rate: perDaySalaryRate,
    leave_days_taken: leaveDaysTaken,
    leave_deduction: leaveDeduction,
    total_deductions: totalDeductions,
    net_salary: netSalary,
    annual_ctc: annualCtc,
  };
}

export async function updatePayroll(
  employeeId: string,
  updates: {
    base_salary?: number;
    allowances?: number;
    benefits?: number;
    deductions?: number;
  }
) {
  const supabase = createClient();

  // If a non-UUID ID was provided (e.g. from mock/demo), resolve first actual employee UUID
  let targetEmployeeId = employeeId;
  if (!isValidUUID(targetEmployeeId)) {
    const { data: firstEmp } = await supabase
      .from('employees')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (firstEmp?.id) {
      targetEmployeeId = firstEmp.id;
    } else {
      throw new Error('Please select a valid registered employee from the directory.');
    }
  }

  const { data, error } = await supabase
    .from('payroll')
    .upsert({
      employee_id: targetEmployeeId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'employee_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getAllPayroll() {
  const supabase = createClient();

  // Fetch all payroll records with employee and profile details
  const { data: payrollList, error } = await supabase
    .from('payroll')
    .select('*, employees(*, profiles(*))');

  if (error) throw new Error(error.message);

  // Fetch approved leaves for all employees to calculate dynamic leave deductions
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const { data: allApprovedLeaves } = await supabase
    .from('leave_requests')
    .select('employee_id, total_days')
    .eq('status', 'approved')
    .gte('start_date', startOfYear)
    .lte('end_date', endOfYear);

  // Aggregate leave days per employee
  const leaveDaysMap: Record<string, number> = {};
  (allApprovedLeaves || []).forEach((req) => {
    if (req.employee_id) {
      leaveDaysMap[req.employee_id] = (leaveDaysMap[req.employee_id] || 0) + (req.total_days || 0);
    }
  });

  return (payrollList || []).map((p: any) => {
    const base = Number(p.base_salary) || 45000;
    const allowances = Number(p.allowances) || 12000;
    const benefits = Number(p.benefits) || 4000;
    const standardDeductions = Number(p.deductions) || 2500;
    const gross = base + allowances + benefits;

    const leaveDays = leaveDaysMap[p.employee_id] || 0;
    const perDayRate = Math.round((gross / 30) * 100) / 100;
    const leaveDeduction = Math.round(leaveDays * (gross / 30));
    const totalDeductions = standardDeductions + leaveDeduction;
    const net = Math.max(0, gross - totalDeductions);

    return {
      ...p,
      base_salary: base,
      allowances,
      benefits,
      deductions: standardDeductions,
      gross_salary: gross,
      per_day_rate: perDayRate,
      leave_days_taken: leaveDays,
      leave_deduction: leaveDeduction,
      total_deductions: totalDeductions,
      net_salary: net,
      annual_ctc: gross * 12,
    };
  });
}
