# Vessel Central — Demo Polish Plan

**Goal:** Take the existing prototype and make it a polished, crash-free demo. Not production. Something you can hand an investor or partner, let them tap through every screen, and nothing breaks.

---

## 1. Crash Fixes (Critical)

### 1A. Document Viewer — Dead Button

**File:** `app/document-detail.tsx:41-46`

The "Open Document" button shows a placeholder alert. During a demo, this is a dead end that looks broken.

**Fix:** Remove `handleOpenFile` and the "Open Document" button. Replace with a simple inline preview section and Download/Share actions. Keep the implementation minimal — a styled card with the file icon, file name, and type is enough to sell "this is a document viewer."

```tsx
// Remove handleOpenFile entirely. Replace the <TouchableOpacity> "Open Document"
// button at the bottom of the ScrollView with:

<View style={styles.previewCard}>
  <View style={styles.previewIconRow}>
    <IconSymbol
      ios_icon_name="doc.text.fill"
      android_material_icon_name="picture-as-pdf"
      size={40}
      color={colors.accent}
    />
  </View>
  <Text style={styles.previewFileName}>{doc.fileName}</Text>
  <Text style={styles.previewFileType}>
    {doc.fileType.toUpperCase()} · {formatFileSize(doc.fileSize)}
  </Text>
</View>

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

Styles needed: `previewCard` (centered card with padding, background, border radius), `previewIconRow`, `previewFileName`, `previewFileType`, `actionRow` (flexDirection row, gap), `actionButton` (flex 1, row, centered, padding, borderRadius), `actionButtonText`.

### 1B. Null Safety — Auth Values in Callbacks

Quick fix. Add `if (!userId || !userName) return;` guards to two handlers:

- **`app/supply-detail.tsx:71`** — `handleApprove`: add guard before the `Alert.alert` call
- **`app/issue-detail.tsx:77`** — `handleAddComment`: add guard before `addIssueComment`

Two lines each. No UI changes.

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

Apply the same pattern to `app/add-document.tsx`, `app/add-supply-request.tsx`, `app/add-parts-request.tsx`, and `app/add-calendar-event.tsx`.

### 1D. Non-Null Assertion Fix

**Audit results:** Only one file uses non-null assertions — `app/add-document.tsx:162-165` with four `selectedDocument!` usages. No other `!.` assertions exist across `app/`.

**Fix:** Add `if (!selectedDocument) return;` at the top of `handleSubmit`, after `validateForm()`. Then remove all four `!` operators. TypeScript narrows the type after the guard.

```tsx
const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!selectedDocument) return;

  setIsSubmitting(true);
  try {
    addDocument({
      // selectedDocument is now narrowed — no ! needed
      fileUri: selectedDocument.uri,
      fileName: selectedDocument.name,
      fileSize: selectedDocument.size || 0,
      fileType: selectedDocument.mimeType || 'application/octet-stream',
      // ...
    });
```

---

## 2. Screen Completion (Detail Screens)

### 2A. Issue Detail — Add Photo Attachments Display

**File:** `app/issue-detail.tsx`

Issue detail shows comments but not photo attachments from the issue report. If someone adds photos when creating an issue, they're stored but never displayed. Simple fix — add a horizontal scroll of thumbnails.

```tsx
// Add after the description section, before the details card:
{issue.attachments.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      Attachments ({issue.attachments.length})
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {issue.attachments.map((att) => (
          <View key={att.id} style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.card }}>
            {att.type === 'image' ? (
              <Image source={{ uri: att.uri }} style={{ width: 120, height: 120 }} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <IconSymbol ios_icon_name="play.circle.fill" android_material_icon_name="play-circle" size={32} color={colors.text} />
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
)}
```

Add `Image` and `ScrollView` to imports.

### 2B. Issue Detail — Add Assignment Action

Managers can change status but can't assign the issue to anyone. Simple addition inside the existing Actions section.

```tsx
// Add inside the Actions section for managers, before the status change buttons:
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

### 2C. Vessel Detail — Add Stats Row

**File:** `app/vessel-detail.tsx`

The stats row style already exists in the stylesheet but isn't used. Add a row of StatCard components after the title section to show vessel activity at a glance.

```tsx
// Add after the titleSection, before activeTasks:
<View style={styles.statsRow}>
  <StatCard label="Tasks" value={vesselTasks.length.toString()} color={colors.accent} />
  <StatCard label="Issues" value={vesselIssues.length.toString()} color={colors.warning} />
  <StatCard label="Supplies" value={vesselSupplies.length.toString()} color={colors.success} />
  <StatCard label="Docs" value={vesselDocs.length.toString()} color={colors.textSecondary} />
</View>
```

`StatCard` is already imported.

### 2D. Supply Detail — Add Status Progression

**File:** `app/supply-detail.tsx`

Once a request is approved, there are no further actions. Add buttons to advance through the lifecycle: Approved → Ordered → Received.

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
      updateSupplyRequest(request.id, { status: 'received', receivedAt: new Date() });
      Alert.alert("Updated", "Supply request marked as received.");
    }}
  >
    <Text style={styles.actionButtonText}>Mark as Received</Text>
  </TouchableOpacity>
)}
```

Need to pull `updateSupplyRequest` from `useData()` (currently only `approveSupplyRequest` and `denySupplyRequest` are destructured).

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

### 4B. Apply to All List Screens

Add empty states to these tab screens when the filtered list is empty:

- **Maintenance tab:** "No maintenance tasks. Tap + to create one."
- **Issues tab:** "No issues reported. All clear."
- **Supplies tab:** "No supply requests."
- **Documents tab:** "No documents uploaded yet."
- **Calendar tab:** "No upcoming events."

---

## 5. Demo Unused Screens Cleanup

### 5A. Remove Demo Modal Screens

Delete these files:

- `app/modal.tsx`
- `app/formsheet.tsx`
- `app/transparent-modal.tsx`

Also remove any corresponding route definitions from `app/_layout.tsx` if present.

### 5B. Forgot Password Screen

**File:** `app/forgot-password.tsx`

Verify it shows a clean "check your email" message after submission and navigates back to login. It should not actually try to call a backend.

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

### 6B. Hardcoded "2.3 days" Response Time

**File:** `app/analytics.tsx:339`

Compute from mock data instead of hardcoding:

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

---

## 7. Layout & Cross-Platform Checks

### 7A. Safe Area Handling

Verify every screen wraps content properly for:

- iPhone notch/Dynamic Island
- Android status bar
- Bottom home indicator

The root `_layout.tsx` should handle this, but verify each tab screen doesn't have content hidden behind the tab bar.

### 7B. Keyboard Avoidance on Forms

All modal form screens (`add-*.tsx`) use ScrollView. Verify:

- Keyboard doesn't cover input fields
- Submit button is accessible when keyboard is up
- `paddingBottom: 120` in `scrollContent` should handle this, but test on small screens (iPhone SE, Android compact)

---

## Todo List

### Phase 1 — Crash Fixes

- [ ] **1A-1** Remove `handleOpenFile` function from `app/document-detail.tsx`
- [ ] **1A-2** Remove "Open Document" `<TouchableOpacity>` button from `app/document-detail.tsx`
- [ ] **1A-3** Add preview card (icon, filename, file type/size) in its place
- [ ] **1A-4** Add Download and Share action buttons below the preview card
- [ ] **1A-5** Add new styles: `previewCard`, `previewIconRow`, `previewFileName`, `previewFileType`, `actionRow`, `actionButton`, `actionButtonText`
- [ ] **1B-1** Add `if (!userId || !userName) return;` guard to `handleApprove` in `app/supply-detail.tsx`
- [ ] **1B-2** Add `if (!userId || !userName) return;` guard to `handleAddComment` in `app/issue-detail.tsx`
- [ ] **1C-1** Add empty vessel list early return to `app/add-issue.tsx`
- [ ] **1C-2** Add empty vessel list early return to `app/add-document.tsx`
- [ ] **1C-3** Add empty vessel list early return to `app/add-supply-request.tsx`
- [ ] **1C-4** Add empty vessel list early return to `app/add-parts-request.tsx`
- [ ] **1C-5** Add empty vessel list early return to `app/add-calendar-event.tsx`
- [ ] **1D-1** Add `if (!selectedDocument) return;` guard to `handleSubmit` in `app/add-document.tsx`
- [ ] **1D-2** Remove all four `!` operators from `selectedDocument!.uri`, `.name`, `.size`, `.mimeType`

### Phase 2 — Screen Completion

- [ ] **2A-1** Add `Image` and `ScrollView` to imports in `app/issue-detail.tsx`
- [ ] **2A-2** Add horizontal attachment thumbnail scroll after description section in `app/issue-detail.tsx`
- [ ] **2B-1** Add "Assign to Me" button inside Actions section in `app/issue-detail.tsx` (only when unassigned, manager/owner role)
- [ ] **2C-1** Add `StatCard` stats row after title section in `app/vessel-detail.tsx` (Tasks, Issues, Supplies, Docs counts)
- [ ] **2D-1** Destructure `updateSupplyRequest` from `useData()` in `app/supply-detail.tsx`
- [ ] **2D-2** Add "Mark as Ordered" button for approved requests in `app/supply-detail.tsx`
- [ ] **2D-3** Add "Mark as Received" button for ordered requests in `app/supply-detail.tsx`

### Phase 3 — Mock Data Enrichment

- [ ] **3A-1** Add 5-7 maintenance tasks to initial state in `contexts/DataContext.tsx` (varied statuses: completed, overdue, waiting_on_parts, open, in_progress)
- [ ] **3A-2** Add 3-4 issues to initial state (one resolved with `resolvedAt`, one in_progress, one with pre-populated comments)
- [ ] **3A-3** Add 2-3 supply requests to initial state (one ordered, one received, one denied with `deniedReason`)
- [ ] **3A-4** Add 3-4 documents to initial state across categories (warranty, manual, invoice, receipt)
- [ ] **3A-5** Add 4-5 expenses to initial state across categories (Fuel, Docking, Insurance, Repairs, Crew) so analytics charts render well
- [ ] **3B-1** Add 1-2 comments to existing issue id `'1'` (Deck Leak)
- [ ] **3B-2** Add 1-2 comments to existing issue id `'2'` (Navigation Light Malfunction)

### Phase 4 — Empty States

- [ ] **4A-1** Create `components/EmptyState.tsx` with icon, title, subtitle props
- [ ] **4B-1** Add empty state to maintenance tab list screen
- [ ] **4B-2** Add empty state to issues tab list screen
- [ ] **4B-3** Add empty state to supplies tab list screen
- [ ] **4B-4** Add empty state to documents tab list screen
- [ ] **4B-5** Add empty state to calendar tab screen

### Phase 5 — Cleanup

- [ ] **5A-1** Delete `app/modal.tsx`
- [ ] **5A-2** Delete `app/formsheet.tsx`
- [ ] **5A-3** Delete `app/transparent-modal.tsx`
- [ ] **5A-4** Remove any corresponding route definitions from `app/_layout.tsx`
- [ ] **5B-1** Verify `app/forgot-password.tsx` shows "check your email" message and navigates back — fix if broken

### Phase 6 — Analytics Hardening

- [ ] **6A-1** Add `hasExpenseData` check (`.some(v => v > 0)`) before LineChart render in `app/analytics.tsx`
- [ ] **6A-2** Add same zero-value check before BarChart render
- [ ] **6A-3** Add same zero-value check before PieChart render
- [ ] **6B-1** Replace hardcoded "2.3 days" with computed `avgResponseTime` from resolved issues

### Phase 7 — Layout Verification

- [ ] **7A-1** Verify safe area handling on all tab screens (no content behind notch or tab bar)
- [ ] **7B-1** Verify keyboard avoidance on `app/add-maintenance-task.tsx`
- [ ] **7B-2** Verify keyboard avoidance on `app/add-issue.tsx`
- [ ] **7B-3** Verify keyboard avoidance on `app/add-supply-request.tsx`
- [ ] **7B-4** Verify keyboard avoidance on `app/add-parts-request.tsx`
- [ ] **7B-5** Verify keyboard avoidance on `app/add-document.tsx`
- [ ] **7B-6** Verify keyboard avoidance on `app/add-calendar-event.tsx`