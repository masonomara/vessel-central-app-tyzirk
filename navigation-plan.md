# Navigation Plan

Based on the actual codebase. Every code snippet references real files at real line numbers.

---

## Phase 0: Enhance PressableCard for Universal Use

`PressableCard` (`components/PressableCard.tsx`) bakes in card-level styles (background, border, padding, borderRadius). This is great for dashboard cards but prevents reuse in contexts that already define their own visual container (detail rows, feed items, inline elements).

**Add a `variant` prop** so every tappable element in the app can use PressableCard for consistent press animation + haptics:

**Current** (`components/PressableCard.tsx:12-17`):

```tsx
interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}
```

**Fix:**

```tsx
interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  variant?: "card" | "ghost";
}
```

Update the render (`components/PressableCard.tsx:50-54`):

```tsx
<AnimatedPressable
  onPress={onPress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  style={[variant !== "ghost" && styles.container, animatedStyle, style]}
>
  {children}
</AnimatedPressable>
```

- `variant="card"` (default): Current behavior — background, border, padding, borderRadius.
- `variant="ghost"`: No visual container — just the animated scale + haptics. The caller supplies all visual styling through `style` or children.

### Files changed:

- `components/PressableCard.tsx` — add `variant` prop, conditionally apply container styles

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

Three card types in `app/(tabs)/manager/index.tsx` are plain `View`s with no press handling. Replace each `View` with `PressableCard` to get animated press + haptics for free.

### 3A. Fleet Status Vessel Cards

**Current** (`app/(tabs)/manager/index.tsx:206`):

```tsx
<View key={vessel.id} style={styles.vesselCard}>
```

**Fix** — replace `View` with `PressableCard`:

```tsx
<PressableCard
  key={vessel.id}
  style={styles.vesselCard}
  onPress={() =>
    router.push({ pathname: "/vessel-detail", params: { id: vessel.id } })
  }
>
  {/* ...existing children... */}
</PressableCard>
```

### 3B. Upcoming Maintenance Cards

**Current** (`app/(tabs)/manager/index.tsx:348`):

```tsx
<View key={item.id} style={styles.maintenanceCard}>
```

**Fix:**

```tsx
<PressableCard
  key={item.id}
  style={styles.maintenanceCard}
  onPress={() =>
    router.push({ pathname: "/maintenance-detail", params: { id: item.id } })
  }
>
  {/* ...existing children... */}
</PressableCard>
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

**Fix** — add `onItemPress` prop and wrap items in `PressableCard`:

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
<PressableCard
  style={styles.eventCard}
  onPress={() => onItemPress?.('issue', 'placeholder-id')}
>
  {/* ...existing children... */}
</PressableCard>
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

- `app/(tabs)/manager/index.tsx` — replace `View` with `PressableCard` on vessel + maintenance cards, pass `onItemPress` to `RealtimeFeed`
- `components/RealtimeFeed.tsx` — add `onItemPress` prop, replace `View` with `PressableCard` on items

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
    {/* ...checkbox icon... */}
  </TouchableOpacity>
  <PressableCard
    variant="ghost"
    style={styles.taskContent}
    onPress={() =>
      router.push({ pathname: "/maintenance-detail", params: { id: task.id } })
    }
  >
    {/* ...existing task content children... */}
  </PressableCard>
</View>
```

The outer wrapper changes from `TouchableOpacity` to `View`. The checkbox stays a plain `TouchableOpacity` (small tap target, no scale animation needed). The content area uses `PressableCard variant="ghost"` so it inherits card styling from the outer `View` while adding press animation.

### 4B. Vessel Cards

**Current** (`app/(tabs)/crew/index.tsx:94`):

```tsx
<View key={vessel.id} style={styles.vesselCard}>
```

**Fix:**

```tsx
<PressableCard
  key={vessel.id}
  style={styles.vesselCard}
  onPress={() =>
    router.push({ pathname: "/vessel-detail", params: { id: vessel.id } })
  }
>
  {/* ...existing children... */}
</PressableCard>
```

### 4C. Supply Request Cards

**Current** (`app/(tabs)/crew/index.tsx:196`):

```tsx
<View key={request.id} style={styles.supplyCard}>
```

**Fix:**

```tsx
<PressableCard
  key={request.id}
  style={styles.supplyCard}
  onPress={() =>
    router.push({ pathname: "/supply-detail", params: { id: request.id } })
  }
>
  {/* ...existing children... */}
</PressableCard>
```

### Files changed:

