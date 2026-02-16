# Navigation Plan

Based on the actual codebase. Every code snippet references real files at real line numbers.

---

## Phase 1: Fix Broken PressableCards on Owner Dashboard

Six `PressableCard` instances in `app/(tabs)/owner/index.tsx` animate on tap (scale + haptics) but have no `onPress`, making them feel broken. This is the highest-impact fix.

### 1A. Vessel Cards → Vessel Detail (new screen)

**Current** (`app/(tabs)/owner/index.tsx:239`):

```tsx
<PressableCard key={vessel.id} style={styles.vesselCard}>
```

**Fix:**

```tsx
<PressableCard
  key={vessel.id}
  style={styles.vesselCard}
  onPress={() => router.push({ pathname: '/vessel-detail', params: { id: vessel.id } })}
>
```

### 1B. Performance Card → Analytics

**Current** (`app/(tabs)/owner/index.tsx:347`):

```tsx
<PressableCard style={styles.performanceCard}>
```

**Fix:**

```tsx
<PressableCard style={styles.performanceCard} onPress={() => router.push('/analytics')}>
```

### 1C. Expense Chart Card → Analytics

**Current** (`app/(tabs)/owner/index.tsx:378`):

```tsx
<PressableCard style={styles.expenseChartCard}>
```

**Fix:**

```tsx
<PressableCard style={styles.expenseChartCard} onPress={() => router.push('/analytics')}>
```

### 1D. Next Maintenance Card → Maintenance Detail

**Current** (`app/(tabs)/owner/index.tsx:394`):

```tsx
<PressableCard style={styles.maintenanceCard}>
```

**Fix:**

```tsx
<PressableCard
  style={styles.maintenanceCard}
  onPress={() => router.push({ pathname: '/maintenance-detail', params: { id: upcomingMaintenance.id } })}
>
```

### 1E. Pending Approval Cards → Supply Detail

**Current** (`app/(tabs)/owner/index.tsx:459`):

```tsx
<PressableCard key={approval.id} style={styles.approvalCard}>
```

**Fix:**

```tsx
<PressableCard
  key={approval.id}
  style={styles.approvalCard}
  onPress={() => router.push({ pathname: '/supply-detail', params: { id: approval.id } })}
>
```

### 1F. Activity Log Cards → Typed Detail Screens

**Current** (`app/(tabs)/owner/index.tsx:500`):

```tsx
<PressableCard key={log.id} style={styles.activityCard}>
```

**Fix** — route by `log.type`:

```tsx
<PressableCard
  key={log.id}
  style={styles.activityCard}
  onPress={() => {
    switch (log.type) {
      case 'maintenance':
      case 'task':
        router.push({ pathname: '/maintenance-detail', params: { id: log.entityId } });
        break;
      case 'issue':
        router.push({ pathname: '/issue-detail', params: { id: log.entityId } });
        break;
      case 'supply':
        router.push({ pathname: '/supply-detail', params: { id: log.entityId } });
        break;
      default:
        break;
    }
  }}
>
```

> **Note:** This requires `ActivityLog` items to carry an `entityId` field. Check the seed data / DataContext to confirm this exists. If not, it needs to be added to the type and seed data.

### Files changed:

- `app/(tabs)/owner/index.tsx` — add `onPress` to all 6 PressableCards

---

## Phase 2: Fix GlobalSearch Navigation

`components/GlobalSearch.tsx:50-74` only sends `maintenance` results to their detail screen. The other 4 types dump users on list screens.

**Current:**

```tsx
const handleResultPress = useCallback(
  (result: SearchResult) => {
    onClose();
    switch (result.type) {
      case "maintenance":
        router.push({
          pathname: "/maintenance-detail",
          params: { id: result.id },
        });
        break;
      case "issue":
        router.push("/(tabs)/issues"); // ← list, not detail
        break;
      case "supply":
        router.push("/(tabs)/supplies"); // ← list, not detail
        break;
      case "document":
        router.push("/(tabs)/documents"); // ← list, not detail
        break;
      case "vessel":
        router.push("/(tabs)/owner"); // ← dashboard, not detail
        break;
    }
  },
  [onClose],
);
```

