
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES, NotificationCategory } from '@/types/notifications';

const PREFERENCES_KEY = '@notification_preferences';

class NotificationPreferencesManager {
  private preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
  private listeners: Set<(prefs: NotificationPreferences) => void> = new Set();

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        this.preferences = JSON.parse(stored);
        console.log('Notification preferences loaded');
      } else {
        await this.savePreferences();
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.preferences));
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
  }

  async updateCategoryPreferences(
    category: NotificationCategory,
    updates: Partial<NotificationPreferences['categories'][NotificationCategory]>
  ): Promise<void> {
    this.preferences.categories[category] = {
      ...this.preferences.categories[category],
      ...updates,
    };
    await this.savePreferences();
  }

  async toggleCategory(category: NotificationCategory, enabled: boolean): Promise<void> {
    this.preferences.categories[category].enabled = enabled;
    await this.savePreferences();
  }

  async togglePushForCategory(category: NotificationCategory, enabled: boolean): Promise<void> {
    this.preferences.categories[category].pushEnabled = enabled;
    await this.savePreferences();
  }

  async toggleInAppForCategory(category: NotificationCategory, enabled: boolean): Promise<void> {
    this.preferences.categories[category].inAppEnabled = enabled;
    await this.savePreferences();
  }

  async setQuietHours(enabled: boolean, startTime?: string, endTime?: string): Promise<void> {
    this.preferences.quietHours = {
      enabled,
      startTime: startTime || this.preferences.quietHours.startTime,
      endTime: endTime || this.preferences.quietHours.endTime,
    };
    await this.savePreferences();
  }

  async setFrequency(frequency: NotificationPreferences['frequency']): Promise<void> {
    this.preferences.frequency = frequency;
    await this.savePreferences();
  }

  isCategoryEnabled(category: NotificationCategory): boolean {
    return this.preferences.enabled && this.preferences.categories[category].enabled;
  }

  shouldShowPushNotification(category: NotificationCategory): boolean {
    if (!this.isCategoryEnabled(category)) {
      return false;
    }

    if (!this.preferences.categories[category].pushEnabled) {
      return false;
    }

    if (this.preferences.quietHours.enabled && this.isInQuietHours()) {
      return false;
    }

    return true;
  }

  shouldShowInAppNotification(category: NotificationCategory): boolean {
    return this.isCategoryEnabled(category) && this.preferences.categories[category].inAppEnabled;
  }

  shouldPlaySound(category: NotificationCategory): boolean {
    if (this.preferences.quietHours.enabled && this.isInQuietHours()) {
      return false;
    }
    return this.preferences.categories[category].sound;
  }

  shouldVibrate(category: NotificationCategory): boolean {
    if (this.preferences.quietHours.enabled && this.isInQuietHours()) {
      return false;
    }
    return this.preferences.categories[category].vibration;
  }

  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { startTime, endTime } = this.preferences.quietHours;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  subscribe(listener: (prefs: NotificationPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async resetToDefaults(): Promise<void> {
    this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
    await this.savePreferences();
  }
}

export const notificationPreferencesManager = new NotificationPreferencesManager();