- `app/(tabs)/crew/index.tsx` — split task card touch targets (checkbox stays `TouchableOpacity`, content body becomes `PressableCard variant="ghost"`), replace vessel + supply `View`s with `PressableCard`

---

## Phase 5: Create Vessel Detail Screen

Multiple screens reference vessels but there's no detail screen for them. This screen reuses existing components (`StatCard`, `PressableCard`) and follows the same layout structure as `maintenance-detail.tsx` — `ScrollView` with section groups, consistent `sectionTitle` typography, and card-based content blocks.

### 5A. Register the Route

**Add to** `app/_layout.tsx` after line 113:

```tsx
<Stack.Screen name="vessel-detail" options={{ title: "Vessel Details" }} />
```

### 5B. Create the Screen

**New file:** `app/vessel-detail.tsx`

```tsx
import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { useData } from "@/contexts/DataContext";
import { IconSymbol } from "@/components/IconSymbol";
import { StatCard } from "@/components/StatCard";
import { PressableCard } from "@/components/PressableCard";

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
  const vesselSupplies = supplyRequests.filter(
    (s) => s.vesselId === vessel.id,
  );
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
        {/* Header — mirrors maintenance-detail titleSection pattern */}
        <View style={styles.titleSection}>
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
          <Text style={styles.title}>{vessel.name}</Text>
          <Text style={styles.subtitle}>{vessel.location}</Text>
          <View style={styles.badges}>
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
        </View>

        {/* Quick stats — reuses StatCard from owner dashboard */}
        <View style={styles.statsRow}>
          <StatCard
            icon="wrench.and.screwdriver.fill"
            androidIcon="build"
            iconColor={colors.warning}
            label="Active Tasks"
            value={activeTasks.length}
            onPress={() => router.push("/(tabs)/maintenance")}
          />
          <StatCard
            icon="exclamationmark.triangle.fill"
            androidIcon="warning"
            iconColor={colors.danger}
            label="Open Issues"
            value={openIssues.length}
            onPress={() => router.push("/(tabs)/issues")}
          />
        </View>

        {/* Navigable list sections — PressableCard for each item */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            {activeTasks.slice(0, 5).map((task) => (
              <PressableCard
                key={task.id}
                style={styles.listCard}
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
              </PressableCard>
            ))}
          </View>
        )}

        {openIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Issues</Text>
            {openIssues.slice(0, 5).map((issue) => (
              <PressableCard
                key={issue.id}
                style={styles.listCard}
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
              </PressableCard>
            ))}
          </View>
        )}

        {pendingSupplies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Supplies</Text>
            {pendingSupplies.slice(0, 5).map((req) => (
              <PressableCard
                key={req.id}
                style={styles.listCard}
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
              </PressableCard>
            ))}
          </View>
        )}

        {vesselDocs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {vesselDocs.slice(0, 5).map((doc) => (
              <PressableCard
                key={doc.id}
                style={styles.listCard}
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
              </PressableCard>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* Styles reuse the same naming conventions and values as maintenance-detail.tsx.
   Only vessel-specific additions (iconCircle, statsRow, listCard) are new. */
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.textSecondary, fontSize: 16 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  titleSection: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  badges: { flexDirection: "row", gap: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  listCard: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  listCardContent: { flex: 1 },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  listSubtext: { fontSize: 13, color: colors.textSecondary },
});
```

Key design decisions:
- **`StatCard` for quick stats** — the same component from the owner dashboard, with `onPress` to navigate to relevant tabs. No custom stat UI needed.
- **`PressableCard` for all list items** — gets animated press + haptics for free. The `listCard` style only adds `flexDirection`, `alignItems`, and `marginBottom` since PressableCard provides the card background, border, padding, and borderRadius.
- **Style names and values match `maintenance-detail.tsx`** — `container`, `scrollContent`, `section`, `sectionTitle`, `title`, `badges`, `statusBadge`, `statusText`, `errorText` all use the same naming and values.
- **No `TouchableOpacity` imports needed.**

### Files changed:

- `app/_layout.tsx` — register `vessel-detail` route
- `app/vessel-detail.tsx` — new file

---

## Phase 6: Add Cross-Entity Links in Detail Screens

All 5 detail screens display vessel names, person names, etc. as plain `Text`. Making these tappable creates a connected navigation web.

### 6A. Create a Reusable `LinkedDetailRow` Component

Uses `PressableCard variant="ghost"` for the tappable wrapper — no visual card chrome, just press animation + haptics when a `linkTo` is provided.

