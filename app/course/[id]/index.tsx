import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
// CourseNavBar kept but hidden — re-enable if needed by the team
import { CourseNavBar } from '@/components/course-nav-bar';
import { COURSES } from '@/constants/courses';
import type { AppPalette } from '@/constants/theme';

const SHOW_NAV_BAR = false;

type SectionKey = 'exams' | 'exercises' | 'summaries' | 'tips';

type SectionItem = {
  key: SectionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: (courseId: string) => number;
};

const SECTIONS: SectionItem[] = [
  {
    key: 'exams',
    label: 'Exames',
    icon: 'newspaper-outline',
    count: (id) => COURSES[id]?.materials.filter((m) => m.type === 'Exame').length ?? 0,
  },
  {
    key: 'exercises',
    label: 'Exercícios',
    icon: 'book-outline',
    count: (id) => COURSES[id]?.materials.filter((m) => m.type === 'Ficha').length ?? 0,
  },
  {
    key: 'summaries',
    label: 'Resumos',
    icon: 'document-text-outline',
    count: (id) => COURSES[id]?.materials.filter((m) => m.type === 'Resumo').length ?? 0,
  },
  {
    key: 'tips',
    label: 'Dicas',
    icon: 'bulb-outline',
    count: (id) => COURSES[id]?.materials.filter((m) => m.type === 'Dica').length ?? 0,
  },
];

// Placeholder course metadata — will be fetched from the database
const COURSE_META: Record<string, { description: string; professors: string[]; ects: number; semester: string }> = {
  'c1000000-0000-0000-0000-000000000001': {
    description: 'Introdução aos princípios e práticas de engenharia de software, incluindo metodologias ágeis, gestão de projetos e qualidade de software.',
    professors: ['Prof. João Pascoal Faria', 'Prof. Alberto Simões'],
    ects: 6,
    semester: '2º Ano, 2º Semestre',
  },
  'c1000000-0000-0000-0000-000000000003': {
    description: 'Estudo dos fenómenos físicos fundamentais, incluindo mecânica, termodinâmica e eletromagnetismo.',
    professors: ['Prof. Maria Helena Braga'],
    ects: 6,
    semester: '2º Ano, 1º Semestre',
  },
  'c1000000-0000-0000-0000-000000000005': {
    description: 'Conceitos de micro e macroeconomia, mercados, oferta e procura, e política económica.',
    professors: ['Prof. Ana Costa'],
    ects: 4,
    semester: '2º Ano, 2º Semestre',
  },
  'c1000000-0000-0000-0000-000000000006': {
    description: 'Programação imperativa e orientada a objetos, estruturas de dados básicas e algoritmos fundamentais.',
    professors: ['Prof. Pedro Ribeiro'],
    ects: 6,
    semester: '1º Ano, 2º Semestre',
  },
  'c1000000-0000-0000-0000-000000000004': {
    description: 'Algoritmos clássicos, estruturas de dados avançadas, análise de complexidade e técnicas de programação.',
    professors: ['Prof. Luís Damas', 'Prof. Fernando Silva'],
    ects: 6,
    semester: '2º Ano, 1º Semestre',
  },
  'c1000000-0000-0000-0000-000000000002': {
    description: 'Modelação de dados, linguagem SQL, sistemas de gestão de bases de dados relacionais e não relacionais.',
    professors: ['Prof. Rui Moreira'],
    ects: 6,
    semester: '2º Ano, 2º Semestre',
  },
};

export default function CourseIndexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);
  const course = COURSES[id ?? ''];
  const meta = COURSE_META[id ?? ''];

  if (!course) {
    return (
      <View style={s.root}>
        <Text style={s.notFound}>Cadeira não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={s.backText}>Voltar</Text>
        </TouchableOpacity>

        {/* Course header */}
        <Text testID="course-code" style={s.code}>{course.code}</Text>
        <Text testID="course-name" style={s.title}>{course.name}</Text>

        {/* Description block */}
        {meta && (
          <View style={s.metaCard}>
            <Text style={s.metaDescription}>{meta.description}</Text>
            <View style={s.metaRow}>
              <Ionicons name="school-outline" size={14} color={t.textSecondary} />
              <Text style={s.metaText}>{meta.professors.join(' · ')}</Text>
            </View>
            <View style={s.metaRow}>
              <Ionicons name="layers-outline" size={14} color={t.textSecondary} />
              <Text style={s.metaText}>{meta.ects} ECTS · {meta.semester}</Text>
            </View>
          </View>
        )}

        {/* Section list */}
        <Text style={s.sectionLabel}>Conteúdo</Text>

        {SECTIONS.map((section, index) => {
          const count = section.count(id ?? '');
          return (
            <View key={section.key}>
              <TouchableOpacity
                style={s.card}
                testID={`section-${section.key}`}
                accessibilityLabel={section.label}
                onPress={() => router.push(`/course/${id}/${section.key}`)}
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
                  <Text style={s.cardCount}>
                    {count === 0 ? 'Sem conteúdo' : `${count} item${count !== 1 ? 's' : ''}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
              </TouchableOpacity>
              {index < SECTIONS.length - 1 && <View style={s.sep} />}
            </View>
          );
        })}

        {/* Threads / Forum */}
        <Text style={[s.sectionLabel, { marginTop: 28 }]}>Comunidade</Text>
        {(() => {
          const threadCount = COURSES[id ?? '']?.threads.length ?? 0;
          const latestThreads = COURSES[id ?? '']?.threads.slice(0, 2) ?? [];
          return (
            <View style={s.forumCard}>
              <TouchableOpacity
                style={s.card}
                testID="section-threads"
                accessibilityLabel="Fórum de discussão"
                onPress={() => router.push(`/course/${id}/threads`)}
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
                  <Text style={s.cardCount}>
                    {threadCount === 0 ? 'Sem publicações' : `${threadCount} publicaç${threadCount !== 1 ? 'ões' : 'ão'}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
              </TouchableOpacity>

              {latestThreads.length > 0 && (
                <View style={s.threadPreviewList}>
                  {latestThreads.map((thread, idx) => (
                    <View key={thread.id}>
                      {idx > 0 && <View style={s.sep} />}
                      <TouchableOpacity
                        style={s.threadPreview}
                        onPress={() => router.push(`/course/${id}/thread/${thread.id}`)}
                        activeOpacity={0.7}
                      >
                        <View style={s.threadPreviewIcon}>
                          <Ionicons name="chatbubble-outline" size={13} color={t.accent} />
                        </View>
                        <View style={s.threadPreviewInfo}>
                          <Text style={s.threadPreviewTitle} numberOfLines={1}>{thread.title}</Text>
                          <Text style={s.threadPreviewMeta}>
                            {thread.author} · {thread.replyCount} resposta{thread.replyCount !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={13} color={t.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })()}
      </ScrollView>

      {SHOW_NAV_BAR && <CourseNavBar courseId={id ?? ''} />}
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
    notFound: {
      color: t.textSecondary,
      fontSize: 16,
      margin: 20,
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
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: 12,
      color: t.textSecondary,
      flex: 1,
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
    threadPreviewList: {
      borderTopWidth: 1,
      borderTopColor: t.surfaceBorder,
      marginHorizontal: -14,
      paddingHorizontal: 14,
    },
    threadPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 10,
    },
    threadPreviewIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    threadPreviewInfo: { flex: 1 },
    threadPreviewTitle: {
      fontSize: 13,
      fontWeight: '500',
      color: t.textPrimary,
      marginBottom: 2,
    },
    threadPreviewMeta: {
      fontSize: 11,
      color: t.textMuted,
    },
  });
}
