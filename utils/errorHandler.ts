
import { Alert } from 'react-native';

export interface ErrorDetails {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export class AppError extends Error {
  code?: string;
  details?: any;
  timestamp: Date;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Error Handler Utility
 * Provides consistent error handling across the app
 */
class ErrorHandler {
  /**
   * Handle error with user-friendly message
   */
  handle(error: unknown, context?: string): ErrorDetails {
    console.error(`[ErrorHandler] ${context || 'Error'}:`, error);

    const errorDetails = this.parseError(error);
    
    // Log to error tracking service (e.g., Sentry) in production
    if (!__DEV__) {
      this.logToService(errorDetails, context);
    }

    return errorDetails;
  }

  /**
   * Parse error into consistent format
   */
  private parseError(error: unknown): ErrorDetails {
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: error.timestamp,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        details: error.stack,
        timestamp: new Date(),
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        timestamp: new Date(),
      };
    }

    return {
      message: 'An unexpected error occurred',
      details: error,
      timestamp: new Date(),
    };
  }

  /**
   * Show error alert to user
   */
  showAlert(error: unknown, title: string = 'Error', context?: string) {
    const errorDetails = this.handle(error, context);
    const userMessage = this.getUserFriendlyMessage(errorDetails);

    Alert.alert(
      title,
      userMessage,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  }

  /**
   * Show error alert with retry option
   */
  showAlertWithRetry(
    error: unknown,
    onRetry: () => void,
    title: string = 'Error',
    context?: string
  ) {
    const errorDetails = this.handle(error, context);
    const userMessage = this.getUserFriendlyMessage(errorDetails);

    Alert.alert(
      title,
      userMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: onRetry, style: 'default' },
      ],
      { cancelable: true }
    );
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(errorDetails: ErrorDetails): string {
    // Map common error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
      TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',
      AUTH_ERROR: 'Authentication failed. Please log in again.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      NOT_FOUND: 'The requested resource was not found.',
      PERMISSION_DENIED: 'You don&apos;t have permission to perform this action.',
      SERVER_ERROR: 'A server error occurred. Please try again later.',
    };

    if (errorDetails.code && errorMessages[errorDetails.code]) {
      return errorMessages[errorDetails.code];
    }

    // Return the original message if it's user-friendly
    if (errorDetails.message && errorDetails.message.length < 200) {
      return errorDetails.message;
    }

    // Default fallback message
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Log error to external service (placeholder)
   */
  private logToService(errorDetails: ErrorDetails, context?: string) {
    // TODO: Implement logging to error tracking service (e.g., Sentry)
    console.log('[ErrorHandler] Would log to service:', {
      ...errorDetails,
      context,
    });
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(error: unknown, context?: string): ErrorDetails {
    const errorDetails = this.handle(error, context);
    
    return {
      ...errorDetails,
      code: 'NETWORK_ERROR',
      message: 'Network request failed. Please check your connection.',
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: Record<string, string>): ErrorDetails {
    const message = Object.values(errors).join('\n');
    
    return {
      message,
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date(),
    };
  }

  /**
   * Create a safe async wrapper that handles errors
   */
  wrapAsync<T>(
    fn: () => Promise<T>,
    onError?: (error: ErrorDetails) => void
  ): () => Promise<T | null> {
    return async () => {
      try {
        return await fn();
      } catch (error) {
        const errorDetails = this.handle(error);
        if (onError) {
          onError(errorDetails);
        } else {
          this.showAlert(error);
        }
        return null;
      }
    };
  }

  /**
   * Create a safe sync wrapper that handles errors
   */
  wrapSync<T>(
    fn: () => T,
    onError?: (error: ErrorDetails) => void
  ): () => T | null {
    return () => {
      try {
        return fn();
      } catch (error) {
        const errorDetails = this.handle(error);
        if (onError) {
          onError(errorDetails);
        } else {
          this.showAlert(error);
        }
        return null;
      }
    };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error: unknown, context?: string) => 
  errorHandler.handle(error, context);

export const showErrorAlert = (error: unknown, title?: string, context?: string) => 
  errorHandler.showAlert(error, title, context);

export const showErrorAlertWithRetry = (
  error: unknown,
  onRetry: () => void,
  title?: string,
  context?: string
) => errorHandler.showAlertWithRetry(error, onRetry, title, context);
