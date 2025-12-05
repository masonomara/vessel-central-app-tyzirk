
import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RealtimeEventType = 
  | 'maintenance_updated'
  | 'issue_created'
  | 'issue_updated'
  | 'supply_approved'
  | 'supply_denied'
  | 'document_uploaded'
  | 'notification_received'
  | 'vessel_status_changed'
  | 'task_assigned'
  | 'task_completed';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  timestamp: Date;
  userId?: string;
  vesselId?: string;
  data: any;
  read: boolean;
}

class RealtimeManager extends EventEmitter {
  private events: RealtimeEvent[] = [];
  private subscribers: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;

  constructor() {
    super();
    this.loadEvents();
  }

  private async loadEvents() {
    try {
      const stored = await AsyncStorage.getItem('@realtime_events');
      if (stored) {
        this.events = JSON.parse(stored).map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading realtime events:', error);
    }
  }

  private async saveEvents() {
    try {
      await AsyncStorage.setItem('@realtime_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving realtime events:', error);
    }
  }

  public async publishEvent(type: RealtimeEventType, data: any, userId?: string, vesselId?: string) {
    const event: RealtimeEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date(),
      userId,
      vesselId,
      data,
      read: false,
    };

    this.events.unshift(event);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    await this.saveEvents();

    // Notify all subscribers
    this.emit('event', event);
    
    // Notify type-specific subscribers
    const typeSubscribers = this.subscribers.get(type);
    if (typeSubscribers) {
      typeSubscribers.forEach(callback => callback(event));
    }

    console.log('Realtime event published:', type, data);
  }

  public subscribe(
    eventType: RealtimeEventType | 'all',
    callback: (event: RealtimeEvent) => void
  ): () => void {
    if (eventType === 'all') {
      this.on('event', callback);
      return () => this.off('event', callback);
    }

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    return () => {
      const subs = this.subscribers.get(eventType);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  public getRecentEvents(limit: number = 20, userId?: string): RealtimeEvent[] {
    let filtered = this.events;
    
    if (userId) {
      filtered = filtered.filter(e => !e.userId || e.userId === userId);
    }

    return filtered.slice(0, limit);
  }

  public markEventAsRead(eventId: string) {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.read = true;
      this.saveEvents();
    }
  }

  public markAllAsRead(userId?: string) {
    this.events.forEach(event => {
      if (!userId || event.userId === userId) {
        event.read = true;
      }
    });
    this.saveEvents();
  }

  public getUnreadCount(userId?: string): number {
    return this.events.filter(e => 
      !e.read && (!userId || !e.userId || e.userId === userId)
    ).length;
  }

  public startPolling(intervalMs: number = 5000) {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.pollInterval = setInterval(() => {
      this.emit('poll');
    }, intervalMs);

    console.log('Realtime polling started');
  }

  public stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
    console.log('Realtime polling stopped');
  }

  public clearEvents() {
    this.events = [];
    this.saveEvents();
  }
}

export const realtimeManager = new RealtimeManager();
