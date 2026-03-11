
/**
 * Validation utilities for form inputs
 */

import { formatFileSize } from './formatting';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validatePositiveNumber = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }

  if (num <= 0) {
    return { valid: false, message: `${fieldName} must be greater than 0` };
  }

  return { valid: true };
};

export function validateImage(
  mimeType?: string,
  size?: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): ValidationResult {
  if (mimeType && !mimeType.startsWith('image/')) {
    return {
      valid: false,
      message: 'File must be an image',
    };
  }

  if (size && size > maxSize) {
    return {
      valid: false,
      message: `Image size must be less than ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}