**Fix:**

```tsx
const handleResultPress = useCallback(
  (result: SearchResult) => {
    onClose();
    switch (result.type) {
      case "maintenance":
        router.push({
          pathname: "/maintenance-detail",
          params: { id: result.id },
        });
        break;
      case "issue":
        router.push({ pathname: "/issue-detail", params: { id: result.id } });
        break;
      case "supply":
        router.push({ pathname: "/supply-detail", params: { id: result.id } });
        break;
      case "document":
        router.push({
          pathname: "/document-detail",
          params: { id: result.id },
        });
        break;
      case "vessel":
        router.push({ pathname: "/vessel-detail", params: { id: result.id } });
        break;
    }
  },
  [onClose],
);
```

### Files changed:

- `components/GlobalSearch.tsx` — update `handleResultPress` switch cases

---

## Phase 3: Wire Up Manager Dashboard Cards

Three card types in `app/(tabs)/manager/index.tsx` are plain `View`s with no press handling.

### 3A. Fleet Status Vessel Cards

**Current** (`app/(tabs)/manager/index.tsx:206`):

```tsx
<View key={vessel.id} style={styles.vesselCard}>
```

**Fix** — wrap in `TouchableOpacity`:

```tsx
<TouchableOpacity
  key={vessel.id}
  style={styles.vesselCard}
  activeOpacity={0.7}
  onPress={() =>
    router.push({ pathname: "/vessel-detail", params: { id: vessel.id } })
  }
>
  {/* ...existing children... */}
</TouchableOpacity>
```

<!-- here in throughout, try to use pressableCard componenet whenever possible, its designed to be very scalable and if not, modify it so it is -->

### 3B. Upcoming Maintenance Cards

**Current** (`app/(tabs)/manager/index.tsx:348`):

```tsx
<View key={item.id} style={styles.maintenanceCard}>
```

**Fix:**

```tsx
<TouchableOpacity
  key={item.id}
  style={styles.maintenanceCard}
  activeOpacity={0.7}
  onPress={() =>
    router.push({ pathname: "/maintenance-detail", params: { id: item.id } })
  }
>
  {/* ...existing children... */}
</TouchableOpacity>
```

### 3C. RealtimeFeed Activity Items

The `RealtimeFeed` component (`components/RealtimeFeed.tsx`) uses hardcoded data with plain `View`s. It needs an `onItemPress` callback.

**Current** (`components/RealtimeFeed.tsx:7-11`):

```tsx
interface RealtimeFeedProps {
  userId?: string;
  limit?: number;
  showUnreadOnly?: boolean;
}
```

**Fix** — add `onItemPress` prop and wrap items:

```tsx
interface RealtimeFeedProps {
  userId?: string;
  limit?: number;
  showUnreadOnly?: boolean;
  onItemPress?: (type: string, id: string) => void;
}

export function RealtimeFeed({ limit = 20, onItemPress }: RealtimeFeedProps) {
```

Each event card (`components/RealtimeFeed.tsx:21`) becomes:

```tsx
<TouchableOpacity
  style={styles.eventCard}
  activeOpacity={0.7}
  onPress={() => onItemPress?.('issue', 'placeholder-id')}
>
```

The parent (`app/(tabs)/manager/index.tsx:192`) passes the handler:

```tsx
<RealtimeFeed
  userId={userId}
  limit={5}
  onItemPress={(type, id) => {
    switch (type) {
      case "issue":
        router.push({ pathname: "/issue-detail", params: { id } });
        break;
      case "maintenance":
        router.push({ pathname: "/maintenance-detail", params: { id } });
        break;
      case "supply":
        router.push({ pathname: "/supply-detail", params: { id } });
        break;
    }
  }}
/>
```

### Files changed:

