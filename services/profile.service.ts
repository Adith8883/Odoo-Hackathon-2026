import { createClient } from '@/lib/supabase';

export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, employees(*)')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMyProfile() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error(authError?.message || 'User not found');
  
  return getProfile(user.id);
}

export async function updateProfile(userId: string, updates: { phone?: string; address?: string; avatar_url?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  return updateProfile(userId, { avatar_url: publicUrl });
}
