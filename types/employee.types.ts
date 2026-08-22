export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface Employee {
  id: string;
  userId: string;
  department: string;
  designation: string;
  joiningDate: string;
  employeeId: string;
  managerId?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

export interface EmployeeWithProfile extends Employee {
  profile: Profile;
  email: string;
  fullName: string;
  avatarUrl?: string;
}
