import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import type { Material } from '@/constants/courses';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getMaterialsByClassCodeAndType } from '@/services/materials';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function CourseExamsScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string | string[];
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const t = useAppTheme();

  const courseCode = (Array.isArray(id) ? id[0] : id ?? 'XX').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  const [exams, setExams] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setErrorMsg(null);

    getMaterialsByClassCodeAndType(courseCode, 'exam')
      .then((data) => {
        if (!alive) return;
        setExams(data.map((m) => ({
          id: m.id,
          title: m.title,
          type: 'exam' as const,
          subtitle: m.academic_year ?? undefined,
          pdf: m.file_url ?? undefined,
        })));
      })
      .catch(() => {
        if (alive) setErrorMsg('Ocorreu um erro ao carregar os exames.');
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => { alive = false; };
  }, [courseCode]);

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? 'Undefined'}
      courseDescription={courseDescription}
      activeKey="exams"
      onUpload={() => router.push('/upload')}
    >
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={{ marginTop: 12, color: t.textSecondary, fontSize: 14 }}>A carregar exames...</Text>
        </View>
      ) : errorMsg ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ color: t.textPrimary, fontSize: 16 }}>{errorMsg}</Text>
        </View>
      ) : (
        <MaterialList items={exams} emptyMessage="Sem exames disponíveis." />
      )}
    </CourseSectionShell>
  );
}
