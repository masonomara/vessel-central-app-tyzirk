
export type NotificationCategory = 
  | 'maintenance'
  | 'issues'
  | 'supplies'
  | 'documents'
  | 'tasks'
  | 'approvals'
  | 'system';

export interface NotificationPreferences {
  enabled: boolean;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      pushEnabled: boolean;
      inAppEnabled: boolean;
      sound: boolean;
      vibration: boolean;
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  frequency: 'realtime' | 'hourly' | 'daily';
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  categories: {
    maintenance: {
      enabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      sound: true,
      vibration: true,
    },
    issues: {
      enabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      sound: true,
      vibration: true,
    },
    supplies: {
      enabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      sound: true,
      vibration: false,
    },
    documents: {
      enabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      sound: false,
      vibration: false,
    },
    tasks: {
      enabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      sound: true,
      vibration: true,
    },
    approvals: {
      enabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      sound: true,
      vibration: true,
    },
    system: {
      enabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      sound: false,
      vibration: false,
    },
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  frequency: 'realtime',
};
