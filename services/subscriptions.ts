import { supabase } from '../lib/supabase';

export async function getSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function subscribe(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unsubscribe(userId: string, courseId: string) {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
}
