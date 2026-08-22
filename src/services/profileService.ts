import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return data as Profile;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as Profile[];
  },

  async updateOwnProfile(
    userId: string,
    updates: { phone?: string | null; address?: string | null; profile_picture_url?: string | null }
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        phone: updates.phone,
        address: updates.address,
        profile_picture_url: updates.profile_picture_url,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Profile;
  },

  async updateProfileByAdmin(
    userId: string,
    updates: Partial<Omit<Profile, 'id' | 'created_at'>>
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Profile;
  },
};
