
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { Alert } from 'react-native';

const DEMO_ASSETS: Record<string, number> = {
  'vessel_registration.pdf': require('../assets/documents/vessel_registration.pdf'),
  'hull_insurance.pdf': require('../assets/documents/hull_insurance.pdf'),
  'dpnr_registration.pdf': require('../assets/documents/dpnr_registration.pdf'),
  'captain_license.pdf': require('../assets/documents/captain_license.pdf'),
  'fcc_license.pdf': require('../assets/documents/fcc_license.pdf'),
  'bahamas_permit.pdf': require('../assets/documents/bahamas_permit.pdf'),
  'safety_manual.pdf': require('../assets/documents/safety_manual.pdf'),
};

export async function openDocument(fileUri: string, fileType: string): Promise<void> {
  let uri = fileUri;

  if (fileUri.startsWith('file://documents/')) {
    const basename = fileUri.replace('file://documents/', '');
    const assetModule = DEMO_ASSETS[basename];
    if (!assetModule) {
      Alert.alert('File Not Found', 'Demo document asset is missing.');
      return;
    }
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    uri = asset.localUri!;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: fileType });
  } else {
    Alert.alert('Sharing Not Available', 'Cannot open documents on this device.');
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
