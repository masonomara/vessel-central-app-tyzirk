# Vessel Central: Polished Demo Cleanup Plan

Goal: Turn the existing prototype into a polished demo. Not production -- a walkthrough-ready app where every button works, nothing crashes, and layouts hold across screen sizes. No real backend needed.

---

## Phase 1: Strip Unnecessary Features

Five features exist that serve no purpose in a demo. They add dead code, broken UI, and false complexity. Remove them entirely.

### 1.1 Remove Offline Mode

Offline queue and cache layer are not connected to anything. They add phantom infrastructure that never fires.

**Delete files:**

- `utils/offlineManager.ts` -- offline queue singleton (482 lines)
- `utils/cacheManager.ts` -- cache layer singleton (344 lines)
- `components/OfflineQueueStatus.tsx` -- offline status banner (382 lines)
- `components/CacheStatus.tsx` -- cache status display (192 lines)
- `app/cache-settings.tsx` -- cache settings screen (403 lines)

**Modify `app/_layout.tsx`:**

```typescript
// REMOVE these lines
import { OfflineQueueStatus } from '@/components/OfflineQueueStatus';
// ...
<OfflineQueueStatus />
```

**Modify `contexts/DataContext.tsx`:**

```typescript
// REMOVE these imports
import {
  cacheManager,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  cacheHelpers,
} from "@/utils/cacheManager";
import { offlineManager } from "@/utils/offlineManager";
```

Then strip all offline/cache logic from DataContext:

- Remove the entire `loadData` function's cache layer (falls back to AsyncStorage reads of seed data -- keep the seed data, remove the caching wrapper)
- Remove the entire `saveData` function's cache layer (keep basic AsyncStorage persistence if needed, remove cacheManager calls)
- Remove `cacheHelpers.invalidateCache(...)` calls in `addMaintenanceTask`, `updateMaintenanceTask`, `addIssue`
- Remove `offlineManager.getNetworkStatus()` checks and `offlineManager.addToOfflineQueue(...)` calls in those same methods

**Modify `app/(tabs)/profile.tsx`:**

- Remove "Cache & Storage" settings row and its navigation to `/cache-settings`

### 1.2 Remove Realtime

The realtime system is a local event bus pretending to be live data. It publishes events to itself and displays them back. No external data source.

**Delete files:**

- `utils/realtimeManager.ts` -- event bus singleton
- `hooks/useRealtime.ts` -- hook wrapping the event bus
- `components/RealtimeFeed.tsx` -- feed UI component

**Modify `app/(tabs)/owner.tsx`:**

```typescript
// REMOVE these lines
import RealtimeFeed from "@/components/RealtimeFeed";
// ...and wherever <RealtimeFeed ... /> is rendered, delete the entire block
```

**Modify `app/(tabs)/manager.tsx`:**

```typescript
// REMOVE these lines
import { RealtimeFeed } from "@/components/RealtimeFeed";
// ...and wherever <RealtimeFeed ... /> is rendered, delete the entire block
```

**Modify `contexts/DataContext.tsx`:**

```typescript
// REMOVE this import
import { realtimeManager } from "@/utils/realtimeManager";
```

Then remove all `realtimeManager.publishEvent(...)` calls:

- `addMaintenanceTask` -- `task_assigned` event
- `completeMaintenanceTask` -- `task_completed` event
- `updateMaintenanceTask` -- `maintenance_updated` event
- `addIssue` -- `issue_created` event
- `approveSupplyRequest` -- `supply_approved` event
- `denySupplyRequest` -- `supply_denied` event

### 1.3 Remove Notifications

No backend to push notifications. The entire notification system is inert plumbing.

**Delete files:**

- `utils/notificationService.ts` -- notification scheduling service
- `utils/notificationPreferences.ts` -- preference management singleton
- `hooks/useNotifications.ts` -- global notification setup hook
- `hooks/useNotificationPreferences.ts` -- preferences UI hook
- `app/notification-settings.tsx` -- notification settings screen
- `types/notifications.ts` -- notification preference types

**Modify `app/_layout.tsx`:**

```typescript
// REMOVE these lines
import { useNotifications } from "@/hooks/useNotifications";
// ...inside RootLayoutContent:
useNotifications(); // DELETE this call
```

**Modify `app/(tabs)/_layout.tsx`:**

