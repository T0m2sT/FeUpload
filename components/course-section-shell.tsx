import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import type { CourseNavKey } from '@/components/course-nav-bar';

type Tab = {
  key: CourseNavKey;
  label: string;
};

const TABS: Tab[] = [
  { key: 'exams',     label: 'Exames'    },
  { key: 'exercises', label: 'Exercícios'},
  { key: 'summaries', label: 'Resumos'   },
  { key: 'tips',      label: 'Dicas'     },
  { key: 'threads',   label: 'Fórum'     },
];

type Props = {
  courseId: string;
  courseCode: string;
  courseName: string;
  activeKey: CourseNavKey;
  children: React.ReactNode;
  // Upload button shown on each section screen
  onUpload?: () => void;
};

export function CourseSectionShell({
  courseId,
  courseCode,
  courseName,
  activeKey,
  children,
  onUpload,
}: Props) {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);

  return (
    <View style={s.root}>
      {/* Fixed chrome — never re-mounts when switching tabs */}
      <View style={s.chrome}>
        <View style={s.topRow}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.push(`/course/${courseId}`)}
            accessibilityLabel="Voltar para cadeira"
          >
            <Ionicons name="arrow-back" size={20} color={t.accent} />
            <Text style={s.backText}>{courseCode}</Text>
          </TouchableOpacity>

          {/* Star logo — centred, taps go home */}
          <TouchableOpacity
            style={s.logoWrap}
            onPress={() => router.push('/')}
            accessibilityLabel="Ir para o início"
          >
            <Ionicons name="star" size={22} color={t.accent} />
          </TouchableOpacity>

          <View style={s.uploadBtnSpacer}>
            {onUpload && (
              <TouchableOpacity
                style={s.uploadBtn}
                onPress={onUpload}
                accessibilityLabel="Enviar material"
              >
                <Ionicons name="cloud-upload-outline" size={14} color={t.accent} />
                <Text style={s.uploadBtnText}>Enviar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={s.courseName}>{courseName}</Text>

        {/* Tab strip */}
        <View style={s.tabStrip}>
          {TABS.map((tab) => {
            const active = tab.key === activeKey;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, active && s.tabActive]}
                onPress={() => {
                  if (!active) router.replace(`/course/${courseId}/${tab.key}`);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Scrollable content area — only this part changes between tabs */}
      <View style={s.content}>
        {children}
      </View>
    </View>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
    },
    chrome: {
      paddingTop: Platform.OS === 'ios' ? 56 : 44,
      paddingHorizontal: 20,
      paddingBottom: 0,
      backgroundColor: t.background,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,            // pushes star to centre
    },
    backText: {
      color: t.accent,
      fontSize: 15,
      fontWeight: '600',
    },
    logoWrap: {
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadBtnSpacer: {
      flex: 1,
      alignItems: 'flex-end',   // upload button right-aligned, spacer when empty
    },
    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    uploadBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.accent,
    },
    courseName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: t.textPrimary,
      marginBottom: 16,
    },
    tabStrip: {
      flexDirection: 'row',
      gap: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: t.accent,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.textSecondary,
    },
    tabTextActive: {
      color: t.accent,
      fontWeight: '700',
    },
    content: {
      flex: 1,
    },
  });
}
