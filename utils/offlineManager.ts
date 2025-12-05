
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { cacheManager, CACHE_KEYS } from './cacheManager';

const OFFLINE_QUEUE_KEY = '@offline_queue';
const NETWORK_STATUS_KEY = '@network_status';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lastRetryAt?: number;
  error?: string;
}

export interface QueueStatus {
  totalActions: number;
  pendingActions: number;
  failedActions: number;
  isOnline: boolean;
  isSyncing: boolean;
}

/**
 * Enhanced Offline Manager with exponential backoff and better retry logic
 */
class OfflineManager {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private networkCheckInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: QueueStatus) => void> = [];

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
      console.log(`[OfflineManager] Initial network status: ${this.isOnline ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error('[OfflineManager] Error getting initial network status:', error);
      this.isOnline = true; // Assume online if we can't check
    }

    // Poll network status every 10 seconds
    this.networkCheckInterval = setInterval(async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const wasOnline = this.isOnline;
        this.isOnline = networkState.isConnected ?? true;
        
        if (wasOnline !== this.isOnline) {
          await this.saveNetworkStatus(this.isOnline);
          console.log(`[OfflineManager] Network status changed: ${this.isOnline ? 'Online' : 'Offline'}`);

          // Notify listeners
          this.notifyListeners();

          // If we just came back online, sync offline queue
          if (!wasOnline && this.isOnline) {
            console.log('[OfflineManager] Back online, syncing offline queue...');
            this.syncOfflineQueue();
          }
        }
      } catch (error) {
        console.error('[OfflineManager] Error checking network status:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Subscribe to queue status changes
   */
  subscribe(listener: (status: QueueStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current status
    this.getQueueStatus().then(status => listener(status));
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private async notifyListeners() {
    const status = await this.getQueueStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('[OfflineManager] Error notifying listener:', error);
      }
    });
  }

  /**
   * Save network status to AsyncStorage
   */
  private async saveNetworkStatus(isOnline: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NETWORK_STATUS_KEY, JSON.stringify(isOnline));
    } catch (error) {
      console.error('[OfflineManager] Error saving network status:', error);
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
      console.error('[OfflineManager] Error getting network status:', error);
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
      console.log('[OfflineManager] Action added to offline queue:', newAction.type, newAction.entity);
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineManager] Error adding to offline queue:', error);
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
      console.error('[OfflineManager] Error getting offline queue:', error);
      return [];
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<QueueStatus> {
    const queue = await this.getOfflineQueue();
    const failedActions = queue.filter(a => a.retryCount >= MAX_RETRIES).length;
    
    return {
      totalActions: queue.length,
      pendingActions: queue.length - failedActions,
      failedActions,
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
    };
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log('[OfflineManager] Offline queue cleared');
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineManager] Error clearing offline queue:', error);
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
      console.log('[OfflineManager] Action removed from offline queue:', actionId);
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineManager] Error removing from offline queue:', error);
      throw error;
    }
  }

  /**
   * Update action in queue
   */
  private async updateActionInQueue(actionId: string, updates: Partial<OfflineAction>): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.map(action =>
        action.id === actionId ? { ...action, ...updates } : action
      );
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('[OfflineManager] Error updating action in queue:', error);
      throw error;
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  }

  /**
   * Check if action should be retried
   */
  private shouldRetryAction(action: OfflineAction): boolean {
    if (action.retryCount >= MAX_RETRIES) {
      return false;
    }

    if (!action.lastRetryAt) {
      return true;
    }

    const delay = this.calculateRetryDelay(action.retryCount);
    const timeSinceLastRetry = Date.now() - action.lastRetryAt;
    
    return timeSinceLastRetry >= delay;
  }

  /**
   * Sync offline queue when back online with exponential backoff
   */
  async syncOfflineQueue(): Promise<void> {
    if (this.syncInProgress) {
      console.log('[OfflineManager] Sync already in progress, skipping...');
      return;
    }

    if (!this.isOnline) {
      console.log('[OfflineManager] Device is offline, cannot sync');
      return;
    }

    try {
      this.syncInProgress = true;
      this.notifyListeners();
      
      const queue = await this.getOfflineQueue();

      if (queue.length === 0) {
        console.log('[OfflineManager] Offline queue is empty');
        return;
      }

      console.log(`[OfflineManager] Syncing ${queue.length} offline actions...`);

      let successCount = 0;
      let failureCount = 0;

      for (const action of queue) {
        // Check if action should be retried
        if (!this.shouldRetryAction(action)) {
          if (action.retryCount >= MAX_RETRIES) {
            console.log(`[OfflineManager] Action ${action.id} exceeded max retries, marking as failed`);
            failureCount++;
          } else {
            console.log(`[OfflineManager] Action ${action.id} waiting for retry delay`);
          }
          continue;
        }

        try {
          console.log(`[OfflineManager] Processing action ${action.id} (attempt ${action.retryCount + 1}/${MAX_RETRIES})`);
          
          // Process action based on type
          await this.processOfflineAction(action);
          
          // Remove from queue on success
          await this.removeFromQueue(action.id);
          successCount++;
          console.log(`[OfflineManager] Action ${action.id} synced successfully`);
        } catch (error) {
          console.error(`[OfflineManager] Error syncing action ${action.id}:`, error);
          
          // Update retry count and last retry time
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await this.updateActionInQueue(action.id, {
            retryCount: action.retryCount + 1,
            lastRetryAt: Date.now(),
            error: errorMessage,
          });
          
          failureCount++;
          
          // If max retries reached, log it but keep in queue for manual review
          if (action.retryCount + 1 >= MAX_RETRIES) {
            console.error(`[OfflineManager] Action ${action.id} failed after ${MAX_RETRIES} attempts`);
          }
        }
      }

      console.log(`[OfflineManager] Sync completed: ${successCount} succeeded, ${failureCount} failed`);
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineManager] Error syncing offline queue:', error);
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Manually retry a specific action
   */
  async retryAction(actionId: string): Promise<boolean> {
    try {
      const queue = await this.getOfflineQueue();
      const action = queue.find(a => a.id === actionId);
      
      if (!action) {
        console.error('[OfflineManager] Action not found:', actionId);
        return false;
      }

      console.log(`[OfflineManager] Manually retrying action ${actionId}`);
      
      await this.processOfflineAction(action);
      await this.removeFromQueue(actionId);
      
      console.log(`[OfflineManager] Action ${actionId} retried successfully`);
      return true;
    } catch (error) {
      console.error(`[OfflineManager] Error retrying action ${actionId}:`, error);
      
      // Update error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateActionInQueue(actionId, {
        retryCount: (await this.getOfflineQueue()).find(a => a.id === actionId)!.retryCount + 1,
        lastRetryAt: Date.now(),
        error: errorMessage,
      });
      
      return false;
    }
  }

  /**
   * Clear failed actions from queue
   */
  async clearFailedActions(): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const activeQueue = queue.filter(action => action.retryCount < MAX_RETRIES);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(activeQueue));
      
      console.log('[OfflineManager] Failed actions cleared from queue');
      this.notifyListeners();
    } catch (error) {
      console.error('[OfflineManager] Error clearing failed actions:', error);
      throw error;
    }
  }

  /**
   * Process individual offline action
   */
  private async processOfflineAction(action: OfflineAction): Promise<void> {
    console.log('[OfflineManager] Processing offline action:', action.type, action.entity);
    
    // TODO: Implement actual API calls here
    // For now, just simulate processing with potential failure
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 80% success rate
        if (Math.random() > 0.2) {
          resolve(true);
        } else {
          reject(new Error('Simulated network error'));
        }
      }, 500);
    });
    
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

  /**
   * Cleanup on unmount
   */
  destroy() {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();
