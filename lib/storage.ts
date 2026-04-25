import { supabase } from './supabase';

export async function uploadProofPhoto(
  userId: string,
  taskId: number,
  imageUri: string
): Promise<string> {
  const fileName = `${userId}/task_${taskId}_${Date.now()}.jpg`;

  // FormData upload works reliably on both iOS and Android
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const { error } = await supabase.storage
    .from('proof-photos')
    .upload(fileName, formData, { contentType: 'image/jpeg', upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('proof-photos').getPublicUrl(fileName);
  return data.publicUrl;
}
