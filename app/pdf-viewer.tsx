import { PdfViewerComponent } from '@/components/PdfViewerComponent';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

export default function PdfViewer() {
    const { pdf } = useLocalSearchParams();
    const pdfSource = { uri: pdf as string, cache: true };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'View PDF' }} />
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
    }
});
