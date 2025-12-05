
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = '@vessel_co_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'issue' | 'supply' | 'maintenance' | 'approval' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private pushToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing notification service...');
      
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
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        
        await Notifications.setNotificationChannelAsync('high-priority', {
          name: 'High Priority',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
        });
      }
      
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });
      
      this.pushToken = tokenData.data;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.pushToken);
      console.log('Push token:', this.pushToken);
      
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
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
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
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
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: delaySeconds,
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
      title: 'New Issue Reported',
      body: `${issueTitle} on ${vesselName}`,
      data: { type: 'issue', issueTitle, vesselName },
    });
  }

  async sendSupplyRequestNotification(itemName: string, vesselName: string): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'supply',
      title: 'New Supply Request',
      body: `${itemName} requested for ${vesselName}`,
      data: { type: 'supply', itemName, vesselName },
    });
  }

  async sendApprovalNotification(itemName: string, approved: boolean): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'approval',
      title: approved ? 'Request Approved' : 'Request Denied',
      body: `Your request for ${itemName} has been ${approved ? 'approved' : 'denied'}`,
      data: { type: 'approval', itemName, approved },
    });
  }

  async sendMaintenanceReminderNotification(taskTitle: string, daysUntilDue: number): Promise<void> {
    await this.scheduleLocalNotification({
      type: 'maintenance',
      title: 'Maintenance Reminder',
      body: `${taskTitle} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
      data: { type: 'maintenance', taskTitle, daysUntilDue },
    });
  }
}

export const notificationService = new NotificationService();
