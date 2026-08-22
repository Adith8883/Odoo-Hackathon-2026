'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllEmployees, getEmployeeStats } from '@/services/employee.service';

export function useEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [stats, setStats] = useState<any>(null);

  const refreshEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const deptFilter = department === 'all' ? undefined : department;
      const data = await getAllEmployees(search, deptFilter);
      setEmployees(data || []);

      const statsData = await getEmployeeStats().catch(() => null);
      setStats(statsData || {
        total: data?.length || 0,
        active: data?.filter((e: any) => e.status === 'active').length || 0,
        on_leave: data?.filter((e: any) => e.status === 'on_leave').length || 0,
      });
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, department]);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  return {
    employees,
    isLoading,
    search,
    setSearch,
    department,
    setDepartment,
    stats,
    refreshEmployees,
  };
}
