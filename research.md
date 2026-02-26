# Index Screen Style Architecture — Issues as Reference

This document defines how `issues/index.tsx` is built so that `documents`, `supplies`, and `maintenance` can be aligned to match it exactly.

---

## 1. Structural Layout

Every index screen follows this hierarchy:

```
<View container>                    // flex:1, bg: colors.surfaceOne
  <Stack.Screen options />          // title, headerRight (plus button + ProfileHeaderButton)
  <SectionList
    sections
    renderItem
    keyExtractor
    renderSectionHeader
    ListHeaderComponent             // search + filter chips
    ListFooterComponent             // bottom inset spacer
    ListEmptyComponent
    contentContainerStyle           // listContent + marginTop: topPadding
    stickySectionHeadersEnabled={false}
  />
</View>
```

### Key differences from issues that need fixing:

| Area                            | Issues (correct)                                                          | Documents                                                                              | Supplies                                                  | Maintenance                                               |
| ------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| **ListFooterComponent**         | Explicit `<View>` with `height: insets.bottom + 64`, bg: `surfaceOne`     | Missing — uses `paddingBottom` on `contentContainerStyle`                              | Missing — uses `paddingBottom` on `contentContainerStyle` | Missing — uses `paddingBottom` on `contentContainerStyle` |
| **contentContainerStyle**       | `styles.listContent` + `{ marginTop: topPadding }`                        | `styles.listContent` + `{ paddingTop: topPadding, paddingBottom: insets.bottom + 64 }` | Same as documents                                         | Same as documents                                         |
| **listContent style**           | `{ backgroundColor: colors.surfaceTwo }` — no `paddingHorizontal`         | `{ paddingHorizontal: 20, paddingBottom: 20 }`                                         | Same as documents                                         | Same as documents                                         |
| **ListHeaderComponent wrapper** | Wrapped in `<View style={styles.listHeaderComponent}>` (bg: `surfaceOne`) | Uses bare `<>...</>` fragment                                                          | Uses bare `<>...</>` fragment                             | Uses bare `<>...</>` fragment                             |

---

## 2. ListHeaderComponent

Issues wraps search + filters inside a `<View style={styles.listHeaderComponent}>` with `backgroundColor: colors.surfaceOne`. This creates a visual separation between the header zone (surfaceOne) and the section list body (surfaceTwo via `listContent`).

### Search Container (Issues)

```js
{
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.container,   // #ffffff
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginHorizontal: 20,
  gap: 10,
  borderWidth: 1,
  borderColor: colors.borderSoft,      // rgba(0,0,0,.11)
}
```

### Search Container (Documents/Supplies/Maintenance — deviations)

- `backgroundColor: colors.surfaceOne` instead of `colors.container`
- `borderColor: colors.border` instead of `colors.borderSoft`
- `marginBottom: 16` added (Issues has none)
- `marginLeft: 12` on searchInput instead of `gap: 10` on container

### Filter Chips

All screens use `indexScreenStyles.filterContainer/filterContent/filterChip/filterChipActive/filterChipText/filterChipTextActive` from `commonStyles.ts`. This part is consistent.

---

## 3. Section Headers

Issues uses `indexScreenStyles.sectionHeaderRow` from commonStyles. All screens share this.

### Differences:

| Prop                  | Issues                  | Documents                             | Supplies                              | Maintenance                           |
| --------------------- | ----------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- |
| chevron icon size     | 16                      | 18                                    | 18                                    | 24                                    |
| section count display | `{section.count} items` | `{section.count}` (no "items" suffix) | `{section.count}` (no "items" suffix) | **Missing entirely** — no count shown |

Issues format: `<Text style={indexScreenStyles.sectionCount}>{" "}{section.count} items</Text>`

---

## 4. Card Component

Issues extracts the card into a `React.memo` component (`IssueItem`). The card structure:

```
<TouchableOpacity style={[styles.issueCard, isLast && styles.issueCardLast]}>
  <View style={styles.topRow}>                    // flexDirection: "row", gap: 16
    <Pressable completeButton />                   // 20x20 circle checkbox (issues + maintenance only)
    <Text issueTitle numberOfLines={2} />          // fontSize:15, lineHeight:20, fontWeight:"500", flex:1
    <Text priorityText />                          // colored badge inline
  </View>
  <View style={styles.bottomRow}>                  // paddingLeft: 36 (to align past checkbox)
    <Text issueDescription numberOfLines={2} />    // fontSize:14, color:textSecondary, marginTop:4
  </View>
  <View style={styles.taskMeta}>                   // marginLeft:36, flexDirection:"row", gap:8, marginTop:4
    <Text metaText />                              // fontSize:12, color:textTertiary
  </View>
</TouchableOpacity>
```

### Card style values (canonical):

```js
issueCard: {
  borderWidth: 1,
  borderColor: colors.borderSoft,
  borderRadius: 16,
  padding: 16,
  backgroundColor: colors.surfaceOne,
  marginHorizontal: 20,    // issues has this, others don't
  marginBottom: 10,
}
issueCardLast: {
  marginBottom: 16,
}
```

