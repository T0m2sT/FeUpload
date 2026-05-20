import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CourseSectionShell } from '@/components/course-section-shell';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import { getSummariesByClassCode, type SummaryListItem } from '@/services/materials';

type SortKey = 'rating' | 'date';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function StarRating({ avg, accent, mute }: { avg: number; accent: string; mute: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(avg) ? 'star' : 'star-outline'}
          size={12}
          color={i <= Math.round(avg) ? accent : mute}
        />
      ))}
    </View>
  );
}

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

  const [items, setItems] = useState<SummaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getSummariesByClassCode(courseCode)
      .then((data) => {
        if (alive) setItems(data);
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

  const sorted = [...items].sort((a, b) =>
    sortBy === 'rating'
      ? b.avgRating - a.avgRating
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? courseCode}
      courseDescription={courseDescription}
      activeKey="summaries"
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

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="document-text-outline" size={40} color={t.textMuted} />
          <Text style={s.emptyText}>Sem resumos disponíveis.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.row}
              onPress={() =>
                router.push({ pathname: '/summary/[id]' as any, params: { id: item.id } })
              }
              accessibilityLabel={item.title}
              testID={`summary-${item.id}`}
            >
              <View style={s.iconWrap}>
                <Ionicons name="document-text-outline" size={18} color={t.accent} />
              </View>
              <View style={s.info}>
                <Text style={s.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={s.meta}>
                  {item.author} · {formatDate(item.created_at)}
                </Text>
                <View style={s.ratingRow}>
                  <StarRating avg={item.avgRating} accent={t.accent} mute={t.textMuted} />
                  <Text style={s.ratingText}>
                    {item.ratingCount > 0
                      ? `${item.avgRating.toFixed(1)} (${item.ratingCount})`
                      : 'sem avaliações'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
            </TouchableOpacity>
          )}
        />
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
    emptyText: {
      color: t.textMuted,
      fontSize: 14,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      gap: 12,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textPrimary,
    },
    meta: {
      fontSize: 12,
      color: t.textSecondary,
      marginTop: 2,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    ratingText: {
      fontSize: 11,
      color: t.textMuted,
    },
    sep: {
      height: 1,
      backgroundColor: t.surfaceBorder,
    },
  });
}
