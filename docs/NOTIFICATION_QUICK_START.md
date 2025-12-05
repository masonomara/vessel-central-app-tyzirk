
# Notification System Quick Start Guide

## For Developers

This guide will help you quickly integrate the notification system into your features.

## Basic Setup (Already Done)

The notification system is already initialized in the app. You just need to use it!

## Sending Notifications

### 1. Import the Service

```typescript
import { notificationService } from '@/utils/notificationService';
import { realtimeManager } from '@/utils/realtimeManager';
```

### 2. Send a Notification

Choose the appropriate method based on your use case:

#### Issue Notifications
```typescript
await notificationService.sendIssueNotification(
  'Engine overheating',  // Issue title
  'Serenity'            // Vessel name
);

// Also publish real-time event
await realtimeManager.publishEvent(
  'issue_created',
  { issueId: '123', issueTitle: 'Engine overheating' },
  userId,
  vesselId
);
```

#### Supply Request Notifications
```typescript
await notificationService.sendSupplyRequestNotification(
  'Engine oil',  // Item name
  'Serenity'    // Vessel name
);

await realtimeManager.publishEvent(
  'supply_approved',
  { requestId: '456', itemName: 'Engine oil' },
  userId,
  vesselId
);
```

#### Maintenance Notifications
```typescript
await notificationService.sendMaintenanceReminderNotification(
  'Oil change',  // Task title
  3             // Days until due
);

await realtimeManager.publishEvent(
  'maintenance_updated',
  { taskId: '789', taskTitle: 'Oil change', status: 'due' },
  userId,
  vesselId
);
```

#### Task Notifications
```typescript
await notificationService.sendTaskNotification(
  'Clean deck',  // Task title
  'John Doe'    // Assigned to
);

await realtimeManager.publishEvent(
  'task_assigned',
  { taskId: '101', taskTitle: 'Clean deck', assignedTo: 'John Doe' },
  userId,
  vesselId
);
```

#### Document Notifications
```typescript
await notificationService.sendDocumentNotification(
  'Insurance Policy.pdf',  // Document name
  'Jane Smith'            // Uploaded by
);

await realtimeManager.publishEvent(
  'document_uploaded',
  { documentId: '202', documentName: 'Insurance Policy.pdf' },
  userId,
  vesselId
);
```

#### Approval Notifications
```typescript
await notificationService.sendApprovalNotification(
  'Engine oil',  // Item name
  true          // Approved (true) or denied (false)
);

await realtimeManager.publishEvent(
  'supply_approved',  // or 'supply_denied'
  { requestId: '303', itemName: 'Engine oil', approved: true },
  userId,
  vesselId
);
```

#### System Notifications
```typescript
await notificationService.sendSystemNotification(
  'System Maintenance',  // Title
  'The app will be under maintenance tonight'  // Body
);
```

## Real-time Events

### Available Event Types

```typescript
type RealtimeEventType = 
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
```

### Publishing Events

```typescript
await realtimeManager.publishEvent(
  'issue_created',      // Event type
  {                     // Event data
    issueId: '123',
    issueTitle: 'Engine overheating',
    priority: 'high',
  },
  userId,              // Optional: User ID
  vesselId             // Optional: Vessel ID
);
```

## Using in Components

### Display Activity Feed

```typescript
import { RealtimeFeed } from '@/components/RealtimeFeed';

function MyScreen() {
  return (
    <RealtimeFeed
      userId={currentUser.id}
      limit={20}
      showUnreadOnly={false}
    />
  );
}
```

### Subscribe to Events

```typescript
import { useRealtime } from '@/hooks/useRealtime';

function MyComponent() {
  const { events, unreadCount, markAsRead } = useRealtime({
    userId: currentUser.id,
    eventType: 'issue_created',  // Or 'all' for all events
    autoRefresh: true,
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

### Check Notification Preferences

```typescript
import { notificationPreferencesManager } from '@/utils/notificationPreferences';

// Check if a category is enabled
if (notificationPreferencesManager.shouldShowPushNotification('maintenance')) {
  // Send notification
}