- `app/(tabs)/manager/index.tsx` — wrap vessel + maintenance cards in `TouchableOpacity`, pass `onItemPress` to `RealtimeFeed`
- `components/RealtimeFeed.tsx` — add `onItemPress` prop, wrap items in `TouchableOpacity`

---

## Phase 4: Wire Up Crew Dashboard Cards

### 4A. Task Cards — Add Detail Navigation

**Current** (`app/(tabs)/crew/index.tsx:132-185`):
Task cards use `TouchableOpacity` with `onPress={() => toggleTaskCompletion(task.id)}`. This only toggles completion. Crew can never view full task details.

**Fix** — split interaction: tap the card body to navigate, tap the checkbox to toggle:

```tsx
<View
  key={task.id}
  style={[
    styles.taskCard,
    task.status === "completed" && styles.taskCardCompleted,
  ]}
>
  <TouchableOpacity
    style={styles.taskCheckbox}
    onPress={() => toggleTaskCompletion(task.id)}
  >
    {task.status === "completed" ? (
      <IconSymbol
        ios_icon_name="checkmark.circle.fill"
        android_material_icon_name="check-circle"
        size={28}
        color={colors.success}
      />
    ) : (
      <IconSymbol
        ios_icon_name="circle"
        android_material_icon_name="radio-button-unchecked"
        size={28}
        color={colors.textSecondary}
      />
    )}
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.taskContent}
    activeOpacity={0.7}
    onPress={() =>
      router.push({ pathname: "/maintenance-detail", params: { id: task.id } })
    }
  >
    {/* ...existing task content children... */}
  </TouchableOpacity>
</View>
```

The outer wrapper changes from `TouchableOpacity` to `View`. The checkbox and content area become separate touch targets. Tapping the checkbox toggles completion; tapping anywhere else opens the detail screen.

### 4B. Vessel Cards

**Current** (`app/(tabs)/crew/index.tsx:94`):

```tsx
<View key={vessel.id} style={styles.vesselCard}>
```

**Fix:**

```tsx
<TouchableOpacity
  key={vessel.id}
  style={styles.vesselCard}
  activeOpacity={0.7}
  onPress={() =>
    router.push({ pathname: "/vessel-detail", params: { id: vessel.id } })
  }
>
  {/* ...existing children... */}
</TouchableOpacity>
```

### 4C. Supply Request Cards

**Current** (`app/(tabs)/crew/index.tsx:196`):

```tsx
<View key={request.id} style={styles.supplyCard}>
```

**Fix:**

```tsx
<TouchableOpacity
  key={request.id}
  style={styles.supplyCard}
  activeOpacity={0.7}
  onPress={() =>
    router.push({ pathname: "/supply-detail", params: { id: request.id } })
  }
>
  {/* ...existing children... */}
</TouchableOpacity>
```

### Files changed:

- `app/(tabs)/crew/index.tsx` — split task card touch targets, wrap vessel + supply cards in `TouchableOpacity`

---

## Phase 5: Create Vessel Detail Screen

Multiple screens reference vessels but there's no detail screen for them. This new screen aggregates vessel-specific data.

### 5A. Register the Route

**Add to** `app/_layout.tsx` after line 113:

```tsx
<Stack.Screen name="vessel-detail" options={{ title: "Vessel Details" }} />
```

### 5B. Create the Screen

**New file:** `app/vessel-detail.tsx`

