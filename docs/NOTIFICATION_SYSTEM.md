
# Notification System Documentation

## Overview

The Vessel & Co. app features a comprehensive notification system that combines real-time in-app updates with push notifications. The system is highly customizable, allowing users to control which notifications they receive and how they're delivered.

## Architecture

### Core Components

1. **Notification Service** (`utils/notificationService.ts`)
   - Manages Expo push notifications
   - Handles notification scheduling and delivery
   - Integrates with notification preferences
   - Supports Android notification channels

2. **Realtime Manager** (`utils/realtimeManager.ts`)
   - Manages in-app real-time events
   - Provides event subscription system
   - Stores recent events in AsyncStorage
   - Supports event filtering and read/unread tracking

3. **Notification Preferences Manager** (`utils/notificationPreferences.ts`)
   - Manages user notification preferences
   - Controls notification behavior per category
   - Implements quiet hours functionality
   - Provides notification frequency settings

### Hooks

1. **useNotifications** (`hooks/useNotifications.ts`)
   - Initializes notification service
   - Sets up notification listeners
   - Provides helper methods for sending notifications
   - Handles navigation on notification tap

2. **useRealtime** (`hooks/useRealtime.ts`)
   - Subscribes to real-time events
   - Manages event state
   - Provides mark as read functionality
   - Supports auto-refresh

3. **useNotificationPreferences** (`hooks/useNotificationPreferences.ts`)
   - Manages notification preferences state
   - Provides methods to update preferences
   - Handles preference persistence

## Notification Categories

The system supports 7 notification categories:

1. **Maintenance** - Scheduled maintenance tasks and reminders
2. **Issues** - New issues and status updates
3. **Supplies** - Supply requests and inventory updates
4. **Documents** - New documents and file uploads
5. **Tasks** - Task assignments and completions
6. **Approvals** - Approval requests and decisions
7. **System** - System updates and announcements

Each category can be configured independently with:
- Enable/disable toggle
- Push notification toggle
- In-app notification toggle
- Sound toggle
- Vibration toggle

## Features

### 1. Notification Preferences

Users can customize their notification experience through the Notification Settings screen:

- **Master Toggle**: Enable/disable all notifications
- **Notification Frequency**: Choose between realtime, hourly, or daily updates
- **Quiet Hours**: Set time periods when notifications are muted
- **Category Settings**: Customize each notification category independently

### 2. Push Notifications

- Native push notifications using Expo Notifications
- Android notification channels for better organization
- Custom sounds and vibration patterns
- Badge count management
- Deep linking to relevant screens

### 3. In-App Notifications

- Real-time activity feed
- Unread notification badges
- Mark as read functionality
- Event filtering and sorting
- Pull-to-refresh support

### 4. Quiet Hours

- Automatically mute notifications during specified hours
- Supports overnight quiet hours (e.g., 22:00 to 08:00)
- Respects user's local timezone
- Can be enabled/disabled independently

### 5. Notification Frequency

Three frequency modes:
- **Realtime**: Immediate notifications as events occur
- **Hourly**: Batched notifications sent once per hour
- **Daily**: Daily digest of all notifications

## Usage Examples

### Sending Notifications

```typescript
import { notificationService } from '@/utils/notificationService';

// Send an issue notification
await notificationService.sendIssueNotification(
  'Engine overheating',
  'Serenity'
);

// Send a supply request notification
await notificationService.sendSupplyRequestNotification(
  'Engine oil',
  'Serenity'
);

// Send a maintenance reminder
await notificationService.sendMaintenanceReminderNotification(
  'Oil change',
  3 // days until due
);

// Send a task notification
await notificationService.sendTaskNotification(
  'Clean deck',
  'John Doe'
);

// Send a document notification
await notificationService.sendDocumentNotification(
  'Insurance Policy.pdf',
  'Jane Smith'
);

// Send a system notification
await notificationService.sendSystemNotification(
  'System Maintenance',
  'The app will be under maintenance tonight from 2-4 AM'
);
```

### Publishing Real-time Events

