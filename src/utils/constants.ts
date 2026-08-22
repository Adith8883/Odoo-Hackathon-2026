export const APP_NAME = 'Dayflow HRMS';

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance & Accounting',
  'Marketing & Sales',
  'Product Design',
  'Customer Operations',
  'Legal & Compliance',
  'General',
] as const;

export const JOB_TITLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'HR Specialist',
  'HR Manager',
  'Financial Analyst',
  'Product Manager',
  'UI/UX Designer',
  'Operations Coordinator',
  'Executive Assistant',
] as const;

export const LEAVE_TYPES: { value: 'PAID' | 'SICK' | 'UNPAID'; label: string; description: string }[] = [
  { value: 'PAID', label: 'Paid Leave', description: 'Standard paid time off allocation' },
  { value: 'SICK', label: 'Sick Leave', description: 'Medical and health recovery leave' },
  { value: 'UNPAID', label: 'Unpaid Leave', description: 'Personal leave without pay' },
];
