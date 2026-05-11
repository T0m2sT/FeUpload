import { supabase } from '../lib/supabase';

export type BookmarkWithMaterial = {
  id: string;
  user_id: string;
  material_id: string;
  name: string | null;
  color: string;
  created_at: string;
  materials: {
    id: string;
    title: string;
    type: 'exam' | 'exercise' | 'summary' | 'notes';
    file_url?: string;
    class_code: string;
    courses?: {
      code: string;
      name: string;
    };
    reviews?: Array<{ rating: number }>;
  };
};

// ============ Bookmark Management ============

export async function getUserBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, materials(id, title, type, file_url, class_code, courses(code, name), reviews(rating))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as BookmarkWithMaterial[] | null;
}

export async function addBookmark(userId: string, materialId: string | null, name?: string, color?: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: userId,
      material_id: materialId || null,
      name: name || null,
      color: color || '#FF6B6B',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeBookmark(bookmarkId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId);
  if (error) throw error;
}

export async function removeBookmarksByName(userId: string, name: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('name', name);
  if (error) throw error;
}

export async function deleteCollection(collectionId: string) {
  const { error } = await supabase
    .from('bookmark_collections')
    .delete()
    .eq('id', collectionId);
  if (error) throw error;
}

// ============ Collection Items Management ============

export async function addItemToCollection(collectionId: string, materialId: string) {
  const { data, error } = await supabase
    .from('bookmark_collection_items')
    .insert({
      collection_id: collectionId,
      material_id: materialId,
    })
    .select()
    .single();
  if (error) throw error;
  
  // Update item count
  await supabase.rpc('increment_collection_count', { collection_id: collectionId });
  
  return data;
}

export async function removeItemFromCollection(collectionId: string, materialId: string) {
  const { error } = await supabase
    .from('bookmark_collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('material_id', materialId);
  if (error) throw error;
  
  // Update item count
  await supabase.rpc('decrement_collection_count', { collection_id: collectionId });
}

// ============ Legacy Bookmarks (backward compatibility) ============

export async function getBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, materials(title, type, courses(code, name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addBookmarkLegacy(userId: string, materialId: string, name?: string, color?: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, material_id: materialId, name, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeBookmarkLegacy(userId: string, materialId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('material_id', materialId);
  if (error) throw error;
}