```tsx
import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";

export default function VesselDetailScreen() {
  const { id } = useLocalSearchParams();
  const { vessels, maintenanceTasks, issues, supplyRequests, documents } =
    useData();

  const vessel = vessels.find((v) => v.id === id);

  if (!vessel) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Vessel Not Found" }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Vessel not found</Text>
        </View>
      </View>
    );
  }

  const vesselTasks = maintenanceTasks.filter((t) => t.vesselId === vessel.id);
  const vesselIssues = issues.filter((i) => i.vesselId === vessel.id);
  const vesselSupplies = supplyRequests.filter((s) => s.vesselId === vessel.id);
  const vesselDocs = documents.filter((d) => d.vesselId === vessel.id);

  const activeTasks = vesselTasks.filter((t) => t.status !== "completed");
  const openIssues = vesselIssues.filter((i) => i.status !== "completed");
  const pendingSupplies = vesselSupplies.filter((s) => s.status === "pending");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: vessel.name }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vessel header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <IconSymbol
              ios_icon_name="sailboat.fill"
              android_material_icon_name="sailing"
              size={40}
              color={colors.accent}
            />
          </View>
          <Text style={styles.vesselName}>{vessel.name}</Text>
          <Text style={styles.vesselLocation}>{vessel.location}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  (vessel.status === "active"
                    ? colors.success
                    : colors.warning) + "30",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    vessel.status === "active"
                      ? colors.success
                      : colors.warning,
                },
              ]}
            >
              {vessel.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{openIssues.length}</Text>
            <Text style={styles.statLabel}>Open Issues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{vessel.crewCount}</Text>
            <Text style={styles.statLabel}>Crew</Text>
          </View>
        </View>

        {/* Active maintenance tasks */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            {activeTasks.slice(0, 5).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.listCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/maintenance-detail",
                    params: { id: task.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{task.title}</Text>
                  <Text style={styles.listSubtext}>
                    {task.status.replace("_", " ")} · {task.priority}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Open issues */}
        {openIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Issues</Text>
            {openIssues.slice(0, 5).map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={styles.listCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/issue-detail",
                    params: { id: issue.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{issue.title}</Text>
                  <Text style={styles.listSubtext}>{issue.priority}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pending supply requests */}
        {pendingSupplies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Supplies</Text>
            {pendingSupplies.slice(0, 5).map((req) => (
              <TouchableOpacity
                key={req.id}
                style={styles.listCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/supply-detail",
                    params: { id: req.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{req.itemName}</Text>
                  <Text style={styles.listSubtext}>
                    ${req.estimatedCost} · {req.status}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Documents */}
        {vesselDocs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {vesselDocs.slice(0, 5).map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.listCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/document-detail",
                    params: { id: doc.id },
                  })
                }
              >
                <View style={styles.listCardContent}>
                  <Text style={styles.listTitle}>{doc.title}</Text>
                  <Text style={styles.listSubtext}>{doc.category}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  vesselName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  vesselLocation: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listCardContent: { flex: 1 },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  listSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
```

<!-- jsut to reiterate, anys creen should be as simpel as possible and shoudl try to emulate/resuse compoentns from existingscreens with simialr hierarchy -->

### Files changed:

- `app/_layout.tsx` — register `vessel-detail` route
- `app/vessel-detail.tsx` — new file

---

## Phase 6: Add Cross-Entity Links in Detail Screens

All 5 detail screens display vessel names, person names, etc. as plain `Text`. Making these tappable creates a connected navigation web.

### 6A. Create a Reusable `LinkedDetailRow` Component

**New file:** `components/LinkedDetailRow.tsx`

```tsx
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "./IconSymbol";

interface LinkedDetailRowProps {
  label: string;
  value: string;
  linkTo?: { pathname: string; params: Record<string, string> };
}

export function LinkedDetailRow({
  label,
  value,
  linkTo,
}: LinkedDetailRowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, linkTo && styles.valueLinked]}>
          {value}
        </Text>
        {linkTo && (
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={16}
            color={colors.accent}
          />
        )}
      </View>
    </View>
  );

  if (linkTo) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(linkTo)}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: { fontSize: 14, color: colors.textMuted },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  value: { fontSize: 14, color: colors.text, fontWeight: "500" },
  valueLinked: { color: colors.accent },
});
```

### 6B. Apply to Each Detail Screen

**`app/maintenance-detail.tsx`** — vessel detail item (lines 113-124) and assigned-to item (lines 144-157):

The current code renders these as plain `View` + `Text` inside the details grid. Replace the vessel item with `LinkedDetailRow`:

