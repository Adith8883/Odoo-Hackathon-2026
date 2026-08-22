import { supabase } from '../lib/supabase';
import { PayrollRecord } from '../types/database';

export const payrollService = {
  async getOwnPayroll(employeeId: string): Promise<PayrollRecord | null> {
    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as PayrollRecord | null;
  },

  async getAllPayroll(): Promise<PayrollRecord[]> {
    const { data, error } = await supabase
      .from('payroll')
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
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as PayrollRecord[];
  },

  async updatePayroll(
    employeeId: string,
    salaryData: {
      basic_salary: number;
      allowances: number;
      deductions: number;
    }
  ): Promise<PayrollRecord> {
    const netSalary =
      Number(salaryData.basic_salary || 0) +
      Number(salaryData.allowances || 0) -
      Number(salaryData.deductions || 0);

    const { data, error } = await supabase
      .from('payroll')
      .upsert(
        {
          employee_id: employeeId,
          basic_salary: salaryData.basic_salary,
          allowances: salaryData.allowances,
          deductions: salaryData.deductions,
          net_salary: netSalary,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'employee_id' }
      )
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
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as PayrollRecord;
  },

  async getTotalPayrollAmount(): Promise<number> {
    const { data, error } = await supabase.from('payroll').select('net_salary');

    if (error || !data) {
      return 0;
    }

    return data.reduce((sum, item) => sum + (Number(item.net_salary) || 0), 0);
  },
};
