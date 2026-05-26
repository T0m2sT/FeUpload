import { PdfViewerComponent } from '@/components/PdfViewerComponent';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useIsOnline } from '@/hooks/use-is-online';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

    const activePdfUri = showSolved ? solvedUri : mainUri;
    const activeIsLocal = activePdfUri.startsWith('file://');
    const pdfSource = { uri: activePdfUri, cache: true };

    const showOfflineError = !activeIsLocal && !isOnline;

    return (
        <View style={[styles.container, { backgroundColor: t.background }]}>
            <Stack.Screen
                options={{
                    title: title ?? 'PDF',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color={t.accent} />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: t.background,
                    },
                    headerTintColor: t.textPrimary,
                    headerShadowVisible: false,
                    headerBackVisible: false,
                }}
            />
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
    tabButtonActive: {
        // Applied dynamically
    },
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
});
