
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Attachment } from '../types';

export const pickImage = async (): Promise<Attachment | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        id: Date.now().toString(),
        name: asset.fileName || 'image.jpg',
        uri: asset.uri,
        type: 'image',
        size: asset.fileSize || 0,
        uploadedBy: 'current_user',
        uploadedAt: new Date(),
        mimeType: asset.mimeType,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const pickVideo = async (): Promise<Attachment | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        id: Date.now().toString(),
        name: asset.fileName || 'video.mp4',
        uri: asset.uri,
        type: 'video',
        size: asset.fileSize || 0,
        uploadedBy: 'current_user',
        uploadedAt: new Date(),
        mimeType: asset.mimeType,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking video:', error);
    return null;
  }
};

export const takePhoto = async (): Promise<Attachment | null> => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.status !== 'granted') {
      alert('Permission to access camera is required!');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        id: Date.now().toString(),
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        uri: asset.uri,
        type: 'image',
        size: asset.fileSize || 0,
        uploadedBy: 'current_user',
        uploadedAt: new Date(),
        mimeType: asset.mimeType,
      };
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const pickDocument = async (): Promise<Attachment | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        id: Date.now().toString(),
        name: asset.name,
        uri: asset.uri,
        type: 'document',
        size: asset.size || 0,
        uploadedBy: 'current_user',
        uploadedAt: new Date(),
        mimeType: asset.mimeType,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking document:', error);
    return null;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (type: string): string => {
  if (type.includes('image')) return 'photo';
  if (type.includes('video')) return 'videocam';
  if (type.includes('pdf')) return 'picture_as_pdf';
  if (type.includes('document') || type.includes('word')) return 'description';
  if (type.includes('spreadsheet') || type.includes('excel')) return 'table_chart';
  return 'insert_drive_file';
};
