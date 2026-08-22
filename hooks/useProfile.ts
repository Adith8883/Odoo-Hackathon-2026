'use client';
import { useState, useEffect } from 'react';
import { getProfile, updateProfile as updateProfileApi, uploadAvatar as uploadAvatarApi } from '@/services/profile.service';
import { useAuthStore } from '@/store/authStore';

export function useProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    getProfile(user.id)
      .then(data => setProfile(data))
      .catch(err => setError(err))
      .finally(() => setIsLoading(false));
  }, [user]);

  const updateProfile = async (data: any) => {
    if (!user?.id) return;
    const updated = await updateProfileApi(user.id, data);
    setProfile(updated);
    return updated;
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return;
    const updated = await uploadAvatarApi(user.id, file);
    setProfile(updated);
    return updated;
  };

  return { profile, isLoading, error, updateProfile, uploadAvatar };
}
