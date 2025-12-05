
import { useState, useEffect, useCallback } from 'react';
import { notificationPreferencesManager } from '@/utils/notificationPreferences';
import { NotificationPreferences, NotificationCategory } from '@/types/notifications';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationPreferencesManager.getPreferences()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await notificationPreferencesManager.initialize();
      setPreferences(notificationPreferencesManager.getPreferences());
      setLoading(false);
    };

    initialize();

    const unsubscribe = notificationPreferencesManager.subscribe((prefs) => {
      setPreferences(prefs);
    });

    return unsubscribe;
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    await notificationPreferencesManager.updatePreferences(updates);
  }, []);

  const toggleCategory = useCallback(async (category: NotificationCategory, enabled: boolean) => {
    await notificationPreferencesManager.toggleCategory(category, enabled);
  }, []);

  const togglePushForCategory = useCallback(async (category: NotificationCategory, enabled: boolean) => {
    await notificationPreferencesManager.togglePushForCategory(category, enabled);
  }, []);

  const toggleInAppForCategory = useCallback(async (category: NotificationCategory, enabled: boolean) => {
    await notificationPreferencesManager.toggleInAppForCategory(category, enabled);
  }, []);

  const setQuietHours = useCallback(async (enabled: boolean, startTime?: string, endTime?: string) => {
    await notificationPreferencesManager.setQuietHours(enabled, startTime, endTime);
  }, []);

  const setFrequency = useCallback(async (frequency: NotificationPreferences['frequency']) => {
    await notificationPreferencesManager.setFrequency(frequency);
  }, []);

  const resetToDefaults = useCallback(async () => {
    await notificationPreferencesManager.resetToDefaults();
  }, []);

  return {
    preferences,
    loading,
    updatePreferences,
    toggleCategory,
    togglePushForCategory,
    toggleInAppForCategory,
    setQuietHours,
    setFrequency,
    resetToDefaults,
  };
}
