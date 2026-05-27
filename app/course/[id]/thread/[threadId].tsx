import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getThreadWithReplies, createReply, deleteThread, deleteReply } from '@/services/threads';

const LABELS = [
  { name: 'Question', color: '#FF6B6B' },
  { name: 'Project', color: '#4ECDC4' },
  { name: 'Advice', color: '#FFE66D' },
  { name: 'Other', color: '#95E1D3' },
];

type ThreadRow = {
  id: string;
  title: string;
  body: string;
  label: string;
  created_at: string;
  user_id: string;
  profiles?: { name: string } | null;
};

type ReplyRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles?: { name: string } | null;
};

export default function ThreadDetailScreen() {
  const { threadId } = useLocalSearchParams<{
    id: string;
    threadId: string;
    name?: string | string[];
  }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const [thread, setThread] = useState<ThreadRow | null>(null);
  const [replies, setReplies] = useState<ReplyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, [threadId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (err) {
      console.error('Error getting current user:', err);
    }
  };

  useEffect(() => {
    fetchThreadAndReplies();
  }, [threadId]);

  const fetchThreadAndReplies = async () => {
    try {
      setLoading(true);
      const { thread: t, replies: r } = await getThreadWithReplies(threadId);
      setThread(t as ThreadRow);
      setReplies(r as ReplyRow[]);
    } catch (err) {
      console.error('Erro ao carregar thread:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Precisas de estar logado!');
        return;
      }

      await createReply({
        thread_id: threadId,
        user_id: user.id,
        body: replyText.trim(),
      });

      setReplyText('');
      fetchThreadAndReplies();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSending(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteThread = () => {
    const performDelete = async () => {
      if (isDeleting) return;
      setIsDeleting(true);
      try {
        await deleteThread(threadId);
        router.back();
      } catch (err: any) {
        setIsDeleting(false);
        Platform.OS === 'web' ? window.alert('Erro ao eliminar') : Alert.alert('Erro', 'Não foi possível eliminar a publicação.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tens a certeza que queres eliminar esta publicação?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Publicação',
        'Tens a certeza que queres eliminar esta publicação? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', onPress: performDelete, style: 'destructive' },
        ],
      );
    }
  };

  const handleDeleteReply = (replyId: string) => {
    Alert.alert(
      'Eliminar Resposta',
      'Tens a certeza que queres eliminar esta resposta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteReply(replyId);
              fetchThreadAndReplies();
            } catch (err: any) {
              Alert.alert('Erro', 'Não foi possível eliminar a resposta.');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[s.root, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!thread) {
    return (
      <View style={s.root}>
        <Text style={s.notFound}>Publicação não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={s.backText}>Fórum</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/')}
          accessibilityLabel="Ir para o início"
        >
          <Image source={require('@/assets/Logo.png')} style={{ width: 32, height: 32, borderRadius: 16 }} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.container}>
        <View style={s.op}>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, justifyContent: 'space-between' }}>
              <Text style={[s.opTitle, { flex: 1 }]}>{thread.title}</Text>
              {currentUserId === thread.user_id && (
                <TouchableOpacity
                  style={[s.deleteButton, isDeleting && { opacity: 0.5 }]}
                  onPress={handleDeleteThread}
                  disabled={isDeleting}
                  accessibilityLabel="Eliminar publicação"
                >
                  <Ionicons name="trash" size={18} color="#DC3545" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              {thread.label && (
                <View
                  style={{
                    backgroundColor: LABELS.find(l => l.name === thread.label)?.color,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#333' }}>
                    {thread.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={s.opMeta}>
            <Ionicons name="person-circle-outline" size={14} color={t.textMuted} />
            <Text style={s.opMetaText}>{thread.profiles?.name ?? 'Utilizador'}</Text>
            <Text style={s.opMetaDot}>•</Text>
            <Text style={s.opMetaText}>
              {new Date(thread.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={s.opBody}>{thread.body}</Text>
        </View>

        <Text style={s.sectionLabel}>Respostas ({replies.length})</Text>

        {replies.map((reply, index) => (
          <View key={reply.id} style={[s.reply, index === 0 && s.replyFirst]}>
            <View style={s.replyAuthorRow}>
              <View style={s.replyAvatar}>
                <Text style={s.replyAvatarText}>
                  {(reply.profiles?.name ?? 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.replyAuthor}>{reply.profiles?.name ?? 'Utilizador'}</Text>
                <Text style={s.replyDate}>{new Date(reply.created_at).toLocaleDateString()}</Text>
              </View>
              {currentUserId === reply.user_id && (
                <TouchableOpacity
                  style={s.deleteButton}
                  onPress={() => handleDeleteReply(reply.id)}
                  accessibilityLabel="Eliminar resposta"
                >
                  <Ionicons name="trash" size={18} color="#DC3545" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={s.replyBody}>{reply.body}</Text>
          </View>
        ))}

        <View style={s.composer}>
          <Text style={s.composerLabel}>A tua resposta</Text>
          <TextInput
            style={s.composerInput}
            placeholder="Escreve aqui..."
            placeholderTextColor={t.textMuted}
            multiline
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity
            style={[s.replyBtn, (!replyText.trim() || sending) && s.replyBtnDisabled]}
            onPress={submitReply}
            disabled={!replyText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={t.background} />
            ) : (
              <Text style={s.replyBtnText}>Enviar Resposta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Platform.OS === 'ios' ? 56 : 44,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: t.background,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backText: { color: t.accent, fontSize: 15, fontWeight: '600' },
    notFound: { color: t.textSecondary, fontSize: 15, margin: 20 },

    scroll: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },

    op: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      padding: 16,
      marginBottom: 24,
      gap: 10,
    },
    opTitle: { fontSize: 18, fontWeight: 'bold', color: t.textPrimary, lineHeight: 24 },
    opMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    opMetaText: { fontSize: 12, color: t.textMuted },
    opMetaDot: { fontSize: 12, color: t.textMuted },
    opBody: { fontSize: 14, color: t.textSecondary, lineHeight: 22 },

    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },

    reply: {
      borderTopWidth: 1,
      borderTopColor: t.surfaceBorder,
      paddingTop: 14,
      paddingBottom: 14,
      gap: 8,
    },
    replyFirst: { borderTopWidth: 0 },
    replyAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    replyAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    replyAvatarText: { fontSize: 13, fontWeight: 'bold', color: t.accent },
    replyAuthor: { fontSize: 13, fontWeight: '600', color: t.textPrimary },
    replyDate: { fontSize: 11, color: t.textMuted },
    replyBody: { fontSize: 14, color: t.textSecondary, lineHeight: 21, paddingLeft: 42 },

    composer: {
      marginTop: 28,
      gap: 10,
    },
    composerLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    composerInput: {
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
      fontSize: 14,
      color: t.textPrimary,
      minHeight: 90,
      paddingTop: 12,
    },
    replyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: t.accent,
      borderRadius: 12,
      paddingVertical: 13,
    },
    replyBtnDisabled: { opacity: 0.4 },
    replyBtnText: { fontSize: 15, fontWeight: '700', color: t.background },
    deleteButton: {
      backgroundColor: 'rgba(220, 53, 69, 0.15)',
      borderWidth: 1.5,
      borderColor: '#DC3545',
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
