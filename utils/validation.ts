
/**
 * Validation utilities for form inputs
 */

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
