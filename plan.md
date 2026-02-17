# Vessel Central — Demo Polish Plan

**Goal:** Take the existing prototype and make it a polished, crash-free demo. Not production. Something you can hand an investor or partner, let them tap through every screen, and nothing breaks.

---

## 1. Crash Fixes (Critical)

### 1A. Document Viewer — Dead Button

**File:** `app/document-detail.tsx:41-46`

The "Open Document" button shows a placeholder alert. During a demo, this is a dead end that looks broken.

**Fix:** Replace with an inline document preview. For PDFs, render a fake preview card with document metadata. For images, show the image. No need to actually open files — just make it look like a real viewer.

```tsx
// Replace handleOpenFile and the TouchableOpacity button with an inline preview

// Add this component above the return statement:
const DocumentPreview = () => {
  const fileType = doc.fileType.toLowerCase();
  const isPdf = fileType.includes('pdf');

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <IconSymbol
          ios_icon_name={isPdf ? "doc.text.fill" : "photo.fill"}
          android_material_icon_name={isPdf ? "picture-as-pdf" : "image"}
          size={20}
          color={colors.accent}
        />
        <Text style={styles.previewHeaderText}>Document Preview</Text>
      </View>

      {isPdf ? (
        // Fake PDF preview — page representation
        <View style={styles.pdfPreview}>
          <View style={styles.pdfPage}>
            <Text style={styles.pdfTitle}>{doc.title}</Text>
            <View style={styles.pdfLine} />
            <View style={styles.pdfLine} />
            <View style={[styles.pdfLine, { width: '60%' }]} />
            <View style={{ height: 16 }} />
            <View style={styles.pdfLine} />
            <View style={styles.pdfLine} />
            <View style={[styles.pdfLine, { width: '80%' }]} />
            <View style={{ height: 16 }} />
            <View style={styles.pdfLine} />
            <View style={[styles.pdfLine, { width: '45%' }]} />
          </View>
          <Text style={styles.pdfPageLabel}>Page 1 of 1</Text>
        </View>
      ) : (
        // Image placeholder
        <View style={styles.imagePreview}>
          <IconSymbol
            ios_icon_name="photo.fill"
            android_material_icon_name="image"
            size={48}
            color={colors.textMuted}
          />
          <Text style={styles.imagePreviewText}>{doc.fileName}</Text>
        </View>
      )}
    </View>
  );
};

// New styles to add:
// previewContainer: {
//   backgroundColor: colors.card,
//   borderRadius: 12,
//   borderWidth: 1,
//   borderColor: colors.border,
//   overflow: 'hidden',
//   marginBottom: 24,
// },
// previewHeader: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: 8,
//   padding: 12,
//   borderBottomWidth: 1,
//   borderBottomColor: colors.divider,
// },
// previewHeaderText: {
//   fontSize: 14,
//   fontWeight: '600',
//   color: colors.text,
// },
// pdfPreview: { padding: 16, alignItems: 'center' },
// pdfPage: {
//   width: '100%',
//   backgroundColor: '#1a1a2e',
//   borderRadius: 4,
//   padding: 24,
//   minHeight: 200,
// },
// pdfTitle: {
//   fontSize: 14,
//   fontWeight: '600',
//   color: colors.text,
//   marginBottom: 16,
// },
// pdfLine: {
//   height: 8,
//   backgroundColor: colors.border,
//   borderRadius: 4,
//   marginBottom: 8,
//   width: '100%',
// },
// pdfPageLabel: {
//   fontSize: 12,
//   color: colors.textMuted,
//   marginTop: 8,
// },
```

Also add "Download" and "Share" buttons below the preview to round out the UI:

```tsx
<View style={styles.actionRow}>
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: colors.accent }]}
    onPress={() => Alert.alert("Download", `"${doc.fileName}" saved to device.`)}
  >
    <IconSymbol ios_icon_name="arrow.down.circle.fill" android_material_icon_name="download" size={20} color="#FFFFFF" />
    <Text style={styles.actionButtonText}>Download</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: colors.secondary }]}
    onPress={() => Alert.alert("Shared", `"${doc.fileName}" share sheet opened.`)}
  >
    <IconSymbol ios_icon_name="square.and.arrow.up" android_material_icon_name="share" size={20} color="#FFFFFF" />
    <Text style={styles.actionButtonText}>Share</Text>
  </TouchableOpacity>
</View>
```

