import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function PdfViewer() {
    const { pdf } = useLocalSearchParams();
    const pdfSource = { uri: pdf as string, cache: true };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'View PDF' }} />
            <Pdf
                source={pdfSource}
                trustAllCerts={false}
                style={styles.pdf}/>
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
