import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { SolvedToggle, type SolvedFilter } from '@/components/solved-toggle';
import type { Material } from '@/constants/courses';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getMaterialsByClassCodeAndType } from '@/services/materials';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import type { AppPalette } from '@/constants/theme';

export default function CourseExamsScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string | string[];
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const courseCode = (Array.isArray(id) ? id[0] : id ?? 'XX').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  const [exams, setExams] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'date'>('rating');
  const [solvedFilter, setSolvedFilter] = useState<SolvedFilter>('unsolved');

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
          pdf_solved: m.file_url_solved ?? undefined,
          is_solved: m.is_solved ?? false,
          rating: m.rating ?? undefined,
          ratingCount: m.ratingCount ?? 0,
          created_at: m.created_at,
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

  const filteredExams = exams.filter((m) =>
    solvedFilter === 'solved' ? m.is_solved : !m.is_solved
  );

  const sortedExams = [...filteredExams].sort((a, b) => {
    if (sortBy === 'rating') {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
    }
    const yearA = a.subtitle ?? '';
    const yearB = b.subtitle ?? '';
    if (yearB !== yearA) return yearB.localeCompare(yearA);
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? 'Undefined'}
      courseDescription={courseDescription}
      activeKey="exams"
      onUpload={() => router.push({ pathname: '/upload', params: { preselect: courseCode } })}
    >
      <View style={s.solvedToggleWrap}>
        <SolvedToggle value={solvedFilter} onChange={setSolvedFilter} />
      </View>

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
          <Text style={{ marginTop: 12, color: t.textSecondary, fontSize: 14 }}>A carregar exames...</Text>
        </View>
      ) : errorMsg ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ color: t.textPrimary, fontSize: 16 }}>{errorMsg}</Text>
        </View>
      ) : (
        <MaterialList
          items={sortedExams}
          emptyMessage={
            solvedFilter === 'solved'
              ? 'Sem exames resolvidos disponíveis.'
              : 'Sem exames por resolver disponíveis.'
          }
        />
      )}
    </CourseSectionShell>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    solvedToggleWrap: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
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
