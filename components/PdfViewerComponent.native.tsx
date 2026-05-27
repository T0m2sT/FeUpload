import React from 'react';
import Pdf from 'react-native-pdf';

export function PdfViewerComponent(props: any) {
  // react-native-pdf handles file:// URIs correctly if they are absolute.
  // We assume the source.uri passed from the viewer screen is already correctly resolved.
  return <Pdf {...props} />;
}
