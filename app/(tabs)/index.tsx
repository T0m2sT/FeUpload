import { useAppTheme } from '@/hooks/use-app-theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { user } from '../../constants/user';

const OFFLINE_COUNT = 4;

type Course = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);
  
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, code, name, description")
        .eq("year", user.year)
        .eq("semester", user.semester);

      if (error) {
        console.log(error);
        return;
      }

      setCourses(data ?? []);
    };

    fetchCourses();
  }, []);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greetingStatic}>Bem-vindo, </Text>
        <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="Ir para perfil">
          <Text style={s.greetingName}>{user.name}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
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
        />
      </View>

      {/* Course grid */}
      <Text style={s.sectionLabel}>As minhas cadeiras</Text>
      <View style={s.grid}>
        {courses.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={s.card}
            onPress={() => router.push(`/course/${item.id}`)}
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
