import { supabase } from '../lib/supabase';

export async function getMaterialsByCourse(classCode: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*, profiles(name)')
    .eq('class_code', classCode)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMaterialsByType(type: 'exam' | 'exercise' | 'notes' | 'summary') {
  const { data, error } = await supabase
    .from('materials')
    .select('*, courses(code, name), profiles(name)')
    .eq('type', type)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Upload a file to Supabase Storage and return its public URL.
 *
 * Bucket structure:  materials/LEIC/Y{year}/S{semester}/{classCode}/{ts}_{fileName}
 * The bucket must exist with public read access.
 *
 * NOTE: Uses FormData instead of fetch+Blob because React Native cannot
 * use fetch() on local file:// URIs.
 */
export async function uploadMaterialFile(
  fileUri: string,
  fileName: string,
  mimeType: string,
  /** Course year (integer from the courses table, e.g. 1, 2, 3) */
  courseYear: number,
  /** Course semester (smallint from the courses table, e.g. 1 or 2) */
  courseSemester: number,
  /** Course code / acronym (e.g. "ES", "BD") */
  classCode: string,
): Promise<string> {
  // Sanitize filename: keep only alphanumeric, dots, hyphens, underscores.
  // Supabase Storage rejects keys with spaces, accents, parentheses, etc.
  const safeName = fileName
    .normalize('NFD')                        // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')         // strip accent marks
    .replace(/[^a-zA-Z0-9._-]/g, '_');      // replace everything else

  // e.g. (bucket: LEIC)  Y2/S1/ES/1714900000000_exam2024.pdf
  const path = `Y${courseYear}/S${courseSemester}/${classCode}/${Date.now()}_${safeName}`;

  // FormData is the correct way to upload local files in React Native / Expo.
  // fetch() on a file:// URI throws "Network request failed" on Android.
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const { error: uploadError } = await supabase.storage
    .from('LEIC')
    .upload(path, formData, { contentType: mimeType, upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('LEIC').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMaterial(material: {
  title: string;
  description?: string;
  type: 'exam' | 'exercise' | 'notes' | 'summary';
  class_code: string;
  user_id: string;
  academic_year?: string;
  file_url?: string;
  is_solved?: boolean;
}) {
  const { data, error } = await supabase
    .from('materials')
    .insert(material)
    .select()
    .single();
  if (error) throw error;
  return data;
}
