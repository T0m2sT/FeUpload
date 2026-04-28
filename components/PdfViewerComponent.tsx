import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PdfViewerComponent({ source, style }: any) {
  return (
    <View style={styles.container}>
      <Text>PDF viewing is not supported in the browser. Please open the link directly.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