// Check if sound should play
if (notificationPreferencesManager.shouldPlaySound('issues')) {
  // Play sound
}
```

## Common Patterns

### Pattern 1: Create + Notify

```typescript
async function createIssue(issueData) {
  // 1. Create the issue
  const issue = await saveIssue(issueData);
  
  // 2. Send push notification
  await notificationService.sendIssueNotification(
    issue.title,
    issue.vesselName
  );
  
  // 3. Publish real-time event
  await realtimeManager.publishEvent(
    'issue_created',
    { issueId: issue.id, issueTitle: issue.title },
    userId,
    vesselId
  );
  
  return issue;
}
```

### Pattern 2: Update + Notify

```typescript
async function updateMaintenanceTask(taskId, updates) {
  // 1. Update the task
  const task = await updateTask(taskId, updates);
  
  // 2. Publish real-time event
  await realtimeManager.publishEvent(
    'maintenance_updated',
    { taskId: task.id, taskTitle: task.title, status: task.status },
    userId,
    vesselId
  );
  
  // 3. Send notification if status changed to completed
  if (updates.status === 'completed') {
    await realtimeManager.publishEvent(
      'task_completed',
      { taskId: task.id, taskTitle: task.title },
      userId,
      vesselId
    );
  }
  
  return task;
}
```

### Pattern 3: Approve/Deny + Notify

```typescript
async function approveSupplyRequest(requestId, approved) {
  // 1. Update the request
  const request = await updateSupplyRequest(requestId, {
    status: approved ? 'approved' : 'denied',
  });
  
  // 2. Send notification to requester
  await notificationService.sendApprovalNotification(
    request.itemName,
    approved
  );
  
  // 3. Publish real-time event
  await realtimeManager.publishEvent(
    approved ? 'supply_approved' : 'supply_denied',
    { requestId: request.id, itemName: request.itemName },
    request.requestedBy,  // Send to requester
    vesselId
  );
  
  return request;
}
```

## Testing Notifications

### Test Push Notifications

```typescript
// In your test component or screen
import { notificationService } from '@/utils/notificationService';

function TestNotifications() {
  const testPush = async () => {
    await notificationService.sendSystemNotification(
      'Test Notification',
      'This is a test notification'
    );
  };

  return (
    <Button title="Test Push" onPress={testPush} />
  );
}
```

### Test Real-time Events

```typescript
import { realtimeManager } from '@/utils/realtimeManager';

function TestRealtime() {
  const testEvent = async () => {
    await realtimeManager.publishEvent(
      'notification_received',
      { message: 'Test event' }
    );
  };

  return (
    <Button title="Test Event" onPress={testEvent} />
  );
}
```

## Troubleshooting

### Notifications not showing?

1. Check notification permissions:
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status);
   ```

2. Check user preferences:
   ```typescript
   const prefs = notificationPreferencesManager.getPreferences();
   console.log('Preferences:', prefs);
   ```

3. Check if in quiet hours:
   ```typescript
   const shouldShow = notificationPreferencesManager.shouldShowPushNotification('maintenance');
   console.log('Should show:', shouldShow);
   ```

### Events not appearing in feed?

1. Check if events are being published:
   ```typescript
   const events = realtimeManager.getRecentEvents(10);
   console.log('Recent events:', events);
   ```

2. Check if polling is active:
   ```typescript
   realtimeManager.startPolling(5000);
   ```

## Best Practices

1. **Always send both push and real-time events** for important actions
2. **Use appropriate categories** for proper filtering
3. **Include relevant data** in event payloads for deep linking
4. **Test on physical devices** for push notifications
5. **Respect user preferences** - the system does this automatically
6. **Provide meaningful titles and descriptions**
7. **Use consistent event types** across your app

## Need Help?

- Check `docs/NOTIFICATION_SYSTEM.md` for detailed documentation
- Review `docs/NOTIFICATION_ENHANCEMENT_SUMMARY.md` for system overview
- Look at existing implementations in the codebase
- Test with the notification settings screen at `/notification-settings`

## Quick Reference

```typescript
// Send notifications
notificationService.sendIssueNotification(title, vessel)
notificationService.sendSupplyRequestNotification(item, vessel)
notificationService.sendMaintenanceReminderNotification(task, days)
notificationService.sendTaskNotification(task, assignee)
notificationService.sendDocumentNotification(doc, uploader)
notificationService.sendApprovalNotification(item, approved)
notificationService.sendSystemNotification(title, body)

// Publish events
realtimeManager.publishEvent(type, data, userId?, vesselId?)

// Use in components
const { events, unreadCount, markAsRead } = useRealtime(options)
const { preferences, toggleCategory } = useNotificationPreferences()

// Check preferences
notificationPreferencesManager.shouldShowPushNotification(category)
notificationPreferencesManager.shouldPlaySound(category)
```
