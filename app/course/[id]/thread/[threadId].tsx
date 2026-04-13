import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { COURSES, type ThreadReply } from '@/constants/courses';
import type { AppPalette } from '@/constants/theme';

export default function ThreadDetailScreen() {
  const { id, threadId } = useLocalSearchParams<{ id: string; threadId: string }>();
  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const course = COURSES[id ?? ''];
  const thread = course?.threads.find((th) => th.id === threadId);

  const [replyText, setReplyText] = useState('');
  const [localReplies, setLocalReplies] = useState<ThreadReply[]>(thread?.replies ?? []);

  if (!thread) {
    return (
      <View style={s.root}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={s.backText}>Fórum</Text>
        </TouchableOpacity>
        <Text style={s.notFound}>Publicação não encontrada.</Text>
      </View>
    );
  }

  const submitReply = () => {
    if (!replyText.trim()) return;
    const newReply: ThreadReply = {
      id: `local-${Date.now()}`,
      author: 'eu',
      body: replyText.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setLocalReplies((prev) => [...prev, newReply]);
    setReplyText('');
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Voltar ao fórum"
        >
          <Ionicons name="arrow-back" size={20} color={t.accent} />
          <Text style={s.backText}>{course.code}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/')}
          accessibilityLabel="Ir para o início"
        >
          <Ionicons name="star" size={22} color={t.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Original post */}
        <View style={s.op}>
          <Text style={s.opTitle}>{thread.title}</Text>
          <View style={s.opMeta}>
            <Ionicons name="person-circle-outline" size={14} color={t.textMuted} />
            <Text style={s.opMetaText}>{thread.author}</Text>
            <Text style={s.opMetaDot}>·</Text>
            <Text style={s.opMetaText}>{thread.createdAt}</Text>
          </View>
          <Text style={s.opBody}>{thread.body}</Text>
        </View>

        {/* Replies */}
        {localReplies.length > 0 && (
          <Text style={s.sectionLabel}>
            {localReplies.length} resposta{localReplies.length !== 1 ? 's' : ''}
          </Text>
        )}

        {localReplies.map((reply, index) => (
          <View key={reply.id} style={[s.reply, index === 0 && s.replyFirst]}>
            <View style={s.replyAuthorRow}>
              <View style={s.replyAvatar}>
                <Text style={s.replyAvatarText}>{reply.author.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={s.replyAuthor}>{reply.author}</Text>
                <Text style={s.replyDate}>{reply.createdAt}</Text>
              </View>
            </View>
            <Text style={s.replyBody}>{reply.body}</Text>
          </View>
        ))}

        {/* Reply composer */}
        <View style={s.composer}>
          <Text style={s.composerLabel}>A tua resposta</Text>
          <TextInput
            style={[s.composerInput]}
            placeholder="Escreve uma resposta..."
            placeholderTextColor={t.textMuted}
            value={replyText}
            onChangeText={setReplyText}
            selectionColor={t.accent}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[s.replyBtn, !replyText.trim() && s.replyBtnDisabled]}
            onPress={submitReply}
            disabled={!replyText.trim()}
          >
            <Ionicons name="send-outline" size={15} color={t.background} />
            <Text style={s.replyBtnText}>Responder</Text>
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
  });
}
