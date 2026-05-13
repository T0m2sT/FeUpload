import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';

type SectionKey = 'exams' | 'exercises' | 'summaries' | 'tips';

type SectionItem = {
  key: SectionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function getSectionPath(section: SectionKey) {
  switch (section) {
    case 'exams':
      return '/course/[id]/exams' as const;
    case 'exercises':
      return '/course/[id]/exercises' as const;
    case 'summaries':
      return '/course/[id]/summaries' as const;
    case 'tips':
      return '/course/[id]/tips' as const;
  }
}

const SECTIONS: SectionItem[] = [
  {
    key: 'exams',
    label: 'Exames',
    icon: 'newspaper-outline',
  },
  {
    key: 'exercises',
    label: 'Exercícios',
    icon: 'book-outline',
  },
  {
    key: 'summaries',
    label: 'Resumos',
    icon: 'document-text-outline',
  },
  {
    key: 'tips',
    label: 'Dicas',
    icon: 'bulb-outline',
  },
];


export default function CourseIndexScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string;
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);
  const courseCode = (id ?? '').toUpperCase();
  const courseName = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={s.backText}>Voltar</Text>
        </TouchableOpacity>

        {/* Course header */}
        <Text testID="course-code" style={s.code}>{courseCode}</Text>
        <Text testID="course-name" style={s.title}>{courseName ?? courseCode}</Text>

        {/* Description block */}
        {!!courseDescription && (
          <View style={s.metaCard}>
            <Text style={s.metaDescription}>{courseDescription}</Text>
          </View>
        )}

        {/* Section list */}
        <Text style={s.sectionLabel}>Conteúdo</Text>

        {SECTIONS.map((section, index) => (
          <View key={section.key}>
            <TouchableOpacity
              style={s.card}
              testID={`section-${section.key}`}
              accessibilityLabel={section.label}
              onPress={() =>
                router.push({
                  pathname: getSectionPath(section.key),
                  params: {
                    id: courseCode,
                    name: courseName ?? courseCode,
                    description: courseDescription ?? '',
                  },
                })
              }
            >
              <View style={[
                s.cardIcon,
                t.isDark && {
                  shadowColor: t.accentGlow,
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}>
                <Ionicons name={section.icon} size={20} color={t.accent} />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardTitle}>{section.label}</Text>
                <Text style={s.cardCount}>Abrir secção</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
            </TouchableOpacity>
            {index < SECTIONS.length - 1 && <View style={s.sep} />}
          </View>
        ))}

        {/* Threads / Forum */}
        <Text style={[s.sectionLabel, { marginTop: 28 }]}>Comunidade</Text>
        <View style={s.forumCard}>
          <TouchableOpacity
            style={s.card}
            testID="section-threads"
            accessibilityLabel="Fórum de discussão"
            onPress={() =>
              router.push({
                pathname: '/course/[id]/threads',
                params: {
                  id: courseCode,
                  name: courseName ?? courseCode,
                  description: courseDescription ?? '',
                },
              })
            }
          >
            <View style={[
              s.cardIcon,
              t.isDark && {
                shadowColor: t.accentGlow,
                shadowOpacity: 0.5,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}>
              <Ionicons name="chatbubbles-outline" size={20} color={t.accent} />
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>Fórum de Discussão</Text>
              <Text style={s.cardCount}>Abrir fórum</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

    </View>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
    },
    container: {
      padding: 20,
      paddingTop: 60,
      paddingBottom: 32,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 20,
    },
    backText: {
      color: t.accent,
      fontSize: 16,
    },
    code: {
      fontSize: 12,
      fontWeight: '700',
      color: t.accent,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: t.textPrimary,
      marginBottom: 20,
    },
    metaCard: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      padding: 16,
      marginBottom: 28,
      gap: 10,
    },
    metaDescription: {
      fontSize: 13,
      color: t.textSecondary,
      lineHeight: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 14,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: t.textPrimary,
      marginBottom: 2,
    },
    cardCount: {
      fontSize: 12,
      color: t.textSecondary,
    },
    sep: {
      height: 1,
      backgroundColor: t.surfaceBorder,
    },
    forumCard: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      overflow: 'hidden',
      paddingHorizontal: 14,
    },
  });
}
