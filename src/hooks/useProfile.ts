import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { profileService } from '../services/profileService';
import { Profile } from '../types/database';
import { useToast } from '../context/ToastContext';

export function useProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (updates: {
    phone?: string | null;
    address?: string | null;
    profile_picture_url?: string | null;
  }) => {
    if (!user) return;
    setUpdating(true);
    try {
      await profileService.updateOwnProfile(user.id, updates);
      await refreshProfile();
      showSuccess('Profile updated successfully.');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    updating,
    updateProfile,
    refreshProfile,
  };
}
