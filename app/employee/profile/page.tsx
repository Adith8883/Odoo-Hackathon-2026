'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEmployee } from '@/hooks/useEmployee';
import { useProfile } from '@/hooks/useProfile';
import { ProfileView } from '@/components/employee/ProfileView';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  useAuth();
  const { employee, isLoading: isEmpLoading, refreshEmployee } = useEmployee();
  const { updateProfile, uploadAvatar, isLoading: isProfileLoading } = useProfile();

  const handleUpdate = async (updates: { phone?: string; address?: string }) => {
    await updateProfile(updates);
    await refreshEmployee();
  };

  const handleAvatar = async (file: File) => {
    await uploadAvatar(file);
    await refreshEmployee();
  };

  if (isEmpLoading && !employee) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          My Profile & Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View your organizational credentials and manage your personal contact information.
        </p>
      </div>

      <ProfileView
        employee={employee}
        isLoading={isProfileLoading}
        onUpdateProfile={handleUpdate}
        onUploadAvatar={handleAvatar}
      />
    </div>
  );
}
