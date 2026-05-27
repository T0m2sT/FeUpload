import type { CourseNavKey } from '@/components/course-nav-bar';
import type { AppPalette } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = {
  key: CourseNavKey;
  label: string;
};

function getTabPath(tab: CourseNavKey) {
  switch (tab) {
    case 'exams':
      return '/course/[id]/exams' as const;
    case 'exercises':
      return '/course/[id]/exercises' as const;
    case 'summaries':
      return '/course/[id]/summaries' as const;
    case 'tips':
      return '/course/[id]/tips' as const;
    case 'threads':
      return '/course/[id]/threads' as const;
  }
}

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
  courseDescription?: string;
  activeKey: CourseNavKey;
  children: React.ReactNode;
  // Upload button shown on each section screen
  onUpload?: () => void;
};

export function CourseSectionShell({
  courseId,
  courseCode,
  courseName,
  courseDescription,
  activeKey,
  children,
  onUpload,
}: Props) {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);

  return (
    <View style={s.root}>
      {Platform.OS === 'web' ? (
        <ScrollView style={s.content}>
          <View style={s.chrome}>
            <View style={s.topRow}>
              <TouchableOpacity
                style={s.backBtn}
                onPress={() =>
                  router.push({
                    pathname: '/course/[id]',
                    params: {
                      id: courseId,
                      name: courseName,
                      description: courseDescription ?? '',
                    },
                  })
                }
                accessibilityLabel="Voltar para cadeira"
              >
                <Ionicons name="arrow-back" size={20} color={t.accent} />
                <Text style={s.backText}>{courseCode}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.logoWrap}
                onPress={() => router.push('/')}
                accessibilityLabel="Ir para o início"
              >
                <Image source={require('@/assets/Logo.png')} style={s.logo} />
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

            <View style={s.tabStrip}>
              {TABS.map((tab) => {
                const active = tab.key === activeKey;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[s.tab, active && s.tabActive]}
                    onPress={() => {
                      if (!active) {
                        router.replace({
                          pathname: getTabPath(tab.key),
                          params: {
                            id: courseId,
                            name: courseName,
                            description: courseDescription ?? '',
                          },
                        });
                      }
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
          <View style={s.content}>{children}</View>
        </ScrollView>
      ) : (
        <View style={s.root}>
          <View style={s.chrome}>
            <View style={s.topRow}>
              <TouchableOpacity
                style={s.backBtn}
                onPress={() =>
                  router.push({
                    pathname: '/course/[id]',
                    params: {
                      id: courseId,
                      name: courseName,
                      description: courseDescription ?? '',
                    },
                  })
                }
                accessibilityLabel="Voltar para cadeira"
              >
                <Ionicons name="arrow-back" size={20} color={t.accent} />
                <Text style={s.backText}>{courseCode}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.logoWrap}
                onPress={() => router.push('/')}
                accessibilityLabel="Ir para o início"
              >
                <Image source={require('@/assets/Logo.png')} style={s.logo} />
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

            <View style={s.tabStrip}>
              {TABS.map((tab) => {
                const active = tab.key === activeKey;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[s.tab, active && s.tabActive]}
                    onPress={() => {
                      if (!active) {
                        router.replace({
                          pathname: getTabPath(tab.key),
                          params: {
                            id: courseId,
                            name: courseName,
                            description: courseDescription ?? '',
                          },
                        });
                      }
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
          <View style={s.content}>{children}</View>
        </View>
      )}
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
      paddingTop: Platform.OS === 'ios' ? 44 : 32,
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
      flex: 1,            // pushes logo to centre
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
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
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
