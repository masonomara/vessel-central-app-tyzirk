
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type NotificationCategory =
  | 'maintenance'
  | 'issues'
  | 'supplies'
  | 'documents'
  | 'tasks'
  | 'approvals'
  | 'system';

interface CategoryPreferences {
  enabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  sound: boolean;
  vibration: boolean;
}

interface NotificationPreferences {
  enabled: boolean;
  categories: Record<NotificationCategory, CategoryPreferences>;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'realtime' | 'hourly' | 'daily';
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  categories: {
    maintenance: { enabled: true, pushEnabled: true, inAppEnabled: true, sound: true, vibration: true },
    issues: { enabled: true, pushEnabled: true, inAppEnabled: true, sound: true, vibration: true },
    supplies: { enabled: true, pushEnabled: true, inAppEnabled: true, sound: true, vibration: false },
    documents: { enabled: true, pushEnabled: false, inAppEnabled: true, sound: false, vibration: false },
    tasks: { enabled: true, pushEnabled: true, inAppEnabled: true, sound: true, vibration: true },
    approvals: { enabled: true, pushEnabled: true, inAppEnabled: true, sound: true, vibration: true },
    system: { enabled: true, pushEnabled: false, inAppEnabled: true, sound: false, vibration: false },
  },
  quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' },
  frequency: 'realtime',
};

const CATEGORY_INFO: Record<NotificationCategory, { title: string; description: string; icon: string }> = {
  maintenance: {
    title: 'Maintenance',
    description: 'Scheduled maintenance tasks and reminders',
    icon: 'wrench.fill',
  },
  issues: {
    title: 'Issues',
    description: 'New issues and status updates',
    icon: 'exclamationmark.triangle.fill',
  },
  supplies: {
    title: 'Supplies',
    description: 'Supply requests and inventory updates',
    icon: 'shippingbox.fill',
  },
  documents: {
    title: 'Documents',
    description: 'New documents and file uploads',
    icon: 'doc.fill',
  },
  tasks: {
    title: 'Tasks',
    description: 'Task assignments and completions',
    icon: 'checkmark.circle.fill',
  },
  approvals: {
    title: 'Approvals',
    description: 'Approval requests and decisions',
    icon: 'hand.thumbsup.fill',
  },
  system: {
    title: 'System',
    description: 'System updates and announcements',
    icon: 'bell.fill',
  },
};

const CATEGORIES = Object.keys(CATEGORY_INFO) as NotificationCategory[];

export default function NotificationSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleCategory = useCallback((category: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], enabled },
      },
    }));
  }, []);

  const togglePushForCategory = useCallback((category: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], pushEnabled: enabled },
      },
    }));
  }, []);

  const toggleInAppForCategory = useCallback((category: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], inAppEnabled: enabled },
      },
    }));
  }, []);

  const updateCategoryField = useCallback((category: NotificationCategory, field: keyof CategoryPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], [field]: value },
      },
    }));
  }, []);

  const setQuietHoursEnabled = useCallback((enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, enabled },
    }));
  }, []);

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPreferences(prev => ({
        ...prev,
        quietHours: { ...prev.quietHours, startTime: formatTime(selectedDate) },
      }));
    }
  };

  const handleEndTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPreferences(prev => ({
        ...prev,
        quietHours: { ...prev.quietHours, endTime: formatTime(selectedDate) },
      }));
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setPreferences(DEFAULT_PREFERENCES),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notification Settings' }} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.masterToggle}>
            <View style={styles.masterToggleContent}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={24}
                color={preferences.enabled ? colors.primary : colors.textSecondary}
              />
              <View style={styles.masterToggleText}>
                <Text style={styles.sectionTitle}>All Notifications</Text>
                <Text style={styles.sectionDescription}>
                  {preferences.enabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.enabled}
              onValueChange={(value) => updatePreferences({ enabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Frequency</Text>
          <View style={styles.frequencyContainer}>
            {(['realtime', 'hourly', 'daily'] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  preferences.frequency === freq && styles.frequencyButtonActive,
                ]}
                onPress={() => updatePreferences({ frequency: freq })}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    preferences.frequency === freq && styles.frequencyButtonTextActive,
                  ]}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Quiet Hours</Text>
              <Text style={styles.settingDescription}>
                Mute notifications during specific hours
              </Text>
            </View>
            <Switch
              value={preferences.quietHours.enabled}
              onValueChange={setQuietHoursEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {preferences.quietHours.enabled && (
            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeLabel}>Start Time</Text>
                <Text style={styles.timeValue}>{preferences.quietHours.startTime}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeLabel}>End Time</Text>
                <Text style={styles.timeValue}>{preferences.quietHours.endTime}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showStartTimePicker && (
            <DateTimePicker
              value={parseTime(preferences.quietHours.startTime)}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleStartTimeChange}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={parseTime(preferences.quietHours.endTime)}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Categories</Text>
          <Text style={styles.sectionDescription}>
            Customize notifications for each category
          </Text>

          {CATEGORIES.map((category) => {
            const info = CATEGORY_INFO[category];
            const categoryPrefs = preferences.categories[category];

            return (
              <View key={category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryHeaderLeft}>
                    <IconSymbol
                      ios_icon_name={info.icon}
                      android_material_icon_name="notifications"
                      size={24}
                      color={categoryPrefs.enabled ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryTitle}>{info.title}</Text>
                      <Text style={styles.categoryDescription}>{info.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={categoryPrefs.enabled}
                    onValueChange={(value) => toggleCategory(category, value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.card}
                  />
                </View>

                {categoryPrefs.enabled && (
                  <View style={styles.categoryOptions}>
                    <View style={styles.categoryOption}>
                      <Text style={styles.categoryOptionText}>Push Notifications</Text>
                      <Switch
                        value={categoryPrefs.pushEnabled}
                        onValueChange={(value) => togglePushForCategory(category, value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.card}
                      />
                    </View>

                    <View style={styles.categoryOption}>
                      <Text style={styles.categoryOptionText}>In-App Notifications</Text>
                      <Switch
                        value={categoryPrefs.inAppEnabled}
                        onValueChange={(value) => toggleInAppForCategory(category, value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.card}
                      />
                    </View>

                    <View style={styles.categoryOption}>
                      <Text style={styles.categoryOptionText}>Sound</Text>
                      <Switch
                        value={categoryPrefs.sound}
                        onValueChange={(value) => updateCategoryField(category, 'sound', value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.card}
                      />
                    </View>

                    <View style={styles.categoryOption}>
                      <Text style={styles.categoryOptionText}>Vibration</Text>
                      <Switch
                        value={categoryPrefs.vibration}
                        onValueChange={(value) => updateCategoryField(category, 'vibration', value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.card}
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  masterToggle: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterToggleText: {
    marginLeft: 12,
    flex: 1,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  frequencyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  frequencyButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  settingRow: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryOptions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.danger + '20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
