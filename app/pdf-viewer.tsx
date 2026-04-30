import { PdfViewerComponent } from '@/components/PdfViewerComponent';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PdfViewer() {
    const { pdf, title } = useLocalSearchParams<{ pdf: string; title: string }>();
    const router = useRouter();
    const pdfSource = { uri: pdf as string, cache: true };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: title ?? 'PDF',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <PdfViewerComponent
                source={pdfSource}
                trustAllCerts={false}
                style={styles.pdf} />
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
});
