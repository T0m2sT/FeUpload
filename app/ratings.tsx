import type { AppPalette } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { supabase } from '@/lib/supabase';
import {
  deleteReview,
  getReviewsByMaterial,
  refreshMaterialRating,
  updateReview,
} from '@/services/reviews';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_COMMENT_LENGTH = 500;

type Review = {
  id: string;
  userId: string;
  author: string;
  content: string;
  rating: number;
};

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

function EditableStars({
  rating,
  color,
  onPress,
}: {
  rating: number;
  color: string;
  onPress: (value: number) => void;
}) {
  return (
    <View style={stylesStatic.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity
          key={value}
          onPress={() => onPress(value)}
          accessibilityRole="button"
          accessibilityLabel={`Classificação ${value}`}
          style={stylesStatic.starTouch}
        >
          <Ionicons
            name={value <= rating ? 'star' : 'star-outline'}
            size={18}
            color={value <= rating ? color : '#c4c0b9'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function RatingsScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const { materialId, materialTitle, courseCode } = useLocalSearchParams<{
    materialId?: string | string[];
    materialTitle?: string | string[];
    courseCode?: string | string[];
  }>();
  const s = makeStyles(t);
  const ratingAccent = t.accent;
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(1);
  const [editComment, setEditComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);

  const selectedMaterialId = Array.isArray(materialId) ? materialId[0] : materialId;
  const selectedMaterialTitle = Array.isArray(materialTitle) ? materialTitle[0] : materialTitle;
  const selectedCourseCode = Array.isArray(courseCode) ? courseCode[0] : courseCode;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const myReview = useMemo(
    () => reviews.find((review) => review.userId === currentUserId) ?? null,
    [currentUserId, reviews]
  );

  useEffect(() => {
    if (!myReview) return;
    setEditRating(myReview.rating);
    setEditComment(myReview.content);
  }, [myReview]);

  useEffect(() => {
    if (!myReview) {
      setIsEditingMyReview(false);
    }
  }, [myReview]);

  const isDirty = useMemo(() => {
    if (!myReview) return false;
    const originalComment = myReview.content.trim();
    const nextComment = editComment.trim();
    return editRating !== myReview.rating || originalComment !== nextComment;
  }, [editComment, editRating, myReview]);

  const fetchReviews = useCallback(async () => {
    if (!selectedMaterialId) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      const data = await getReviewsByMaterial(selectedMaterialId);
      const mappedReviews = (data ?? []).map((review: any) => {
        const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;
        return {
          id: review.id,
          userId: review.user_id,
          author: profile?.name ?? 'Utilizador',
          content: review.content ?? '',
          rating: review.rating,
        };
      });
      setReviews(mappedReviews);
    } catch {
      setErrorMsg('Ocorreu um erro ao carregar avaliações.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMaterialId]);

  const onCancelEdit = useCallback(() => {
    if (!myReview) return;
    setEditRating(myReview.rating);
    setEditComment(myReview.content);
    setIsEditingMyReview(false);
  }, [myReview]);

  const onSaveEdit = useCallback(async () => {
    if (!myReview || !selectedMaterialId) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateReview(myReview.id, {
        rating: editRating,
        content: editComment.trim() || null,
      });
      await refreshMaterialRating(selectedMaterialId);
      await fetchReviews();
      setIsEditingMyReview(false);
    } catch {
      setErrorMsg('Não foi possível guardar alterações.');
    } finally {
      setIsSaving(false);
    }
  }, [editComment, editRating, fetchReviews, myReview, selectedMaterialId]);

  const onDeleteMyReview = useCallback(async () => {
    if (!myReview || !selectedMaterialId) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await deleteReview(myReview.id);
      await refreshMaterialRating(selectedMaterialId);
      await fetchReviews();
    } catch {
      setErrorMsg('Não foi possível apagar a avaliação.');
    } finally {
      setIsDeleting(false);
    }
  }, [fetchReviews, myReview, selectedMaterialId]);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews])
  );

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

        <Text style={s.materialInfo}>{selectedMaterialTitle ?? 'Material'}</Text>
        {selectedCourseCode ? <Text style={s.courseInfo}>Cadeira: {selectedCourseCode}</Text> : null}

        <View style={s.divider} />

        <View style={s.summaryRow}>
          <Text style={s.averageValue}>{averageRating.toFixed(1)}</Text>
          <Stars rating={averageRating} size={36} color={ratingAccent} />
        </View>

        <View style={s.divider} />

        <View style={s.reviewsList}>
          {isLoading ? (
            <View style={s.feedbackBox}>
              <ActivityIndicator color={ratingAccent} />
              <Text style={s.feedbackText}>A carregar avaliações...</Text>
            </View>
          ) : errorMsg ? (
            <View style={s.feedbackBox}>
              <Text style={s.feedbackText}>{errorMsg}</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={s.feedbackBox}>
              <Text style={s.feedbackText}>Ainda não existem avaliações para este material.</Text>
            </View>
          ) : (
            reviews.map((review, index) => (
              <View key={review.id}>
                <View style={s.reviewRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{review.author.slice(0, 1).toUpperCase()}</Text>
                  </View>

                  <View style={s.reviewInfo}>
                    <Text style={s.reviewAuthor}>{review.author}</Text>
                    <Text style={s.reviewContent}>
                      {review.content.trim() ? review.content : 'Sem comentário.'}
                    </Text>
                  </View>

                  <View style={s.reviewRight}>
                    <Stars rating={review.rating} size={14} color={ratingAccent} />
                    <Ionicons name="return-up-back" size={18} color={t.textSecondary} />
                  </View>
                </View>
                {index < reviews.length - 1 && <View style={s.divider} />}
              </View>
            ))
          )}
        </View>

        {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

        {myReview && !isEditingMyReview ? (
          <TouchableOpacity
            style={s.ctaButton}
            accessibilityRole="button"
            onPress={() => setIsEditingMyReview(true)}
            disabled={isLoading || isDeleting || isSaving}
          >
            <Text style={s.ctaText}>Editar Avaliação</Text>
          </TouchableOpacity>
        ) : null}

        {myReview && isEditingMyReview ? (
          <View style={s.editCard}>
            <View style={s.editHeader}>
              <Text style={s.editPill}>A tua avaliação</Text>
              <TouchableOpacity
                onPress={onDeleteMyReview}
                accessibilityLabel="Apagar avaliação"
                disabled={isDeleting || isSaving}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={ratingAccent} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={ratingAccent} />
                )}
              </TouchableOpacity>
            </View>

            <View style={s.editIdentityRow}>
              <View style={s.editAvatar}>
                <Text style={s.editAvatarText}>{getInitials(myReview.author)}</Text>
              </View>
              <View>
                <Text style={s.editAuthorName}>{myReview.author}</Text>
                <EditableStars rating={editRating} color={ratingAccent} onPress={setEditRating} />
              </View>
            </View>

            <TextInput
              style={s.editCommentInput}
              multiline
              textAlignVertical="top"
              placeholder="Atualiza o teu comentário..."
              placeholderTextColor={t.textMuted}
              value={editComment}
              onChangeText={setEditComment}
              maxLength={MAX_COMMENT_LENGTH}
              selectionColor={ratingAccent}
            />
            <Text style={s.editCounter}>{editComment.length} / {MAX_COMMENT_LENGTH}</Text>

            <View style={s.editActions}>
              <TouchableOpacity
                style={[
                  s.cancelButton,
                  isDirty && !isSaving && !isDeleting && s.cancelButtonActive,
                ]}
                onPress={onCancelEdit}
                disabled={!isDirty || isSaving || isDeleting}
              >
                <Text
                  style={[
                    s.cancelText,
                    isDirty && !isSaving && !isDeleting && s.cancelTextActive,
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveButton, (!isDirty || isSaving || isDeleting) && s.saveButtonDisabled]}
                onPress={onSaveEdit}
                disabled={!isDirty || isSaving || isDeleting}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={s.saveText}>Guardar Alterações</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : !myReview ? (
          <TouchableOpacity
            style={s.ctaButton}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/material-evaluation',
                params: {
                  materialId: selectedMaterialId,
                  materialTitle: selectedMaterialTitle,
                  courseCode: selectedCourseCode,
                },
              })
            }
            disabled={!selectedMaterialId}
          >
            <Text style={s.ctaText}>Avaliar Material</Text>
          </TouchableOpacity>
        ) : null}
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
    materialInfo: {
      fontSize: 16,
      fontWeight: '700',
      color: t.textPrimary,
      paddingTop: 14,
    },
    courseInfo: {
      fontSize: 13,
      color: t.textSecondary,
      paddingBottom: 12,
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
    feedbackBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      gap: 12,
    },
    feedbackText: {
      fontSize: 14,
      color: t.textSecondary,
      textAlign: 'center',
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
    editCard: {
      borderWidth: 1.5,
      borderColor: t.accent,
      borderRadius: 14,
      backgroundColor: t.surface,
      padding: 12,
      gap: 8,
    },
    editHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editPill: {
      backgroundColor: t.accent,
      color: '#ffffff',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      fontWeight: '700',
      fontSize: 13,
      overflow: 'hidden',
    },
    editIdentityRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    editAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: t.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editAvatarText: {
      color: t.textPrimary,
      fontWeight: '700',
      fontSize: 13,
    },
    editAuthorName: {
      fontSize: 26,
      fontWeight: '700',
      color: t.textPrimary,
    },
    editCommentInput: {
      minHeight: 84,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: t.textSecondary,
      backgroundColor: t.background,
      color: t.textPrimary,
      fontSize: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    editCounter: {
      alignSelf: 'flex-end',
      color: t.textMuted,
      fontSize: 13,
    },
    editActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 2,
    },
    cancelButton: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 42,
      backgroundColor: t.background,
    },
    cancelText: {
      color: t.textSecondary,
      fontWeight: '600',
      fontSize: 20,
    },
    cancelButtonActive: {
      borderColor: t.accent,
      backgroundColor: t.accentDim,
    },
    cancelTextActive: {
      color: t.textPrimary,
      fontWeight: '700',
    },
    saveButton: {
      flex: 1,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 42,
      backgroundColor: t.accent,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveText: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 19,
      lineHeight: 19,
      includeFontPadding: false,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    errorText: {
      color: '#ff6f6f',
      textAlign: 'center',
      marginBottom: 10,
      fontSize: 13,
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
  starTouch: {
    paddingRight: 4,
  },
});
