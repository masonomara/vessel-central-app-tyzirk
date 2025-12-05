
import { useState, useEffect, useCallback } from 'react';
import { realtimeManager, RealtimeEvent, RealtimeEventType } from '@/utils/realtimeManager';

interface UseRealtimeOptions {
  eventType?: RealtimeEventType | 'all';
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRealtime({
  eventType = 'all',
  userId,
  autoRefresh = true,
  refreshInterval = 5000,
}: UseRealtimeOptions = {}) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshEvents = useCallback(() => {
    const recentEvents = realtimeManager.getRecentEvents(20, userId);
    setEvents(recentEvents);
    setUnreadCount(realtimeManager.getUnreadCount(userId));
  }, [userId]);

  useEffect(() => {
    refreshEvents();

    const unsubscribe = realtimeManager.subscribe(eventType, (event) => {
      if (!userId || !event.userId || event.userId === userId) {
        refreshEvents();
      }
    });

    if (autoRefresh) {
      realtimeManager.startPolling(refreshInterval);
    }

    return () => {
      unsubscribe();
      if (autoRefresh) {
        realtimeManager.stopPolling();
      }
    };
  }, [eventType, userId, autoRefresh, refreshInterval, refreshEvents]);

  const markAsRead = useCallback((eventId: string) => {
    realtimeManager.markEventAsRead(eventId);
    refreshEvents();
  }, [refreshEvents]);

  const markAllAsRead = useCallback(() => {
    realtimeManager.markAllAsRead(userId);
    refreshEvents();
  }, [userId, refreshEvents]);

  return {
    events,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: refreshEvents,
  };
}
