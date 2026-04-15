import { supabase } from '../lib/supabase';

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
