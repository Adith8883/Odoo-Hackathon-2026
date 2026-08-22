export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY: '/verify',
  },
  EMPLOYEE: {
    HOME: '/employee/home',
    ATTENDANCE: '/employee/attendance',
    LEAVE: '/employee/leave',
    MESSAGES: '/employee/messages',
    MEETINGS: '/employee/meetings',
    GROUPS: '/employee/groups',
    PAYROLL: '/employee/payroll',
    PROFILE: '/employee/profile',
  },
  HR: {
    DASHBOARD: '/hr/dashboard',
    EMPLOYEES: '/hr/employees',
    ATTENDANCE: '/hr/attendance',
    LEAVE: '/hr/leave',
    MESSAGES: '/hr/messages',
    MEETINGS: '/hr/meetings',
    GROUPS: '/hr/groups',
    ANNOUNCEMENTS: '/hr/announcements',
    PAYROLL: '/hr/payroll',
  },
} as const;
