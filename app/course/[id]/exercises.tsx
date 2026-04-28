import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Material } from '@/constants/courses';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function CourseExercisesScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string;
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const t = useAppTheme();
  
  const courseCode = (id ?? '').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  const [items, setItems] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        // Fetch the exercises using the class_code directly as per schema
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('class_code', courseCode)
          .eq('type', 'exercise');

        if (error) {
          setErrorMsg('Ocorreu um erro ao carregar as fichas.');
          return;
        }

        if (data) {
          const mappedItems: Material[] = data.map((m: any) => ({
            id: m.id,
            title: m.title,
            type: m.type as any,
            subtitle: m.description || m.academic_year || undefined,
            rating: m.rating,
            pdf: m.file_url || undefined,
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        setErrorMsg('Erro inesperado ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }

    if (courseCode) {
      fetchExercises();
    }
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
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={{ marginTop: 12, color: t.textSecondary, fontSize: 14 }}>A carregar fichas...</Text>
        </View>
      ) : errorMsg ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ color: t.textPrimary, fontSize: 16 }}>{errorMsg}</Text>
        </View>
      ) : (
        <MaterialList items={items} emptyMessage="Sem fichas disponíveis." />
      )}
    </CourseSectionShell>
  );
}