<!-- make sure to keep this simple, looks like a lot fo code for pdf viewer -->

### 1B. Null Safety — Auth Values in Callbacks

Multiple screens pass `userId` and `userName` from `useAuth()` into data functions without null checks. These are typed as `string` but start as empty strings. If somehow accessed before login is complete, they'll pass empty values into the data layer.

**Files & Fixes:**

**`app/supply-detail.tsx:77`** — `approveSupplyRequest(request.id, userId, userName)`
```tsx
// Wrap handleApprove with a guard
const handleApprove = () => {
  if (!userId || !userName) {
    Alert.alert("Error", "Not authenticated.");
    return;
  }
  Alert.alert("Approve Request", `Approve "${request.itemName}"?`, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Approve",
      onPress: () => {
        approveSupplyRequest(request.id, userId, userName);
        Alert.alert("Approved", "Supply request has been approved.");
        router.back();
      },
    },
  ]);
};
```

**`app/issue-detail.tsx:77-86`** — `addIssueComment` with potentially empty userId/userName
```tsx
const handleAddComment = () => {
  if (!commentText.trim()) return;
  if (!userId || !userName) {
    Alert.alert("Error", "Not authenticated.");
    return;
  }
  addIssueComment(issue.id, {
    userId,
    userName,
    userRole,
    text: commentText.trim(),
    attachments: [],
  });
  setCommentText("");
};
```

<!-- im not that worried about this but if its an easy fix rip it -->

### 1C. Empty Vessel List Guard

**File:** `app/add-issue.tsx:44-48`

If a user has no vessels assigned, `userVessels[0]?.id` returns `undefined`, and the form silently breaks.

```tsx
// Add early return if no vessels
const userVessels = getVesselsForUser(userId, userRole || 'crew');

if (userVessels.length === 0) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Report Issue' }} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <IconSymbol ios_icon_name="sailboat" android_material_icon_name="sailing" size={48} color={colors.textMuted} />
        <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No vessels assigned to your account. Contact your manager.
        </Text>
      </View>
    </View>
  );
}
```

<!-- good catch -->

Apply the same pattern to `app/add-document.tsx`, `app/add-supply-request.tsx`, `app/add-parts-request.tsx`, and `app/add-calendar-event.tsx`.

### 1D. Non-Null Assertion in add-document.tsx

**File:** `app/add-document.tsx:162-165`

Uses `selectedDocument!` (non-null assertion). The `validateForm()` check above should catch this, but a race condition or double-tap could bypass it.

```tsx
// Replace non-null assertions with safe access + early return
const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!selectedDocument) return; // Belt and suspenders

  setIsSubmitting(true);
  try {
    addDocument({
      // ... now safe to use selectedDocument directly
      fileUri: selectedDocument.uri,
      fileName: selectedDocument.name,
      fileSize: selectedDocument.size || 0,
      fileType: selectedDocument.mimeType || 'application/octet-stream',
      // ...
    });
```

<!-- i think this pattern shows up a lot throughout the app -->

---

## 2. Screen Completion (Detail Screens)

### 2A. Issue Detail — Add Photo Attachments Display

**File:** `app/issue-detail.tsx`

Issue detail shows comments but not photo attachments from the issue report. If someone adds photos when creating an issue, they're stored but never displayed.

```tsx
// Add after the description section, before the card:
{issue.attachments.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      Attachments ({issue.attachments.length})
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {issue.attachments.map((att) => (
          <View key={att.id} style={styles.attachmentThumb}>
            {att.type === 'image' ? (
              <Image
                source={{ uri: att.uri }}
                style={{ width: 120, height: 120, borderRadius: 8 }}
              />
            ) : (
              <View style={styles.videoThumb}>
                <IconSymbol
                  ios_icon_name="play.circle.fill"
                  android_material_icon_name="play-circle"
                  size={32}
                  color={colors.text}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
)}
```

