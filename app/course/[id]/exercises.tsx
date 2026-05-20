import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { useEffect, useState } from 'react';
import type { Material } from '@/constants/courses';
import { getMaterialsByClassCodeAndType } from '@/services/materials';
import { ActivityIndicator, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';

export default function CourseExercisesScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string;
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const courseCode = (id ?? '').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  const [items, setItems] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'date'>('rating');

  useEffect(() => {
    if (!courseCode) return;

    let alive = true;
    setIsLoading(true);
    setErrorMsg(null);

    getMaterialsByClassCodeAndType(courseCode, 'exercise')
      .then((data) => {
        if (!alive) return;
        setItems(data.map((m) => ({
          id: m.id,
          title: m.title,
          type: 'exercise' as const,
          subtitle: m.description || m.academic_year || undefined,
          pdf: m.file_url || undefined,
          pdf_solved: m.file_url_solved ?? undefined,
          is_solved: m.is_solved ?? false,
          rating: m.rating ?? undefined,
          created_at: m.created_at,
        })));
      })
      .catch(() => {
        if (alive) setErrorMsg('Ocorreu um erro ao carregar as fichas.');
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => { alive = false; };
  }, [courseCode]);

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'rating') {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    } else {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? courseCode}
      courseDescription={courseDescription}
      activeKey="exercises"
      onUpload={() => router.push({ pathname: '/upload', params: { preselect: courseCode } })}
    >
      <View style={s.toolbar}>
        <Text style={s.toolbarLabel}>Ordenar por:</Text>
        <TouchableOpacity
          style={[s.sortBtn, sortBy === 'rating' && s.sortBtnActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[s.sortBtnText, sortBy === 'rating' && s.sortBtnTextActive]}>Avaliação</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.sortBtn, sortBy === 'date' && s.sortBtnActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={[s.sortBtnText, sortBy === 'date' && s.sortBtnTextActive]}>Data</Text>
        </TouchableOpacity>
      </View>

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
        <MaterialList items={sortedItems} emptyMessage="Sem fichas disponíveis." />
      )}
    </CourseSectionShell>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    toolbarLabel: {
      fontSize: 12,
      color: t.textSecondary,
      marginRight: 4,
    },
    sortBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
    },
    sortBtnActive: {
      borderColor: t.accentBorder,
      backgroundColor: t.accentDim,
    },
    sortBtnText: {
      fontSize: 12,
      color: t.textSecondary,
    },
    sortBtnTextActive: {
      color: t.accent,
      fontWeight: '700',
    },
  });
}