```tsx
// Replace the vessel <View style={styles.detailItem}> block with:
<LinkedDetailRow
  label="Vessel"
  value={task.vesselName}
  linkTo={{ pathname: "/vessel-detail", params: { id: task.vesselId } }}
/>;

// Replace the assigned-to block with:
{
  task.assignedToName && (
    <LinkedDetailRow label="Assigned To" value={task.assignedToName} />
  );
}
```

**`app/issue-detail.tsx`** — `DetailRow` calls (lines 145-157):

The screen uses a local `DetailRow` component. Replace vessel and person rows with `LinkedDetailRow`:

```tsx
// Inside the <View style={styles.card}> block:
<LinkedDetailRow
  label="Vessel"
  value={issue.vesselName}
  linkTo={{ pathname: '/vessel-detail', params: { id: issue.vesselId } }}
/>
<LinkedDetailRow label="Reported By" value={issue.reportedByName} />
<DetailRow label="Location" value={issue.location || 'Not specified'} />
<DetailRow label="Created" value={formatDate(new Date(issue.createdAt))} />
{issue.assignedToName && (
  <LinkedDetailRow label="Assigned To" value={issue.assignedToName} />
)}
```

**`app/supply-detail.tsx`** — `DetailRow` calls (lines 147-183):

```tsx
<LinkedDetailRow
  label="Vessel"
  value={request.vesselName}
  linkTo={{ pathname: '/vessel-detail', params: { id: request.vesselId } }}
/>
<LinkedDetailRow label="Requested By" value={request.requestedByName} />
{request.approvedByName && (
  <LinkedDetailRow label="Approved By" value={request.approvedByName} />
)}
```

**`app/document-detail.tsx`** — `DetailRow` calls (lines 112-128):

```tsx
<LinkedDetailRow
  label="Vessel"
  value={doc.vesselName}
  linkTo={{ pathname: '/vessel-detail', params: { id: doc.vesselId } }}
/>
<LinkedDetailRow label="Uploaded By" value={doc.uploadedByName} />
```

**`app/calendar-event-detail.tsx`** — vessel name (lines 143-151):

Replace the plain vessel `View` with a `TouchableOpacity`:

```tsx
<TouchableOpacity
  style={styles.detailRow}
  onPress={() =>
    router.push({ pathname: "/vessel-detail", params: { id: event.vesselId } })
  }
>
  <IconSymbol
    ios_icon_name="sailboat.fill"
    android_material_icon_name="directions-boat"
    size={20}
    color={colors.accent}
  />
  <Text style={[styles.detailText, { color: colors.accent }]}>
    {event.vesselName}
  </Text>
  <IconSymbol
    ios_icon_name="chevron.right"
    android_material_icon_name="chevron-right"
    size={16}
    color={colors.accent}
  />
</TouchableOpacity>
```

### Files changed:

- `components/LinkedDetailRow.tsx` — new shared component
- `app/maintenance-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/issue-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/supply-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/document-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/calendar-event-detail.tsx` — make vessel name tappable

---

## Phase 7: Wire Up Analytics Stat Cards

`app/analytics.tsx` has 4 stat cards (lines 179-226) that are plain `View`s. Users who tap "Active Tasks: 5" should land on the maintenance tab.

**Current** (`app/analytics.tsx:179`):

```tsx
<View style={styles.statCard}>
  <IconSymbol ... />
  <Text style={styles.statLabel}>Active Tasks</Text>
  <Text style={styles.statValue}>{...}</Text>
</View>
```

**Fix** — wrap each in `TouchableOpacity`:

