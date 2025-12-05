
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationPreferencesManager } from './notificationPreferences';
import { NotificationCategory } from '@/types/notifications';

const PUSH_TOKEN_KEY = '@vessel_co_push_token';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const category = notification.request.content.data?.category as NotificationCategory;
    
    if (category) {
      const shouldShow = notificationPreferencesManager.shouldShowInAppNotification(category);
      const shouldPlaySound = notificationPreferencesManager.shouldPlaySound(category);
      
      return {
        shouldShowAlert: shouldShow,
        shouldPlaySound: shouldPlaySound,
        shouldSetBadge: true,
      };
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export interface NotificationData {
  type: 'issue' | 'supply' | 'maintenance' | 'approval' | 'system' | 'task' | 'document';
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private pushToken: string | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('Initializing notification service...');
      
      await notificationPreferencesManager.initialize();
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }
      
      console.log('Notification permissions granted');
      
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }
      
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id',
        });
        
        this.pushToken = tokenData.data;
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.pushToken);
        console.log('Push token:', this.pushToken);
      } catch (error) {
        console.log('Could not get push token (this is normal in development):', error);
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    const channels: Array<{
      id: string;
      name: string;
      importance: Notifications.AndroidImportance;
      sound?: string;
      vibrationPattern?: number[];
    }> = [
      {
        id: 'maintenance',
        name: 'Maintenance',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      },
      {
        id: 'issues',
        name: 'Issues',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      },
      {
        id: 'supplies',
        name: 'Supplies',
        importance: Notifications.AndroidImportance.DEFAULT,
      },
      {
        id: 'documents',
        name: 'Documents',
        importance: Notifications.AndroidImportance.LOW,
      },
      {
        id: 'tasks',
        name: 'Tasks',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      },
      {
        id: 'approvals',
        name: 'Approvals',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      },
      {
        id: 'system',
        name: 'System',
        importance: Notifications.AndroidImportance.LOW,
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        vibrationPattern: channel.vibrationPattern,
        lightColor: '#FF231F7C',
      });
    }
  }

  async getPushToken(): Promise<string | null> {
    if (this.pushToken) {
      return this.pushToken;
    }
    
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (storedToken) {
        this.pushToken = storedToken;
        return storedToken;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }
    
    return null;
  }

  async scheduleLocalNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (!notificationPreferencesManager.shouldShowPushNotification(notification.category)) {
        console.log('Notification suppressed by user preferences:', notification.category);
        return null;
      }

      const shouldPlaySound = notificationPreferencesManager.shouldPlaySound(notification.category);
      const shouldVibrate = notificationPreferencesManager.shouldVibrate(notification.category);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { ...notification.data, category: notification.category },
          sound: shouldPlaySound,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: shouldVibrate ? [0, 250, 250, 250] : undefined,
        },
        trigger: null,
      });
      
      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleDelayedNotification(
    notification: NotificationData,
    delaySeconds: number
  ): Promise<string | null> {
    try {
      if (!notificationPreferencesManager.shouldShowPushNotification(notification.category)) {
        console.log('Delayed notification suppressed by user preferences:', notification.category);
        return null;
      }

      const shouldPlaySound = notificationPreferencesManager.shouldPlaySound(notification.category);
      const shouldVibrate = notificationPreferencesManager.shouldVibrate(notification.category);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { ...notification.data, category: notification.category },
          sound: shouldPlaySound,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: shouldVibrate ? [0, 250, 250, 250] : undefined,
        },
        trigger: {
          seconds: delaySeconds,
          channelId: notification.category,
        },
      });
      
      console.log('Delayed notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling delayed notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('Badge count set to:', count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('Badge cleared');
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  async sendIssueNotification(issueTitle: string, vesselName: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'issue',
      category: 'issues',
      title: 'New Issue Reported',
      body: `${issueTitle} on ${vesselName}`,
      data: { type: 'issue', issueTitle, vesselName },
    });
  }

  async sendSupplyRequestNotification(itemName: string, vesselName: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'supply',
      category: 'supplies',
      title: 'New Supply Request',
      body: `${itemName} requested for ${vesselName}`,
      data: { type: 'supply', itemName, vesselName },
    });
  }

  async sendApprovalNotification(itemName: string, approved: boolean): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'approval',
      category: 'approvals',
      title: approved ? 'Request Approved' : 'Request Denied',
      body: `Your request for ${itemName} has been ${approved ? 'approved' : 'denied'}`,
      data: { type: 'approval', itemName, approved },
    });
  }

  async sendMaintenanceReminderNotification(taskTitle: string, daysUntilDue: number): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'maintenance',
      category: 'maintenance',
      title: 'Maintenance Reminder',
      body: `${taskTitle} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
      data: { type: 'maintenance', taskTitle, daysUntilDue },
    });
  }

  async sendTaskNotification(taskTitle: string, assignedTo: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'task',
      category: 'tasks',
      title: 'New Task Assigned',
      body: `${taskTitle} assigned to ${assignedTo}`,
      data: { type: 'task', taskTitle, assignedTo },
    });
  }

  async sendDocumentNotification(documentName: string, uploadedBy: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'document',
      category: 'documents',
      title: 'New Document Uploaded',
      body: `${documentName} uploaded by ${uploadedBy}`,
      data: { type: 'document', documentName, uploadedBy },
    });
  }

  async sendSystemNotification(title: string, body: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'system',
      category: 'system',
      title,
      body,
      data: { type: 'system' },
    });
  }
}

export const notificationService = new NotificationService();