### Card differences by screen:

**Documents:**

- No `marginHorizontal: 20` on card (relies on `listContent.paddingHorizontal: 20`)
- No checkbox (correct — documents don't have completion)
- No priority badge (correct — documents don't have priority)
- `bottomRow` is empty `{}` — no `paddingLeft: 36`
- `docMeta` has no `marginLeft: 36`

**Supplies:**

- No `marginHorizontal: 20` on card
- No checkbox (correct — supplies use approve/deny instead)
- Has priority badge (correct)
- `bottomRow` is empty `{}` — no padding offset
- `requestMeta` has no `marginLeft`
- Has additional `actionButtons` row for approve/deny

**Maintenance:**

- No `marginHorizontal: 20` on card
- Has checkbox (correct)
- Has priority badge (correct)
- `bottomRow` has `paddingLeft: 36` (matches issues)
- `taskMeta` has `marginLeft: 36` (matches issues)

### The `marginHorizontal` discrepancy:

Issues puts `marginHorizontal: 20` on each card and has no `paddingHorizontal` on `listContent`.
Documents/Supplies/Maintenance put `paddingHorizontal: 20` on `listContent` and no `marginHorizontal` on cards.

The Issues approach is correct because it allows the `surfaceTwo` background to bleed to the screen edges behind the cards, while the section headers (which use their own `paddingHorizontal: 20` from `indexScreenStyles.sectionHeaderRow`) sit flush on the `surfaceTwo` background.

---

## 5. Two-Background System

Issues creates a visual layering:

1. **Container** — `colors.surfaceOne` (`#fbf8f7`) — the outer View bg
2. **listContent** — `colors.surfaceTwo` (`#f7f2ef`) — the scrollable content bg
3. **listHeaderComponent** — `colors.surfaceOne` — keeps the search/filter area on the lighter surface
4. **Cards** — `colors.surfaceOne` — cards sit on `surfaceTwo`, creating subtle separation
5. **ListFooterComponent** — `colors.surfaceOne` — caps the bottom, returning to the lighter surface

This produces a sandwich effect: `surfaceOne → surfaceTwo (content) → surfaceOne`.

Documents/Supplies/Maintenance do NOT implement this. They have no `surfaceTwo` on `listContent`, no `listHeaderComponent` wrapper, and no explicit `ListFooterComponent`. Everything sits on `surfaceOne`.

---

## 6. Padding/Spacing Approach

### Issues (canonical):

- `contentContainerStyle`: `{ backgroundColor: colors.surfaceTwo }` + `{ marginTop: topPadding }`
- Cards: `marginHorizontal: 20`, `marginBottom: 10`, last card `marginBottom: 16`
- ListFooterComponent: explicit View with `insets.bottom + 64` height
- No `paddingHorizontal` on listContent

### Others (current, needs fixing):

- `contentContainerStyle`: `{ paddingHorizontal: 20, paddingBottom: 20 }` + `{ paddingTop: topPadding, paddingBottom: insets.bottom + 64 }`
- Cards: no `marginHorizontal`, `marginBottom: 10`, last card `marginBottom: 16`
- No ListFooterComponent
- `paddingHorizontal: 20` on listContent

---

## 7. Maintenance-Specific Extras

Maintenance has a `statsRow` (Total / Overdue / Completed) between the filter chips and the section list. Issues does not have this. Decision needed: keep it or remove it for consistency.

Maintenance also has a `emptyStateButton` ("Create First Task") in the empty state. Issues does not. The empty state in Issues uses a different icon color (`colors.success` vs `colors.textSecondary`).

---

## 8. Summary of Required Changes

To align Documents, Supplies, and Maintenance with Issues:

### All three screens:

1. Add `listHeaderComponent` wrapper View with `backgroundColor: colors.surfaceOne`
2. Change `listContent` to `{ backgroundColor: colors.surfaceTwo }` — remove `paddingHorizontal` and `paddingBottom`
3. Change `contentContainerStyle` from `paddingTop`/`paddingBottom` to `marginTop: topPadding`
4. Add explicit `ListFooterComponent` View with `height: insets.bottom + 64`, `backgroundColor: colors.surfaceOne`
5. Add `marginHorizontal: 20` to card styles
6. Fix search container: `backgroundColor: colors.container`, `borderColor: colors.borderSoft`, remove `marginBottom`, use `gap: 10` instead of `marginLeft: 12` on input
7. Fix section header chevron icon size to `16`
8. Fix section count to include ` items` suffix
9. Standardize `placeholderTextColor` to `colors.textTertiary` (issues) vs `colors.textSecondary` (others)

### Documents only:

- No bottomRow/meta padding changes needed (no checkbox)

### Supplies only:

- No bottomRow padding needed (no checkbox)
- Keep approve/deny action buttons

### Maintenance only:

- Fix section header to show count (currently missing)
- Decide on statsRow (not present in issues)