<!-- good catch, fix this if easy -->

### 2B. Issue Detail — Add Assignment Action

Managers can change status but can't assign the issue to anyone. Add an "Assign" action.

```tsx
// Add inside the Actions section for managers:
{!issue.assignedToName && (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: colors.accent }]}
    onPress={() => {
      updateIssue(issue.id, {
        assignedTo: userId,
        assignedToName: userName,
      });
      Alert.alert("Assigned", `Issue assigned to ${userName}`);
    }}
  >
    <Text style={styles.actionButtonText}>Assign to Me</Text>
  </TouchableOpacity>
)}
```

<!-- good catch, fix this if easy -->


### 2C. Vessel Detail — Add Vessel Info Card

**File:** `app/vessel-detail.tsx`

Currently shows name, location, status, and linked entities. Missing: crew count, owner/manager info, and basic vessel specs. Add a summary card.

```tsx
// Add after the titleSection, before activeTasks:
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Vessel Info</Text>
  <View style={styles.infoCard}>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Crew Members</Text>
      <Text style={styles.infoValue}>{vessel.crewCount}</Text>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Status</Text>
      <Text style={[styles.infoValue, {
        color: vessel.status === 'active' ? colors.success : colors.warning
      }]}>
        {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
      </Text>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Location</Text>
      <Text style={styles.infoValue}>{vessel.location}</Text>
    </View>
  </View>
</View>

// Add stats row showing counts:
<View style={styles.statsRow}>
  <StatCard label="Tasks" value={vesselTasks.length.toString()} color={colors.accent} />
  <StatCard label="Issues" value={vesselIssues.length.toString()} color={colors.warning} />
  <StatCard label="Supplies" value={vesselSupplies.length.toString()} color={colors.success} />
  <StatCard label="Docs" value={vesselDocs.length.toString()} color={colors.textSecondary} />
</View>
```

<!-- good catch, fix this if easy -->


### 2D. Calendar Event Detail — Handle All Statuses

**File:** `app/calendar-event-detail.tsx:221`

Action buttons only show for `status === 'scheduled'`. Once completed or cancelled, there's no way to re-open or view history. Add a status indicator and undo option.

```tsx
// Replace the status-conditional actions section:
{event.status === 'scheduled' && (
  <View style={styles.actions}>
    {/* existing Complete and Cancel buttons */}
  </View>
)}

{event.status === 'completed' && (
  <View style={styles.actions}>
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
      onPress={() => {
        updateCalendarEvent(event.id, { status: 'scheduled' });
        Alert.alert('Reopened', 'Event has been rescheduled.');
      }}
    >
      <Text style={[styles.actionButtonText, { color: colors.text }]}>Reopen Event</Text>
    </TouchableOpacity>
  </View>
)}

{event.status === 'cancelled' && (
  <View style={styles.actions}>
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
      onPress={() => {
        updateCalendarEvent(event.id, { status: 'scheduled' });
        Alert.alert('Restored', 'Event has been restored.');
      }}
    >
      <Text style={[styles.actionButtonText, { color: colors.text }]}>Restore Event</Text>
    </TouchableOpacity>
  </View>
)}
```
<!-- this seems a little complicted for somethign thats not that big a win. If its not a big user win, cut this -->

### 2E. Supply Detail — Add Status Progression for Non-Pending

**File:** `app/supply-detail.tsx`

Once a request is approved, there are no further actions. Managers should be able to mark it as "Ordered" and then "Received" to complete the lifecycle.

