import { PdfViewerComponent } from '@/components/PdfViewerComponent';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useIsOnline } from '@/hooks/use-is-online';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type QAEntry = { question: string; answer: string };

function PdfBackButton() {
    const router = useRouter();
    const t = useAppTheme();
    return (
        <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 8 }}>
            <Ionicons name="chevron-back" size={24} color={t.accent} />
        </TouchableOpacity>
    );
}

function PdfQaButton({ onPress }: { onPress: () => void }) {
    const t = useAppTheme();
    return (
        <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 8 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={t.accent} />
        </TouchableOpacity>
    );
}

export default function PdfViewer() {
    const { pdf, pdf_solved, local_pdf, local_pdf_solved, title, initialSolved } = useLocalSearchParams<{
        pdf?: string;
        pdf_solved?: string;
        local_pdf?: string;
        local_pdf_solved?: string;
        title: string;
        initialSolved?: string;
    }>();
    const router = useRouter();
    const t = useAppTheme();
    const insets = useSafeAreaInsets();
    const isOnline = useIsOnline();

    // Prefer local files when available — they work offline and load faster.
    const mainUri = local_pdf || pdf || '';
    const solvedUri = local_pdf_solved || pdf_solved || '';

    const hasBoth = !!mainUri && !!solvedUri;
    const [showSolved, setShowSolved] = useState(initialSolved === '1' || (!mainUri && !!solvedUri));
    const [qaOpen, setQaOpen] = useState(false);
    const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
    const [qaInput, setQaInput] = useState('');
    const [qaLoading, setQaLoading] = useState(false);
    const [qaError, setQaError] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    const activePdfUri = showSolved ? solvedUri : mainUri;
    const activeIsLocal = activePdfUri.startsWith('file://');
    const pdfSource = { uri: activePdfUri, cache: true };
    const showOfflineError = !activeIsLocal && !isOnline;
    
    // For AI features, use remote URL if available and online, otherwise use local (won't work for AI)
    const fileUrlForQa = pdf || local_pdf || '';
    const canUseAi = isOnline && !!pdf;

    // Memoize header options to prevent unnecessary re-renders
    const headerOptions = useMemo(() => ({
        title: title ?? 'PDF',
        headerLeft: () => <PdfBackButton />,
        headerRight: () => <PdfQaButton onPress={() => setQaOpen(true)} />,
        headerStyle: { backgroundColor: t.background },
        headerTintColor: t.accent,
        headerShadowVisible: false,
        headerBackVisible: false,
    }), [title, t.background, t.accent]);

    const handleAsk = async () => {
        const question = qaInput.trim();
        if (!question || qaLoading) return;
        setQaInput('');
        setQaError(null);
        setQaLoading(true);
        try {
            const recentHistory = qaHistory.slice(-3);
            const { data, error: fnError } = await supabase.functions.invoke('ask-pdf', {
                body: { fileUrl: fileUrlForQa, title: title ?? '', question, history: recentHistory },
            });
            if (fnError) throw fnError;
            setQaHistory(prev => [...prev, { question, answer: data.answer }]);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (e: any) {
            setQaError(e?.message ?? 'Não foi possível obter resposta. Tenta novamente.');
        } finally {
            setQaLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: t.background }]}>
            <Stack.Screen options={headerOptions} />

            {hasBoth && (
                <View style={[
                    styles.toggleContainer,
                    {
                        backgroundColor: t.surface,
                        borderColor: t.surfaceBorder,
                        bottom: Math.max(insets.bottom, 16) + 12,
                    }
                ]}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            !showSolved && [styles.tabButtonActive, { backgroundColor: t.accent }]
                        ]}
                        onPress={() => setShowSolved(false)}
                        accessibilityLabel="Ver sem resoluções"
                    >
                        <Ionicons
                            name="document-text-outline"
                            size={16}
                            color={!showSolved ? (t.isDark ? '#000' : '#fff') : t.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: !showSolved ? (t.isDark ? '#000' : '#fff') : t.textSecondary }
                        ]}>
                            Sem Resoluções
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            showSolved && [styles.tabButtonActive, { backgroundColor: t.accent }]
                        ]}
                        onPress={() => setShowSolved(true)}
                        accessibilityLabel="Ver com resoluções"
                    >
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={16}
                            color={showSolved ? (t.isDark ? '#000' : '#fff') : t.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: showSolved ? (t.isDark ? '#000' : '#fff') : t.textSecondary }
                        ]}>
                            Com Resoluções
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {showOfflineError ? (
                <View style={styles.offlineBox}>
                    <Ionicons name="cloud-offline-outline" size={48} color={t.textMuted} />
                    <Text style={[styles.offlineTitle, { color: t.textPrimary }]}>Sem ligação</Text>
                    <Text style={[styles.offlineText, { color: t.textSecondary }]}>
                        Este ficheiro não está disponível offline. Liga-te à internet para o descarregar primeiro.
                    </Text>
                </View>
            ) : (
                <PdfViewerComponent
                    key={activePdfUri}
                    source={pdfSource}
                    trustAllCerts={false}
                    style={styles.pdf} />
            )}

            {/* Q&A modal sheet */}
            <Modal
                visible={qaOpen}
                animationType="slide"
                transparent
                onRequestClose={() => setQaOpen(false)}
            >
                <KeyboardAvoidingView
                    style={styles.qaOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    {/* Dismiss backdrop */}
                    <TouchableOpacity style={styles.qaBackdrop} activeOpacity={1} onPress={() => setQaOpen(false)} />

                    <View style={[styles.qaSheet, { backgroundColor: t.background, borderColor: t.surfaceBorder }]}>
                        {/* Header */}
                        <View style={[styles.qaSheetHeader, { borderBottomColor: t.surfaceBorder }]}>
                            <Ionicons name="sparkles-outline" size={16} color={t.accent} />
                            <Text style={[styles.qaSheetTitle, { color: t.textPrimary }]}>Perguntar sobre o documento</Text>
                            <TouchableOpacity onPress={() => setQaOpen(false)} style={styles.qaCloseBtn}>
                                <Ionicons name="close" size={20} color={t.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {!canUseAi ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                                <Ionicons name="cloud-offline-outline" size={48} color={t.textMuted} style={{ marginBottom: 12 }} />
                                <Text style={[styles.qaEmptyText, { color: t.textPrimary, fontSize: 14, fontStyle: 'normal', marginTop: 0 }]}>
                                    {!isOnline ? 'Sem ligação à internet' : 'Ficheiro não disponível'}
                                </Text>
                                <Text style={[styles.qaEmptyText, { color: t.textMuted }]}>
                                    {!isOnline ? 'Liga-te à internet para usar as funcionalidades de IA.' : 'Abre o documento original para usar IA.'}
                                </Text>
                            </View>
                        ) : (
                            <>
                        {/* History */}
                        <ScrollView
                            ref={scrollRef}
                            style={styles.qaHistory}
                            contentContainerStyle={styles.qaHistoryContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {qaHistory.length === 0 && !qaLoading ? (
                                <Text style={[styles.qaEmptyText, { color: t.textMuted }]}>
                                    Faz uma pergunta sobre o conteúdo deste documento.
                                </Text>
                            ) : null}
                            {qaHistory.map((entry, i) => (
                                <View key={i} style={styles.qaEntry}>
                                    <View style={[styles.qaBubble, styles.qaBubbleUser, { backgroundColor: t.accentDim, borderColor: t.accentBorder }]}>
                                        <Text style={[styles.qaBubbleText, { color: t.accent }]}>{entry.question}</Text>
                                    </View>
                                    <View style={[styles.qaBubble, styles.qaBubbleAnswer, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
                                        <Text style={[styles.qaBubbleText, { color: t.textPrimary }]}>{entry.answer}</Text>
                                    </View>
                                </View>
                            ))}
                            {qaLoading ? (
                                <View style={[styles.qaBubble, styles.qaBubbleAnswer, { backgroundColor: t.surface, borderColor: t.surfaceBorder }]}>
                                    <ActivityIndicator size="small" color={t.accent} />
                                </View>
                            ) : null}
                            {qaError ? (
                                <Text style={[styles.qaErrorText, { color: t.error }]}>{qaError}</Text>
                            ) : null}
                        </ScrollView>

                        {/* Input — pinned at bottom */}
                        <View style={[styles.qaInputRow, { borderTopColor: t.surfaceBorder, paddingBottom: Math.max(insets.bottom, 16) }]}>
                            <TextInput
                                style={[styles.qaInput, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
                                placeholder="Faz uma pergunta..."
                                placeholderTextColor={t.textMuted}
                                value={qaInput}
                                onChangeText={setQaInput}
                                onSubmitEditing={handleAsk}
                                returnKeyType="send"
                                editable={!qaLoading}
                                selectionColor={t.accent}
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                onPress={handleAsk}
                                disabled={!qaInput.trim() || qaLoading}
                                style={[styles.qaSendBtn, { backgroundColor: t.accent, opacity: (!qaInput.trim() || qaLoading) ? 0.4 : 1 }]}
                            >
                                <Ionicons name="arrow-up" size={18} color={t.isDark ? '#000' : '#fff'} />
                            </TouchableOpacity>
                        </View>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    backBtn: {
        paddingHorizontal: 8,
    },
    qaHeaderBtn: {
        paddingHorizontal: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        borderRadius: 24,
        borderWidth: 1,
        position: 'absolute',
        zIndex: 10,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    tabButtonActive: {},
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    offlineBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    offlineTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    offlineText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    qaOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    qaBackdrop: {
        flex: 1,
    },
    qaSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        height: '40%',
    },
    qaSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    qaSheetTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    qaCloseBtn: {
        padding: 4,
    },
    qaHistory: {
        flex: 1,
    },
    qaHistoryContent: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },
    qaEmptyText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    qaEntry: {
        gap: 8,
    },
    qaBubble: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
    },
    qaBubbleUser: {
        alignSelf: 'flex-end',
        maxWidth: '85%',
    },
    qaBubbleAnswer: {
        alignSelf: 'flex-start',
        maxWidth: '95%',
    },
    qaBubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    qaErrorText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },
    qaInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        paddingHorizontal: 14,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    qaInput: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
    },
    qaSendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
});
