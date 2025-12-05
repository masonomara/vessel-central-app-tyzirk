
import { useEffect, useRef } from 'react';
import { notificationService } from '@/utils/notificationService';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    console.log('Setting up notification listeners...');
    
    notificationService.initialize().then((success) => {
      if (success) {
        console.log('Notifications initialized successfully');
      } else {
        console.log('Failed to initialize notifications');
      }
    });

    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        const data = notification.request.content.data;
        console.log('Notification data:', data);
      }
    );

    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response received:', response);
        const data = response.notification.request.content.data;
        
        if (data.type === 'issue') {
          router.push('/(tabs)/issues');
        } else if (data.type === 'supply') {
          router.push('/(tabs)/supplies');
        } else if (data.type === 'maintenance') {
          router.push('/(tabs)/maintenance');
        } else if (data.type === 'approval') {
          router.push('/(tabs)/supplies');
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    sendIssueNotification: notificationService.sendIssueNotification.bind(notificationService),
    sendSupplyRequestNotification: notificationService.sendSupplyRequestNotification.bind(notificationService),
    sendApprovalNotification: notificationService.sendApprovalNotification.bind(notificationService),
    sendMaintenanceReminderNotification: notificationService.sendMaintenanceReminderNotification.bind(notificationService),
    clearBadge: notificationService.clearBadge.bind(notificationService),
    setBadgeCount: notificationService.setBadgeCount.bind(notificationService),
  };
}