```tsx
// Add after the existing approve/deny section:
{(userRole === "owner" || userRole === "manager") && request.status === "approved" && (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: colors.accent, marginTop: 16 }]}
    onPress={() => {
      updateSupplyRequest(request.id, { status: 'ordered' });
      Alert.alert("Updated", "Supply request marked as ordered.");
    }}
  >
    <Text style={styles.actionButtonText}>Mark as Ordered</Text>
  </TouchableOpacity>
)}

{(userRole === "owner" || userRole === "manager") && request.status === "ordered" && (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: colors.success, marginTop: 16 }]}
    onPress={() => {
      updateSupplyRequest(request.id, {
        status: 'received',
        receivedAt: new Date(),
      });
      Alert.alert("Updated", "Supply request marked as received.");
    }}
  >
    <Text style={styles.actionButtonText}>Mark as Received</Text>
  </TouchableOpacity>
)}
```

<!-- implement if simple -->

---

## 3. Mock Data Enrichment

The current seed data is minimal (3 vessels, 3 tasks, 2 issues). During a demo, lists look empty. Bulk up the mock data in `contexts/DataContext.tsx`.

### 3A. Add More Realistic Data

Add to initial state in DataContext:

- **Maintenance tasks:** Add 5-7 more with varied statuses (some completed with history, some overdue, some waiting on parts).
- **Issues:** Add 3-4 more (one resolved, one in-progress, one with comments already).
- **Supply requests:** Add 2-3 more in different lifecycle stages (ordered, received, denied).
- **Documents:** Add 3-4 more across different categories (warranty, manual, invoice) so the documents tab doesn't look sparse.
- **Calendar events:** Already has 5, which is fine.
- **Expenses:** Add 4-5 more across different categories so the analytics charts have real-looking data.

<!-- implement if simple -->


### 3B. Pre-populate Issue Comments

The existing issues have empty comment arrays. Add 1-2 comments to each so the comment section on issue-detail looks alive.

```tsx
// In the issues initial state, add comments:
comments: [
  {
    id: 'c1',
    userId: 'manager1',
    userName: 'Sarah Johnson',
    userRole: 'manager',
    text: 'Inspected the area. Will need to schedule a repair crew for next week.',
    attachments: [],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
],
```

<!-- implement if simple -->


---

## 4. Empty State Screens

When a list has zero items, it should show a helpful empty state, not a blank screen.

### 4A. Standardized Empty State Component

Create a reusable component:

```tsx
// components/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface EmptyStateProps {
  ios_icon_name: string;
  android_material_icon_name: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ ios_icon_name, android_material_icon_name, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconSymbol
        ios_icon_name={ios_icon_name}
        android_material_icon_name={android_material_icon_name}
        size={48}
        color={colors.textMuted}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

<!-- implement if simple -->


### 4B. Apply to All List Screens

Add empty states to these tab screens when the filtered list is empty:

- **Maintenance tab:** "No maintenance tasks. Tap + to create one."
- **Issues tab:** "No issues reported. All clear."
- **Supplies tab:** "No supply requests."
- **Documents tab:** "No documents uploaded yet."
- **Calendar tab:** "No upcoming events."

<!-- implement if simple -->


---

## 5. Demo Unused Screens Cleanup

### 5A. Remove Demo Modal Screens

**Files to remove or make unreachable:**
- `app/modal.tsx`
- `app/formsheet.tsx`
- `app/transparent-modal.tsx`

These are Expo Router boilerplate demos. If they're reachable from anywhere (deep link, etc.), they should either be deleted or have their routes removed from `_layout.tsx`.


<!-- def delete -->

### 5B. Forgot Password Screen

**File:** `app/forgot-password.tsx`

Verify it shows a clean "check your email" message after submission and navigates back to login. It should not actually try to call a backend.

<!-- implement if simple -->
---

## 6. Analytics Screen Hardening

**File:** `app/analytics.tsx`

### 6A. Chart Crash Prevention

`react-native-chart-kit` can crash when data arrays are empty or contain only zeros. The existing `length > 0` checks help, but the charts still crash if all values are 0.

```tsx
// Before rendering LineChart, ensure at least one non-zero value:
const hasExpenseData = expensesByMonth.datasets[0].data.some(v => v > 0);

