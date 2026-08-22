'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useEmployee() {
  const { user } = useAuthStore();
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployee = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // First try to find by profile_id
      const { data, error } = await supabase
        .from('employees')
        .select('*, profile:profiles(*)')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (data) {
        setEmployee(data);
        return;
      }

      // No employee record yet — auto-create one so check-in works immediately
      const { data: newEmployee } = await supabase
        .from('employees')
        .upsert({
          profile_id: user.id,
          employee_id: `EMP-${String(Date.now()).slice(-4)}`,
          department: 'Engineering',
          job_title: 'Team Member',
          status: 'active',
          joining_date: new Date().toISOString().split('T')[0],
        })
        .select('*, profile:profiles(*)')
        .maybeSingle();

      if (newEmployee) {
        setEmployee(newEmployee);
      } else {
        // Fallback in-memory representation so UI renders
        setEmployee({
          id: user.id,
          profile_id: user.id,
          employee_id: 'EMP-001',
          department: 'Engineering',
          job_title: 'Team Member',
          status: 'active',
          joining_date: new Date().toISOString().split('T')[0],
          profile: {
            id: user.id,
            email: user.email || '',
            full_name: user.fullName || user.email?.split('@')[0] || 'Team Member',
            role: user.role || 'employee',
            avatar_url: user.avatarUrl || null,
            phone: null,
            address: null,
          },
        });
      }
    } catch (err) {
      console.error('useEmployee error:', err);
      // Always provide a fallback so the UI doesn't go blank
      setEmployee({
        id: user.id,
        profile_id: user.id,
        employee_id: 'EMP-001',
        department: 'Engineering',
        job_title: 'Team Member',
        status: 'active',
        joining_date: new Date().toISOString().split('T')[0],
        profile: {
          id: user.id,
          email: user.email || '',
          full_name: user.fullName || user.email?.split('@')[0] || 'Team Member',
          role: user.role || 'employee',
          avatar_url: user.avatarUrl || null,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return { employee, isLoading, refreshEmployee: fetchEmployee };
}