```typescript
import { realtimeManager } from '@/utils/realtimeManager';

// Publish a maintenance update event
await realtimeManager.publishEvent(
  'maintenance_updated',
  {
    taskId: '123',
    taskTitle: 'Oil change',
    status: 'completed',
  },
  userId,
  vesselId
);

// Publish an issue created event
await realtimeManager.publishEvent(
  'issue_created',
  {
    issueId: '456',
    issueTitle: 'Engine overheating',
    priority: 'high',
  },
  userId,
  vesselId
);
```

### Using the Realtime Hook

```typescript
import { useRealtime } from '@/hooks/useRealtime';

function MyComponent() {
  const { events, unreadCount, markAsRead, markAllAsRead } = useRealtime({
    userId: currentUser.id,
    autoRefresh: true,
    refreshInterval: 5000,
  });

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      {events.map(event => (
        <TouchableOpacity
          key={event.id}
          onPress={() => markAsRead(event.id)}
        >
          <Text>{event.type}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### Managing Preferences

```typescript
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

function SettingsComponent() {
  const {
    preferences,
    toggleCategory,
    setQuietHours,
    setFrequency,
  } = useNotificationPreferences();

  return (
    <View>
      <Switch
        value={preferences.categories.maintenance.enabled}
        onValueChange={(value) => toggleCategory('maintenance', value)}
      />
      <Button
        title="Enable Quiet Hours"
        onPress={() => setQuietHours(true, '22:00', '08:00')}
      />
      <Button
        title="Set Hourly Frequency"
        onPress={() => setFrequency('hourly')}
      />
    </View>
  );
}
```

## Android Notification Channels

The system automatically creates Android notification channels for each category:

- **Maintenance**: High importance, vibration enabled
- **Issues**: Max importance, vibration enabled
- **Supplies**: Default importance
- **Documents**: Low importance
- **Tasks**: High importance, vibration enabled
- **Approvals**: High importance, vibration enabled
- **System**: Low importance

## Best Practices

1. **Always check preferences before sending notifications**
   ```typescript
   if (notificationPreferencesManager.shouldShowPushNotification('maintenance')) {
     await notificationService.sendMaintenanceReminderNotification(...);
   }
   ```

2. **Combine push and in-app notifications**
   ```typescript
   // Send push notification
   await notificationService.sendIssueNotification(...);
   
   // Publish real-time event
   await realtimeManager.publishEvent('issue_created', ...);
   ```

3. **Respect quiet hours**
   - The system automatically respects quiet hours
   - No need to check manually when using the notification service

4. **Use appropriate categories**
   - Choose the correct category for each notification
   - This ensures proper filtering and user control

5. **Provide meaningful content**
   - Use clear, concise titles
   - Include relevant details in the body
   - Add data for deep linking

## Troubleshooting

### Notifications not appearing

1. Check notification permissions
2. Verify notification preferences are enabled
3. Check if quiet hours are active
4. Ensure the category is enabled

### Push notifications not working

1. Verify Expo push token is obtained
2. Check Android notification channels are set up
3. Ensure app has notification permissions
4. Test on a physical device (not simulator)

### Real-time events not updating

1. Check if polling is started
2. Verify event subscriptions are active
3. Check AsyncStorage for stored events
4. Ensure events are being published correctly

## Future Enhancements

Potential improvements for the notification system:

1. **Push Notification Server Integration**
   - Connect to a backend server for remote push notifications
   - Implement notification scheduling on the server

2. **Rich Notifications**
   - Add images and media to notifications
   - Support action buttons in notifications

3. **Notification History**
   - Store complete notification history
   - Add search and filter capabilities

4. **Smart Notifications**
   - AI-powered notification prioritization
   - Predictive notification timing

5. **Notification Templates**
   - Pre-defined notification templates
   - Customizable notification formats

6. **Multi-device Sync**
   - Sync notification read status across devices
   - Unified notification management

## Related Files

- `utils/notificationService.ts` - Core notification service
- `utils/realtimeManager.ts` - Real-time event manager
- `utils/notificationPreferences.ts` - Preference management
- `hooks/useNotifications.ts` - Notification hook
- `hooks/useRealtime.ts` - Real-time hook
- `hooks/useNotificationPreferences.ts` - Preferences hook
- `types/notifications.ts` - Notification type definitions
- `app/notification-settings.tsx` - Settings screen
- `components/RealtimeFeed.tsx` - Activity feed component
