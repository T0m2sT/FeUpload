import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { getMaterialsByClassCodeAndType } from '@/services/materials';
import { useEffect, useState } from 'react';
import type { Material } from '@/constants/courses';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function CourseTipsScreen() {
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
    if (!courseCode) return;

    let alive = true;
    setIsLoading(true);
    setErrorMsg(null);

    getMaterialsByClassCodeAndType(courseCode, 'notes')
      .then((data) => {
        if (!alive) return;
        setItems(data.map((m) => ({
          id: m.id,
          title: m.title,
          type: 'notes' as const,
          subtitle: m.description || m.academic_year || undefined,
          pdf: m.file_url || undefined,
        })));
      })
      .catch(() => {
        if (alive) setErrorMsg('Ocorreu um erro ao carregar as dicas.');
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
      courseName={courseNameParam ?? courseCode}
      courseDescription={courseDescription}
      activeKey="tips"
      onUpload={() => router.push({ pathname: '/upload', params: { preselect: courseCode } })}
    >
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={{ marginTop: 12, color: t.textSecondary, fontSize: 14 }}>A carregar dicas...</Text>
        </View>
      ) : errorMsg ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ color: t.textPrimary, fontSize: 16 }}>{errorMsg}</Text>
        </View>
      ) : (
        <MaterialList items={items} emptyMessage="Sem dicas disponíveis." courseCode={courseCode} />
      )}
    </CourseSectionShell>
  );
}
