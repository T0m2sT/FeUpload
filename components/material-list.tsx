import type { Material } from '@/constants/courses';
import type { AppPalette } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { type BookmarkCollection, BOOKMARK_COLORS } from '@/constants/bookmarks';
import { supabase } from '@/lib/supabase';
import { addBookmark } from '@/services/bookmarks';

function StarRating({ rating, accent }: { rating: number; accent: string }) {
  const rounded = Math.round(rating);
  return (
    <View style={{ flexDirection: 'row', marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rounded ? 'star' : 'star-outline'}
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
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOOKMARK_COLORS[0]);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async (uid: string) => {
    try {
      setIsLoadingCollections(true);
      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select('name, color, material_id')
        .eq('user_id', uid);

      if (fetchError) throw fetchError;

      const grouped = (data || []).reduce((acc: BookmarkCollection[], curr) => {
        if (!curr.name) return acc;
        const hasMaterial = curr.material_id != null;
        const existing = acc.find((c) => c.name === curr.name);
        if (existing) {
          if (hasMaterial) existing.item_count += 1;
        } else {
          acc.push({
            id: curr.name, 
            name: curr.name,
            color: curr.color || BOOKMARK_COLORS[0],
            item_count: hasMaterial ? 1 : 0,
          });
        }
        return acc;
      }, []);

      setCollections(grouped);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoadingCollections(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
        fetchCollections(data.session.user.id);
      }
    };
    init();
  }, [fetchCollections]);

  const handleBookmarkPress = (material: Material) => {
    setError(null);
    setSelectedMaterial(material);
    setShowCollectionPicker(true);
  };

  const handleSelectCollection = async (collection: BookmarkCollection) => {
    if (!selectedMaterial?.id || !userId) return;
    
    try {
      setIsBookmarking(true);
      setError(null);
      await addBookmark(userId, selectedMaterial.id, collection.name, collection.color);
      
      await fetchCollections(userId);
      setShowCollectionPicker(false);
      setSelectedMaterial(null);
    } catch (err) {
      setError('Falha ao adicionar bookmark.');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleCreateAndBookmark = async () => {
    if (!selectedMaterial || !userId || !newCollectionName.trim()) {
      setError('Selecione um material e dê um nome à coleção.');
      return;
    }

    try {
      setIsBookmarking(true);
      setError(null);

      await addBookmark(userId, selectedMaterial.id, newCollectionName.trim(), selectedColor);
      
      await fetchCollections(userId);
      setShowCollectionPicker(false);
      setSelectedMaterial(null);
      setNewCollectionName('');
      setShowNewCollectionInput(false);
    } catch (err) {
      console.error('Bookmark creation error:', err);
      setError('Erro ao criar coleção. Verifique se o material é válido.');
    } finally {
      setIsBookmarking(false);
    }
  };

  const openPDF = (item: Material) => {
    if (!item.pdf && !item.pdf_solved) return;
    if (Platform.OS === 'web') {
      Linking.openURL(item.pdf || item.pdf_solved!);
    } else {
      router.push({
        pathname: "/pdf-viewer" as any,
        params: {
          pdf: item.pdf ?? '',
          pdf_solved: item.pdf_solved ?? '',
          title: item.title ?? 'PDF',
        },
      });
    }
  };

  if (items.length === 0) {
    return (
      <View style={s.empty}>
        <Ionicons name="folder-open-outline" size={40} color={t.textMuted} />
        <Text style={s.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.row}
              onPress={() => openPDF(item)}
              accessibilityLabel={item.title}
            >
            <View style={[
              s.iconWrap,
              t.isDark && Platform.select({
                web: {
                  boxShadow: `0px 0px 5px ${t.accentGlow}` as any,
                },
                default: {
                  shadowColor: t.accentGlow,
                  shadowOpacity: 0.45,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 0 },
                }
              }),
            ]}>
              <Ionicons name="document-text-outline" size={18} color={t.accent} />
            </View>
            <View style={s.info}>
              <Text style={s.title}>{item.title}</Text>
              {item.subtitle ? <Text style={s.sub}>{item.subtitle}</Text> : null}
              <View style={s.ratingRow}>
                {(() => {
                  const ratingCount = typeof item.ratingCount === 'number' ? item.ratingCount : null;
                  const hasRating = ratingCount !== null
                    ? ratingCount > 0
                    : typeof item.rating === 'number' && item.rating > 0;
                  const ratingValue = typeof item.rating === 'number' ? item.rating : 0;
                  return (
                    <>
                      <StarRating rating={hasRating ? ratingValue : 0} accent={hasRating ? t.accent : t.textMuted} />
                      <Text style={hasRating ? s.ratingValue : s.ratingEmpty}>
                        {hasRating ? ratingValue.toFixed(1) : 'Sem avaliações'}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>
            <View style={s.actions}>
              <TouchableOpacity 
                style={s.actionBtn} 
                onPress={() => handleBookmarkPress(item)}
                accessibilityLabel="Bookmark"
              >
                <Ionicons name="bookmark-outline" size={20} color={t.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionBtn}
                accessibilityLabel="Detalhes do material"
                onPress={() =>
                  router.push({
                    pathname: '/material/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <Ionicons name="information-circle-outline" size={18} color={t.textSecondary} />
              </TouchableOpacity>
              {item.pdf && (
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={() => Linking.openURL(item.pdf!)}
                  accessibilityLabel="Download"
                >
                  <Ionicons name="cloud-download-outline" size={18} color={t.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
      />

      <Modal 
        visible={showCollectionPicker} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowCollectionPicker(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.collectionPickerModal}>
            <View style={s.collectionPickerHeader}>
              <Text style={s.collectionPickerTitle}>
                {showNewCollectionInput ? 'Nova Coleção' : 'Guardar Material'}
              </Text>
              <TouchableOpacity onPress={() => setShowCollectionPicker(false)}>
                <Ionicons name="close" size={24} color={t.textPrimary} />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={s.errorBanner}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {!showNewCollectionInput ? (
                <>
                  <TouchableOpacity style={s.collectionOption} onPress={() => setShowNewCollectionInput(true)}>
                    <View style={[s.collectionColorBadge, { backgroundColor: t.accent, justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="add" size={24} color="#FFF" />
                    </View>
                    <View style={s.collectionOptionContent}>
                      <Text style={s.collectionOptionName}>Criar Nova Coleção</Text>
                    </View>
                  </TouchableOpacity>

                  {isLoadingCollections ? (
                    <ActivityIndicator style={{ margin: 20 }} color={t.accent} />
                  ) : (
                    collections.map((col) => (
                      <TouchableOpacity key={col.name} style={s.collectionOption} onPress={() => handleSelectCollection(col)}>
                        <View style={[s.collectionColorBadge, { backgroundColor: col.color }]} />
                        <View style={s.collectionOptionContent}>
                          <Text style={s.collectionOptionName}>{col.name}</Text>
                          <Text style={s.collectionOptionCount}>{col.item_count} materiais</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </>
              ) : (
                <View style={s.newCollectionForm}>
                  <Text style={s.inputLabel}>Nome da Coleção</Text>
                  <TextInput
                    style={s.textInput}
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    placeholder="Ex: Estudo de Exames"
                    placeholderTextColor={t.textMuted}
                  />
                  <Text style={s.inputLabel}>Cor</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {BOOKMARK_COLORS.map((color) => (
                      <TouchableOpacity 
                        key={color} 
                        style={[s.colorOption, { backgroundColor: color }, selectedColor === color && s.colorOptionSelected]} 
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={[s.createButton, { opacity: isBookmarking ? 0.6 : 1 }]} 
                    onPress={handleCreateAndBookmark}
                    disabled={isBookmarking}
                  >
                    <Text style={s.createButtonText}>{isBookmarking ? 'A guardar...' : 'Criar e Guardar'}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={s.backButton} onPress={() => setShowNewCollectionInput(false)}>
                    <Text style={s.backButtonText}>Voltar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    ratingValue: {
      fontSize: 11,
      color: t.textMuted,
    },
    ratingEmpty: {
      fontSize: 11,
      color: t.textMuted,
      marginTop: 4,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    collectionPickerModal: {
      backgroundColor: t.background,
      borderRadius: 16,
      width: '85%',
      maxHeight: '70%',
      overflow: 'hidden',
    },
    collectionPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    collectionPickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: t.textPrimary,
    },
    collectionPickerList: {
      paddingBottom: 20,
    },
    collectionOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    collectionColorBadge: {
      width: 40,
      height: 40,
      borderRadius: 8,
    },
    collectionOptionContent: {
      flex: 1,
    },
    collectionOptionName: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textPrimary,
    },
    collectionOptionCount: {
      fontSize: 12,
      color: t.textSecondary,
    },
    newCollectionForm: {
      padding: 16,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      margin: 16,
      padding: 12,
      borderRadius: 8,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginTop: 12,
    },
    textInput: {
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: t.textPrimary,
      marginBottom: 16,
    },
    colorOption: {
      width: 44,
      height: 44,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorOptionSelected: {
      borderWidth: 3,
      borderColor: '#FFF',
    },
    createButton: {
      backgroundColor: t.accent,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 24,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFF',
    },
    backButton: {
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    backButtonText: {
      fontSize: 14,
      color: t.textSecondary,
    },
  });
}
