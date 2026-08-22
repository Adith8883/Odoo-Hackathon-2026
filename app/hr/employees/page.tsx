'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmployeeList } from '@/components/hr/EmployeeList';
import { getAllEmployees } from '@/services/employee.service';

const FALLBACK_EMPLOYEES = [
  { id: '1', name: 'Arjun Kumar', email: 'arjun.kumar@dayflow.com', department: 'Engineering', jobTitle: 'Senior Software Engineer', status: 'active', employeeId: 'EMP-001' },
  { id: '2', name: 'Priya Sharma', email: 'priya.sharma@dayflow.com', department: 'Design', jobTitle: 'UI/UX Designer', status: 'active', employeeId: 'EMP-002' },
  { id: '3', name: 'Rahul Kumar', email: 'rahul.kumar@dayflow.com', department: 'Marketing', jobTitle: 'Marketing Manager', status: 'on_leave', employeeId: 'EMP-003' },
  { id: '4', name: 'Ananya Patel', email: 'ananya.patel@dayflow.com', department: 'Finance', jobTitle: 'Finance Analyst', status: 'active', employeeId: 'EMP-004' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllEmployees();
      const mapped = (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.profiles?.full_name || emp.profile?.full_name || 'Employee',
        email: emp.profiles?.email || emp.profile?.email || '',
        department: emp.department || 'Engineering',
        jobTitle: emp.job_title || 'Team Member',
        status: emp.status || 'active',
        avatarUrl: emp.profiles?.avatar_url || emp.profile?.avatar_url,
        employeeId: emp.employee_id || emp.id,
      }));
      setEmployees(mapped.length > 0 ? mapped : FALLBACK_EMPLOYEES);
    } catch {
      setEmployees(FALLBACK_EMPLOYEES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Employee Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Browse, search, and manage all employees across departments.
        </p>
      </div>
      <EmployeeList employees={employees} isLoading={isLoading} />
    </div>
  );
}
