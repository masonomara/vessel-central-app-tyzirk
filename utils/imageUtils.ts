
/**
 * Image optimization utilities for React Native
 * Handles image compression, resizing, and format conversion
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizedImage {
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
    
    console.log(`Image optimized: ${formatFileSize(originalInfo.size)} → ${formatFileSize(optimizedInfo.size)} (${compressionRatio.toFixed(1)}% reduction)`);
    
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
 * Optimize multiple images in batch
 */
export async function optimizeImages(
  uris: string[],
  options: ImageOptimizationOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<OptimizedImage[]> {
  const results: OptimizedImage[] = [];
  
  for (let i = 0; i < uris.length; i++) {
    try {
      const optimized = await optimizeImage(uris[i], options);
      results.push(optimized);
      
      if (onProgress) {
        onProgress(i + 1, uris.length);
      }
    } catch (error) {
      console.error(`Error optimizing image ${i + 1}:`, error);
      // Continue with other images even if one fails
    }
  }
  
  return results;
}

/**
 * Get image dimensions and file size
 */
async function getImageInfo(uri: string): Promise<{ width: number; height: number; size: number }> {
  try {
    // For local files, we can get the file size
    let size = 0;
    
    // Try to fetch file info
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      size = blob.size;
    } catch (error) {
      console.log('Could not get file size:', error);
    }
    
    // Get image dimensions
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
    // Return default values if we can't get info
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
  
  // Check if resizing is needed
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  
  // Calculate aspect ratio
  const aspectRatio = width / height;
  
  // Resize based on which dimension exceeds the limit more
  if (width / maxWidth > height / maxHeight) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  } else {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }
  
  return { width, height };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Check if image needs optimization
 */
export function shouldOptimizeImage(
  width: number,
  height: number,
  size: number,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  maxSize: number = 2 * 1024 * 1024 // 2MB
): boolean {
  return width > maxWidth || height > maxHeight || size > maxSize;
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  uri: string,
  size: number = 200
): Promise<OptimizedImage> {
  return optimizeImage(uri, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
  });
}

/**
 * Validate image before processing
 */
export function validateImage(
  mimeType?: string,
  size?: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): { valid: boolean; error?: string } {
  // Check file type
  if (mimeType && !mimeType.startsWith('image/')) {
    return {
      valid: false,
      error: 'File must be an image',
    };
  }
  
  // Check file size
  if (size && size > maxSize) {
    return {
      valid: false,
      error: `Image size must be less than ${formatFileSize(maxSize)}`,
    };
  }
  
  return { valid: true };
}

/**
 * Show optimization progress alert
 */
export function showOptimizationProgress(current: number, total: number): void {
  if (current === total) {
    Alert.alert(
      'Optimization Complete',
      `Successfully optimized ${total} image${total > 1 ? 's' : ''}`
    );
  }
}
