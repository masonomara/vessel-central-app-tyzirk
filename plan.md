# Plan: Shared Index Screen Components

Goal: Extract shared primitives from `issues/index.tsx` (golden reference) into reusable components and shared styles. Then refactor `documents`, `supplies`, and `maintenance` to consume them, eliminating all style drift.

---

## Phase 1 — Expand `indexScreenStyles` in `commonStyles.ts`

Move all repeated per-screen styles into `indexScreenStyles`. These are currently duplicated with slight (incorrect) variations across 4 files.

**Add to `indexScreenStyles`:**

All values below are copied verbatim from `issues/index.tsx` local styles, verified against the file:

```ts
// Screen shell
// from issues:352-355 → styles.container
container: { flex: 1 },
// from issues:373-375 → styles.listContent
listContent: { backgroundColor: colors.surfaceTwo },
// from issues:458-460 → styles.listHeaderComponent
listHeaderComponent: { backgroundColor: colors.surfaceOne },

// Search bar
// from issues:356-367 → styles.searchContainer
searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.container,    // verified: issues uses colors.container (#ffffff)
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginHorizontal: 20,
  gap: 10,                              // verified: issues uses gap:10, not marginLeft:12 on input
  borderWidth: 1,
  borderColor: colors.borderSoft,       // verified: issues uses borderSoft, not border
},
// from issues:368-372 → styles.searchInput
searchInput: {
  flex: 1,
  fontSize: 16,
  color: colors.text,
},

// Card base
// from issues:390-398 → styles.issueCard
card: {
  borderWidth: 1,
  borderColor: colors.borderSoft,
  borderRadius: 16,
  padding: 16,
  backgroundColor: colors.surfaceOne,
  marginHorizontal: 20,
  marginBottom: 10,
},
// from issues:399-401 → styles.issueCardLast
cardLast: { marginBottom: 16 },

// Card internals
// from issues:418-421 → styles.topRow
topRow: { flexDirection: "row", gap: 16 },
// from issues:411-417 → styles.issueTitle
cardTitle: { fontSize: 15, lineHeight: 20, fontWeight: "500", color: colors.text, flex: 1 },
// from issues:422-427 → styles.issueDescription
cardDescription: { fontSize: 14, color: colors.textSecondary, lineHeight: 19, marginTop: 4 },
// from issues:461-467 → styles.taskMeta
metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
// from issues:453-457 → styles.metaText
metaText: { fontSize: 12, color: colors.textTertiary, lineHeight: 15 },
// from issues:441-452 → styles.priorityText
priorityText: {
  fontSize: 13, color: colors.text, fontWeight: "500",
  borderRadius: 4, padding: 4, paddingVertical: 0,
  lineHeight: 20, height: 20,
},

// Checkbox (issues + maintenance)
// from issues:403-409 → styles.completeButton
completeButton: {
  height: 20, width: 20, borderRadius: 100,
  alignItems: "center", justifyContent: "center",
},

// Offset for rows under checkbox (checkbox width 20 + gap 16 = 36)
// from issues:428-430 → styles.bottomRow
bottomRowWithCheckbox: { paddingLeft: 36 },
// from issues:461-467 → styles.taskMeta (marginLeft specifically)
metaRowWithCheckbox: { marginLeft: 36 },

// Empty state
// from issues:376-380 → styles.emptyState
emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
// from issues:381-385 → styles.emptyStateText
emptyStateText: { fontSize: 18, fontWeight: "600", color: colors.text },
// from issues:386-389 → styles.emptyStateSubtext
emptyStateSubtext: { fontSize: 14, color: colors.textSecondary },
```

**No new files.** This goes into the existing `indexScreenStyles` block in `styles/commonStyles.ts`.

---

## Phase 2 — Copy-paste canonical SectionList structure onto each screen

No `<IndexScreenShell>` component. Instead, directly apply the correct structure to each screen file. The pattern to replicate on every screen:

```tsx
// Outer wrapper
<View style={[indexScreenStyles.container, { backgroundColor: colors.surfaceOne }]}>
  <Stack.Screen options={{ title: "...", headerRight: () => (...) }} />

  <SectionList
    sections={sections}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    renderSectionHeader={renderSectionHeader}
    ListHeaderComponent={ListHeaderComponent}
    ListFooterComponent={
      <View style={{ backgroundColor: colors.surfaceOne, height: insets.bottom + 64 }} />
    }
    ListEmptyComponent={ListEmptyComponent}
    contentContainerStyle={[indexScreenStyles.listContent, { marginTop: topPadding }]}
    showsVerticalScrollIndicator={false}
    stickySectionHeadersEnabled={false}
  />
</View>
```

This is a direct copy from issues. Each screen gets this exact structure pasted in, replacing its current divergent version.

---

## Phase 3 — Create `<SearchBar>` component

**File:** `components/SearchBar.tsx`

```tsx
type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};
```

Renders the magnifying glass icon + TextInput using `indexScreenStyles.searchContainer` and `indexScreenStyles.searchInput`. `placeholderTextColor` hardcoded to `colors.textTertiary`.

---

## Phase 4 — Create `<FilterRow>` component

**File:** `components/FilterRow.tsx`

Generic horizontal chip row. Not vessel-specific — accepts any string array.

