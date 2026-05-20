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
import { getMaterialById } from '@/services/materials';

type MaterialDetail = {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_url_solved: string | null;
  created_at: string;
  type: string;
  class_code: string;
  academic_year: string | null;
  author: string;
  avgRating: number;
  ratingCount: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}

function Stars({ rating, size, color, muted }: { rating: number; size: number; color: string; muted: string }) {
  const rounded = Math.round(rating);
  return (
    <View style={stylesStatic.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rounded ? 'star' : 'star-outline'}
          size={size}
          color={i <= rounded ? color : muted}
          style={stylesStatic.starIcon}
        />
      ))}
    </View>
  );
}

export default function MaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const materialId = Array.isArray(id) ? id[0] : id;

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!materialId) return;
    setLoading(true);
    getMaterialById(materialId)
      .then((data) => {
        if (alive) setMaterial(data as MaterialDetail);
      })
      .catch((e) => {
        if (alive) setError(e.message ?? 'Erro ao carregar material.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [materialId]);

  const openFile = (url: string | null) => {
    if (!url) return;
    if (Platform.OS === 'web') {
      Linking.openURL(url);
    } else {
      router.push({ pathname: '/pdf-viewer' as any, params: { pdf: url, title: material?.title ?? 'PDF' } });
    }
  };

  return (
    <View style={s.root}>
      <View style={s.chrome}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
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
      ) : !material ? (
        <View style={s.center}>
          <Text style={s.errorText}>Material não encontrado.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.container}>
          {material.class_code ? <Text style={s.code}>{material.class_code}</Text> : null}
          <Text style={s.title}>{material.title}</Text>

          <View style={s.metaRow}>
            <Ionicons name="person-outline" size={14} color={t.textSecondary} />
            <Text style={s.metaText}>{material.author}</Text>
            <Text style={s.metaDot}>·</Text>
            <Ionicons name="calendar-outline" size={14} color={t.textSecondary} />
            <Text style={s.metaText}>{formatDate(material.created_at)}</Text>
          </View>

          <View style={s.ratingRow}>
            <Stars rating={material.avgRating} size={16} color={t.accent} muted={t.textMuted} />
            <Text style={s.ratingText}>
              {material.ratingCount > 0
                ? `${material.avgRating.toFixed(1)} (${material.ratingCount} avaliações)`
                : 'Sem avaliações'}
            </Text>
          </View>

          <TouchableOpacity
            style={s.ratingsButton}
            onPress={() =>
              router.push({
                pathname: '/ratings',
                params: {
                  materialId: material.id,
                  materialTitle: material.title,
                  courseCode: material.class_code,
                },
              })
            }
            accessibilityLabel="Ver avaliações"
          >
            <Ionicons name="star-outline" size={16} color={t.accent} />
            <Text style={s.ratingsText}>Ver avaliações</Text>
          </TouchableOpacity>

          <View style={s.divider} />

          {material.description ? (
            <Text style={s.body}>{material.description}</Text>
          ) : (
            <Text style={s.bodyMuted}>Sem descrição. Abra o ficheiro abaixo para ver o conteúdo.</Text>
          )}

          <View style={s.actionsRow}>
            {material.file_url ? (
              <TouchableOpacity style={s.fileBtn} onPress={() => openFile(material.file_url)}>
                <Ionicons name="document-outline" size={18} color={t.accent} />
                <Text style={s.fileBtnText}>Abrir material</Text>
              </TouchableOpacity>
            ) : null}
            {material.file_url_solved ? (
              <TouchableOpacity style={s.fileBtn} onPress={() => openFile(material.file_url_solved)}>
                <Ionicons name="checkmark-circle-outline" size={18} color={t.accent} />
                <Text style={s.fileBtnText}>Abrir resolução</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const stylesStatic = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    marginRight: 2,
  },
});

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
      gap: 6,
      marginBottom: 10,
    },
    ratingText: { fontSize: 12, color: t.textMuted, marginLeft: 4 },
    ratingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      marginBottom: 12,
    },
    ratingsText: { color: t.accent, fontWeight: '600', fontSize: 13 },
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
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 24,
    },
    fileBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
