
/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

export const validateRequired = (value: string, fieldName: string): { valid: boolean; message?: string } => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateNumber = (value: string, fieldName: string): { valid: boolean; message?: string } => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  return { valid: true };
};

export const validatePositiveNumber = (value: string, fieldName: string): { valid: boolean; message?: string } => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, message: `${fieldName} must be a positive number` };
  }
  return { valid: true };
};

export const validateDate = (date: Date | null, fieldName: string): { valid: boolean; message?: string } => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, message: `${fieldName} must be a valid date` };
  }
  return { valid: true };
};

export const validateFutureDate = (date: Date | null, fieldName: string): { valid: boolean; message?: string } => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.valid) {
    return dateValidation;
  }
  
  if (date && date < new Date()) {
    return { valid: false, message: `${fieldName} must be in the future` };
  }
  return { valid: true };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number = 10): { valid: boolean; message?: string } => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (sizeInBytes > maxSizeInBytes) {
    return { valid: false, message: `File size must be less than ${maxSizeInMB}MB` };
  }
  return { valid: true };
};

export const validateFileType = (
  fileType: string, 
  allowedTypes: string[]
): { valid: boolean; message?: string } => {
  if (!allowedTypes.includes(fileType)) {
    return { valid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  return { valid: true };
};
