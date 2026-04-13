import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';

export type CourseNavKey = 'exams' | 'exercises' | 'summaries' | 'tips' | 'threads';

type NavItem = {
  key: CourseNavKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'exams',     label: 'Exames',    icon: 'newspaper-outline',     iconFocused: 'newspaper'      },
  { key: 'exercises', label: 'Exercícios',icon: 'book-outline',           iconFocused: 'book'           },
  { key: 'summaries', label: 'Resumos',   icon: 'document-text-outline',  iconFocused: 'document-text'  },
  { key: 'tips',      label: 'Dicas',     icon: 'bulb-outline',           iconFocused: 'bulb'           },
];

type Props = {
  courseId: string;
  // Pass the active key from the current screen; omit on the course index.
  activeKey?: CourseNavKey;
};

export function CourseNavBar({ courseId, activeKey }: Props) {
  const t = useAppTheme();
  const router = useRouter();

  return (
    <View style={[
      styles.bar,
      {
        backgroundColor: t.tabBackground,
        borderTopColor: t.tabBorder,
        shadowColor: t.isDark ? t.accentGlow : '#000',
      },
    ]}>
      {NAV_ITEMS.map((item) => {
        const focused = item.key === activeKey;
        const color = focused ? t.tabActive : t.tabInactive;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => router.push(`/course/${courseId}/${item.key}`)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Ionicons
              name={focused ? item.iconFocused : item.icon}
              size={24}
              color={color}
            />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
            {focused && <View style={[styles.dot, { backgroundColor: t.tabActive }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 10,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
