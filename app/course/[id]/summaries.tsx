import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import type { Material } from '@/constants/courses';
import { getMaterialsByClassCodeAndType } from '@/services/materials';

type SortKey = 'rating' | 'date';

export default function CourseSummariesScreen() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  useEffect(() => {
    if (!courseCode) return;
    let alive = true;
    setLoading(true);
    setError(null);
    getMaterialsByClassCodeAndType(courseCode, 'summary')
      .then((data) => {
        if (!alive) return;
        setItems(data.map((m) => ({
          id: m.id,
          title: m.title,
          type: 'summary' as const,
          subtitle: m.description || m.academic_year || undefined,
          pdf: m.file_url || undefined,
          pdf_solved: m.file_url_solved ?? undefined,
          is_solved: m.is_solved ?? false,
          rating: m.rating ?? undefined,
          ratingCount: m.ratingCount ?? 0,
          created_at: m.created_at,
        })));
      })
      .catch((e) => {
        if (alive) setError(e.message ?? 'Erro a carregar resumos');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [courseCode]);

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'rating') {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? courseCode}
      courseDescription={courseDescription}
      activeKey="summaries"
      onUpload={() => router.push('/upload')}
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

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : (
        <MaterialList items={sorted} emptyMessage="Sem resumos disponíveis." />
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
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    errorText: {
      color: t.textSecondary,
      fontSize: 13,
      paddingHorizontal: 20,
      textAlign: 'center',
    },
  });
}
