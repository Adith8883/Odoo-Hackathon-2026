import { createClient } from './supabase';

const PROFILE_BUCKET = 'profile-pictures';
const DOCUMENT_BUCKET = 'employee-documents';

export async function uploadProfilePicture(userId: string, file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(filePath, file, { upsert: true });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(PROFILE_BUCKET)
    .getPublicUrl(filePath);
  
  return publicUrl;
}

export async function uploadDocument(employeeId: string, file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${employeeId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(filePath, file);
  
  if (error) throw error;
  return data.path;
}

export async function getDocumentUrl(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(path, 3600);
  
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .remove([path]);
  if (error) throw error;
}
