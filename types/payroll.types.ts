export interface SalaryBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  pf: number;
  tax: number;
  otherDeductions: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  breakdown: SalaryBreakdown;
  status: 'draft' | 'processed' | 'paid';
  paidOn?: string;
  payslipUrl?: string;
}
