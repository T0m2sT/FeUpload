import { supabase } from '../lib/supabase';

export type ReviewInsert = {
  material_id: string;
  user_id: string;
  rating: number;
  content?: string;
};

export async function getReviewsByMaterial(materialId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name)')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReview(review: ReviewInsert) {
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

export async function updateReview(
  reviewId: string,
  review: { rating: number; content?: string | null }
) {
  const { data, error } = await supabase
    .from('reviews')
    .update(review)
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function refreshMaterialRating(materialId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('material_id', materialId);
  if (error) throw error;

  const nextRating = !data || data.length === 0
    ? null
    : Math.round(data.reduce((sum, review) => sum + review.rating, 0) / data.length);

  const { error: updateError } = await supabase
    .from('materials')
    .update({ rating: nextRating })
    .eq('id', materialId);
  if (updateError) throw updateError;

  return nextRating;
}
