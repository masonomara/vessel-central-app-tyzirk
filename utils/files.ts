
/**
 * Image optimization and file handling utilities
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { Alert } from 'react-native';
import { formatFileSize } from './formatting';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  size?: number;
  originalSize?: number;
  compressionRatio?: number;
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: 'jpeg',
};

/**
 * Optimize a single image by resizing and compressing
 */
export async function optimizeImage(
  uri: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Get original image info
    const originalInfo = await getImageInfo(uri);

    // Calculate new dimensions while maintaining aspect ratio
    const { width, height } = calculateOptimalDimensions(
      originalInfo.width,
      originalInfo.height,
      opts.maxWidth!,
      opts.maxHeight!
    );

    // Perform image manipulation
    const manipulateActions: ImageManipulator.Action[] = [];

    // Resize if needed
    if (width !== originalInfo.width || height !== originalInfo.height) {
      manipulateActions.push({
        resize: { width, height },
      });
    }

    // Compress and save
    const result = await ImageManipulator.manipulateAsync(
      uri,
      manipulateActions,
      {
        compress: opts.quality,
        format: opts.format === 'png'
          ? ImageManipulator.SaveFormat.PNG
          : opts.format === 'webp'
          ? ImageManipulator.SaveFormat.WEBP
          : ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get optimized image info
    const optimizedInfo = await getImageInfo(result.uri);

    const compressionRatio = originalInfo.size
      ? (1 - (optimizedInfo.size / originalInfo.size)) * 100
      : 0;

    if (__DEV__) {
      console.log(`Image optimized: ${formatFileSize(originalInfo.size)} → ${formatFileSize(optimizedInfo.size)} (${compressionRatio.toFixed(1)}% reduction)`);
    }

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: optimizedInfo.size,
      originalSize: originalInfo.size,
      compressionRatio,
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}

/**
 * Get image dimensions and file size
 */
async function getImageInfo(uri: string): Promise<{ width: number; height: number; size: number }> {
  try {
    let size = 0;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      size = blob.size;
    } catch (error) {
      console.log('Could not get file size:', error);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size,
        });
      };
      img.onerror = reject;
      img.src = uri;
    });
  } catch (error) {
    console.error('Error getting image info:', error);
    return { width: 1920, height: 1920, size: 0 };
  }
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width / maxWidth > height / maxHeight) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  } else {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

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