**New file:** `components/LinkedDetailRow.tsx`

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "./IconSymbol";
import { PressableCard } from "./PressableCard";

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
      <PressableCard variant="ghost" onPress={() => router.push(linkTo)}>
        {content}
      </PressableCard>
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

Replace the plain vessel `View` with `PressableCard variant="ghost"`:

```tsx
<PressableCard
  variant="ghost"
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
</PressableCard>
```

### Files changed:

- `components/LinkedDetailRow.tsx` — new shared component (uses `PressableCard variant="ghost"`)
- `app/maintenance-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/issue-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/supply-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/document-detail.tsx` — use `LinkedDetailRow` for vessel + person rows
- `app/calendar-event-detail.tsx` — make vessel name tappable via `PressableCard variant="ghost"`

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

**Fix** — replace navigable `View`s with `PressableCard variant="ghost"` (the existing `styles.statCard` already provides the visual container):

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
<PressableCard
  variant="ghost"
  style={styles.statCard}
  onPress={() => router.push('/(tabs)/maintenance')}
>
  <IconSymbol ... />
  <Text style={styles.statLabel}>Active Tasks</Text>
  <Text style={styles.statValue}>{...}</Text>
</PressableCard>

// Open Issues → issues tab
<PressableCard
  variant="ghost"
  style={styles.statCard}
  onPress={() => router.push('/(tabs)/issues')}
>
  <IconSymbol ... />
  <Text style={styles.statLabel}>Open Issues</Text>
  <Text style={styles.statValue}>{...}</Text>
</PressableCard>
```

Also wire the metric cards at the bottom (lines 296-344):

```tsx
// Completion Rate → maintenance tab
<PressableCard
  variant="ghost"
  style={styles.metricCard}
  onPress={() => router.push('/(tabs)/maintenance')}
>
  {/* ...existing Completion Rate content... */}
</PressableCard>

// Supply Requests → supplies tab
<PressableCard
  variant="ghost"
  style={styles.metricCard}
  onPress={() => router.push('/(tabs)/supplies')}
>
  {/* ...existing Supply Requests content... */}
