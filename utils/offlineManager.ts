
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { cacheManager, CACHE_KEYS } from './cacheManager';

const OFFLINE_QUEUE_KEY = '@offline_queue';
const NETWORK_STATUS_KEY = '@network_status';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

/**
 * Offline Manager
 * Handles offline data synchronization and queue management
 */
class OfflineManager {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor() {
    this.initializeNetworkListener();
  }

  /**
   * Initialize network status listener
   */
  private async initializeNetworkListener() {
    // Get initial network status
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected ?? true;
      await this.saveNetworkStatus(this.isOnline);
      console.log(`Initial network status: ${this.isOnline ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error('Error getting initial network status:', error);
      this.isOnline = true; // Assume online if we can't check
    }

    // Poll network status every 10 seconds
    // Note: expo-network doesn't have a listener, so we poll
    setInterval(async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const wasOnline = this.isOnline;
        this.isOnline = networkState.isConnected ?? true;
        
        if (wasOnline !== this.isOnline) {
          await this.saveNetworkStatus(this.isOnline);
          console.log(`Network status changed: ${this.isOnline ? 'Online' : 'Offline'}`);

          // If we just came back online, sync offline queue
          if (!wasOnline && this.isOnline) {
            console.log('Back online, syncing offline queue...');
            this.syncOfflineQueue();
          }
        }
      } catch (error) {
        console.error('Error checking network status:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Save network status to AsyncStorage
   */
  private async saveNetworkStatus(isOnline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NETWORK_STATUS_KEY, JSON.stringify(isOnline));
    } catch (error) {
      console.error('Error saving network status:', error);
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(NETWORK_STATUS_KEY);
      return status ? JSON.parse(status) : true;
    } catch (error) {
      console.error('Error getting network status:', error);
      return true;
    }
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add action to offline queue
   */
  async addToOfflineQueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const newAction: OfflineAction = {
        ...action,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(newAction);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('Action added to offline queue:', newAction.type, newAction.entity);
    } catch (error) {
      console.error('Error adding to offline queue:', error);
      throw error;
    }
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue(): Promise<OfflineAction[]> {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log('Offline queue cleared');
    } catch (error) {
      console.error('Error clearing offline queue:', error);
      throw error;
    }
  }

  /**
   * Remove specific action from queue
   */
  async removeFromQueue(actionId: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.filter((action) => action.id !== actionId);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
      console.log('Action removed from offline queue:', actionId);
    } catch (error) {
      console.error('Error removing from offline queue:', error);
      throw error;
    }
  }

  /**
   * Sync offline queue when back online
   */
  async syncOfflineQueue(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    if (!this.isOnline) {
      console.log('Device is offline, cannot sync');
      return;
    }

    try {
      this.syncInProgress = true;
      const queue = await this.getOfflineQueue();

      if (queue.length === 0) {
        console.log('Offline queue is empty');
        return;
      }

      console.log(`Syncing ${queue.length} offline actions...`);

      for (const action of queue) {
        try {
          // Process action based on type
          await this.processOfflineAction(action);
          
          // Remove from queue on success
          await this.removeFromQueue(action.id);
          console.log('Action synced successfully:', action.id);
        } catch (error) {
          console.error('Error syncing action:', action.id, error);
          
          // Increment retry count
          action.retryCount++;
          
          // If max retries reached, remove from queue
          if (action.retryCount >= 3) {
            console.log('Max retries reached, removing action:', action.id);
            await this.removeFromQueue(action.id);
          }
        }
      }

      console.log('Offline queue sync completed');
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual offline action
   */
  private async processOfflineAction(action: OfflineAction): Promise<void> {
    console.log('Processing offline action:', action.type, action.entity);
    
    // TODO: Implement actual API calls here
    // For now, just simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Invalidate cache for the entity
    const cacheKey = this.getCacheKeyForEntity(action.entity);
    if (cacheKey) {
      await cacheManager.remove(cacheKey);
    }
  }

  /**
   * Get cache key for entity type
   */
  private getCacheKeyForEntity(entity: string): string | null {
    const entityToCacheKey: Record<string, string> = {
      vessel: CACHE_KEYS.VESSELS,
      maintenance: CACHE_KEYS.MAINTENANCE_TASKS,
      issue: CACHE_KEYS.ISSUES,
      supply: CACHE_KEYS.SUPPLY_REQUESTS,
      document: CACHE_KEYS.DOCUMENTS,
      expense: CACHE_KEYS.EXPENSES,
    };

    return entityToCacheKey[entity] || null;
  }

  /**
   * Get offline queue size
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getOfflineQueue();
    return queue.length;
  }

  /**
   * Check if there are pending offline actions
   */
  async hasPendingActions(): Promise<boolean> {
    const size = await this.getQueueSize();
    return size > 0;
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();