```tsx
// Total Expenses — no link (already on analytics)
<View style={styles.statCard}>
  ...
</View>

// Avg Monthly — no link
<View style={styles.statCard}>
  ...
</View>

// Active Tasks → maintenance tab
<TouchableOpacity
  style={styles.statCard}
  activeOpacity={0.7}
  onPress={() => router.push('/(tabs)/maintenance')}
>
  <IconSymbol ... />
  <Text style={styles.statLabel}>Active Tasks</Text>
  <Text style={styles.statValue}>{...}</Text>
</TouchableOpacity>

// Open Issues → issues tab
<TouchableOpacity
  style={styles.statCard}
  activeOpacity={0.7}
  onPress={() => router.push('/(tabs)/issues')}
>
  <IconSymbol ... />
  <Text style={styles.statLabel}>Open Issues</Text>
  <Text style={styles.statValue}>{...}</Text>
</TouchableOpacity>
```

Also wire the metric cards at the bottom (lines 296-344):

```tsx
// Completion Rate → maintenance tab
<TouchableOpacity
  style={styles.metricCard}
  activeOpacity={0.7}
  onPress={() => router.push('/(tabs)/maintenance')}
>
  {/* ...existing Completion Rate content... */}
</TouchableOpacity>

// Supply Requests → supplies tab
<TouchableOpacity
  style={styles.metricCard}
  activeOpacity={0.7}
  onPress={() => router.push('/(tabs)/supplies')}
>
  {/* ...existing Supply Requests content... */}
</TouchableOpacity>
```

### Files changed:

- `app/analytics.tsx` — wrap relevant stat cards and metric cards in `TouchableOpacity`

---

## Execution Order

| Phase                                  | Priority | Effort | Impact                             |
| -------------------------------------- | -------- | ------ | ---------------------------------- |
| 1 — Fix Owner Dashboard PressableCards | High     | Low    | Fixes 6 broken interactions        |
| 2 — Fix GlobalSearch                   | High     | Low    | Makes search actually useful       |
| 3 — Wire Manager Dashboard             | Medium   | Low    | 3 card types become navigable      |
| 4 — Wire Crew Dashboard                | Medium   | Medium | Crew can finally view task details |
| 5 — Create Vessel Detail               | Medium   | Medium | Unlocks vessel links everywhere    |
| 6 — Cross-Entity Links                 | Low      | Medium | Connects the full navigation web   |
| 7 — Analytics Stat Cards               | Low      | Low    | Dead-end screen becomes linked     |

Phases 1-2 are quick wins that fix broken UX. Phase 5 should come before Phase 6 since cross-entity vessel links depend on the vessel-detail route existing.

---

## Full File Change Summary

| File                             | Action                                                                         | Phases |
| -------------------------------- | ------------------------------------------------------------------------------ | ------ |
| `app/(tabs)/owner/index.tsx`     | Edit — add 6 `onPress` handlers                                                | 1      |
| `components/GlobalSearch.tsx`    | Edit — fix 4 switch cases                                                      | 2      |
| `app/(tabs)/manager/index.tsx`   | Edit — wrap 2 card types in `TouchableOpacity`, pass handler to `RealtimeFeed` | 3      |
| `components/RealtimeFeed.tsx`    | Edit — add `onItemPress` prop, wrap items                                      | 3      |
| `app/(tabs)/crew/index.tsx`      | Edit — split task touch targets, wrap vessel + supply cards                    | 4      |
| `app/_layout.tsx`                | Edit — register `vessel-detail` route                                          | 5      |
| `app/vessel-detail.tsx`          | **New** — vessel detail screen                                                 | 5      |
| `components/LinkedDetailRow.tsx` | **New** — reusable linked row component                                        | 6      |
| `app/maintenance-detail.tsx`     | Edit — use `LinkedDetailRow`                                                   | 6      |
| `app/issue-detail.tsx`           | Edit — use `LinkedDetailRow`                                                   | 6      |
| `app/supply-detail.tsx`          | Edit — use `LinkedDetailRow`                                                   | 6      |
| `app/document-detail.tsx`        | Edit — use `LinkedDetailRow`                                                   | 6      |
| `app/calendar-event-detail.tsx`  | Edit — make vessel tappable                                                    | 6      |
| `app/analytics.tsx`              | Edit — wrap stats in `TouchableOpacity`                                        | 7      |

Total: 12 files edited, 2 new files created.
