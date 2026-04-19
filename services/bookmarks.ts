import { supabase } from '../lib/supabase';

export async function getBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, materials(title, type, courses(code, name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addBookmark(userId: string, materialId: string, name?: string, color?: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, material_id: materialId, name, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeBookmark(userId: string, materialId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('material_id', materialId);
  if (error) throw error;
}
