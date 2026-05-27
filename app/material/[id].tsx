import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
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
import { supabase } from '@/lib/supabase';
import { getCachedSummary, setCachedSummary, getCachedFlashcards, setCachedFlashcards, type Flashcard } from '@/lib/ai-summary-cache';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [aiSummary, setAiSummary] = useState<string | null>(() => getCachedSummary(materialId ?? '') ?? null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(() => getCachedFlashcards(materialId ?? '') ?? null);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

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

  const generateAiSummary = async () => {
    if (!material?.file_url) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('summarize-pdf', {
        body: { fileUrl: material.file_url, title: material.title },
      });
      if (fnError) throw fnError;
      setAiSummary(data.summary);
      if (materialId) setCachedSummary(materialId, data.summary);
    } catch (e: any) {
      setAiError(e?.message ?? 'Não foi possível gerar o resumo. Tenta novamente.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!material?.file_url) return;
    setFlashcardsLoading(true);
    setFlashcardsError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('study-questions', {
        body: { fileUrl: material.file_url, title: material.title },
      });
      if (fnError) throw fnError;
      const cards: Flashcard[] = data.questions;
      setFlashcards(cards);
      setFlashcardIndex(0);
      setFlipped(false);
      flipAnim.setValue(0);
      if (materialId) setCachedFlashcards(materialId, cards);
    } catch (e: any) {
      setFlashcardsError(e?.message ?? 'Não foi possível gerar as fichas. Tenta novamente.');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const handleFlip = () => {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, friction: 8 }).start();
    setFlipped(!flipped);
  };

  const handleNext = () => {
    if (!flashcards || flashcardIndex >= flashcards.length - 1) return;
    setFlipped(false);
    flipAnim.setValue(0);
    setFlashcardIndex(flashcardIndex + 1);
  };

  const handlePrev = () => {
    if (flashcardIndex <= 0) return;
    setFlipped(false);
    flipAnim.setValue(0);
    setFlashcardIndex(flashcardIndex - 1);
  };

  const openFile = (url: string | null, startSolved = false) => {
    if (!url) return;
    if (Platform.OS === 'web') {
      Linking.openURL(url);
    } else {
      router.push({
        pathname: '/pdf-viewer' as any,
        params: {
          pdf: startSolved ? (material?.file_url ?? url) : url,
          pdf_solved: material?.file_url_solved ?? '',
          title: material?.title ?? 'PDF',
          ...(startSolved && { initialSolved: '1' }),
        },
      });
    }
  };

  return (
    <SafeAreaView style={s.root}>
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
          {material.file_url ? (
            <TouchableOpacity onPress={() => openFile(material.file_url)} accessibilityLabel="Abrir ficheiro">
              <Text style={s.title}>{material.title}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.title}>{material.title}</Text>
          )}

          <View style={s.metaRow}>
            <Ionicons name="person-outline" size={14} color={t.textSecondary} />
            <Text style={s.metaText}>{material.author}</Text>
            <Text style={s.metaDot}>·</Text>
            <Ionicons name="calendar-outline" size={14} color={t.textSecondary} />
            <Text style={s.metaText}>{formatDate(material.created_at)}</Text>
          </View>

          <TouchableOpacity
            style={s.ratingRow}
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
            <Stars rating={material.avgRating} size={16} color={t.accent} muted={t.textMuted} />
            {material.ratingCount > 0 ? (
              <Text style={s.ratingText}>
                <Text style={s.ratingAccent}>{material.avgRating.toFixed(1)} (</Text><Text style={s.ratingLink}>{`${material.ratingCount} ${material.ratingCount === 1 ? 'avaliação' : 'avaliações'})`}</Text>
              </Text>
            ) : (
              <Text style={s.ratingLink}>Sem avaliações</Text>
            )}
          </TouchableOpacity>

          <View style={s.divider} />

          {material.description ? (
            <Text style={s.body}>{material.description}</Text>
          ) : (
            <Text style={s.bodyMuted}>Sem descrição. Abra o ficheiro abaixo para ver o conteúdo.</Text>
          )}

          <View style={s.divider} />

          {material.file_url_solved ? (
            <TouchableOpacity style={s.fileBtn} onPress={() => openFile(material.file_url_solved, true)}>
              <Ionicons name="checkmark-circle-outline" size={18} color={t.accent} />
              <Text style={s.fileBtnText}>Abrir resolução</Text>
            </TouchableOpacity>
          ) : null}

          {/* Fichas de estudo */}
          {material.file_url && !flashcardsLoading && !flashcards ? (
            <TouchableOpacity style={s.aiBtn} onPress={generateFlashcards}>
              <Ionicons name="layers-outline" size={16} color={t.accent} />
              <Text style={s.aiBtnText}>Gerar fichas de estudo</Text>
            </TouchableOpacity>
          ) : null}
          {flashcardsLoading ? (
            <View style={s.aiBox}>
              <ActivityIndicator size="small" color={t.accent} style={{ marginBottom: 8 }} />
              <Text style={s.aiBoxMuted}>A gerar fichas de estudo...</Text>
            </View>
          ) : flashcardsError ? (
            <View style={s.aiBox}>
              <Text style={s.aiErrorText}>{flashcardsError}</Text>
              <TouchableOpacity onPress={generateFlashcards} style={{ marginTop: 8 }}>
                <Text style={s.aiBtnText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : flashcards && flashcards.length > 0 ? (
            <View style={s.aiBox}>
              <View style={s.aiHeader}>
                <Ionicons name="layers-outline" size={14} color={t.accent} />
                <Text style={s.aiLabel}>Fichas de estudo</Text>
                <TouchableOpacity onPress={generateFlashcards} disabled={flashcardsLoading} style={{ marginLeft: 'auto' as any }}>
                  <Text style={[s.aiLabel, { color: flashcardIndex === flashcards.length - 1 ? t.accent : t.textMuted }]}>Regenerar</Text>
                </TouchableOpacity>
                <Text style={[s.aiLabel, { color: t.textMuted, marginLeft: 8 }]}>
                  {flashcardIndex + 1}/{flashcards.length}
                </Text>
              </View>
              <TouchableOpacity onPress={handleFlip} activeOpacity={0.85}>
                <View style={s.flashcard}>
                  {!flipped ? (
                    <>
                      <Text style={s.flashcardHint}>Pergunta</Text>
                      <Text style={s.flashcardText}>{flashcards[flashcardIndex].question}</Text>
                      <Text style={s.flashcardTap}>Toca para ver a resposta</Text>
                    </>
                  ) : (
                    <>
                      <Text style={[s.flashcardHint, { color: t.accent }]}>Resposta</Text>
                      <Text style={s.flashcardText}>{flashcards[flashcardIndex].answer}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
              <View style={s.flashcardNav}>
                <TouchableOpacity onPress={handlePrev} disabled={flashcardIndex === 0} style={[s.navBtn, flashcardIndex === 0 && s.navBtnDisabled]}>
                  <Ionicons name="chevron-back" size={20} color={flashcardIndex === 0 ? t.textMuted : t.accent} />
                </TouchableOpacity>
                <View style={s.flashcardDots}>
                  {flashcards.map((_, i) => (
                    <View key={i} style={[s.dot, i === flashcardIndex && { backgroundColor: t.accent }]} />
                  ))}
                </View>
                <TouchableOpacity onPress={handleNext} disabled={flashcardIndex === flashcards.length - 1} style={[s.navBtn, flashcardIndex === flashcards.length - 1 && s.navBtnDisabled]}>
                  <Ionicons name="chevron-forward" size={20} color={flashcardIndex === flashcards.length - 1 ? t.textMuted : t.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Resumo com IA */}
          {material.file_url && !aiSummary && !aiLoading ? (
            <TouchableOpacity style={s.aiBtn} onPress={generateAiSummary}>
              <Ionicons name="sparkles-outline" size={16} color={t.accent} />
              <Text style={s.aiBtnText}>Gerar resumo com IA</Text>
            </TouchableOpacity>
          ) : null}
          {aiLoading ? (
            <View style={s.aiBox}>
              <ActivityIndicator size="small" color={t.accent} style={{ marginBottom: 8 }} />
              <Text style={s.aiBoxMuted}>A gerar resumo...</Text>
            </View>
          ) : aiError ? (
            <View style={s.aiBox}>
              <Text style={s.aiErrorText}>{aiError}</Text>
              <TouchableOpacity onPress={generateAiSummary} style={{ marginTop: 8 }}>
                <Text style={s.aiBtnText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : aiSummary ? (
            <View style={s.aiBox}>
              <View style={s.aiHeader}>
                <Ionicons name="sparkles-outline" size={14} color={t.accent} />
                <Text style={s.aiLabel}>Resumo gerado por IA</Text>
              </View>
              <Markdown style={{ body: s.aiText, bullet_list_icon: s.aiText, bullet_list_content: s.aiText, strong: { color: s.aiText.color, fontWeight: '700' } }}>{aiSummary}</Markdown>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
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
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
      backgroundColor: t.background,
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
    ratingText: { fontSize: 12, color: t.textMuted },
    ratingLink: { fontSize: 12, color: t.accent, textDecorationLine: 'underline' },
    ratingAccent: { fontSize: 12, color: t.accent },
    divider: {
      height: 1,
      backgroundColor: t.surfaceBorder,
      marginVertical: 16,
      marginBottom: 8,
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
      flexDirection: 'column',
      gap: 16,
      marginTop: 8,
    },
    fileBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
    },
    fileBtnText: { color: t.accent, fontWeight: '600', fontSize: 14 },
    aiBtn: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
    },
    aiBtnText: { color: t.accent, fontWeight: '600', fontSize: 14 },
    aiBox: {
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.accentBorder,
      padding: 14,
      marginTop: 4,
    },
    aiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    aiLabel: { fontSize: 11, fontWeight: '700', color: t.accent, textTransform: 'uppercase', letterSpacing: 0.6 },
    aiText: { fontSize: 14, lineHeight: 22, color: t.textPrimary },
    aiBoxMuted: { fontSize: 13, color: t.textMuted, textAlign: 'center' },
    aiErrorText: { fontSize: 13, color: t.error },
    flashcard: {
      backgroundColor: t.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      padding: 16,
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8,
    },
    flashcardHint: {
      fontSize: 11,
      fontWeight: '700',
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    flashcardText: {
      fontSize: 15,
      color: t.textPrimary,
      textAlign: 'center',
      lineHeight: 22,
    },
    flashcardTap: {
      marginTop: 12,
      fontSize: 11,
      color: t.textMuted,
      fontStyle: 'italic',
    },
    flashcardNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    flashcardDots: {
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.surfaceBorder,
    },
    navBtn: {
      padding: 8,
    },
    navBtnDisabled: {
      opacity: 0.3,
    },
  });
}
