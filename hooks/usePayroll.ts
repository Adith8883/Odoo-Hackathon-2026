'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMyPayroll } from '@/services/payroll.service';
import { useEmployee } from './useEmployee';

export function usePayroll(providedEmployeeId?: string) {
  const { employee, isLoading: isEmployeeLoading } = useEmployee();
  const empId = providedEmployeeId || employee?.id;

  const [payroll, setPayroll] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayroll = useCallback(async () => {
    if (!empId) return;
    setIsLoading(true);
    try {
      const data = await getMyPayroll(empId);
      setPayroll(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    if (!isEmployeeLoading) {
      fetchPayroll();
    }
  }, [isEmployeeLoading, fetchPayroll]);

  return { payroll, isLoading: isLoading || isEmployeeLoading, error, fetchPayroll };
}
