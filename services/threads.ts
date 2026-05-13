import { supabase } from '../lib/supabase';

export async function getThreadsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from('threads')
    .select('*, profiles(name)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getThreadsByCourseCode(courseCode: string) {
  const { data, error } = await supabase
    .from('threads')
    .select('*, profiles(name), thread_replies(id), courses!inner(id, code)')
    .eq('courses.code', courseCode)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCourseIdByCode(courseCode: string): Promise<string | null> {
  const { data } = await supabase
    .from('courses')
    .select('id')
    .eq('code', courseCode)
    .single();
  return data?.id ?? null;
}

export async function getThreadWithReplies(threadId: string) {
  const [threadRes, repliesRes] = await Promise.all([
    supabase.from('threads').select('*, profiles(name)').eq('id', threadId).single(),
    supabase.from('thread_replies').select('*, profiles(name)').eq('thread_id', threadId).order('created_at', { ascending: true }),
  ]);
  if (threadRes.error) throw threadRes.error;
  return { thread: threadRes.data, replies: repliesRes.data ?? [] };
}

export async function createThread(thread: {
  title: string;
  body: string;
  course_id: string;
  user_id: string;
}) {
  const { data, error } = await supabase
    .from('threads')
    .insert(thread)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReplies(threadId: string) {
  const { data, error } = await supabase
    .from('thread_replies')
    .select('*, profiles(name)')
    .eq('thread_id', threadId)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function createReply(reply: {
  thread_id: string;
  user_id: string;
  body: string;
}) {
  const { data, error } = await supabase
    .from('thread_replies')
    .insert(reply)
    .select()
    .single();
  if (error) throw error;
  return data;
}