```tsx
type Props = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  labelForAll?: string;  // defaults to "All"
};
```

Horizontal FlatList using `indexScreenStyles.filterContainer/filterContent/filterChip/filterChipActive/filterChipText/filterChipTextActive`. Each screen passes its own options (currently always vessel names, but the component doesn't know or care).

---

## Phase 5 — Create `<CollapsibleSectionHeader>` component

**File:** `components/CollapsibleSectionHeader.tsx`

```tsx
type Props = {
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
};
```

Chevron (size 16) + title + count with " items" suffix. Fixes the 3 current variations (icon size 16/18/24, count format, missing count on maintenance).

---

## Phase 6 — Copy-paste canonical ListHeaderComponent onto each screen

No `<ListHeader>` component. Each screen defines its own `ListHeaderComponent` callback inline, copy-pasting this structure:

```tsx
const ListHeaderComponent = useCallback(
  () => (
    <View style={indexScreenStyles.listHeaderComponent}>
      <SearchBar
        placeholder="Search ..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FilterRow
        options={["all", ...vesselNames]}
        selected={filterVessel}
        onSelect={setFilterVessel}
      />
      {/* screen-specific extras here (e.g., maintenance statsRow) */}
    </View>
  ),
  [searchQuery, filterVessel, vesselNames],
);
```

Maintenance adds its `statsRow` as a sibling after `<FilterRow>` inside the wrapper. Other screens have nothing extra.

---

## Phase 7 — Refactor each screen

### 7a. `documents/index.tsx`

1. Replace local `styles.container`, `styles.listContent`, `styles.searchContainer`, `styles.searchInput` with `indexScreenStyles.*`
2. Paste canonical SectionList structure (Phase 2)
3. Use `<SearchBar>`, `<FilterRow>`, `<CollapsibleSectionHeader>`
4. Add `marginHorizontal: 20` to `documentCard` (or use `indexScreenStyles.card`)
5. Remove `paddingHorizontal` from local `listContent`
6. Card-specific styles stay local: no checkbox, no priority badge

### 7b. `supplies/index.tsx`

1. Same structure paste + shared component swap
2. Add `marginHorizontal: 20` to `requestCard` (or use `indexScreenStyles.card`)
3. Remove `paddingHorizontal` from local `listContent`
4. Card-specific: keep `actionButtons`, `approveButton`, `denyButton` local
5. Use shared `priorityText`, `topRow`, `cardTitle`, `cardDescription`, `metaRow`, `metaText`

### 7c. `maintenance/index.tsx`

1. Same structure paste + shared component swap
2. Add `marginHorizontal: 20` to `taskCard` (or use `indexScreenStyles.card`)
3. Remove `paddingHorizontal` from local `listContent`
4. Keep `statsRow` inside `ListHeaderComponent` after `<FilterRow>`
5. Add section count via `<CollapsibleSectionHeader>` (currently missing)
6. Use shared `completeButton`, `bottomRowWithCheckbox`, `metaRowWithCheckbox`

### 7d. `issues/index.tsx`

1. Same structure paste — issues is already correct, so this is a refactor to reference `indexScreenStyles.*` instead of local duplicates
2. All card styles already match canonical values; point them at shared styles
3. Local styles reduced to only `issueCard`-specific overrides (if any remain)

---

## Phase 8 — Delete dead local styles

After each screen consumes shared styles, delete the now-unused local `StyleSheet.create` entries. Expected deletions per screen:

- `container`, `searchContainer`, `searchInput`, `listContent`, `listHeaderComponent`
- `emptyState`, `emptyStateText` (if using shared)
- `topRow`, `metaText` (if using shared)

Each screen retains only styles unique to its card variant (e.g., `actionButtons` in supplies, `statsRow` in maintenance).

---

## Execution Order

| Step | What                          | Files touched                             |
| ---- | ----------------------------- | ----------------------------------------- |
| 1    | Expand `indexScreenStyles`    | `styles/commonStyles.ts`                  |
| 2    | Create `SearchBar`            | `components/SearchBar.tsx`                |
| 3    | Create `FilterRow`            | `components/FilterRow.tsx`                |
| 4    | Create `CollapsibleSectionHeader` | `components/CollapsibleSectionHeader.tsx` |
| 5a   | Refactor documents            | `app/(tabs)/documents/index.tsx`          |
| 5b   | Refactor supplies             | `app/(tabs)/supplies/index.tsx`           |
| 5c   | Refactor maintenance          | `app/(tabs)/maintenance/index.tsx`        |
| 5d   | Refactor issues               | `app/(tabs)/issues/index.tsx`             |
| 6    | Clean dead styles             | all 4 index files                         |

Steps 2-4 can be done in parallel. Steps 5a-5d can be done in parallel after 1-4 are complete.

---

## What this does NOT change

- Card item components (`IssueItem`, `MaintenanceTaskItem`, `SupplyRequestItem`) stay as local `React.memo` components in their respective files. They are not generic enough to share — each has different fields, actions, and conditional logic.
- Data hooks, filtering logic, section grouping logic — all stay local. The shared layer is purely presentational.
- `commonStyles.ts` existing exports (`colors`, `shadows`, `spacing`, `buttonStyles`, `commonStyles`, `detailScreenStyles`) — untouched.
