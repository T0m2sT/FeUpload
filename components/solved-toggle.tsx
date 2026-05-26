import { useAppTheme } from '@/hooks/use-app-theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SolvedFilter = 'unsolved' | 'solved';

type Props = {
  value: SolvedFilter;
  onChange: (value: SolvedFilter) => void;
};

export function SolvedToggle({ value, onChange }: Props) {
  const t = useAppTheme();
  const activeText = t.isDark ? '#000' : '#fff';

  return (
    <View
      style={[styles.row, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}
      accessibilityRole="tablist"
    >
      <TouchableOpacity
        onPress={() => onChange('unsolved')}
        accessibilityRole="tab"
        accessibilityLabel="Ver materiais não resolvidos"
        accessibilityState={{ selected: value === 'unsolved' }}
        style={[
          styles.pill,
          value === 'unsolved' && { backgroundColor: t.accent },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: value === 'unsolved' ? activeText : t.textSecondary },
          ]}
        >
          Não resolvido
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('solved')}
        accessibilityRole="tab"
        accessibilityLabel="Ver materiais resolvidos"
        accessibilityState={{ selected: value === 'solved' }}
        style={[
          styles.pill,
          value === 'solved' && { backgroundColor: t.accent },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: value === 'solved' ? activeText : t.textSecondary },
          ]}
        >
          Resolvido
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
