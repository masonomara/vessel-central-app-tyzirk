# Vessel Central: Polished Demo Cleanup Plan

Goal: Turn the existing prototype into a polished demo. Not production -- a walkthrough-ready app where every button works, nothing crashes, and layouts hold across screen sizes. No real backend needed.

---

## Phase 1: Kill the iOS Overrides

**Problem:** 6 `.ios.tsx` files are simplified prototypes with hardcoded data, dead buttons, and broken logout. Expo Router prioritizes these on iOS, so on any iPhone the user sees the dumbed-down version instead of the real screens.

**Fix:** Delete all 6 files.

```
app/(tabs)/(home)/index.ios.tsx
app/(tabs)/owner.ios.tsx
app/(tabs)/manager.ios.tsx
app/(tabs)/crew.ios.tsx
app/(tabs)/calendar.ios.tsx
app/(tabs)/profile.ios.tsx
```

The `.tsx` versions are the real, data-driven screens. They will run on all platforms once the `.ios.tsx` files are gone.

**What this fixes in one move:**
- Hardcoded vessel data on owner dashboard
- Dead "Report Issue" / "Request Supplies" / "Upload Photo" buttons on crew
- Console.log-only approve/reject on manager
- Missing Settings section on profile
- Broken logout (setUserRole(null) instead of signOut)
- Missing auth check on home screen
- Empty calendar (user.id null in demo mode)

---

## Phase 2: Fix Crash-Causing Bugs

### 2.1 Add missing color tokens

`colors.error` and `colors.grey` are referenced but don't exist in `commonStyles.ts`. This causes `undefined` colors (invisible text/icons).

**File:** `styles/commonStyles.ts`

Add to the colors object after line 25 (`info`):

```typescript
  error: '#EF4444',          // Alias for danger (used by RealtimeFeed, ErrorState)
```

Add after line 31 (`statusOffline`):

```typescript
  grey: '#6B7280',           // Neutral gray (used in status defaults)
```

**Files affected:** `RealtimeFeed.tsx` (lines 25, 39), `ErrorState.tsx` (line 24), `notification-settings.tsx` (lines 529, 536), `supplies.tsx` (line 33), `issues.tsx` (line 28), `maintenance-detail.tsx` (lines 37, 46-47).

### 2.2 Fix RealtimeFeed import in owner.tsx

**File:** `app/(tabs)/owner.tsx`, line 19

```typescript
// BEFORE (crashes -- RealtimeFeed is a named export)
import RealtimeFeed from "@/components/RealtimeFeed";

// AFTER
import { RealtimeFeed } from "@/components/RealtimeFeed";
```

### 2.3 Fix RealtimeFeed prop name in owner.tsx

**File:** `app/(tabs)/owner.tsx`, wherever `<RealtimeFeed>` is rendered

```typescript
// BEFORE (maxItems is not a prop -- silently ignored, shows 20 items)
<RealtimeFeed userId={userId} maxItems={5} />

// AFTER
<RealtimeFeed userId={userId} limit={5} />
```

### 2.4 Fix calendar-event-detail date crash

`event.createdAt` is a string from JSON, not a `Date` object. Calling `.toLocaleDateString()` on a string crashes.

**File:** `app/calendar-event-detail.tsx`, line 228

```typescript
// BEFORE
{event.createdAt.toLocaleDateString()}

// AFTER
{new Date(event.createdAt).toLocaleDateString()}
```

### 2.5 Fix calendar demo mode (user.id null)

The calendar screen uses `useAuth().user` (Supabase User object, null in demo mode) to fetch events. This means the calendar is always empty in a demo.

**File:** `app/(tabs)/calendar.tsx`

Find where `getCalendarEventsForUser` is called with `user.id`:

```typescript
// BEFORE
const userEvents = getCalendarEventsForUser(user.id, userRole);

// AFTER
const userEvents = getCalendarEventsForUser(user?.id || userId, userRole);
```

Make sure `userId` (the string from `useAuth()`) is destructured alongside `user`.

### 2.6 Fix supplies.tsx hardcoded approver

**File:** `app/(tabs)/supplies.tsx`, lines 174-177

