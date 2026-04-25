import { supabase } from './supabase';

export async function uploadProofPhoto(
  userId: string,
  taskId: number,
  imageUri: string
): Promise<string> {
  const fileName = `${userId}/task_${taskId}_${Date.now()}.jpg`;

  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('proof-photos')
    .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('proof-photos').getPublicUrl(fileName);
  return data.publicUrl;
}
