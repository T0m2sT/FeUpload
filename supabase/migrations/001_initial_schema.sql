-- FeUpload — Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles (extends Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  year int not null,
  description text,
  created_at timestamptz not null default now()
);

-- Materials (exams, exercises, notes, summaries)
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('exam', 'exercise', 'notes', 'summary')),
  file_url text,
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  academic_year text,
  is_solved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Reviews (ratings + comments on materials)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamptz not null default now(),
  unique (material_id, user_id)
);

-- Bookmarks
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  name text,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, material_id)
);

-- Subscriptions (user subscribes to a course)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Threads (tips / advice from students)
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Thread replies
create table public.thread_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index idx_materials_course on public.materials(course_id);
create index idx_materials_user on public.materials(user_id);
create index idx_materials_type on public.materials(type);
create index idx_reviews_material on public.reviews(material_id);
create index idx_bookmarks_user on public.bookmarks(user_id);
create index idx_threads_course on public.threads(course_id);
create index idx_thread_replies_thread on public.thread_replies(thread_id);
create index idx_subscriptions_user on public.subscriptions(user_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.materials enable row level security;
alter table public.reviews enable row level security;
alter table public.bookmarks enable row level security;
alter table public.subscriptions enable row level security;
alter table public.threads enable row level security;
alter table public.thread_replies enable row level security;

-- ---- PROFILES ----
-- Anyone authenticated can read profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Users can insert their own profile (on signup)
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ---- COURSES ----
-- Anyone authenticated can read courses
create policy "Courses are viewable by authenticated users"
  on public.courses for select
  to authenticated
  using (true);

-- ---- MATERIALS ----
-- Anyone authenticated can read materials
create policy "Materials are viewable by authenticated users"
  on public.materials for select
  to authenticated
  using (true);

-- Users can insert their own materials
create policy "Users can upload materials"
  on public.materials for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own materials
create policy "Users can update own materials"
  on public.materials for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own materials
create policy "Users can delete own materials"
  on public.materials for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---- REVIEWS ----
-- Anyone authenticated can read reviews
create policy "Reviews are viewable by authenticated users"
  on public.reviews for select
  to authenticated
  using (true);

-- Users can insert their own reviews
create policy "Users can create reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "Users can update own reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "Users can delete own reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---- BOOKMARKS ----
-- Users can only see their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
create policy "Users can create bookmarks"
  on public.bookmarks for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---- SUBSCRIPTIONS ----
-- Users can only see their own subscriptions
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own subscriptions
create policy "Users can subscribe to courses"
  on public.subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own subscriptions
create policy "Users can unsubscribe from courses"
  on public.subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---- THREADS ----
-- Anyone authenticated can read threads
create policy "Threads are viewable by authenticated users"
  on public.threads for select
  to authenticated
  using (true);

-- Users can insert their own threads
create policy "Users can create threads"
  on public.threads for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own threads
create policy "Users can update own threads"
  on public.threads for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own threads
create policy "Users can delete own threads"
  on public.threads for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---- THREAD REPLIES ----
-- Anyone authenticated can read replies
create policy "Replies are viewable by authenticated users"
  on public.thread_replies for select
  to authenticated
  using (true);

-- Users can insert their own replies
create policy "Users can create replies"
  on public.thread_replies for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own replies
create policy "Users can update own replies"
  on public.thread_replies for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own replies
create policy "Users can delete own replies"
  on public.thread_replies for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

-- This function runs automatically when a new user signs up via Supabase Auth.
-- It creates a row in public.profiles so we don't have to do it manually.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