- Remove the `unreadCount` computation (it's computed but never used anyway)

**Modify `contexts/DataContext.tsx`:**

- Keep the `notifications` array in state (it's used for display) and `markNotificationAsRead` / `clearAllNotifications` methods
- Remove `addNotification(...)` calls that fire inside `addIssue`, `addSupplyRequest`, `approveSupplyRequest`, `denySupplyRequest`, `assignCrewToVessel`, `addCalendarEvent` -- these create notifications that nobody reads

**Modify `types/index.ts`:**

```typescript
// REMOVE these re-exports
export type {
  NotificationCategory,
  NotificationPreferences,
} from "./notifications";
```

**Modify `app/(tabs)/profile.tsx`:**

- Remove "Notifications" settings row and its navigation to `/notification-settings`

### 1.4 Remove Analytics

No real data source. Charts render computed values from mock seed data. Not worth keeping for a demo -- it's a screen that invites scrutiny with no real answers behind it.

**Delete files:**

- `app/analytics.tsx` -- analytics dashboard

**Modify `app/(tabs)/owner.tsx`:**

- Remove `handleViewAnalytics` function and the "View Analytics" `GradientButton`

**Modify `app/(tabs)/manager.tsx`:**

- Remove the "View Analytics" quick action button and its `router.push('/analytics')` call

**Modify `app/(tabs)/maintenance.tsx`:**

- Remove `handleAnalytics` callback and the analytics icon button in the header

**Modify `package.json`:**

```json
// REMOVE this dependency
"react-native-chart-kit": "^6.12.0"
```

Then run `npm install` to update the lockfile.

### 1.5 Remove Supabase Integration

Supabase is never wired up. The app already runs entirely on AsyncStorage mock login. The dual-mode auth pattern adds branching complexity for a path that's never taken.

**Delete files:**

- `utils/supabase.ts` -- Supabase client factory

**Simplify `contexts/AuthContext.tsx`:**

The entire auth context should be rewritten to remove all Supabase code paths. What remains:

```typescript
// REMOVE these imports
import { supabase, isSupabaseConfigured } from "@/utils/supabase";
import { Session, User, AuthError } from "@supabase/supabase-js";

// REMOVE from state
const [user, setUser] = useState<User | null>(null);
const [session, setSession] = useState<Session | null>(null);
const [isSupabaseEnabled] = useState<boolean>(isSupabaseConfigured());

// REMOVE from context type and implementation
(user, session, isSupabaseEnabled);
(resetPassword, updatePassword);
(enrollMFA, verifyMFA, unenrollMFA, getMFAFactors);
refreshSession;

// REMOVE the entire Supabase auth state listener (supabase.auth.onAuthStateChange)
// REMOVE all Supabase-specific branches in signUp, signIn, signOut
```

Keep only the AsyncStorage-based auth: `userId`, `userRole`, `userName`, `isLoading`, `signIn` (mock), `signOut` (clear AsyncStorage), and the legacy setters.

**Simplify `app/login.tsx`:**

- Remove `isSupabaseEnabled` conditional branches
- Remove the "Demo Mode" badge (everything is demo mode now)
- Keep the quick-login buttons and mock user flow as the only login path

**Simplify `app/signup.tsx`:**

- Either delete entirely (no signup in demo mode) or keep as a stub that shows "Coming soon"

**Modify `package.json`:**

```json
// REMOVE this dependency
"@supabase/supabase-js": "^2.84.0"
```

Then run `npm install` to update the lockfile.

---

## Phase 2: Fix Crash-Causing Bugs

### 2.1 Add missing color tokens

`colors.error` and `colors.grey` are referenced but don't exist in `commonStyles.ts`. This causes `undefined` colors (invisible text/icons).

**File:** `styles/commonStyles.ts`

Add to the colors object after line 25 (`info`):

```typescript
  error: '#EF4444',          // Alias for danger (used by ErrorState)
```

Add after line 31 (`statusOffline`):

```typescript
  grey: '#6B7280',           // Neutral gray (used in status defaults)
```

**Files affected:** `ErrorState.tsx` (line 24), `supplies.tsx` (line 33), `issues.tsx` (line 28), `maintenance-detail.tsx` (lines 37, 46-47).

### 2.2 Fix calendar-event-detail date crash

`event.createdAt` is a string from JSON, not a `Date` object. Calling `.toLocaleDateString()` on a string crashes.

**File:** `app/calendar-event-detail.tsx`, line 228

```typescript
// BEFORE
{
  event.createdAt.toLocaleDateString();
}

// AFTER
{
  new Date(event.createdAt).toLocaleDateString();
}
```

### 2.3 Fix calendar demo mode (user.id null)

The calendar screen uses `useAuth().user` (Supabase User object, null after Supabase removal). Switch to `userId` directly.

**File:** `app/(tabs)/calendar.tsx`

```typescript
// BEFORE
const userEvents = getCalendarEventsForUser(user.id, userRole);

// AFTER
const userEvents = getCalendarEventsForUser(userId, userRole);
```

Remove the `user` destructure from `useAuth()` if no longer used elsewhere in the file.

### 2.4 Fix supplies.tsx hardcoded approver

**File:** `app/(tabs)/supplies.tsx`, lines 174-177

```typescript
// BEFORE
const handleApprove = useCallback(
  (id: string) => {
    approveSupplyRequest(id, "manager1", "Sarah Johnson");
    console.log("Approved request:", id);
  },
  [approveSupplyRequest],
);

// AFTER
const handleApprove = useCallback(
  (id: string) => {
    approveSupplyRequest(id, userId, userName);
  },
  [approveSupplyRequest, userId, userName],
);
```

Add `userId` and `userName` to the destructured `useAuth()` call if not already present.

---

## Phase 3: Create Missing Detail Screens

Three list screens are dead ends -- tapping a card does nothing. Each needs a detail screen following the `maintenance-detail.tsx` pattern.

### 3.1 Issue Detail Screen

**Create file:** `app/issue-detail.tsx`

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { formatDate } from '@/utils/dateUtils';
import { TaskStatus, TaskPriority } from '@/types';

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { issues, updateIssue, addIssueComment } = useData();
  const { userRole, userId, userName } = useAuth();
  const [commentText, setCommentText] = useState('');

  const issue = issues.find(i => i.id === id);

  if (!issue) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Issue Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>This issue could not be found.</Text>
        </View>
      </View>
    );
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.accent;
      case 'low': return colors.success;
      default: return colors.grey;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.accent;
      case 'waiting_on_parts': return colors.warning;
      case 'open': return colors.grey;
      default: return colors.grey;
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateIssue(issue.id, { status: newStatus });
    Alert.alert('Updated', `Issue status changed to ${newStatus.replace('_', ' ')}`);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addIssueComment(issue.id, {
      userId: userId,
      userName: userName,
      userRole: userRole,
      text: commentText.trim(),
    });
    setCommentText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Issue Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{issue.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(issue.priority) + '20' }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(issue.priority) }]}>
              {issue.priority.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(issue.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(issue.status) }]}>
              {issue.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {issue.category && (
            <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>{issue.category}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{issue.description}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow label="Vessel" value={issue.vesselName} />
          <DetailRow label="Reported By" value={issue.reportedByName} />
          <DetailRow label="Location" value={issue.location || 'Not specified'} />
          <DetailRow label="Created" value={formatDate(new Date(issue.createdAt))} />
          {issue.assignedToName && <DetailRow label="Assigned To" value={issue.assignedToName} />}
          {issue.resolvedAt && <DetailRow label="Resolved" value={formatDate(new Date(issue.resolvedAt))} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments ({issue.comments.length})</Text>
          {issue.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.userName}</Text>
                <Text style={styles.commentDate}>{formatDate(new Date(comment.createdAt))}</Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <IconSymbol name="arrow.up.circle.fill" size={32} color={commentText.trim() ? colors.accent : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {(userRole === 'owner' || userRole === 'manager') && issue.status !== 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionRow}>
              {issue.status === 'open' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={() => handleStatusChange('in_progress')}>
                  <Text style={styles.actionButtonText}>Start Work</Text>
                </TouchableOpacity>
              )}
              {issue.status === 'in_progress' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success }]} onPress={() => handleStatusChange('completed')}>
                  <Text style={styles.actionButtonText}>Mark Resolved</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center' },
  headerSpacer: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  commentCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: colors.text },
  commentDate: { fontSize: 12, color: colors.textMuted },
  commentText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  commentInput: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 8, marginTop: 8 },
  input: { flex: 1, fontSize: 14, color: colors.text, maxHeight: 100, paddingHorizontal: 8, paddingVertical: 4 },
  sendButton: { padding: 4 },
  sendButtonDisabled: { opacity: 0.5 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
```

### 3.2 Document Detail Screen

**Create file:** `app/document-detail.tsx`

```typescript
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { formatDate, isOverdue } from '@/utils/dateUtils';
import { formatFileSize } from '@/utils/fileUtils';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { documents } = useData();
  const { userRole } = useAuth();

  const doc = documents.find(d => d.id === id);

  if (!doc) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Document Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>This document could not be found.</Text>
        </View>
      </View>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'manual': return 'book';
      case 'insurance': return 'shield';
      case 'registration': return 'badge';
      case 'safety': return 'health_and_safety';
      case 'warranty': return 'verified';
      case 'invoice': return 'receipt';
      case 'receipt': return 'receipt_long';
      default: return 'description';
    }
  };

  const isExpired = doc.expiryDate && isOverdue(new Date(doc.expiryDate));

  const handleOpenFile = () => {
    Alert.alert('Document Preview', `"${doc.fileName}" would open here in a production build.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Document Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.docHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
            <IconSymbol name={getCategoryIcon(doc.category)} size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>{doc.title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>{doc.category.toUpperCase()}</Text>
            </View>
            {doc.isImportant && (
              <View style={[styles.badge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.warning }]}>IMPORTANT</Text>
              </View>
            )}
            {isExpired && (
              <View style={[styles.badge, { backgroundColor: colors.danger + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.danger }]}>EXPIRED</Text>
              </View>
            )}
          </View>
        </View>

        {doc.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{doc.description}</Text>
          </View>
        )}

        <View style={styles.card}>
          <DetailRow label="File Name" value={doc.fileName} />
          <DetailRow label="File Size" value={formatFileSize(doc.fileSize)} />
          <DetailRow label="File Type" value={doc.fileType.toUpperCase()} />
          <DetailRow label="Vessel" value={doc.vesselName} />
          <DetailRow label="Uploaded By" value={doc.uploadedByName} />
          <DetailRow label="Uploaded" value={formatDate(new Date(doc.uploadedAt))} />
          {doc.expiryDate && (
            <DetailRow label="Expires" value={formatDate(new Date(doc.expiryDate))} valueColor={isExpired ? colors.danger : colors.text} />
          )}
        </View>

        {doc.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {doc.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.openButton} onPress={handleOpenFile}>
          <IconSymbol name="doc.text" size={20} color="#FFFFFF" />
          <Text style={styles.openButtonText}>Open Document</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : undefined]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center' },
  headerSpacer: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  docHeader: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailLabel: { fontSize: 14, color: colors.textMuted, flex: 1 },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: colors.secondary + '40', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, color: colors.textSecondary },
  openButton: { flexDirection: 'row', backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  openButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
```

### 3.3 Supply Request Detail Screen

**Create file:** `app/supply-detail.tsx`

```typescript
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { formatDate } from '@/utils/dateUtils';
import { SupplyRequestStatus, TaskPriority } from '@/types';

export default function SupplyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { supplyRequests, approveSupplyRequest, denySupplyRequest } = useData();
  const { userRole, userId, userName } = useAuth();

  const request = supplyRequests.find(r => r.id === id);

  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>This supply request could not be found.</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: SupplyRequestStatus) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'ordered': return colors.accent;
      case 'received': return colors.success;
      case 'denied': return colors.danger;
      case 'pending': return colors.warning;
      default: return colors.grey;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.accent;
      case 'low': return colors.success;
      default: return colors.grey;
    }
  };

  const handleApprove = () => {
    Alert.alert('Approve Request', `Approve "${request.itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => {
          approveSupplyRequest(request.id, userId, userName);
          Alert.alert('Approved', 'Supply request has been approved.');
          router.back();
      }},
    ]);
  };

  const handleDeny = () => {
    Alert.alert('Deny Request', `Deny "${request.itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deny', style: 'destructive', onPress: () => {
          denySupplyRequest(request.id, 'Not approved at this time');
          Alert.alert('Denied', 'Supply request has been denied.');
          router.back();
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Supply Request</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{request.itemName}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(request.status) }]}>{request.status.toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(request.priority) + '20' }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(request.priority) }]}>{request.priority.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow label="Quantity" value={`${request.quantity} ${request.unit}`} />
          <DetailRow label="Estimated Cost" value={`$${request.estimatedCost.toFixed(2)}`} />
          {request.actualCost != null && <DetailRow label="Actual Cost" value={`$${request.actualCost.toFixed(2)}`} />}
          <DetailRow label="Vessel" value={request.vesselName} />
          <DetailRow label="Category" value={request.category} />
          <DetailRow label="Requested By" value={request.requestedByName} />
          <DetailRow label="Created" value={formatDate(new Date(request.createdAt))} />
          {request.vendor && <DetailRow label="Vendor" value={request.vendor} />}
          {request.approvedByName && <DetailRow label="Approved By" value={request.approvedByName} />}
          {request.approvedAt && <DetailRow label="Approved On" value={formatDate(new Date(request.approvedAt))} />}
          {request.deniedReason && <DetailRow label="Denial Reason" value={request.deniedReason} />}
        </View>

        {request.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.description}>{request.notes}</Text>
          </View>
        )}

        {(userRole === 'owner' || userRole === 'manager') && request.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success }]} onPress={handleApprove}>
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.danger }]} onPress={handleDeny}>
              <Text style={styles.actionButtonText}>Deny</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center' },
  headerSpacer: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
```

---

## Phase 4: Wire Dead-End Handlers

### 4.1 Issues list -> issue detail

**File:** `app/(tabs)/issues.tsx`, lines 181-183

```typescript
// BEFORE
const handleIssuePress = useCallback((issue: Issue) => {
  console.log("Issue pressed:", issue.id);
}, []);

// AFTER
const handleIssuePress = useCallback((issue: Issue) => {
  router.push({ pathname: "/issue-detail", params: { id: issue.id } });
}, []);
```

### 4.2 Documents list -> document detail

**File:** `app/(tabs)/documents.tsx`, lines 57-60

```typescript
// BEFORE
const handleDocumentPress = useCallback((doc: Document) => {
  console.log("Document pressed:", doc.id);
}, []);

// AFTER
const handleDocumentPress = useCallback((doc: Document) => {
  router.push({ pathname: "/document-detail", params: { id: doc.id } });
}, []);
```

### 4.3 Supplies list -> supply detail

**File:** `app/(tabs)/supplies.tsx`, lines 184-186

```typescript
// BEFORE
const handleRequestPress = useCallback((request: SupplyRequest) => {
  console.log("Request pressed:", request.id);
}, []);

// AFTER
const handleRequestPress = useCallback((request: SupplyRequest) => {
  router.push({ pathname: "/supply-detail", params: { id: request.id } });
}, []);
```

### 4.4 Home screen info button

**File:** `app/(tabs)/(home)/index.tsx`

Find `handleInfoPress` and either wire it to a quick detail or remove the info icon entirely. Simplest approach for demo -- remove the button:

```typescript
// Option A: Remove the info icon from the card (cleanest for demo)
// Just delete the <TouchableOpacity> wrapping the info icon

// Option B: Show a quick alert with vessel info
const handleInfoPress = useCallback((userId: string, userName: string) => {
  Alert.alert(userName, "Tap the card to switch to this user's dashboard.");
}, []);
```

---

## Phase 5: Register Missing Routes in Root Layout

Several route files exist but aren't registered as `Stack.Screen` entries. They work via auto-discovery but lack proper presentation config.

**File:** `app/_layout.tsx`

Add these screens inside the `<Stack>`:

```typescript
<Stack.Screen
  name="add-issue"
  options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
/>
<Stack.Screen
  name="add-document"
  options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
/>
<Stack.Screen
  name="add-calendar-event"
  options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
/>
<Stack.Screen
  name="add-supply-request"
  options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
/>
<Stack.Screen
  name="add-parts-request"
  options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
/>
<Stack.Screen
  name="issue-detail"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="document-detail"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="supply-detail"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="maintenance-detail"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="calendar-event-detail"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="assign-boats"
  options={{ headerShown: false }}
/>
```

---

## Phase 6: Small Fixes for Polish

### 6.1 Remove console.log debug statements

Strip `console.log` calls from user-facing code. Key files:

- `app/(tabs)/issues.tsx` -- "Loading more issues..."
- `app/(tabs)/documents.tsx` -- "Document pressed:", "Add document pressed", "Loading more documents..."
- `app/(tabs)/supplies.tsx` -- "Approved request:", "Denied request:", "Request pressed:", "Add request pressed"
- `contexts/AuthContext.tsx` -- multiple debug logs
- `app/login.tsx` -- login flow logs

### 6.2 Fix supplies deny reason

**File:** `app/(tabs)/supplies.tsx`, line 180

```typescript
// BEFORE
denySupplyRequest(id, "Budget constraints");

// AFTER
denySupplyRequest(id, "Request not approved at this time");
```

---

## Phase 7: Walkthrough Verification Checklist

After all changes, walk through every screen on both iOS and Android:

### Login & Auth

- [ ] Cold launch -> redirects to login
- [ ] Quick-login as Owner -> lands on owner dashboard
- [ ] Quick-login as Manager -> lands on manager dashboard
- [ ] Quick-login as Crew -> lands on crew dashboard
- [ ] Logout from any dashboard -> returns to login
- [ ] Re-login after logout works

### Owner Dashboard

- [ ] Welcome message shows user name
- [ ] Fleet overview cards render with vessel data
- [ ] Stats section shows metrics
- [ ] "View Documents" button -> documents tab
- [ ] Back navigation works

### Manager Dashboard

- [ ] Overview stats render
- [ ] Approve/Deny on pending supply requests works
- [ ] "Assign Boats" -> assign-boats screen
- [ ] "Schedule Task" -> add-maintenance-task modal

### Crew Dashboard

- [ ] Assigned tasks list renders
- [ ] Task checkbox toggles completion
- [ ] "Report Issue" -> add-issue modal
- [ ] "Request Parts" -> add-parts-request modal
- [ ] "Request Supplies" -> add-supply-request modal

### Issues Tab

- [ ] Issue list renders with status/priority badges
- [ ] Search filters work
- [ ] Status filter chips work
- [ ] Tap issue card -> issue-detail screen
- [ ] Issue detail shows all fields, comments, action buttons
- [ ] Add comment works
- [ ] Status change works
- [ ] Back navigation works
- [ ] "+" button -> add-issue modal

### Documents Tab

- [ ] Document list renders with category icons
- [ ] Search and category filters work
- [ ] Tap document -> document-detail screen
- [ ] Document detail shows file info, tags, expiry
- [ ] "Open Document" shows demo alert
- [ ] Back navigation works
- [ ] "+" button -> add-document modal

### Supplies Tab

- [ ] Supply request list renders
- [ ] Search and status filters work
- [ ] Tap request -> supply-detail screen
- [ ] Supply detail shows all fields
- [ ] Approve/Deny buttons work for managers
- [ ] Back navigation works
- [ ] "+" button -> add-supply-request modal

### Calendar Tab

- [ ] Calendar grid renders with dates
- [ ] Events appear on correct dates
- [ ] Tap event -> calendar-event-detail
- [ ] Event detail renders without crash
- [ ] Delete / Complete / Cancel actions work
- [ ] "+" button -> add-calendar-event modal

### Maintenance Tab

- [ ] Task list renders
- [ ] Tap task -> maintenance-detail
- [ ] Detail screen shows all fields
- [ ] Status change and completion work
- [ ] Back navigation works

### Profile Tab

- [ ] User info displays correctly
- [ ] Logout works properly

### Cross-cutting

- [ ] No yellow box warnings in simulator
- [ ] No red screen crashes
- [ ] Layouts hold on iPhone SE, iPhone 15 Pro Max, and a midsize Android
- [ ] Dark theme is consistent across every screen
- [ ] All `colors.error` and `colors.grey` references resolve correctly

---

## Summary: Execution Order

| Phase                         | Effort | Impact                                              |
| ----------------------------- | ------ | --------------------------------------------------- |
| 1. Strip unnecessary features | 45 min | Removes ~3,400 lines of dead code, 14 files deleted |
| 2. Fix crash bugs             | 10 min | Eliminates every known crash                        |
| 3. Create detail screens      | 30 min | Fills the 3 biggest dead ends                       |
| 4. Wire handlers              | 10 min | Makes every card tappable                           |
| 5. Register routes            | 5 min  | Proper modal/push animations                        |
| 6. Polish                     | 10 min | Removes debug noise, fixes hardcoded data           |
| 7. Walkthrough                | 30 min | Verification                                        |

### Files Deleted in Phase 1

| Feature       | Files                                                                                                                                                                                             | Lines Removed    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Offline       | `utils/offlineManager.ts`, `utils/cacheManager.ts`, `components/OfflineQueueStatus.tsx`, `components/CacheStatus.tsx`, `app/cache-settings.tsx`                                                   | ~1,800           |
| Realtime      | `utils/realtimeManager.ts`, `hooks/useRealtime.ts`, `components/RealtimeFeed.tsx`                                                                                                                 | ~350             |
| Notifications | `utils/notificationService.ts`, `utils/notificationPreferences.ts`, `hooks/useNotifications.ts`, `hooks/useNotificationPreferences.ts`, `app/notification-settings.tsx`, `types/notifications.ts` | ~800             |
| Analytics     | `app/analytics.tsx`                                                                                                                                                                               | ~400             |
| Supabase      | `utils/supabase.ts`                                                                                                                                                                               | ~60              |
| **Total**     | **14 files**                                                                                                                                                                                      | **~3,400 lines** |

### Dependencies to Remove from package.json

```
react-native-chart-kit
@supabase/supabase-js
```

Total: ~2.5 hours of focused work to go from "prototype with dead infrastructure" to "polished demo where every tap works and nothing is faked."

---

## Todo List

Every task below maps to a specific change described in the phases above. Work top-to-bottom. A task is done when the described change compiles and the app still launches.

### Phase 1: Strip Unnecessary Features

#### 1.1 Remove Offline Mode

- [x] Delete `utils/offlineManager.ts`
- [x] Delete `utils/cacheManager.ts`
- [x] Delete `components/OfflineQueueStatus.tsx`
- [x] Delete `components/CacheStatus.tsx`
- [x] Delete `app/cache-settings.tsx`
- [x] Delete `hooks/useCache.ts` (also depended on cacheManager)
- [x] Remove `OfflineQueueStatus` import and render from `app/_layout.tsx`
- [x] Remove `cacheManager` and `offlineManager` imports from `contexts/DataContext.tsx`
- [x] Strip cache layer from `loadData` in DataContext (keep seed data reads, remove caching wrapper)
- [x] Strip cache layer from `saveData` in DataContext (keep AsyncStorage persistence, remove cacheManager calls)
- [x] Remove all `cacheHelpers.invalidateCache(...)` calls in DataContext
- [x] Remove all `offlineManager.getNetworkStatus()` checks and `offlineManager.addToOfflineQueue(...)` calls in DataContext
- [x] Remove "Cache & Storage" settings row and `/cache-settings` navigation from `app/(tabs)/profile.tsx`
- [x] Remove `CacheStatus` import and render from `app/(tabs)/maintenance.tsx`

#### 1.2 Remove Realtime

- [x] Delete `utils/realtimeManager.ts`
- [x] Delete `hooks/useRealtime.ts`
- [x] Rewrite `components/RealtimeFeed.tsx` with static mock activity data (kept UI, stripped plumbing)
- [x] Keep `<RealtimeFeed />` renders in `owner.tsx` and `manager.tsx` as-is (work with static data now)
- [x] Remove `realtimeManager` import from `contexts/DataContext.tsx`
- [x] Remove `realtimeManager.publishEvent(...)` call from `addMaintenanceTask` in DataContext
- [x] Remove `realtimeManager.publishEvent(...)` call from `updateMaintenanceTask` in DataContext
- [x] Remove `realtimeManager.publishEvent(...)` call from `addIssue` in DataContext
- [x] Remove `realtimeManager.publishEvent(...)` call from `approveSupplyRequest` in DataContext
- [x] Remove `realtimeManager.publishEvent(...)` call from `denySupplyRequest` in DataContext

#### 1.3 Remove Notifications

- [x] Delete `utils/notificationService.ts`
- [x] Delete `utils/notificationPreferences.ts`
- [x] Delete `hooks/useNotifications.ts`
- [x] Delete `hooks/useNotificationPreferences.ts`
- [x] Delete `types/notifications.ts`
- [x] Rewrite `app/notification-settings.tsx` with local useState (same UI, no plumbing)
- [x] Remove `useNotifications` import and call from `app/_layout.tsx`
- [x] Remove `unreadCount` computation and `useData` import from `app/(tabs)/_layout.tsx`
- [x] Remove `addNotification(...)` call from `addIssue` in DataContext
- [x] Remove `addNotification(...)` call from `addSupplyRequest` in DataContext
- [x] Remove `addNotification(...)` call from `approveSupplyRequest` in DataContext
- [x] Remove `addNotification(...)` call from `denySupplyRequest` in DataContext
- [x] Remove `addNotification(...)` call from `assignCrewToVessel` in DataContext
- [x] Remove `addNotification(...)` call from `addCalendarEvent` in DataContext
- [x] Remove `NotificationCategory` and `NotificationPreferences` re-exports from `types/index.ts`
- [x] Keep "Notifications" settings row in profile.tsx (demo screen worth showing)
- [x] Keep notifications seed data and display methods in DataContext

#### 1.4 Keep Analytics (revised)

- [x] Keep `app/analytics.tsx` as-is — demo-impressive screen driven by seed data, no backend
- [x] Console.log cleanup and colors.grey fix covered by Phase 2 and Phase 6

#### 1.5 Remove Supabase Integration (revised)

- [x] Delete `utils/supabase.ts`
- [x] Rewrite `contexts/AuthContext.tsx` — pure AsyncStorage auth, no Supabase types, no `any`
- [x] Remove `isSupabaseEnabled` branches and demo badge from `app/login.tsx`, make quick login always visible
- [x] Stub `app/signup.tsx` — always shows demo mode alert
- [x] Stub `app/forgot-password.tsx` — always shows demo mode alert
- [x] Remove `isSupabaseEnabled` branches and demo badge from `app/manager-login.tsx`, make quick login always visible
- [x] Remove `user` (Supabase User object) from `app/(tabs)/profile.tsx`, use `userName` fallback
- [x] Fix `app/(tabs)/calendar.tsx` — replace `user.id` with `userId` from useAuth
- [x] Fix `app/add-calendar-event.tsx` — replace `user` with `userId`/`userName` from useAuth
- [x] Remove `@supabase/supabase-js`, `react-native-url-polyfill`, `expo-notifications` from `package.json`
- [x] Run `npm install` to update lockfile
- [x] Typecheck: 130 errors (down from 133), zero Supabase-related, all pre-existing

### Phase 2: Fix Crash-Causing Bugs

- [x] Add `error: '#EF4444'` color token to `styles/commonStyles.ts`
- [x] Add `grey: '#6B7280'` color token to `styles/commonStyles.ts`
- [x] Fix `app/calendar-event-detail.tsx`: wrap `event.createdAt` in `new Date()`
- [x] Fix `app/(tabs)/calendar.tsx`: change `user.id` to `userId` from `useAuth()` (done in Phase 1.5)
- [x] Remove `user` destructure from `useAuth()` in calendar.tsx (done in Phase 1.5)
- [x] Fix `app/(tabs)/supplies.tsx` hardcoded approver: use `userId`/`userName` from `useAuth()`
- [x] Typecheck: 111 errors (down from 130), all pre-existing icon name format issues

### Phase 3: Create Missing Detail Screens

- [ ] Create `app/issue-detail.tsx` with full implementation (see Phase 3.1 code)
- [ ] Create `app/document-detail.tsx` with full implementation (see Phase 3.2 code)
- [ ] Create `app/supply-detail.tsx` with full implementation (see Phase 3.3 code)
- [ ] Verify `addIssueComment` exists in DataContext (add if missing)
- [ ] Verify `updateIssue` exists in DataContext (add if missing)
- [ ] Verify `formatFileSize` exists in `utils/fileUtils.ts` (add if missing)

### Phase 4: Wire Dead-End Handlers

- [ ] Wire `handleIssuePress` in `app/(tabs)/issues.tsx` to `router.push('/issue-detail')`
- [ ] Wire `handleDocumentPress` in `app/(tabs)/documents.tsx` to `router.push('/document-detail')`
- [ ] Wire `handleRequestPress` in `app/(tabs)/supplies.tsx` to `router.push('/supply-detail')`
- [ ] Fix or remove `handleInfoPress` on home screen info button in `app/(tabs)/(home)/index.tsx`
- [ ] Add `router` import to issues.tsx, documents.tsx, supplies.tsx if not already present

### Phase 5: Register Missing Routes

- [ ] Add `Stack.Screen` for `add-issue` (modal) in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `add-document` (modal) in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `add-calendar-event` (modal) in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `add-supply-request` (modal) in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `add-parts-request` (modal) in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `issue-detail` in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `document-detail` in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `supply-detail` in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `maintenance-detail` in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `calendar-event-detail` in `app/_layout.tsx`
- [ ] Add `Stack.Screen` for `assign-boats` in `app/_layout.tsx`

### Phase 6: Small Fixes for Polish

- [ ] Remove `console.log` statements from `app/(tabs)/issues.tsx`
- [ ] Remove `console.log` statements from `app/(tabs)/documents.tsx`
- [ ] Remove `console.log` statements from `app/(tabs)/supplies.tsx`
- [ ] Remove `console.log` statements from `contexts/AuthContext.tsx`
- [ ] Remove `console.log` statements from `app/login.tsx`
- [ ] Fix hardcoded deny reason in `app/(tabs)/supplies.tsx` ("Budget constraints" -> "Request not approved at this time")

### Phase 7: Walkthrough Verification

- [ ] Login flow: cold launch redirects to login, quick-login works for all 3 roles, logout returns to login
- [ ] Owner dashboard: welcome message, fleet cards, stats, "View Documents" button
- [ ] Manager dashboard: overview stats, approve/deny supplies, "Assign Boats", "Schedule Task"
- [ ] Crew dashboard: assigned tasks, task completion, "Report Issue", "Request Parts", "Request Supplies"
- [ ] Issues tab: list renders, search/filters work, tap -> detail, comments, status change, add issue
- [ ] Documents tab: list renders, search/filters work, tap -> detail, file info, "Open Document" alert, add document
- [ ] Supplies tab: list renders, search/filters work, tap -> detail, approve/deny, add supply request
- [ ] Calendar tab: grid renders, events on dates, tap -> detail without crash, add event
- [ ] Maintenance tab: list renders, tap -> detail, status change, completion
- [ ] Profile tab: user info displays, logout works
- [ ] Cross-cutting: no yellow box warnings, no red screen crashes, layouts hold on small/large screens, dark theme consistent, `colors.error` and `colors.grey` resolve
