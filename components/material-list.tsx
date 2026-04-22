import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import type { Material } from '@/constants/courses';
import { useRouter } from 'expo-router';

function StarRating({ count, accent }: { count: number; accent: string }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={11}
          color={accent}
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );
}

type Props = {
  items: Material[];
  emptyMessage?: string;
};

export function MaterialList({ items, emptyMessage = 'Sem conteúdo disponível.' }: Props) {
  const t = useAppTheme();
  const s = makeStyles(t);

  const router = useRouter();
  const openPDF = (pdf?: string) => {
    router.push({ pathname: "/pdf-viewer" as any, params: { pdf} });
  };

  if (items.length === 0) {
    return (
      <View style={s.empty}>
        <Ionicons name="folder-open-outline" size={40} color={t.textMuted} style={{ marginBottom: 10 }} />
        <Text style={s.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={s.row}
          onPress={() => openPDF(item.pdf)}
          accessibilityLabel={item.title}
        >
          <View style={[
            s.iconWrap,
            t.isDark && {
              shadowColor: t.accentGlow,
              shadowOpacity: 0.45,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}>
            <Ionicons name="document-text-outline" size={18} color={t.accent} />
          </View>
          <View style={s.info}>
            <Text style={s.title}>{item.title}</Text>
            {item.subtitle ? <Text style={s.sub}>{item.subtitle}</Text> : null}
            {item.rating != null ? <StarRating count={item.rating} accent={t.accent} /> : null}
          </View>
          <View style={s.actions}>
            {item.pdf && (
              <TouchableOpacity
                style={s.actionBtn}
                onPress={() => Linking.openURL(item.pdf!)}
                accessibilityLabel="Download"
              >
                <Ionicons name="cloud-download-outline" size={18} color={t.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.actionBtn} accessibilityLabel="Favoritar">
              <Ionicons name="star-outline" size={18} color={t.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 14,
      color: t.textMuted,
      textAlign: 'center',
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
    sub: {
      fontSize: 12,
      color: t.textSecondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    actionBtn: {
      padding: 4,
    },
    sep: {
      height: 1,
      backgroundColor: t.surfaceBorder,
    },
  });
}
