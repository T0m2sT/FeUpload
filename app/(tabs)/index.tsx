import AsyncStorage from '@react-native-async-storage/async-storage';
import { GENERIC_PROGRAM_CODES } from '@/constants/academics';
import { useAppTheme } from '@/hooks/use-app-theme';
import { supabase } from '@/lib/supabase';
import { normalizeCourse } from '@/lib/validation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


const OFFLINE_COUNT = 4;
const PINNED_STORAGE_KEY = '@feupload/pinned-courses';

type Course = {
  id: string;
  code: string;
  name: string;
  description?: string;
  year?: number;
  semester?: number;
};


export default function HomeScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const [courses, setCourses] = useState<Course[]>([]);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [pinnedCourses, setPinnedCourses] = useState<Course[]>([]);
  const [pinnedError, setPinnedError] = useState('');
  const searchRequestId = useRef(0);

  useFocusEffect(useCallback(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;
      const meta = u.user_metadata ?? {};
      setUserName(meta.name ?? u.email?.split('@')[0] ?? '');

      const normalizedCourse = normalizeCourse(meta.course ?? '');
      const courseToken = normalizedCourse.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!meta.year || !meta.semester) { setCourses([]); return; }

      let query = supabase.from('courses').select('id, code, name, description, year, semester');
      query = query.eq('year', Number(meta.year));
      query = query.eq('semester', Number(meta.semester));

      if (courseToken && !GENERIC_PROGRAM_CODES.has(courseToken as 'LEIC')) {
        query = query.eq('code', courseToken as 'LEIC');
      }

      const { data: coursesData, error } = await query;
      if (error) { console.log(error); return; }
      setCourses(coursesData ?? []);
    };
    init();
  }, []));

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PINNED_STORAGE_KEY).then((stored) => {
      if (!active) return;
      if (!stored) {
        setPinnedIds([]);
        return;
      }
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPinnedIds(parsed.filter((id) => typeof id === 'string'));
        } else {
          setPinnedIds([]);
        }
      } catch {
        console.warn('Failed to parse pinned courses from storage.');
        setPinnedIds([]);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedIds))
      .then(() => setPinnedError(''))
      .catch(() => setPinnedError('Não foi possível guardar as cadeiras fixadas.'));
  }, [pinnedIds]);

  useEffect(() => {
    let active = true;
    const loadPinnedCourses = async () => {
      if (pinnedIds.length === 0) {
        setPinnedCourses([]);
        return;
      }
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, description, year, semester')
        .in('id', pinnedIds);
      if (!active) return;
      if (error) {
        setPinnedError('Não foi possível carregar as cadeiras fixadas.');
        return;
      }
      const byId = new Map((data ?? []).map((course) => [course.id, course]));
      const ordered = pinnedIds
        .map((id) => byId.get(id))
        .filter((course): course is NonNullable<typeof course> => Boolean(course)) as Course[];
      setPinnedCourses(ordered);
    };
    loadPinnedCourses();
    return () => { active = false; };
  }, [pinnedIds]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      searchRequestId.current += 1;
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }
    const requestId = ++searchRequestId.current;
    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, description, year, semester')
        .or(`name.ilike.%${term}%,code.ilike.%${term}%`)
        .order('name')
        .limit(8);
      if (searchRequestId.current !== requestId) return;
      if (error) {
        setSearchError('Não foi possível pesquisar cadeiras.');
        setSearchResults([]);
      } else {
        setSearchError('');
        setSearchResults(data ?? []);
      }
      setSearchLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const showPinnedSection = pinnedCourses.length > 0 || !!pinnedError;

  const handleOpenCourse = (course: Course) => {
    setSearchTerm('');
    setSearchResults([]);
    router.push({
      pathname: '/course/[id]',
      params: {
        id: course.code,
        name: course.name,
        description: course.description ?? '',
      },
    });
  };

  const togglePin = (course: Course) => {
    setPinnedIds((prev) => (
      prev.includes(course.id) ? prev.filter((id) => id !== course.id) : [...prev, course.id]
    ));
  };

  const formatCourseMeta = (course: Course) => {
    const parts = [course.code];
    if (course.year) parts.push(`${course.year}º Ano`);
    if (course.semester) parts.push(`${course.semester}º Semestre`);
    return parts.join(' · ');
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greetingStatic}>Bem-vindo, </Text>
        <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="Ir para perfil">
          <Text style={s.greetingName}>{userName}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.push('/(tabs)/bookmarks' as any)} accessibilityLabel="Marcadores">
          <View style={s.avatarCircle}>
            <Ionicons name="bookmark-outline" size={18} color={t.accent} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="Perfil">
          <View style={s.avatarCircle}>
            <Ionicons name="person-outline" size={18} color={t.accent} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={16} color={t.textSecondary} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Procurar por cadeira..."
          placeholderTextColor={t.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      {!!searchTerm.trim() && (
        <View style={s.searchResults}>
          {searchLoading ? (
            <View style={s.searchStateRow}>
              <ActivityIndicator size="small" color={t.accent} />
              <Text style={s.searchStateText}>A procurar cadeiras...</Text>
            </View>
          ) : searchError ? (
            <Text style={s.searchErrorText}>{searchError}</Text>
          ) : searchResults.length === 0 ? (
            <Text style={s.searchEmptyText}>Nenhuma cadeira encontrada.</Text>
          ) : (
            searchResults.map((course) => {
              const isPinned = pinnedIds.includes(course.id);
              return (
                <View key={course.id} style={s.searchResultRow}>
                  <TouchableOpacity
                    style={s.searchResultMain}
                    onPress={() => handleOpenCourse(course)}
                    accessibilityLabel={`Abrir cadeira ${course.name}`}
                  >
                    <Text style={s.searchResultTitle}>{course.name}</Text>
                    <Text style={s.searchResultMeta}>{formatCourseMeta(course)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.pinButton}
                    onPress={() => togglePin(course)}
                    accessibilityLabel={isPinned ? `Remover fixação de ${course.name}` : `Fixar ${course.name}`}
                  >
                    <Ionicons
                      name={isPinned ? 'pin' : 'pin-outline'}
                      size={18}
                      color={isPinned ? t.accent : t.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}

      {showPinnedSection && (
        <>
          <Text style={s.sectionLabel}>Fixadas</Text>
          {pinnedError ? <Text style={s.searchErrorText}>{pinnedError}</Text> : null}
          <View style={s.grid}>
            {pinnedCourses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.card}
                onPress={() => handleOpenCourse(item)}
                testID={`pinned-course-${item.id}`}
                accessibilityLabel={item.name}
              >
                <TouchableOpacity
                  style={s.pinBadge}
                  onPress={() => togglePin(item)}
                  accessibilityLabel={`Remover fixação de ${item.name}`}
                >
                  <Ionicons name="pin" size={14} color={t.accent} />
                </TouchableOpacity>
                <View style={s.cardIconWrap}>
                  <Ionicons name="folder-open-outline" size={16} color={t.accent} />
                </View>
                <Text style={s.cardText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Course grid */}
      <Text style={s.sectionLabel}>As minhas cadeiras</Text>
      <View style={s.grid}>
        {courses.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={s.card}
            onPress={() => handleOpenCourse(item)}
            testID={`course-${item.id}`}
            accessibilityLabel={item.name}
          >
            <View style={s.cardIconWrap}>
              <Ionicons name="folder-open-outline" size={16} color={t.accent} />
            </View>
            <Text style={s.cardText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Offline section */}
      <View style={s.offlineSection}>
        <Text style={s.offlineTitle}>Materiais Offline</Text>
        <TouchableOpacity style={s.offlineRow}>
          <Ionicons name="cloud-offline-outline" size={18} color={t.textSecondary} />
          <Text style={s.offlineText}>{OFFLINE_COUNT} disponíveis offline</Text>
          <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function makeStyles(t: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: t.background,
    },
    container: {
      padding: 20,
      paddingTop: 60,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 8,
    },
    greetingStatic: {
      fontSize: 24,
      fontWeight: 'bold',
      color: t.textPrimary,
    },
    greetingName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: t.accent,
      textDecorationLine: 'underline',
      textDecorationColor: t.accentBorder,
    },
    avatarCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: 12,
      borderColor: t.surfaceBorder,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 24,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: t.textPrimary,
      padding: 0,
    },
    searchResults: {
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      marginTop: -12,
      marginBottom: 20,
      overflow: 'hidden',
    },
    searchResultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchResultMain: {
      flex: 1,
    },
    searchResultTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textPrimary,
      marginBottom: 2,
    },
    searchResultMeta: {
      fontSize: 11,
      color: t.textSecondary,
    },
    searchStateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    searchStateText: {
      fontSize: 12,
      color: t.textSecondary,
    },
    searchEmptyText: {
      fontSize: 12,
      color: t.textSecondary,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    searchErrorText: {
      fontSize: 12,
      color: t.error,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    pinButton: {
      padding: 6,
      borderRadius: 16,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 28,
    },
    card: {
      width: '47%',
      borderRadius: 14,
      padding: 14,
      paddingTop: 12,
      justifyContent: 'flex-end',
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      minHeight: 88,
      // subtle accent glow on dark
      ...(t.isDark ? {
        shadowColor: t.accent,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      } : {}),
    },
    pinBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      padding: 4,
      borderRadius: 12,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      zIndex: 2,
    },
    cardIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    cardText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.textPrimary,
    },
    offlineSection: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      padding: 16,
    },
    offlineTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    offlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    offlineText: {
      fontSize: 14,
      color: t.textSecondary,
      flex: 1,
    },
  });
}
