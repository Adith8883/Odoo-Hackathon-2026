import { UserRole } from '../types/auth.types';

export const canEditField = (role: UserRole | null, fieldName: string): boolean => {
  if (role === 'hr') return true;
  return !isProtectedField(fieldName);
};

export const canApproveLeave = (role: UserRole | null): boolean => {
  return role === 'hr';
};

export const canManagePayroll = (role: UserRole | null): boolean => {
  return role === 'hr';
};

export const canViewAllEmployees = (role: UserRole | null): boolean => {
  return role === 'hr';
};

export const isProtectedField = (fieldName: string): boolean => {
  const protectedFields = [
    'role',
    'salary',
    'department',
    'designation',
    'employeeId',
    'joiningDate',
    'managerId',
    'status'
  ];
  return protectedFields.includes(fieldName);
};
