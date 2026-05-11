import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import { getSummaryById } from '@/services/materials';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}

export default function SummaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!id) return;
    setLoading(true);
    getSummaryById(id)
      .then((data) => {
        if (alive) setSummary(data);
      })
      .catch((e) => {
        if (alive) setError(e.message ?? 'Erro a carregar resumo');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const openFile = (url: string) => {
    if (Platform.OS === 'web') {
      Linking.openURL(url);
    } else {
      router.push({ pathname: '/pdf-viewer' as any, params: { pdf: url } });
    }
  };

  return (
    <View style={s.root}>
      <View style={s.chrome}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={s.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : !summary ? (
        <View style={s.center}>
          <Text style={s.errorText}>Resumo não encontrado.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.container}>
          {summary.class_code ? (
            <Text style={s.code}>{summary.class_code}</Text>
          ) : null}
          <Text style={s.title}>{summary.title}</Text>

          <View style={s.metaRow}>
            <Ionicons name="person-outline" size={14} color={t.textSecondary} />
            <Text style={s.metaText}>{summary.profiles?.name ?? 'Desconhecido'}</Text>
            <Text style={s.metaDot}>·</Text>
            <Ionicons name="calendar-outline" size={14} color={t.textSecondary} />
            <Text style={s.metaText}>{formatDate(summary.created_at)}</Text>
          </View>

          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(summary.avgRating) ? 'star' : 'star-outline'}
                size={16}
                color={i <= Math.round(summary.avgRating) ? t.accent : t.textMuted}
              />
            ))}
            <Text style={s.ratingText}>
              {summary.ratingCount > 0
                ? `${summary.avgRating.toFixed(1)} (${summary.ratingCount} avaliações)`
                : 'Sem avaliações'}
            </Text>
          </View>

          <View style={s.divider} />

          {summary.description ? (
            <Text style={s.body}>{summary.description}</Text>
          ) : (
            <Text style={s.bodyMuted}>Sem texto. Abra o ficheiro abaixo para ver o conteúdo.</Text>
          )}

          {summary.file_url ? (
            <TouchableOpacity style={s.fileBtn} onPress={() => openFile(summary.file_url)}>
              <Ionicons name="document-outline" size={18} color={t.accent} />
              <Text style={s.fileBtnText}>Abrir ficheiro</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    chrome: {
      paddingTop: Platform.OS === 'ios' ? 56 : 44,
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backText: { color: t.accent, fontSize: 15, fontWeight: '600' },
    container: { padding: 20, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: t.textSecondary, fontSize: 13 },
    code: {
      fontSize: 12,
      fontWeight: '700',
      color: t.accent,
      letterSpacing: 1.5,
      marginBottom: 6,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: t.textPrimary,
      marginBottom: 12,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
      flexWrap: 'wrap',
    },
    metaText: { fontSize: 13, color: t.textSecondary },
    metaDot: { fontSize: 13, color: t.textMuted, marginHorizontal: 4 },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 8,
    },
    ratingText: { fontSize: 12, color: t.textMuted, marginLeft: 6 },
    divider: {
      height: 1,
      backgroundColor: t.surfaceBorder,
      marginVertical: 16,
    },
    body: {
      fontSize: 15,
      lineHeight: 24,
      color: t.textPrimary,
    },
    bodyMuted: {
      fontSize: 14,
      color: t.textMuted,
      fontStyle: 'italic',
    },
    fileBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
    },
    fileBtnText: { color: t.accent, fontWeight: '600', fontSize: 14 },
  });
}
