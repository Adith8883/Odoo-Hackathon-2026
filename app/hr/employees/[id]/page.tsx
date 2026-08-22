'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EmployeeDetail } from '@/components/hr/EmployeeDetail';
import { getEmployee } from '@/services/employee.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getEmployee(id);
      setEmployee(data);
    } catch (err) {
      console.warn('Failed to load from database, using mock detail:', err);
      setEmployee({
        id,
        employee_id: 'EMP-001',
        department: 'Engineering',
        job_title: 'Senior Software Engineer',
        status: 'active',
        joining_date: '2026-01-15',
        profile: {
          full_name: 'Arjun Kumar',
          email: 'arjun.kumar@dayflow.com',
          phone: '+91 98765 43210',
          address: 'Indiranagar, Bengaluru, Karnataka',
          avatar_url: null,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (isLoading && !employee) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Link href={ROUTES.HR.EMPLOYEES}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Employee Directory
          </Button>
        </Link>
      </div>

      <EmployeeDetail employee={employee} onRefresh={fetchDetails} />
    </div>
  );
}
