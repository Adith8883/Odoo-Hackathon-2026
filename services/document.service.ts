import { createClient } from '@/lib/supabase';

export async function getDocuments(employeeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadDocument(employeeId: string, file: File, uploadedBy: string) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
  const filePath = `documents/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('employee-documents')
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('employee-documents')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('documents')
    .insert([{
      employee_id: employeeId,
      name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      uploaded_by: uploadedBy,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDocument(documentId: string, filePath: string) {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage
    .from('employee-documents')
    .remove([filePath]);

  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) throw new Error(error.message);
}
