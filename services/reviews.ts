import { supabase } from '../lib/supabase';

export async function getReviewsByMaterial(materialId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name)')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReview(review: {
  material_id: string;
  user_id: string;
  rating: number;
  content?: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
}
