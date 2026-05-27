import React from 'react';
import { View, StyleSheet } from 'react-native';

export function PdfViewerComponent({ source, style }: any) {
  return (
    <View style={style}>
      <iframe
        src={source.uri}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </View>
  );
}
