import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import type { AppPalette } from '@/constants/theme';
import { BOOKMARK_COLORS } from '@/constants/bookmarks';
import { supabase } from '@/lib/supabase';
import { getUserBookmarks, addBookmark, removeBookmark, removeBookmarksByName, type BookmarkWithMaterial } from '@/services/bookmarks';

export default function BookmarksScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  // --- State ---
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkWithMaterial[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOOKMARK_COLORS[0]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Initial Data Loading ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) fetchBookmarks();
  }, [userId]);

  const fetchBookmarks = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserBookmarks(userId);
      setBookmarks(data || []);
    } catch (err) {
      setError('Erro ao carregar favoritos.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const { data, error: err } = await supabase
        .from('materials')
        .select('id, title, type, class_code, courses(code, name)')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setAvailableMaterials(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // --- Handlers ---
  const handleDeleteBookmark = (bookmarkId: string) => {
    Alert.alert(
      'Remover Favorito',
      'Tem certeza que deseja remover este material dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBookmark(bookmarkId);
              await fetchBookmarks();
            } catch (err) {
              setError('Falha ao remover favorito.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCollection = (collectionName: string) => {
    Alert.alert(
      'Eliminar Coleção',
      `Tem certeza que deseja eliminar a coleção "${collectionName}" e todos os seus materiais?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;
            try {
              await removeBookmarksByName(userId, collectionName);
              await fetchBookmarks();
              if (selectedGroupName === collectionName) {
                setSelectedGroupName(null);
              }
            } catch (err) {
              setError('Falha ao eliminar coleção.');
            }
          },
        },
      ]
    );
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !userId) {
      setError('Preencha o nome da coleção.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addBookmark(userId, selectedMaterialId, newCollectionName.trim(), selectedColor);

      await fetchBookmarks();
      setNewCollectionName('');
      setSelectedMaterialId(null);
      setShowCreateModal(false);
    } catch (err: any) {
      if (err.code === '23505') {
        setError('Este material já existe nesta coleção.');
      } else {
        setError('Falha ao criar coleção.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchMaterials();
  };

  // --- Helpers ---
  const getGroupedBookmarks = () => {
    const grouped: { [key: string]: BookmarkWithMaterial[] } = {};
    bookmarks.forEach((b) => {
      const name = b.name || 'Sem Categoria';
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(b);
    });
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      color: items[0]?.color || BOOKMARK_COLORS[0],
      items,
      itemCount: items.filter(i => i.material_id != null).length,
    }));
  };

  const openPDF = (pdf?: string) => {
    if (!pdf) return;
    if (Platform.OS === 'web') Linking.openURL(pdf);
    else router.push({ pathname: '/pdf-viewer' as any, params: { pdf } });
  };

  // --- Render Helpers ---
  const renderGroupCard = ({ item }: { item: any }) => (
    <View style={s.collectionCardContainer}>
      <TouchableOpacity
        style={[s.collectionCard, { borderLeftColor: item.color }]}
        onPress={() => setSelectedGroupName(item.name)}
      >
        <View style={[s.collectionColorBadge, { backgroundColor: item.color }]}>
          <Text style={s.collectionItemCount}>{item.itemCount}</Text>
        </View>
        <View style={s.collectionContent}>
          <Text style={s.collectionName}>{item.name}</Text>
          <Text style={s.collectionMeta}>{item.itemCount} materiais</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={t.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={s.collectionDeleteButton} 
        onPress={() => handleDeleteCollection(item.name)}
      >
        <Ionicons name="trash-outline" size={20} color={t.error} />
      </TouchableOpacity>
    </View>
  );

  const renderBookmarkItem = ({ item }: { item: BookmarkWithMaterial }) => (
    <View style={s.itemCardContainer}>
      <TouchableOpacity style={s.itemCard} onPress={() => openPDF(item.materials?.file_url)}>
        <View style={s.itemHeader}>
          <View style={s.itemTitleContainer}>
            <Text style={s.itemTitle} numberOfLines={2}>{item.materials?.title}</Text>
            <Text style={s.courseCode}>{item.materials?.class_code}</Text>
          </View>
          <View style={[s.typeBadge, { backgroundColor: t.accentDim }]}>
            <Text style={[s.typeBadgeText, { color: t.accent }]}>{item.materials?.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={s.itemDeleteButton} 
        onPress={() => handleDeleteBookmark(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={t.error} />
      </TouchableOpacity>
    </View>
  );

  // --- View Logic ---
  if (selectedGroupName) {
    const group = getGroupedBookmarks().find(g => g.name === selectedGroupName);
    return (
      <View style={s.container}>
        <View style={s.collectionHeaderSection}>
          <TouchableOpacity onPress={() => setSelectedGroupName(null)} style={s.backButton}>
            <Ionicons name="chevron-back" size={24} color={t.accent} />
          </TouchableOpacity>
          <Text style={s.collectionHeaderTitle}>{selectedGroupName}</Text>
        </View>
        <FlatList
          data={(group?.items || []).filter(i => i.material_id != null)}
          renderItem={renderBookmarkItem}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.centerContainer}>
              <Text style={s.collectionMeta}>Nenhum material nesta coleção.</Text>
            </View>
          }
        />
      </View>
    );
  }

  const isButtonDisabled = !newCollectionName.trim() || isSubmitting || loadingMaterials;

  return (
    <View style={s.container}>
      <View style={s.headerSection}>
        <View style={s.headerTop}>
          <Text style={s.screenTitle}>Coleções</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={t.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={s.createButton}
        onPress={handleOpenCreateModal}
        disabled={!userId}
      >
        <Ionicons name="add-circle-outline" size={20} color={t.background} />
        <Text style={s.createButtonText}>Nova Coleção</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={s.centerContainer}><ActivityIndicator color={t.accent} /></View>
      ) : (
        <FlatList
          data={getGroupedBookmarks()}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.name}
          contentContainerStyle={s.collectionsContent}
        />
      )}

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Criar Coleção</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} disabled={isSubmitting}>
                <Ionicons name="close" size={24} color={t.textPrimary} />
              </TouchableOpacity>
            </View>

            {error && <View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View>}

            <Text style={s.inputLabel}>Selecionar Material</Text>
            {loadingMaterials ? (
               <ActivityIndicator style={{ margin: 10 }} color={t.accent} />
            ) : (
              <ScrollView style={s.materialsList} nestedScrollEnabled={true}>
                {availableMaterials.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[s.materialOption, selectedMaterialId === m.id && s.materialOptionSelected]}
                    onPress={() => setSelectedMaterialId(m.id)}
                  >
                    <Text style={s.materialTitle}>{m.title}</Text>
                    {selectedMaterialId === m.id && <Ionicons name="checkmark-circle" size={18} color={t.accent} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={s.inputLabel}>Nome da Coleção</Text>
            <TextInput
              style={s.textInput}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Ex: Exames Recurso"
            />

            <Text style={s.inputLabel}>Cor</Text>
            <ScrollView horizontal contentContainerStyle={s.colorPickerContent}>
              {BOOKMARK_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorOption, { backgroundColor: c }, selectedColor === c && s.colorOptionSelected]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[s.createModalButton, { opacity: isButtonDisabled ? 0.5 : 1 }]}
              onPress={handleCreateCollection}
              disabled={isButtonDisabled}
            >
              {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={s.createModalButtonText}>Criar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (t: AppPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.background },
  headerSection: { padding: 16, paddingTop: 48 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: t.textPrimary },
  createButton: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 12, borderRadius: 12, backgroundColor: t.accent, gap: 8 },
  createButtonText: { fontSize: 14, fontWeight: '600', color: t.background },
  collectionsContent: { padding: 16, gap: 12 },
  collectionCardContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  collectionCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface, borderRadius: 12, borderLeftWidth: 4, padding: 12, gap: 12, borderWidth: 1, borderColor: t.surfaceBorder },
  collectionDeleteButton: { padding: 10, borderRadius: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  collectionColorBadge: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  collectionItemCount: { fontWeight: 'bold', color: 'white' },
  collectionContent: { flex: 1 },
  collectionName: { fontSize: 15, fontWeight: '600', color: t.textPrimary },
  collectionMeta: { fontSize: 12, color: t.textSecondary },
  collectionHeaderSection: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: t.surfaceBorder },
  collectionHeaderTitle: { fontSize: 18, fontWeight: '600', color: t.textPrimary },
  listContent: { padding: 16, gap: 12 },
  itemCardContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemCard: { flex: 1, backgroundColor: t.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: t.surfaceBorder },
  itemDeleteButton: { padding: 10, borderRadius: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemTitleContainer: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: t.textPrimary },
  courseCode: { fontSize: 12, color: t.accent, marginTop: 4 },
  typeBadge: { padding: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: t.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: t.textPrimary },
  inputLabel: { fontSize: 11, fontWeight: '700', color: t.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  textInput: { backgroundColor: t.surface, borderWidth: 1, borderColor: t.surfaceBorder, borderRadius: 8, padding: 12, color: t.textPrimary },
  materialsList: { maxHeight: 150, backgroundColor: t.surface, borderRadius: 8, borderWidth: 1, borderColor: t.surfaceBorder },
  materialOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: t.surfaceBorder },
  materialOptionSelected: { backgroundColor: t.accentDim },
  materialTitle: { fontSize: 13, color: t.textPrimary },
  colorPickerContent: { gap: 10, paddingVertical: 8 },
  colorOption: { width: 40, height: 40, borderRadius: 20 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#FFF' },
  createModalButton: { backgroundColor: t.accent, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  createModalButtonText: { color: t.background, fontWeight: 'bold', fontSize: 16 },
  errorBanner: { backgroundColor: '#FFE5E5', padding: 10, borderRadius: 8, marginBottom: 10 },
  errorText: { color: '#D32F2F', fontSize: 13, fontWeight: '500' },
  backButton: { padding: 2, marginRight: 12 },
});