-- FeUpload — Seed Data
-- Run this AFTER 001_initial_schema.sql
-- Note: Users must be created via Supabase Auth (Dashboard → Authentication → Users → Add User)
-- After creating users, their profiles are auto-created by the trigger.
-- Then run this to populate courses and sample materials.

-- ============================================================
-- COURSES
-- ============================================================

insert into public.courses (id, code, name, year, description) values
  ('c1000000-0000-0000-0000-000000000001', 'ESOF', 'Engenharia de Software', 2, 'Software engineering methodologies, agile, UML, testing.'),
  ('c1000000-0000-0000-0000-000000000002', 'BD', 'Base de Dados', 2, 'Relational databases, SQL, ER diagrams, normalization.'),
  ('c1000000-0000-0000-0000-000000000003', 'LCOM', 'Laboratório de Computadores', 2, 'Low-level programming, device drivers, I/O.'),
  ('c1000000-0000-0000-0000-000000000004', 'AED', 'Algoritmos e Estruturas de Dados', 2, 'Sorting, searching, graphs, trees, complexity analysis.'),
  ('c1000000-0000-0000-0000-000000000005', 'SO', 'Sistemas Operativos', 2, 'Processes, threads, memory management, file systems.');

-- ============================================================
-- SAMPLE MATERIALS (user_id must match a real auth user)
-- After creating test users in Supabase Auth, replace the UUIDs below
-- with the actual user IDs from auth.users.
-- ============================================================

-- To insert sample materials, run this after creating at least one user:
--
-- insert into public.materials (title, type, course_id, user_id, academic_year, is_solved) values
--   ('Final Exam 2024/2025', 'exam', 'c1000000-0000-0000-0000-000000000001', '<USER_UUID>', '2024/2025', true),
--   ('Midterm Exam 2023/2024', 'exam', 'c1000000-0000-0000-0000-000000000002', '<USER_UUID>', '2023/2024', false),
--   ('Agile Methods Lecture Notes', 'notes', 'c1000000-0000-0000-0000-000000000001', '<USER_UUID>', '2024/2025', false),
--   ('ER Diagram Exercises', 'exercise', 'c1000000-0000-0000-0000-000000000002', '<USER_UUID>', '2024/2025', true),
--   ('Process Management Summary', 'summary', 'c1000000-0000-0000-0000-000000000005', '<USER_UUID>', '2024/2025', false);
--
-- insert into public.reviews (material_id, user_id, rating, content) values
--   ('<MATERIAL_UUID>', '<USER_UUID>', 5, 'Very well explained, covers all topics.'),
--   ('<MATERIAL_UUID>', '<USER_UUID>', 4, 'Good but missing some edge cases.');
--
-- insert into public.subscriptions (user_id, course_id) values
--   ('<USER_UUID>', 'c1000000-0000-0000-0000-000000000001'),
--   ('<USER_UUID>', 'c1000000-0000-0000-0000-000000000002');
