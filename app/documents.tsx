import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type OfflineEntry,
  offlineSupported,
  removeOfflineMaterial,
  useOfflineIndex,
} from '@/services/offline';

const TYPE_LABELS: Record<string, string> = {
  exam: 'Exame',
  exercise: 'Exercício',
  notes: 'Apontamentos',
  summary: 'Resumo',
};

function BackButton() {
  const router = useRouter();
  const t = useAppTheme();
  
  return (
    <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Voltar">
      <Ionicons name="chevron-back" size={24} color={t.accent} />
    </TouchableOpacity>
  );
}

export default function DocumentsScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const offlineIndex = useOfflineIndex();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(t), [t]);
  
  // Memoize header options to prevent unnecessary re-renders
  const headerOptions = useMemo(() => ({
    title: 'Os meus documentos',
    headerBackVisible: false,
    headerLeft: () => <BackButton />,
    headerStyle: { backgroundColor: t.background },
    headerTintColor: t.accent,
    headerShadowVisible: false,
  }), [t.background, t.accent]);

  const grouped = useMemo(() => {
    const entries = Object.values(offlineIndex).sort((a, b) =>
      b.downloadedAt.localeCompare(a.downloadedAt),
    );
    const map = new Map<string, OfflineEntry[]>();
    for (const e of entries) {
      const list = map.get(e.courseCode) ?? [];
      list.push(e);
      map.set(e.courseCode, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [offlineIndex]);

  const totalCount = Object.keys(offlineIndex).length;

  const handleOpen = (entry: OfflineEntry) => {
    router.push({
      pathname: '/pdf-viewer' as any,
      params: {
        local_pdf: entry.localUri,
        local_pdf_solved: entry.localUriSolved ?? '',
        pdf: entry.remoteUri ?? '',
        pdf_solved: entry.remoteUriSolved ?? '',
        title: entry.title,
      },
    });
  };

  const handleRemove = (entry: OfflineEntry) => {
    Alert.alert(
      'Remover offline',
      `Eliminar "${entry.title}" do armazenamento local?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => { removeOfflineMaterial(entry.materialId); },
        },
      ],
    );
  };

  if (!offlineSupported) {
    return (
      <View style={s.empty}>
        <Stack.Screen options={headerOptions} />
        <Ionicons name="laptop-outline" size={48} color={t.textMuted} />
        <Text style={s.emptyTitle}>Não disponível na web</Text>
        <Text style={s.emptyText}>
          O modo offline está disponível na app móvel.
        </Text>
      </View>
    );
  }

  if (totalCount === 0) {
    return (
      <View style={s.empty}>
        <Stack.Screen options={headerOptions} />
        <Ionicons name="cloud-offline-outline" size={48} color={t.textMuted} />
        <Text style={s.emptyTitle}>Sem documentos</Text>
        <Text style={s.emptyText}>
          Ainda não tens documentos guardados. Descarrega ficheiros para os leres sem ligação.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={headerOptions} />
      <FlatList
        data={grouped}
        keyExtractor={([code]) => code}
        contentContainerStyle={s.listContent}
        renderItem={({ item: [code, entries] }) => (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{code}</Text>
            {entries.map((entry) => (
              <TouchableOpacity
                key={entry.materialId}
                style={s.row}
                onPress={() => handleOpen(entry)}
                accessibilityLabel={`Abrir ${entry.title}`}
              >
                <View style={s.iconWrap}>
                  <Ionicons name="document-text-outline" size={18} color={t.accent} />
                </View>
                <View style={s.info}>
                  <Text style={s.title} numberOfLines={1}>{entry.title}</Text>
                  <Text style={s.sub}>
                    {TYPE_LABELS[entry.type] ?? entry.type}
                    {entry.sizeBytes ? `  ·  ${(entry.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(entry)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Remover"
                >
                  <Ionicons name="trash-outline" size={18} color={t.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.background,
    },
    listContent: {
      paddingTop: Platform.OS === 'ios' ? 16 : 24,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      marginBottom: 8,
      marginLeft: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      padding: 12,
      marginBottom: 8,
      gap: 12,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t.surfaceBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1 },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textPrimary,
      marginBottom: 2,
    },
    sub: {
      fontSize: 12,
      color: t.textMuted,
    },
    empty: {
      flex: 1,
      backgroundColor: t.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: t.textPrimary,
      marginTop: 12,
    },
    emptyText: {
      fontSize: 14,
      color: t.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
