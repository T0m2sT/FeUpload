import { Platform } from 'react-native';
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

export async function getMaterialsByClassCodeAndType(
  classCode: string,
  type: 'exam' | 'exercise' | 'notes' | 'summary',
): Promise<{ id: string; title: string; file_url: string | null; file_url_solved: string | null; is_solved: boolean; academic_year: string | null; description: string | null; class_code: string; type: string }[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('id, title, file_url, file_url_solved, is_solved, academic_year, class_code, type, description')
    .eq('class_code', classCode)
    .eq('type', type)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
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

export type SummaryListItem = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  created_at: string;
  author: string;
  avgRating: number;
  ratingCount: number;
};

export async function getSummariesByClassCode(classCode: string): Promise<SummaryListItem[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('id, title, description, file_url, created_at, profiles(name), reviews(rating)')
    .eq('type', 'summary')
    .eq('class_code', classCode);
  if (error) throw error;

  const items: SummaryListItem[] = (data ?? []).map((row: any) => {
    const ratings: number[] = (row.reviews ?? []).map((r: any) => r.rating);
    const avg = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      file_url: row.file_url,
      created_at: row.created_at,
      author: row.profiles?.name ?? 'Desconhecido',
      avgRating: avg,
      ratingCount: ratings.length,
    };
  });

  items.sort((a, b) => b.avgRating - a.avgRating);
  return items;
}

export async function getSummaryById(id: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('id, title, description, file_url, created_at, type, class_code, profiles(name), reviews(rating)')
    .eq('id', id)
    .single();
  if (error) throw error;
  const ratings: number[] = (data.reviews ?? []).map((r: any) => r.rating);
  const avgRating = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
  return { ...data, avgRating, ratingCount: ratings.length };
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
  const safeName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  // e.g. (bucket: LEIC)  Y2/S1/ES/1714900000000_exam2024.pdf
  const path = `${classCode}/${Date.now()}_${safeName}`;

  let body: any;

  if (Platform.OS === 'web') {
    const response = await fetch(fileUri);
    body = await response.blob();
  } else {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
    body = formData;
  }

  const { error: uploadError } = await supabase.storage
    .from('LEIC')
    .upload(path, body, { contentType: mimeType, upsert: false });
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
  file_url_solved?: string;
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
