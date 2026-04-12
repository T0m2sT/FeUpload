import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { useLocalSearchParams, Stack } from 'expo-router';
import { pdfAssets } from '../constants/Pdfs';

export default function PdfViewer() {
    const { id } = useLocalSearchParams();
    
    // Ensure we safely map the given dynamic string to our strictly imported local asset
    const pdfSource = typeof id === 'string' && pdfAssets[id] 
        ? pdfAssets[id] 
        : { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true }; // Fallback

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'View PDF' }} />
            <Pdf
                source={pdfSource}
                trustAllCerts={false} // Crucial for Android 10+
                onLoadComplete={(numberOfPages: number, filePath: string) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page: number, numberOfPages: number) => {
                    console.log(`Current page: ${page}`);
                }}
                onError={(error: unknown) => {
                    console.error("PDF Component Error: ", error);
                }}
                onPressLink={(uri: string) => {
                    console.log(`Link pressed: ${uri}`);
                }}
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
