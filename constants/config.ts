export const APP_CONFIG = {
  APP_NAME: 'Dayflow',
  APP_TAGLINE: 'Every workday, perfectly aligned.',
  CURRENCY: '₹',
  CURRENCY_CODE: 'INR',
  WORK_HOURS: { start: 9, end: 18 },
  LEAVE_TYPES: [
    { id: 'annual', name: 'Annual Leave' },
    { id: 'sick', name: 'Sick Leave' },
    { id: 'casual', name: 'Casual Leave' },
    { id: 'maternity', name: 'Maternity Leave' },
    { id: 'paternity', name: 'Paternity Leave' },
  ],
  DEPARTMENTS: [
    'Engineering',
    'Design',
    'Marketing',
    'Finance',
    'Human Resources',
    'Operations',
  ],
  ATTENDANCE_STATUSES: ['present', 'absent', 'half_day', 'leave'],
  LEAVE_STATUSES: ['pending', 'approved', 'rejected'],
} as const;
