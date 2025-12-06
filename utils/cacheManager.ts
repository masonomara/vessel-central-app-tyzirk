
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
export const CACHE_KEYS = {
  VESSELS: '@cache_vessels',
  MAINTENANCE_TASKS: '@cache_maintenance_tasks',
  ISSUES: '@cache_issues',
  SUPPLY_REQUESTS: '@cache_supply_requests',
  DOCUMENTS: '@cache_documents',
  ACTIVITY_LOGS: '@cache_activity_logs',
  NOTIFICATIONS: '@cache_notifications',
  EXPENSES: '@cache_expenses',
  CALENDAR_EVENTS: '@cache_calendar_events',
  USER_PREFERENCES: '@cache_user_preferences',
  CACHE_METADATA: '@cache_metadata',
};

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  NEVER: Infinity,
};

// Cache version for invalidation on app updates
const CACHE_VERSION = '1.0.0';

interface CacheMetadata {
  version: string;
  lastUpdated: number;
  expiresAt: number;
}

interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
}

/**
 * Cache Manager for AsyncStorage
 * Provides methods for caching, retrieving, and invalidating data
 */
class CacheManager {
  /**
   * Set data in cache with expiration
   */
  async set<T>(
    key: string,
    data: T,
    expirationTime: number = CACHE_EXPIRATION.MEDIUM
  ): Promise<void> {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        metadata: {
          version: CACHE_VERSION,
          lastUpdated: Date.now(),
          expiresAt: Date.now() + expirationTime,
        },
      };

      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
      console.log(`Cache set: ${key}`);
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from cache
   * Returns null if cache is expired or doesn't exist
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        console.log(`Cache miss: ${key}`);
        return null;
      }

      const cacheEntry: CacheEntry<T> = JSON.parse(cachedData);

      // Check version
      if (cacheEntry.metadata.version !== CACHE_VERSION) {
        console.log(`Cache version mismatch for ${key}, invalidating...`);
        await this.remove(key);
        return null;
      }

      // Check expiration
      if (Date.now() > cacheEntry.metadata.expiresAt) {
        console.log(`Cache expired for ${key}`);
        await this.remove(key);
        return null;
      }

      console.log(`Cache hit: ${key}`);
      return cacheEntry.data;
    } catch (error) {
      console.error(`Error getting cache for ${key}:`, error);
      return null;
    }
  }

  /**
   * Get data from cache without expiration check
   * Useful for offline mode
   */
  async getStale<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        return null;
      }

      const cacheEntry: CacheEntry<T> = JSON.parse(cachedData);
      return cacheEntry.data;
    } catch (error) {
      console.error(`Error getting stale cache for ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async isValid(key: string): Promise<boolean> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        return false;
      }

      const cacheEntry: CacheEntry<any> = JSON.parse(cachedData);

      // Check version and expiration
      return (
        cacheEntry.metadata.version === CACHE_VERSION &&
        Date.now() <= cacheEntry.metadata.expiresAt
      );
    } catch (error) {
      console.error(`Error checking cache validity for ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache metadata
   */
  async getMetadata(key: string): Promise<CacheMetadata | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        return null;
      }

      const cacheEntry: CacheEntry<any> = JSON.parse(cachedData);
      return cacheEntry.metadata;
    } catch (error) {
      console.error(`Error getting cache metadata for ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Cache removed: ${key}`);
    } catch (error) {
      console.error(`Error removing cache for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error clearing all cache:', error);
      throw error;
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      const now = Date.now();

      for (const key of keys) {
        const metadata = await this.getMetadata(key);
        if (metadata && now > metadata.expiresAt) {
          await this.remove(key);
        }
      }

      console.log('Expired cache cleared');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }

  /**
   * Get cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = Object.values(CACHE_KEYS);
      let totalSize = 0;

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  /**
   * Get all cache keys with their metadata
   */
  async getAllCacheInfo(): Promise<Record<string, CacheMetadata | null>> {
    try {
      const keys = Object.values(CACHE_KEYS);
      const cacheInfo: Record<string, CacheMetadata | null> = {};

      for (const key of keys) {
        cacheInfo[key] = await this.getMetadata(key);
      }

      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {};
    }
  }

  /**
   * Batch set multiple cache entries
   */
  async setMultiple(
    entries: Array<{ key: string; data: any; expiration?: number }>
  ): Promise<void> {
    try {
      const promises = entries.map(({ key, data, expiration }) =>
        this.set(key, data, expiration)
      );
      await Promise.all(promises);
      console.log(`Batch cache set: ${entries.length} entries`);
    } catch (error) {
      console.error('Error setting multiple cache entries:', error);
      throw error;
    }
  }

  /**
   * Batch get multiple cache entries
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const results: Record<string, T | null> = {};
      const promises = keys.map(async (key) => {
        results[key] = await this.get<T>(key);
      });
      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error getting multiple cache entries:', error);
      return {};
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Helper functions for common operations
export const cacheHelpers = {
  /**
   * Cache data with automatic key generation
   */
  cacheData: async <T>(
    type: keyof typeof CACHE_KEYS,
    data: T,
    expiration?: number
  ): Promise<void> => {
    const key = CACHE_KEYS[type];
    await cacheManager.set(key, data, expiration);
  },

  /**
   * Get cached data by type
   */
  getCachedData: async <T>(type: keyof typeof CACHE_KEYS): Promise<T | null> => {
    const key = CACHE_KEYS[type];
    return await cacheManager.get<T>(key);
  },

  /**
   * Invalidate cache by type
   */
  invalidateCache: async (type: keyof typeof CACHE_KEYS): Promise<void> => {
    const key = CACHE_KEYS[type];
    await cacheManager.remove(key);
  },

  /**
   * Refresh cache with new data
   */
  refreshCache: async <T>(
    type: keyof typeof CACHE_KEYS,
    data: T,
    expiration?: number
  ): Promise<void> => {
    const key = CACHE_KEYS[type];
    await cacheManager.remove(key);
    await cacheManager.set(key, data, expiration);
  },
};