// Then use hasExpenseData instead of length > 0 in the conditional
{hasExpenseData ? (
  <LineChart ... />
) : (
  <Text style={styles.noDataText}>No expense data available</Text>
)}
```

Apply the same pattern to BarChart and PieChart.

<!-- implement if simple -->


### 6B. Hardcoded "2.3 days" Response Time

**File:** `app/analytics.tsx:339`

This is a hardcoded value. For a demo it's fine, but compute it from mock data so it's consistent:

```tsx
const avgResponseTime = useMemo(() => {
  const resolved = issues.filter(i => i.resolvedAt);
  if (resolved.length === 0) return '—';
  const totalDays = resolved.reduce((sum, i) => {
    const diff = new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime();
    return sum + diff / (1000 * 60 * 60 * 24);
  }, 0);
  return (totalDays / resolved.length).toFixed(1) + ' days';
}, [issues]);
```

<!-- implement if simple -->


---

## 7. Layout & Cross-Platform Checks

### 7A. Safe Area Handling

Verify every screen wraps content properly for:
- iPhone notch/Dynamic Island
- Android status bar
- Bottom home indicator

The root `_layout.tsx` should handle this, but verify each tab screen doesn't have content hidden behind the tab bar.

<!-- implement if simple -->


### 7B. Keyboard Avoidance on Forms

All modal form screens (`add-*.tsx`) use ScrollView. Verify:
- Keyboard doesn't cover input fields
- Submit button is accessible when keyboard is up
- `paddingBottom: 120` in `scrollContent` should handle this, but test on small screens (iPhone SE, Android compact)

<!-- implement if simple -->


### 7C. Dark Mode Consistency

The app uses a custom dark color palette (`colors` from `commonStyles.ts`). Verify:
- No hardcoded white/black text colors that break on either theme
- All `borderColor`, `backgroundColor`, `color` references use the `colors` object
- Status bar style matches the dark theme

<!-- skip dark mode and remove all references to dark mode -->

---

## 8. Walkthrough Script (QA Checklist)

Test every one of these paths on physical iOS and Android:

### Auth Flow
- [ ] App opens → splash → login screen
- [ ] Quick login as Owner → Owner dashboard
- [ ] Quick login as Manager → Manager dashboard
- [ ] Quick login as Crew → Crew dashboard
- [ ] Sign out → back to login
- [ ] Manager login screen works

### Owner Path
- [ ] Owner dashboard loads with vessels, stats
- [ ] Tap vessel → vessel-detail shows info, linked items
- [ ] Tap "Analytics" → charts render without crash
- [ ] Documents tab → list renders
- [ ] Tap document → document-detail shows preview (not dead button)
- [ ] Add document → form works, submit succeeds
- [ ] Calendar tab → events visible
- [ ] Tap event → event-detail loads
- [ ] Add calendar event → form works
- [ ] Maintenance tab → list renders, tap into detail
- [ ] Profile → settings load, sign out works

### Manager Path
- [ ] Manager dashboard loads
- [ ] Pending approvals section populated
- [ ] Tap supply request → supply-detail → approve/deny works
- [ ] Issues tab → list renders
- [ ] Tap issue → detail shows, add comment works
- [ ] Start Work / Mark Resolved buttons work
- [ ] Maintenance tab → tasks list, tap into detail
- [ ] Change status buttons work
- [ ] Complete task form works
- [ ] Add maintenance task → form submits
- [ ] Supplies tab → list renders, add supply request works
- [ ] Calendar tab → events visible, add event works

### Crew Path
- [ ] Crew dashboard loads with assigned tasks
- [ ] Tap assigned task → maintenance-detail
- [ ] Complete task with notes and cost
- [ ] Issues tab → list shows own reported issues
- [ ] Report new issue → form with photo attachment
- [ ] Supplies tab → list shows own requests
- [ ] Add supply request → form submits
- [ ] Calendar tab → shows relevant events

### Edge Cases
- [ ] Rotate device — layouts don't break
- [ ] Pull to refresh (if implemented) — doesn't crash
- [ ] Navigate deep (3+ screens) then back — no stack issues
- [ ] Open modal, dismiss, open again — no state bleed
- [ ] Type in search → results filter correctly
- [ ] Empty lists show empty state, not blank screen

<!-- this shoudl be a different section -->