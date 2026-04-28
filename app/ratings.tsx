import type { AppPalette } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Review = {
  id: string;
  author: string;
  content: string;
  rating: number;
};

const REVIEWS: Review[] = [
  { id: '1', author: 'João Baião', content: 'Muito bom material!', rating: 5 },
  { id: '2', author: 'João Baião', content: 'Muito bom material!', rating: 5 },
  { id: '3', author: 'João Baião', content: 'Muito bom material!', rating: 5 },
  { id: '4', author: 'João Baião', content: 'Muito bom material!', rating: 5 },
  { id: '5', author: 'João Baião', content: 'Muito bom material!', rating: 5 },
];

const AVERAGE_RATING = 4.6;

function Stars({ rating, size, color }: { rating: number; size: number; color: string }) {
  const roundedToHalf = Math.round(rating * 2) / 2;
  const full = Math.floor(roundedToHalf);
  const hasHalf = roundedToHalf - full >= 0.5;

  return (
    <View style={stylesStatic.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => {
        const isFull = i <= full;
        const isHalf = !isFull && hasHalf && i === full + 1;
        return (
          <Ionicons
            key={i}
            name={isFull ? 'star' : isHalf ? 'star-half' : 'star-outline'}
            size={size}
            color={color}
            style={stylesStatic.starIcon}
          />
        );
      })}
    </View>
  );
}

export default function RatingsScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);
  const ratingAccent = t.accent;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Voltar">
            <Ionicons name="arrow-back" size={22} color={ratingAccent} />
          </TouchableOpacity>
          <Text style={s.title}>Avaliações de Material</Text>
          <View style={s.headerSpacer} />
        </View>

        <View style={s.divider} />

        <View style={s.summaryRow}>
          <Text style={s.averageValue}>{AVERAGE_RATING.toFixed(1)}</Text>
          <Stars rating={AVERAGE_RATING} size={36} color={ratingAccent} />
        </View>

        <View style={s.divider} />

        <View style={s.reviewsList}>
          {REVIEWS.map((review, index) => (
            <View key={review.id}>
              <View style={s.reviewRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>JB</Text>
                </View>

                <View style={s.reviewInfo}>
                  <Text style={s.reviewAuthor}>{review.author}</Text>
                  <Text style={s.reviewContent}>{review.content}</Text>
                </View>

                <View style={s.reviewRight}>
                  <Stars rating={review.rating} size={14} color={ratingAccent} />
                  <Ionicons name="return-up-back" size={18} color={t.textSecondary} />
                </View>
              </View>
              {index < REVIEWS.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={s.ctaButton}
          accessibilityRole="button"
          onPress={() => router.push('/material-evaluation')}
        >
          <Text style={s.ctaText}>Avaliar Material</Text>
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
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backBtn: {
      paddingRight: 8,
      paddingVertical: 2,
      width: 32,
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
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    averageValue: {
      fontSize: 64,
      fontWeight: '700',
      color: t.textPrimary,
      lineHeight: 64,
    },
    reviewsList: {
      marginBottom: 28,
    },
    reviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 10,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.textMuted,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '700',
      color: t.textPrimary,
    },
    reviewInfo: {
      flex: 1,
    },
    reviewAuthor: {
      fontSize: 15,
      fontWeight: '700',
      color: t.textPrimary,
      marginBottom: 2,
    },
    reviewContent: {
      fontSize: 13,
      color: t.textSecondary,
    },
    reviewRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ctaButton: {
      alignSelf: 'center',
      minWidth: 200,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      backgroundColor: t.surface,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 18,
    },
    ctaText: {
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '700',
      color: t.textPrimary,
    },
  });
}

const stylesStatic = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
});
