// Native-only module for document picking
// This file is only used on iOS and Android platforms
import * as DocumentPicker from 'expo-document-picker';

export async function pickDocument() {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });

  if (!res.canceled && res.assets?.[0]) {
    return res.assets[0];
  }
  return null;
}