</PressableCard>
```

### Files changed:

- `app/analytics.tsx` — replace navigable `View`s with `PressableCard variant="ghost"`

---

## Execution Order

| Phase                                  | Priority | Effort | Impact                             |
| -------------------------------------- | -------- | ------ | ---------------------------------- |
| 0 — Enhance PressableCard             | High     | Low    | Unlocks PressableCard everywhere   |
| 1 — Fix Owner Dashboard PressableCards | High     | Low    | Fixes 6 broken interactions        |
| 2 — Fix GlobalSearch                   | High     | Low    | Makes search actually useful       |
| 3 — Wire Manager Dashboard             | Medium   | Low    | 3 card types become navigable      |
| 4 — Wire Crew Dashboard                | Medium   | Medium | Crew can finally view task details |
| 5 — Create Vessel Detail               | Medium   | Medium | Unlocks vessel links everywhere    |
| 6 — Cross-Entity Links                 | Low      | Medium | Connects the full navigation web   |
| 7 — Analytics Stat Cards               | Low      | Low    | Dead-end screen becomes linked     |

Phase 0 is a prerequisite for Phases 3-7 (they depend on `PressableCard` being flexible enough). Phases 1-2 are quick wins that fix broken UX. Phase 5 should come before Phase 6 since cross-entity vessel links depend on the vessel-detail route existing.

---

## Full File Change Summary

| File                             | Action                                                                                  | Phases |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| `components/PressableCard.tsx`   | Edit — add `variant` prop (`"card"` / `"ghost"`)                                       | 0      |
| `app/(tabs)/owner/index.tsx`     | Edit — add 6 `onPress` handlers                                                         | 1      |
| `components/GlobalSearch.tsx`    | Edit — fix 4 switch cases                                                               | 2      |
| `app/(tabs)/manager/index.tsx`   | Edit — replace `View` with `PressableCard` on 2 card types, pass handler to RealtimeFeed | 3      |
| `components/RealtimeFeed.tsx`    | Edit — add `onItemPress` prop, replace `View` with `PressableCard`                      | 3      |
| `app/(tabs)/crew/index.tsx`      | Edit — split task touch targets, replace `View` with `PressableCard` on vessel + supply  | 4      |
| `app/_layout.tsx`                | Edit — register `vessel-detail` route                                                   | 5      |
| `app/vessel-detail.tsx`          | **New** — vessel detail screen (uses `StatCard` + `PressableCard`)                      | 5      |
| `components/LinkedDetailRow.tsx` | **New** — reusable linked row (uses `PressableCard variant="ghost"`)                    | 6      |
| `app/maintenance-detail.tsx`     | Edit — use `LinkedDetailRow`                                                            | 6      |
| `app/issue-detail.tsx`           | Edit — use `LinkedDetailRow`                                                            | 6      |
| `app/supply-detail.tsx`          | Edit — use `LinkedDetailRow`                                                            | 6      |
| `app/document-detail.tsx`        | Edit — use `LinkedDetailRow`                                                            | 6      |
| `app/calendar-event-detail.tsx`  | Edit — make vessel tappable via `PressableCard variant="ghost"`                         | 6      |
| `app/analytics.tsx`              | Edit — replace navigable `View`s with `PressableCard variant="ghost"`                   | 7      |

Total: 13 files edited, 2 new files created.

---

## Todo List

### Phase 0: Enhance PressableCard

- [ ] Add `variant?: "card" | "ghost"` to `PressableCardProps` interface in `components/PressableCard.tsx`
- [ ] Update `PressableCard` render to conditionally apply `styles.container` only when `variant !== "ghost"`
- [ ] Default `variant` to `"card"` so all existing usages are unaffected
- [ ] Smoke-test: existing PressableCards on owner dashboard still look and behave the same

### Phase 1: Fix Owner Dashboard PressableCards

- [ ] **1A** — Add `onPress` to vessel cards (`app/(tabs)/owner/index.tsx:239`) → navigates to `/vessel-detail`
- [ ] **1B** — Add `onPress` to performance card (`app/(tabs)/owner/index.tsx:347`) → navigates to `/analytics`
- [ ] **1C** — Add `onPress` to expense chart card (`app/(tabs)/owner/index.tsx:378`) → navigates to `/analytics`
- [ ] **1D** — Add `onPress` to next maintenance card (`app/(tabs)/owner/index.tsx:394`) → navigates to `/maintenance-detail`
- [ ] **1E** — Add `onPress` to pending approval cards (`app/(tabs)/owner/index.tsx:459`) → navigates to `/supply-detail`
- [ ] **1F** — Add `onPress` to activity log cards (`app/(tabs)/owner/index.tsx:500`) → routes by `log.type` to correct detail screen
- [ ] **1F prerequisite** — Verify `ActivityLog` type has `entityId` field; if not, add it to the type and seed data

### Phase 2: Fix GlobalSearch Navigation

- [ ] Update `handleResultPress` in `components/GlobalSearch.tsx` — `case "issue"` → `/issue-detail` with `result.id`
- [ ] Update `handleResultPress` — `case "supply"` → `/supply-detail` with `result.id`
- [ ] Update `handleResultPress` — `case "document"` → `/document-detail` with `result.id`
- [ ] Update `handleResultPress` — `case "vessel"` → `/vessel-detail` with `result.id`

### Phase 3: Wire Manager Dashboard Cards

- [ ] **3A** — Replace `View` with `PressableCard` on fleet status vessel cards (`app/(tabs)/manager/index.tsx:206`) → navigates to `/vessel-detail`
- [ ] **3B** — Replace `View` with `PressableCard` on upcoming maintenance cards (`app/(tabs)/manager/index.tsx:348`) → navigates to `/maintenance-detail`
- [ ] **3C** — Add `onItemPress` prop to `RealtimeFeedProps` interface in `components/RealtimeFeed.tsx`
- [ ] **3C** — Replace `View` with `PressableCard` on each event card in `RealtimeFeed` (`components/RealtimeFeed.tsx:21`), call `onItemPress` on press
- [ ] **3C** — Pass `onItemPress` handler from `app/(tabs)/manager/index.tsx:192` with type-based routing (issue/maintenance/supply)
- [ ] Add `PressableCard` import to `app/(tabs)/manager/index.tsx`
- [ ] Add `PressableCard` import to `components/RealtimeFeed.tsx`

### Phase 4: Wire Crew Dashboard Cards

- [ ] **4A** — Change outer task card wrapper from `TouchableOpacity` to `View` in `app/(tabs)/crew/index.tsx:132`
- [ ] **4A** — Extract checkbox into its own `TouchableOpacity` with `toggleTaskCompletion`
- [ ] **4A** — Wrap task content area in `PressableCard variant="ghost"` → navigates to `/maintenance-detail`
- [ ] **4B** — Replace `View` with `PressableCard` on vessel cards (`app/(tabs)/crew/index.tsx:94`) → navigates to `/vessel-detail`
- [ ] **4C** — Replace `View` with `PressableCard` on supply request cards (`app/(tabs)/crew/index.tsx:196`) → navigates to `/supply-detail`
- [ ] Add `PressableCard` import to `app/(tabs)/crew/index.tsx`

### Phase 5: Create Vessel Detail Screen

- [ ] **5A** — Register route: add `<Stack.Screen name="vessel-detail">` to `app/_layout.tsx` after line 113
- [ ] **5B** — Create `app/vessel-detail.tsx`
- [ ] Implement not-found state with "Vessel not found" message
- [ ] Implement header section (icon, vessel name, location, status badge) following `maintenance-detail` titleSection pattern
- [ ] Implement quick stats row using `StatCard` component (Active Tasks → maintenance tab, Open Issues → issues tab)
- [ ] Implement "Active Tasks" list section with `PressableCard` items → `/maintenance-detail`
- [ ] Implement "Open Issues" list section with `PressableCard` items → `/issue-detail`
- [ ] Implement "Pending Supplies" list section with `PressableCard` items → `/supply-detail`
- [ ] Implement "Documents" list section with `PressableCard` items → `/document-detail`
- [ ] Add styles following `maintenance-detail.tsx` naming conventions

### Phase 6: Cross-Entity Links in Detail Screens

- [ ] **6A** — Create `components/LinkedDetailRow.tsx` with `PressableCard variant="ghost"` wrapper
- [ ] **6B maintenance-detail** — Import `LinkedDetailRow` in `app/maintenance-detail.tsx`
- [ ] **6B maintenance-detail** — Replace vessel `detailItem` View (lines 113-124) with `<LinkedDetailRow linkTo="/vessel-detail">`
- [ ] **6B maintenance-detail** — Replace assigned-to `detailItem` View (lines 144-157) with `<LinkedDetailRow>` (no link, display only)
- [ ] **6B issue-detail** — Import `LinkedDetailRow` in `app/issue-detail.tsx`
- [ ] **6B issue-detail** — Replace vessel `DetailRow` with `<LinkedDetailRow linkTo="/vessel-detail">`
- [ ] **6B issue-detail** — Replace "Reported By" and "Assigned To" `DetailRow`s with `<LinkedDetailRow>` (display only)
- [ ] **6B supply-detail** — Import `LinkedDetailRow` in `app/supply-detail.tsx`
- [ ] **6B supply-detail** — Replace vessel `DetailRow` with `<LinkedDetailRow linkTo="/vessel-detail">`
- [ ] **6B supply-detail** — Replace "Requested By" and "Approved By" `DetailRow`s with `<LinkedDetailRow>` (display only)
- [ ] **6B document-detail** — Import `LinkedDetailRow` in `app/document-detail.tsx`
- [ ] **6B document-detail** — Replace vessel `DetailRow` with `<LinkedDetailRow linkTo="/vessel-detail">`
- [ ] **6B document-detail** — Replace "Uploaded By" `DetailRow` with `<LinkedDetailRow>` (display only)
- [ ] **6B calendar-event-detail** — Replace plain vessel `View` with `PressableCard variant="ghost"` → `/vessel-detail` in `app/calendar-event-detail.tsx`

### Phase 7: Wire Analytics Stat Cards

- [ ] Replace "Active Tasks" `View` with `PressableCard variant="ghost"` → `/(tabs)/maintenance` in `app/analytics.tsx`
- [ ] Replace "Open Issues" `View` with `PressableCard variant="ghost"` → `/(tabs)/issues` in `app/analytics.tsx`
- [ ] Replace "Completion Rate" metric card `View` with `PressableCard variant="ghost"` → `/(tabs)/maintenance`
- [ ] Replace "Supply Requests" metric card `View` with `PressableCard variant="ghost"` → `/(tabs)/supplies`
- [ ] Add `PressableCard` import to `app/analytics.tsx`

### Final Verification

- [ ] Test all owner dashboard cards navigate to correct detail screens
- [ ] Test GlobalSearch routes all 5 result types to their detail screens
- [ ] Test all manager dashboard cards are pressable and navigate correctly
- [ ] Test crew task cards: checkbox toggles completion, content area opens detail
- [ ] Test crew vessel + supply cards navigate correctly
- [ ] Test vessel-detail screen loads and all list items navigate to correct detail screens
- [ ] Test vessel links work from all 5 detail screens (maintenance, issue, supply, document, calendar-event)
- [ ] Test analytics stat/metric cards navigate to correct tabs
- [ ] Verify no regressions on existing PressableCard usages (owner dashboard)
