'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getMyLeaveRequests,
  getLeaveBalance,
  getLeaveTypes,
  applyLeave as applyLeaveService,
} from '@/services/leave.service';
import { useEmployee } from './useEmployee';

export function useLeave(providedEmployeeId?: string) {
  const { employee, isLoading: isEmployeeLoading } = useEmployee();
  const empId = providedEmployeeId || employee?.id;

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLeave = useCallback(async () => {
    setIsLoading(true);
    try {
      const types = await getLeaveTypes().catch(() => []);
      setLeaveTypes(types || []);

      if (empId) {
        const [requests, balance] = await Promise.all([
          getMyLeaveRequests(empId).catch(() => []),
          getLeaveBalance(empId).catch(() => []),
        ]);
        setLeaveRequests(requests || []);
        setLeaveBalance(balance || []);
      }
    } catch (error) {
      console.error('Failed to load leave data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    if (!isEmployeeLoading) {
      refreshLeave();
    }
  }, [isEmployeeLoading, refreshLeave]);

  const applyLeave = async (data: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    if (!empId) throw new Error('Employee record not found.');
    await applyLeaveService({
      employee_id: empId,
      leave_type_id: data.leaveTypeId,
      start_date: data.startDate,
      end_date: data.endDate,
      total_days: data.totalDays,
      reason: data.reason,
    });
    await refreshLeave();
  };

  return {
    leaveRequests,
    leaveBalance,
    leaveTypes,
    isLoading: isLoading || isEmployeeLoading,
    applyLeave,
    refreshLeave,
  };
}
