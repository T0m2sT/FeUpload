import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CourseSectionShell } from '@/components/course-section-shell';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { getThreadsByCourseCode, getCourseIdByCode, createThread } from '@/services/threads';

type ThreadRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  course_id: string;
  profiles?: { name: string } | null;
  thread_replies?: { id: string }[];
};

export default function CourseThreadsScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string;
    name?: string | string[];
    description?: string | string[];
  }>();

  const router = useRouter();
  const t = useAppTheme();
  const s = makeStyles(t);

  const courseCode = (id ?? '').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;

  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [localThreads, setLocalThreads] = useState<ThreadRow[]>([]);
  const [courseUuid, setCourseUuid] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads();
  }, [courseCode]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await getThreadsByCourseCode(courseCode) as ThreadRow[];
      setLocalThreads(data);

      if (data.length > 0) {
        setCourseUuid(data[0].course_id);
      } else {
        const uuid = await getCourseIdByCode(courseCode);
        if (uuid) setCourseUuid(uuid);
      }
    } catch (err) {
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitThread = async () => {
    if (!title.trim() || !body.trim() || !courseUuid) return;

    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Não estás autenticado. Faz login novamente.');
      }

      await createThread({
        title: title.trim(),
        body: body.trim(),
        course_id: courseUuid,
        user_id: user.id,
      });

      setTitle('');
      setBody('');
      setComposing(false);
      fetchThreads();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CourseSectionShell
      courseId={id ?? ''}
      courseCode={courseCode}
      courseName={courseNameParam ?? courseCode}
      courseDescription={courseDescription}
      activeKey="threads"
    >
      {loading && !composing && localThreads.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={t.accent} />
      ) : composing ? (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.composeContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.composeHeader}>
            <Text style={s.composeTitle}>Nova Publicação</Text>
            <TouchableOpacity onPress={() => setComposing(false)}>
              <Ionicons name="close" size={24} color={t.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={s.inputLabel}>Título</Text>
          <TextInput
            style={s.input}
            placeholder="Sobre o que queres falar?"
            placeholderTextColor={t.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={s.inputLabel}>Mensagem</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            placeholder="Escreve aqui a tua dúvida ou comentário..."
            placeholderTextColor={t.textMuted}
            multiline
            value={body}
            onChangeText={setBody}
          />

          <TouchableOpacity
            style={[s.submitBtn, (!title.trim() || !body.trim() || loading) && s.submitBtnDisabled]}
            onPress={submitThread}
            disabled={!title.trim() || !body.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={t.background} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={t.background} />
                <Text style={s.submitBtnText}>Publicar no Fórum</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={s.scroll} contentContainerStyle={s.listContainer}>
          <TouchableOpacity style={s.newBtn} onPress={() => setComposing(true)}>
             <Ionicons name="add-circle-outline" size={20} color={t.accent} />
             <Text style={s.newBtnText}>Nova publicação</Text>
          </TouchableOpacity>

          {localThreads.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>Ainda não há publicações nesta cadeira.</Text>
            </View>
          ) : (
            localThreads.map((thread) => {
              const replyCount = thread.thread_replies?.length ?? 0;
              return (
                <TouchableOpacity
                  key={thread.id}
                  style={s.card}
                  onPress={() =>
                    router.push({
                      pathname: '/course/[id]/thread/[threadId]',
                      params: {
                        id: courseCode,
                        threadId: thread.id,
                        name: courseNameParam ?? courseCode,
                      },
                    })
                  }
                  activeOpacity={0.75}
                >
                  <View style={s.cardTop}>
                    <Text style={s.cardTitle} numberOfLines={2}>{thread.title}</Text>
                    {replyCount > 0 && (
                      <View style={s.replyBadge}>
                        <Text style={s.replyBadgeText}>{replyCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.cardBody} numberOfLines={2}>{thread.body}</Text>
                  <View style={s.cardMeta}>
                    <Ionicons name="person-circle-outline" size={13} color={t.textMuted} />
                    <Text style={s.cardMetaText}>{thread.profiles?.name ?? 'Utilizador'}</Text>
                    <Text style={s.cardMetaDot}>·</Text>
                    <Text style={s.cardMetaText}>{new Date(thread.created_at).toLocaleDateString()}</Text>
                    <View style={{ flex: 1 }} />
                    <Ionicons name="chatbubble-outline" size={13} color={t.textMuted} />
                    <Text style={s.cardMetaText}>{replyCount} resposta{replyCount !== 1 ? 's' : ''}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </CourseSectionShell>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: t.background },
    listContainer: { padding: 16, paddingBottom: 32 },
    composeContainer: { padding: 20, paddingBottom: 40 },
    newBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 16,
      alignSelf: 'flex-start',
    },
    newBtnText: { fontSize: 14, fontWeight: '600', color: t.accent },
    empty: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 14, color: t.textMuted },
    card: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      padding: 14,
      marginBottom: 10,
      gap: 6,
      ...(t.isDark ? {
        shadowColor: t.accent,
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      } : {}),
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    cardTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: t.textPrimary },
    replyBadge: {
      backgroundColor: t.accentDim,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: t.accentBorder,
    },
    replyBadgeText: { fontSize: 11, fontWeight: '700', color: t.accent },
    cardBody: { fontSize: 13, color: t.textSecondary, lineHeight: 18 },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    cardMetaText: { fontSize: 11, color: t.textMuted },
    cardMetaDot: { fontSize: 11, color: t.textMuted },
    composeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    composeTitle: { fontSize: 18, fontWeight: 'bold', color: t.textPrimary },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    input: {
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
      fontSize: 14,
      color: t.textPrimary,
      marginBottom: 16,
    },
    inputMulti: { minHeight: 120, paddingTop: 12, textAlignVertical: 'top' },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: t.accent,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 4,
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnText: { fontSize: 15, fontWeight: '700', color: t.background },
  });
}
