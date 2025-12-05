
/**
 * Enhanced validation utilities for form inputs
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { valid: false, message: 'Password is required' };
  }
  
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

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateNumber = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
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

export const validateNonNegativeNumber = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (num < 0) {
    return { valid: false, message: `${fieldName} cannot be negative` };
  }
  
  return { valid: true };
};

export const validateDate = (date: Date | null, fieldName: string): ValidationResult => {
  if (!date) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, message: `${fieldName} must be a valid date` };
  }
  
  return { valid: true };
};

export const validateFutureDate = (date: Date | null, fieldName: string): ValidationResult => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.valid) {
    return dateValidation;
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (date && date < now) {
    return { valid: false, message: `${fieldName} must be today or in the future` };
  }
  
  return { valid: true };
};

export const validatePastDate = (date: Date | null, fieldName: string): ValidationResult => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.valid) {
    return dateValidation;
  }
  
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  
  if (date && date > now) {
    return { valid: false, message: `${fieldName} cannot be in the future` };
  }
  
  return { valid: true };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim().length === 0) {
    return { valid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  const phoneRegex = /^[\d\s\-+()]+$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Phone number can only contain digits, spaces, and +()-' };
  }
  
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }
  
  return { valid: true };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (value.trim().length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  return { valid: true };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  if (value && value.length > maxLength) {
    return { valid: false, message: `${fieldName} must be no more than ${maxLength} characters` };
  }
  
  return { valid: true };
};

export const validateRange = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
  const numValidation = validateNumber(value, fieldName);
  if (!numValidation.valid) {
    return numValidation;
  }
  
  const num = parseFloat(value);
  if (num < min || num > max) {
    return { valid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number = 10): ValidationResult => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (sizeInBytes > maxSizeInBytes) {
    return { valid: false, message: `File size must be less than ${maxSizeInMB}MB` };
  }
  return { valid: true };
};

export const validateFileType = (
  fileType: string, 
  allowedTypes: string[]
): ValidationResult => {
  if (!allowedTypes.includes(fileType)) {
    return { valid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  return { valid: true };
};

export const validateDateFormat = (dateString: string): ValidationResult => {
  if (!dateString || dateString.trim().length === 0) {
    return { valid: false, message: 'Date is required' };
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return { valid: false, message: 'Date must be in YYYY-MM-DD format' };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Please enter a valid date' };
  }
  
  return { valid: true };
};

/**
 * Validate multiple fields at once
 */
export const validateFields = (
  validations: Array<{ field: string; validation: ValidationResult }>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let valid = true;
  
  for (const { field, validation } of validations) {
    if (!validation.valid && validation.message) {
      errors[field] = validation.message;
      valid = false;
    }
  }
  
  return { valid, errors };
};

/**
 * Real-time validation helper
 */
export const createValidator = (
  validationFn: (value: any) => ValidationResult
) => {
  return (value: any): string | undefined => {
    const result = validationFn(value);
    return result.valid ? undefined : result.message;
  };
};
