import { supabase } from '../lib/supabase';

export async function getMaterialsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*, profiles(name)')
    .eq('course_id', courseId)
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

export async function uploadMaterial(material: {
  title: string;
  type: 'exam' | 'exercise' | 'notes' | 'summary';
  course_id: string;
  user_id: string;
  academic_year?: string;
  file_url?: string;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('materials')
    .insert(material)
    .select()
    .single();
  if (error) throw error;
  return data;
}
