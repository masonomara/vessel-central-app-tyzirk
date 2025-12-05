
/**
 * Performance optimization utilities for React Native
 */

/**
 * Debounce function to limit how often a function can be called
 * Useful for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once per specified time period
 * Useful for scroll events, resize handlers, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize expensive calculations
 * Cache results based on input arguments
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

/**
 * Batch multiple state updates together
 * Useful when you need to update multiple pieces of state at once
 */
export function batchUpdates(updates: Array<() => void>): void {
  updates.forEach(update => update());
}

/**
 * Check if two objects are shallowly equal
 * Useful for React.memo comparison functions
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Create a stable reference for array/object props
 * Prevents unnecessary re-renders when content is the same
 */
export function createStableReference<T>(value: T, previousValue: T | undefined): T {
  if (previousValue === undefined) {
    return value;
  }

  if (Array.isArray(value) && Array.isArray(previousValue)) {
    if (value.length !== previousValue.length) {
      return value;
    }
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== previousValue[i]) {
        return value;
      }
    }
    
    return previousValue;
  }

  if (typeof value === 'object' && value !== null && typeof previousValue === 'object' && previousValue !== null) {
    if (shallowEqual(value, previousValue)) {
      return previousValue;
    }
  }

  return value;
}

/**
 * Measure component render time (development only)
 */
export function measureRenderTime(componentName: string, callback: () => void): void {
  if (__DEV__) {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
  } else {
    callback();
  }
}

/**
 * Log memory usage (development only)
 */
export function logMemoryUsage(label: string): void {
  if (__DEV__ && global.performance && (global.performance as any).memory) {
    const memory = (global.performance as any).memory;
    console.log(`[Memory] ${label}:`, {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}
