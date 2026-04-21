import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import type { Material } from '@/constants/courses';
import { supabase } from '@/lib/supabase';


export default function CourseExercisesScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string;
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const courseCode = (id ?? '').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);

      // First resolve the course UUID from its code
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .ilike('code', courseCode)
        .single();

      if (courseError || !courseData) {
        console.warn('Course not found for code:', courseCode, courseError);
        setLoading(false);
        return;
      }

      // Then fetch materials of type 'exercise' for that course
      const { data, error } = await supabase
        .from('materials')
        .select('id, title, description, file_url')
        .eq('course_id', courseData.id)
        .eq('type', 'exercise');

      if (error) {
        console.error('Failed to fetch exercises:', error);
        setLoading(false);
        return;
      }

      // Map Supabase rows → Material shape expected by MaterialList
      const mapped: Material[] = (data ?? []).map((row) => ({
        id: String(row.id),
        title: row.title,
        type: 'Ficha',
        subtitle: row.description ?? undefined,
        pdf: row.file_url ?? undefined,
      }));

      setItems(mapped);
      setLoading(false);
    };

    fetchExercises();
  }, [courseCode]);

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? courseCode}
      courseDescription={courseDescription}
      activeKey="exercises"
      onUpload={() => router.push('/upload')}
    >
      <MaterialList
        items={items}
        emptyMessage={loading ? 'A carregar exercícios...' : 'Sem exercícios disponíveis.'}
      />
    </CourseSectionShell>
  );
}
