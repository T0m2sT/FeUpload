import type { AppPalette } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_COMMENT_LENGTH = 500;

function Stars({
  rating,
  size,
  color,
  onPress,
}: {
  rating: number;
  size: number;
  color: string;
  onPress?: (value: number) => void;
}) {
  return (
    <View style={stylesStatic.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity
          key={value}
          onPress={onPress ? () => onPress(value) : undefined}
          disabled={!onPress}
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityLabel={onPress ? `Classificação ${value}` : undefined}
          style={stylesStatic.starTouch}
        >
          <Ionicons
            name={value <= rating ? 'star' : 'star-outline'}
            size={size}
            color={value <= rating ? color : '#c4c0b9'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ratingLabel(value: number) {
  switch (value) {
    case 1:
      return 'Fraco';
    case 2:
      return 'Razoável';
    case 3:
      return 'Bom';
    case 4:
      return 'Muito bom';
    case 5:
      return 'Excelente';
    default:
      return 'Sem classificação';
  }
}

export default function MaterialEvaluationScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);
  const ratingAccent = t.accent;

  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const summary = useMemo(() => `${ratingLabel(rating)} (${rating}/5)`, [rating]);

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Voltar">
            <Ionicons name="arrow-back" size={20} color={ratingAccent} />
          </TouchableOpacity>
          <Text style={s.title}>Avaliar</Text>
          <View style={s.headerSpacer} />
        </View>

        <View style={s.divider} />

        <View style={s.materialCard}>
          <View style={s.materialIconWrap}>
            <Ionicons name="document-text-outline" size={18} color={t.textMuted} />
          </View>

          <View style={s.materialInfo}>
            <Text style={s.materialTitle}>Slides Tópicos 1, 2 e 3</Text>
            <Text style={s.materialCourse}>Cadeira: ESOF</Text>
          </View>

          <Stars rating={4} size={12} color={ratingAccent} />
        </View>

        <Text style={s.sectionTitle}>A tua classificação</Text>

        <View style={s.centered}>
          <Stars rating={rating} size={40} color={ratingAccent} onPress={setRating} />
          <View style={s.summaryPill}>
            <Text style={s.summaryText}>{summary}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>O teu comentário (Opcional)</Text>

        <TextInput
          style={s.commentInput}
          multiline
          textAlignVertical="top"
          placeholder="Escreve o teu comentário sobre este documento ..."
          placeholderTextColor={t.textMuted}
          value={comment}
          onChangeText={setComment}
          maxLength={MAX_COMMENT_LENGTH}
          selectionColor={ratingAccent}
        />
        <Text style={s.counter}>{comment.length} / {MAX_COMMENT_LENGTH}</Text>

        <View style={s.toolbarRow}>
          <Text style={s.toolText}>B</Text>
          <Text style={s.toolText}>I</Text>
          <Text style={s.toolTextUnderline}>U</Text>
          <Text style={s.toolText}>| @mencionar</Text>
        </View>

        <TouchableOpacity style={s.publishBtn} accessibilityRole="button">
          <Text style={s.publishText}>Publicar Avaliação</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
    },
    container: {
      paddingTop: Platform.OS === 'ios' ? 58 : 44,
      paddingHorizontal: 18,
      paddingBottom: 36,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backBtn: {
      width: 32,
      paddingVertical: 2,
      paddingRight: 8,
    },
    headerSpacer: {
      width: 32,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: t.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: t.surfaceBorder,
      marginBottom: 16,
    },
    materialCard: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      backgroundColor: t.surface,
      padding: 8,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    materialIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      backgroundColor: t.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    materialInfo: {
      flex: 1,
    },
    materialTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: t.textPrimary,
      marginBottom: 2,
    },
    materialCourse: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      backgroundColor: t.background,
      color: t.textSecondary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      fontSize: 11,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: t.textSecondary,
      marginBottom: 8,
    },
    centered: {
      alignItems: 'center',
      marginBottom: 16,
    },
    summaryPill: {
      marginTop: 8,
      borderRadius: 999,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    summaryText: {
      fontSize: 13,
      color: t.textSecondary,
    },
    commentInput: {
      minHeight: 170,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: t.surfaceBorder,
      backgroundColor: t.surface,
      color: t.textPrimary,
      fontSize: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    counter: {
      alignSelf: 'flex-end',
      marginTop: 5,
      marginBottom: 8,
      fontSize: 12,
      color: t.textMuted,
    },
    toolbarRow: {
      borderRadius: 9,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    toolText: {
      fontSize: 16,
      color: t.textSecondary,
    },
    toolTextUnderline: {
      fontSize: 16,
      color: t.textSecondary,
      textDecorationLine: 'underline',
    },
    publishBtn: {
      alignSelf: 'center',
      width: '82%',
      borderRadius: 10,
      backgroundColor: t.accent,
      paddingVertical: 12,
      alignItems: 'center',
    },
    publishText: {
      color: '#ffffff',
      fontSize: 17,
      fontWeight: '700',
    },
  });
}

const stylesStatic = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouch: {
    paddingHorizontal: 2,
  },
});
