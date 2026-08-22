'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getTodayAttendance,
  getWeeklyAttendance,
  getAttendanceHistory,
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
} from '@/services/attendance.service';
import { useEmployee } from './useEmployee';

export function useAttendance(providedEmployeeId?: string) {
  const { employee, isLoading: isEmployeeLoading } = useEmployee();
  const empId = providedEmployeeId || employee?.id;

  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAttendance = useCallback(async () => {
    if (!empId) return;
    setIsLoading(true);
    try {
      const [today, weekly, historyRes] = await Promise.all([
        getTodayAttendance(empId).catch(() => null),
        getWeeklyAttendance(empId).catch(() => []),
        getAttendanceHistory(empId, 1, 30).catch(() => ({ data: [] })),
      ]);
      setTodayAttendance(today);
      setWeeklyAttendance(weekly || []);
      setAttendanceHistory(historyRes?.data || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    if (!isEmployeeLoading) {
      refreshAttendance();
    }
  }, [isEmployeeLoading, refreshAttendance]);

  const checkIn = async () => {
    if (!empId) throw new Error('Employee ID missing');
    await apiCheckIn(empId);
    await refreshAttendance();
  };

  const checkOut = async () => {
    if (!empId) throw new Error('Employee ID missing');
    await apiCheckOut(empId);
    await refreshAttendance();
  };

  return {
    todayAttendance,
    weeklyAttendance,
    attendanceHistory,
    isLoading: isLoading || isEmployeeLoading,
    checkIn,
    checkOut,
    refreshAttendance,
  };
}