```typescript
// BEFORE
const handleApprove = useCallback((id: string) => {
  approveSupplyRequest(id, 'manager1', 'Sarah Johnson');
  console.log('Approved request:', id);
}, [approveSupplyRequest]);

// AFTER
const handleApprove = useCallback((id: string) => {
  approveSupplyRequest(id, userId, userName);
}, [approveSupplyRequest, userId, userName]);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Issue Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Title & Badges */}
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

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{issue.description}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <DetailRow label="Vessel" value={issue.vesselName} />
          <DetailRow label="Reported By" value={issue.reportedByName} />
          <DetailRow label="Location" value={issue.location || 'Not specified'} />
          <DetailRow label="Created" value={formatDate(new Date(issue.createdAt))} />
          {issue.assignedToName && (
            <DetailRow label="Assigned To" value={issue.assignedToName} />
          )}
          {issue.resolvedAt && (
            <DetailRow label="Resolved" value={formatDate(new Date(issue.resolvedAt))} />
          )}
        </View>

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments ({issue.comments.length})</Text>
          {issue.comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.userName}</Text>
                <Text style={styles.commentDate}>
                  {formatDate(new Date(comment.createdAt))}
                </Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}

          {/* Add Comment */}
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
              <IconSymbol name="arrow.up.circle.fill" size={32} color={
                commentText.trim() ? colors.accent : colors.textMuted
              } />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Actions */}
        {(userRole === 'owner' || userRole === 'manager') && issue.status !== 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionRow}>
              {issue.status === 'open' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleStatusChange('in_progress')}
                >
                  <Text style={styles.actionButtonText}>Start Work</Text>
                </TouchableOpacity>
              )}
              {issue.status === 'in_progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleStatusChange('completed')}
                >
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  commentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: colors.text },
  commentDate: { fontSize: 12, color: colors.textMuted },
  commentText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sendButton: { padding: 4 },
  sendButtonDisabled: { opacity: 0.5 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
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
    // In a real app this would open the file. For demo, show a message.
    Alert.alert('Document Preview', `"${doc.fileName}" would open here in a production build.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Document Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Document Icon & Title */}
        <View style={styles.docHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
            <IconSymbol name={getCategoryIcon(doc.category)} size={32} color={colors.accent} />
          </View>
          <Text style={styles.title}>{doc.title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                {doc.category.toUpperCase()}
              </Text>
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

        {/* Description */}
        {doc.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{doc.description}</Text>
          </View>
        )}

        {/* File Info Card */}
        <View style={styles.card}>
          <DetailRow label="File Name" value={doc.fileName} />
          <DetailRow label="File Size" value={formatFileSize(doc.fileSize)} />
          <DetailRow label="File Type" value={doc.fileType.toUpperCase()} />
          <DetailRow label="Vessel" value={doc.vesselName} />
          <DetailRow label="Uploaded By" value={doc.uploadedByName} />
          <DetailRow label="Uploaded" value={formatDate(new Date(doc.uploadedAt))} />
          {doc.expiryDate && (
            <DetailRow
              label="Expires"
              value={formatDate(new Date(doc.expiryDate))}
              valueColor={isExpired ? colors.danger : colors.text}
            />
          )}
        </View>

        {/* Tags */}
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

        {/* Open File Button */}
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
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : undefined]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 16 },
  docHeader: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: { fontSize: 14, color: colors.textMuted, flex: 1 },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: colors.secondary + '40',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { fontSize: 13, color: colors.textSecondary },
  openButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
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
      {
        text: 'Approve',
        onPress: () => {
          approveSupplyRequest(request.id, userId, userName);
          Alert.alert('Approved', 'Supply request has been approved.');
          router.back();
        },
      },
    ]);
  };

  const handleDeny = () => {
    Alert.alert('Deny Request', `Deny "${request.itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deny',
        style: 'destructive',
        onPress: () => {
          denySupplyRequest(request.id, 'Not approved at this time');
          Alert.alert('Denied', 'Supply request has been denied.');
          router.back();
        },
      },
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
            <Text style={[styles.badgeText, { color: getStatusColor(request.status) }]}>
              {request.status.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(request.priority) + '20' }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(request.priority) }]}>
              {request.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow label="Quantity" value={`${request.quantity} ${request.unit}`} />
          <DetailRow label="Estimated Cost" value={`$${request.estimatedCost.toFixed(2)}`} />
          {request.actualCost != null && (
            <DetailRow label="Actual Cost" value={`$${request.actualCost.toFixed(2)}`} />
          )}
          <DetailRow label="Vessel" value={request.vesselName} />
          <DetailRow label="Category" value={request.category} />
          <DetailRow label="Requested By" value={request.requestedByName} />
          <DetailRow label="Created" value={formatDate(new Date(request.createdAt))} />
          {request.vendor && <DetailRow label="Vendor" value={request.vendor} />}
          {request.approvedByName && (
            <DetailRow label="Approved By" value={request.approvedByName} />
          )}
          {request.approvedAt && (
            <DetailRow label="Approved On" value={formatDate(new Date(request.approvedAt))} />
          )}
          {request.deniedReason && (
            <DetailRow label="Denial Reason" value={request.deniedReason} />
          )}
        </View>

        {request.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.description}>{request.notes}</Text>
          </View>
        )}

        {/* Actions for managers/owners on pending requests */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
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
  console.log('Issue pressed:', issue.id);
}, []);

// AFTER
const handleIssuePress = useCallback((issue: Issue) => {
  router.push({ pathname: '/issue-detail', params: { id: issue.id } });
}, []);
```

Make sure `router` is available (it's imported as `useRouter` -- use `const router = useRouter()`).

### 4.2 Documents list -> document detail

**File:** `app/(tabs)/documents.tsx`, lines 57-60

```typescript
// BEFORE
const handleDocumentPress = useCallback((doc: Document) => {
  console.log('Document pressed:', doc.id);
  // Open document viewer
}, []);

// AFTER
const handleDocumentPress = useCallback((doc: Document) => {
  router.push({ pathname: '/document-detail', params: { id: doc.id } });
}, []);
```

### 4.3 Supplies list -> supply detail

**File:** `app/(tabs)/supplies.tsx`, lines 184-186

```typescript
// BEFORE
const handleRequestPress = useCallback((request: SupplyRequest) => {
  console.log('Request pressed:', request.id);
}, []);

// AFTER
const handleRequestPress = useCallback((request: SupplyRequest) => {
  router.push({ pathname: '/supply-detail', params: { id: request.id } });
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
  Alert.alert(userName, 'Tap the card to switch to this user\'s dashboard.');
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
  name="analytics"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="notification-settings"
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="cache-settings"
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

### 6.2 Fix analytics hardcoded metric

**File:** `app/analytics.tsx`

The "Average Response Time: 2.3 days" is static. Compute it from issue data:

```typescript
const avgResponseTime = useMemo(() => {
  const resolvedIssues = issues.filter(i => i.resolvedAt && i.createdAt);
  if (resolvedIssues.length === 0) return 'N/A';
  const totalDays = resolvedIssues.reduce((sum, i) => {
    const created = new Date(i.createdAt).getTime();
    const resolved = new Date(i.resolvedAt!).getTime();
    return sum + (resolved - created) / (1000 * 60 * 60 * 24);
  }, 0);
  return (totalDays / resolvedIssues.length).toFixed(1) + ' days';
}, [issues]);
```

### 6.3 Fix supplies deny reason

**File:** `app/(tabs)/supplies.tsx`, line 180

```typescript
// BEFORE
denySupplyRequest(id, 'Budget constraints');

// AFTER -- still a hardcoded reason but more generic
denySupplyRequest(id, 'Request not approved at this time');
```

For a demo this is fine. A real app would show a text input.

---

## Phase 7: Walkthrough Verification Checklist

After all changes, walk through every screen on both iOS and Android:

### Login & Auth
- [ ] Cold launch -> redirects to login
- [ ] Quick-login as Owner -> lands on owner dashboard
- [ ] Quick-login as Manager -> lands on manager dashboard
- [ ] Quick-login as Crew -> lands on crew dashboard
- [ ] Logout from any dashboard -> returns to login (not home)
- [ ] Re-login after logout works

### Owner Dashboard
- [ ] Welcome message shows user name
- [ ] Fleet overview cards render with vessel data
- [ ] Stats section shows metrics
- [ ] RealtimeFeed renders without crash (named import fix)
- [ ] RealtimeFeed shows max 5 items (limit prop fix)
- [ ] "View Analytics" button -> analytics screen
- [ ] "View Documents" button -> documents tab
- [ ] Back navigation works

### Manager Dashboard
- [ ] Overview stats render
- [ ] RealtimeFeed renders without visual issues (colors.error fix)
- [ ] Approve/Deny on pending supply requests works (visual state change)
- [ ] "Assign Boats" -> assign-boats screen
- [ ] "Schedule Task" -> add-maintenance-task modal
- [ ] "View Analytics" -> analytics screen

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
- [ ] Issue form submits and new issue appears in list

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
- [ ] Approve/Deny buttons work for managers (on pending items)
- [ ] Back navigation works
- [ ] "+" button -> add-supply-request modal

### Calendar Tab
- [ ] Calendar grid renders with dates
- [ ] Events appear on correct dates (demo mode fixed)
- [ ] Tap event -> calendar-event-detail
- [ ] Event detail renders without crash (createdAt fix)
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
- [ ] Settings rows appear (Notifications, Cache & Storage)
- [ ] Notification settings screen loads
- [ ] Cache settings screen loads
- [ ] Logout works properly

### Analytics
- [ ] Stat cards render
- [ ] Charts render (expense trend, category bars, task pie)
- [ ] Average response time computed from data (not hardcoded)
- [ ] Back navigation works

### Cross-cutting
- [ ] No yellow box warnings in simulator
- [ ] No red screen crashes
- [ ] Layouts hold on iPhone SE, iPhone 15 Pro Max, and a midsize Android
- [ ] Dark theme is consistent across every screen
- [ ] All `colors.error` and `colors.grey` references resolve correctly

---

## Summary: Execution Order

| Phase | Effort | Impact |
|-------|--------|--------|
| 1. Delete .ios.tsx files | 5 min | Fixes 6 broken screens in one move |
| 2. Fix crash bugs | 15 min | Eliminates every known crash |
| 3. Create detail screens | 30 min | Fills the 3 biggest dead ends |
| 4. Wire handlers | 10 min | Makes every card tappable |
| 5. Register routes | 5 min | Proper modal/push animations |
| 6. Polish | 15 min | Removes debug noise, fixes hardcoded data |
| 7. Walkthrough | 30 min | Verification |

Total: ~2 hours of focused work to go from "prototype with dead ends" to "polished demo where every tap works."
