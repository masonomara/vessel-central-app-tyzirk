# Detail Screen Unification Plan

## Current State: 5 Screens, 5 Different Approaches

Every detail screen does roughly the same thing — show a title, badges, description, key-value details, optional notes, and action buttons — but each one implements these patterns differently. The inconsistencies span structure, styling values, component choices, and naming.

---

## Anatomy of a Unified Detail Screen

Every detail screen will follow this exact skeleton:

```
Container (surfaceTwo bg)
  Stack.Screen (title + optional headerRight)
  ScrollView (unified padding/config)
    TitleSection (title + badges)
    DescriptionSection (optional)
    DetailsCard (key-value rows via DetailRow/LinkedDetailRow)
    [Screen-specific content sections]
    ActionRow (conditional action buttons)
```

---

## Discrepancies to Fix (by component layer)

### 1. Container & Background

| Screen      | Current                                                      | Problem                             |
| ----------- | ------------------------------------------------------------ | ----------------------------------- |
| Maintenance | `[styles.container, { backgroundColor: colors.surfaceTwo }]` | Inline dynamic bg                   |
| Issue       | `[styles.container, { backgroundColor: colors.surfaceTwo }]` | Inline dynamic bg                   |
| Supply      | `[styles.container, { backgroundColor: colors.surfaceTwo }]` | Inline dynamic bg                   |
| Document    | `[styles.container, { backgroundColor: colors.surfaceTwo }]` | Inline dynamic bg                   |
| Calendar    | `commonStyles.container`                                     | Uses shared style (has bg baked in) |

**Fix:** All 5 screens use `commonStyles.container`. It already has `backgroundColor: colors.surfaceTwo` baked in. No inline overrides needed.

---

### 2. Stack.Screen Options

| Screen      | Current                                                |
| ----------- | ------------------------------------------------------ |
| Maintenance | **Missing entirely**                                   |
| Issue       | `title: 'Issue Details'`                               |
| Supply      | `title: 'Supply Request'`                              |
| Document    | `title: 'Document Details'`                            |
| Calendar    | `title: 'Event Details'` + `headerRight` delete button |

**Fix:** Every screen gets a `Stack.Screen` with a title. Calendar keeps its `headerRight`. Maintenance adds `title: 'Task Details'`.

---

### 3. Error/Empty State

| Screen      | Stack.Screen in error?       | Wrapper style                 | Text style                                 | Message format                            |
| ----------- | ---------------------------- | ----------------------------- | ------------------------------------------ | ----------------------------------------- |
| Maintenance | No                           | None (just container)         | `errorText` (danger color, marginTop: 100) | "Task not found"                          |
| Issue       | Yes (`'Issue Not Found'`)    | `centered`                    | `errorText` (textSecondary)                | "This issue could not be found."          |
| Supply      | Yes (`'Request Not Found'`)  | `centered`                    | `errorText` (textSecondary)                | "This supply request could not be found." |
| Document    | Yes (`'Document Not Found'`) | `centered`                    | `errorText` (textSecondary)                | "This document could not be found."       |
| Calendar    | Yes (`'Event Not Found'`)    | `emptyState` (different name) | `emptyStateText` (different name)          | "Event not found"                         |

**Fix:** Extract a shared `DetailNotFound` component. Props: `title` (for Stack.Screen). Each screen passes its own not-found title. Identical layout, identical styles.

```tsx
// components/DetailNotFound.tsx
<View style={commonStyles.container}>
  <Stack.Screen options={{ title }} />
  <View style={styles.centered}>
    <Text style={styles.text}>{title}</Text>
  </View>
</View>
```

---

### 4. ScrollView Configuration

| Screen      | Style prop                       | ContentContainer                                     | showsVerticalScrollIndicator | Horizontal padding             |
| ----------- | -------------------------------- | ---------------------------------------------------- | ---------------------------- | ------------------------------ |
| Maintenance | None                             | `scrollContent` (paddingHorizontal: 20) + paddingTop | `false`                      | 20 (in contentContainer)       |
| Issue       | `styles.content` (padding: 16)   | Inline `{ paddingBottom: 40, paddingTop }`           | Default (true)               | 16 (in style)                  |
| Supply      | `styles.content` (padding: 16)   | Inline `{ paddingBottom: 40, paddingTop }`           | Default (true)               | 16 (in style)                  |
| Document    | `styles.content` (padding: 16)   | Inline `{ paddingBottom: 40, paddingTop }`           | Default (true)               | 16 (in style)                  |
| Calendar    | `styles.scrollView` (no padding) | `styles.scrollContent` + paddingTop                  | `false`                      | 20 (via card marginHorizontal) |

**Fix:** Unified ScrollView config across all screens:

- `showsVerticalScrollIndicator={false}` on all
- Consistent `paddingHorizontal: 20` via contentContainerStyle
- `paddingBottom: 40` via contentContainerStyle
- `paddingTop: topPadding` via contentContainerStyle
- No style prop padding on the ScrollView itself

---

### 5. Title Section

| Screen      | Container                                 | Font size | Font weight | Alignment                | Badges placement            |
| ----------- | ----------------------------------------- | --------- | ----------- | ------------------------ | --------------------------- |
| Maintenance | `titleSection` View (mb 24)               | 28        | 600         | Left                     | Below title in `badges`     |
| Issue       | Bare Text (mb 12)                         | 24        | 700         | Left                     | Separate `badgeRow` (mb 20) |
| Supply      | Bare Text (mb 12)                         | 24        | 700         | Left                     | Separate `badgeRow` (mb 20) |
| Document    | `docHeader` View (centered, mb 24)        | 22        | 700         | Center (with icon above) | Inside docHeader            |
| Calendar    | Inside event card `titleRow` (row layout) | 24        | 600         | Left (badge beside)      | Beside title in row         |

**Fix:** All screens get a unified `titleSection` wrapper. Standard title: fontSize 24, fontWeight "700", left-aligned. Badges always render below the title in a `badgeRow`. Document drops the centered icon header — uses same left-aligned pattern as all others. Calendar pulls its title out of the event card into the standard title section.

---

### 6. Badge Rendering

| Screen      | Style names                               | paddingVertical | borderRadius | Opacity suffix | Text weight |
| ----------- | ----------------------------------------- | --------------- | ------------ | -------------- | ----------- |
| Maintenance | `priorityBadge`, `statusBadge` (separate) | 6               | 8            | "30"           | 600         |
| Issue       | `badge` (unified)                         | 4               | 12           | "20"           | 700         |
| Supply      | `badge` (unified)                         | 4               | 12           | "20"           | 700         |
| Document    | `badge` (unified)                         | 4               | 12           | "20"           | 700         |
| Calendar    | `typeBadge`, `statusBadge` (separate)     | 6               | 12           | "20"           | 600         |

**Fix:** Single `badge` style. `paddingHorizontal: 12`, `paddingVertical: 4`, `borderRadius: 12`. Badge text: `fontSize: 12`, `fontWeight: "700"`. Background opacity suffix: `"20"`. All screens use this one style.

---

### 7. Color Helper Functions

| Screen      | Functions defined                      | Location                        |
| ----------- | -------------------------------------- | ------------------------------- |
| Maintenance | `getPriorityColor`, `getStatusColor`   | Inline in component             |
| Issue       | `getPriorityColor`, `getStatusColor`   | Inline in component (identical) |
| Supply      | `getPriorityColor`, `getStatusColor`   | Inline in component             |
| Document    | None                                   | N/A                             |
| Calendar    | None (uses `getEventColor` from utils) | External util                   |

**Fix:** Move `getPriorityColor` and `getStatusColor` to a shared utility file (`utils/colorUtils.ts`). All screens import from there. Calendar keeps `getEventColor` in its calendar utils. Supply adds its own `getSupplyStatusColor` to the shared file.

---

### 8. Description Section

| Screen      | Font size | Line height | Color                | Has section wrapper                        |
| ----------- | --------- | ----------- | -------------------- | ------------------------------------------ |
| Maintenance | 16        | 24          | textSecondary        | Yes (section + sectionTitle)               |
| Issue       | 15        | 22          | textSecondary        | Yes                                        |
| Supply      | 15        | 22          | textSecondary        | Yes                                        |
| Document    | 15        | 22          | textSecondary        | Yes (conditional)                          |
| Calendar    | 15        | 22          | text (not secondary) | Yes (inside card, with border-top divider) |

**Fix:** Uniform description: `fontSize: 15`, `lineHeight: 22`, `color: colors.textSecondary`. Always wrapped in section with sectionTitle "Description". Conditional rendering when description is optional.

---

### 9. Section Title Style

| Screen      | Font size | Font weight | Color         | Margin bottom |
| ----------- | --------- | ----------- | ------------- | ------------- |
| Maintenance | 18        | 600         | text          | 12            |
| Issue       | 16        | 600         | text          | 12            |
| Supply      | 16        | 600         | text          | 12            |
| Document    | 16        | 600         | text          | 12            |
| Calendar    | 14        | 600         | textSecondary | 8             |

**Fix:** Uniform: `fontSize: 16`, `fontWeight: "600"`, `color: colors.text`, `marginBottom: 12`.

---

### 10. Details Display (Key-Value Rows)

| Screen      | Pattern                                                          | Component                                                          |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| Maintenance | Icon-card grid (each row has icon + bg + border)                 | Inline JSX with `PressableCard` for vessel                         |
| Issue       | Card wrapper → `DetailRow` + `LinkedDetailRow`                   | Local `DetailRow` function + imported `LinkedDetailRow`            |
| Supply      | Card wrapper → `DetailRow` + `LinkedDetailRow`                   | Local `DetailRow` function + imported `LinkedDetailRow`            |
| Document    | Card wrapper → `DetailRow` (with valueColor) + `LinkedDetailRow` | Local `DetailRow` function (extended) + imported `LinkedDetailRow` |
| Calendar    | Icon+text rows inside event card                                 | Inline JSX with `PressableCard` for vessel                         |

**Fix:**

1. Promote `DetailRow` to a shared component (`components/DetailRow.tsx`). Support optional `valueColor` prop (from document's version).
2. All 5 screens use the same card wrapper → `DetailRow` / `LinkedDetailRow` pattern.
3. Maintenance drops its icon-card grid in favor of the card + row pattern.
4. Calendar drops its inline icon+text rows in favor of the card + row pattern.
5. Vessel link always uses `LinkedDetailRow` (not inline `PressableCard`).

---

### 11. Vessel Navigation Link

| Screen      | Component                                                  | Pattern          |
| ----------- | ---------------------------------------------------------- | ---------------- |
| Maintenance | `PressableCard` variant="ghost" with icon + text + chevron | Custom inline    |
| Issue       | `LinkedDetailRow`                                          | Shared component |
| Supply      | `LinkedDetailRow`                                          | Shared component |
| Document    | `LinkedDetailRow`                                          | Shared component |
| Calendar    | `PressableCard` variant="ghost" with icon + text + chevron | Custom inline    |

**Fix:** All 5 use `LinkedDetailRow`. It already wraps `PressableCard` internally.

---

### 12. Notes Section

| Screen      | Present?          | Style                                                                   |
| ----------- | ----------------- | ----------------------------------------------------------------------- |
| Maintenance | Yes               | Card-style background (surfaceOne, border, borderRadius 12, padding 16) |
| Issue       | No (has comments) | N/A                                                                     |
| Supply      | Yes               | Reuses `description` style (no card wrapper)                            |
| Document    | No                | N/A                                                                     |
| Calendar    | Yes               | Inside event card, with border-top separator                            |

**Fix:** When notes exist, render in a consistent section: `sectionTitle` "Notes" + text in a card-like wrapper matching the description style. Same pattern as description but under its own section heading.

---

### 13. Action Buttons

| Screen      | Layout                                               | Has icons?        | Has shadows?        | Text color    |
| ----------- | ---------------------------------------------------- | ----------------- | ------------------- | ------------- |
| Maintenance | Status toggles (wrap row) + separate complete button | Complete has icon | No                  | `colors.text` |
| Issue       | Row of flex:1 buttons                                | No                | No                  | `#FFFFFF`     |
| Supply      | Row of flex:1 buttons                                | No                | No                  | `#FFFFFF`     |
| Document    | Row of flex:1 buttons                                | Yes               | No                  | `#FFFFFF`     |
| Calendar    | Row of flex:1 buttons                                | Yes               | Yes (shadows.small) | `colors.text` |

**Fix:** Unified action button style:

- `flexDirection: "row"`, icon + text layout
- `flex: 1`, `paddingVertical: 14`, `borderRadius: 12`, `alignItems: "center"`, `justifyContent: "center"`, `gap: 8`
- Text: `fontSize: 15`, `fontWeight: "600"`, `color: "#FFFFFF"`
- No shadows (keep it clean)
- Action row: `flexDirection: "row"`, `gap: 12`

Each screen still controls which buttons appear based on its own role/status logic.

---

### 14. Navigation / Param Handling

| Screen      | Params                                                                  | Router                    |
| ----------- | ----------------------------------------------------------------------- | ------------------------- |
| Maintenance | `const { id } = useLocalSearchParams()`                                 | `router` from expo-router |
| Issue       | `const { id } = useLocalSearchParams()`                                 | `router` from expo-router |
| Supply      | `const { id } = useLocalSearchParams()`                                 | `router` from expo-router |
| Document    | `const { id } = useLocalSearchParams()`                                 | `router` from expo-router |
| Calendar    | `const params = useLocalSearchParams()` then `params.eventId as string` | `useRouter()` separately  |

**Fix:** All screens use `const { id } = useLocalSearchParams()`. Calendar renames its route param from `eventId` to `id` (or adapts the destructure). All use `router` from expo-router import.

---

### 15. Data Lookup / Memoization

| Screen      | Memoized?       |
| ----------- | --------------- |
| Maintenance | No              |
| Issue       | No              |
| Supply      | No              |
| Document    | No              |
| Calendar    | Yes (`useMemo`) |

**Fix:** None of these need `useMemo` — the `.find()` is trivial. Remove `useMemo` from Calendar for consistency. All screens do a simple `.find()`.

---

## Shared Components to Create/Modify

### New: `components/DetailRow.tsx`

Promoted from the inline function currently duplicated in Issue, Supply, and Document.

```tsx
interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
}
```

### New: `components/DetailNotFound.tsx`

Shared empty state for all detail screens.

```tsx
interface DetailNotFoundProps {
  title: string;
}
```

### New: `utils/colorUtils.ts`

Extract shared color functions.

```tsx
export function getPriorityColor(priority: TaskPriority): string;
export function getStatusColor(status: TaskStatus): string;
export function getSupplyStatusColor(status: SupplyRequestStatus): string;
```

### Existing: `components/LinkedDetailRow.tsx`

No changes needed — already correct.

---

## Shared Styles to Add to `commonStyles.ts`

Add a `detailScreenStyles` StyleSheet covering:

- `scrollContent` (paddingHorizontal: 20, paddingBottom: 40)
- `titleSection` (marginBottom: 20)
- `title` (fontSize: 24, fontWeight: "700", color: text, marginBottom: 12)
- `badgeRow` (flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20)
- `badge` (paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12)
- `badgeText` (fontSize: 12, fontWeight: "700")
- `section` (marginBottom: 24)
- `sectionTitle` (fontSize: 16, fontWeight: "600", color: text, marginBottom: 12)
- `description` (fontSize: 15, color: textSecondary, lineHeight: 22)
- `card` (backgroundColor: surfaceOne, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: border, marginBottom: 24)
- `actionRow` (flexDirection: "row", gap: 12)
- `actionButton` (flex: 1, flexDirection: "row", paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8)
- `actionButtonText` (color: "#FFFFFF", fontSize: 15, fontWeight: "600")

---

## Execution Order

### Phase 1: Shared Infrastructure

1. Create `utils/colorUtils.ts` — extract `getPriorityColor`, `getStatusColor`, `getSupplyStatusColor`
2. Create `components/DetailRow.tsx` — promote from inline functions
3. Create `components/DetailNotFound.tsx` — shared not-found state
4. Add `detailScreenStyles` to `commonStyles.ts`

### Phase 2: Unify Each Screen (one at a time, test after each)

5. **Supply Detail** (simplest, closest to target pattern already)
   - Swap to `commonStyles.container`
   - Swap to shared ScrollView config
   - Import shared `DetailRow`, `detailScreenStyles`, color utils
   - Remove local `DetailRow` function and duplicate styles
   - Align badge/section/action styles to shared

6. **Issue Detail** (second closest)
   - Same swaps as Supply
   - Remove local `DetailRow` function
   - Align comment section styling (unique to this screen, keep as-is but use shared base styles)
   - Align action buttons to shared pattern

7. **Document Detail** (minor visual restructure)
   - Drop centered doc header, switch to standard left-aligned title section
   - Same shared component swaps
   - Remove local `DetailRow` function
   - Keep unique sections (tags, preview card) but use shared base styles

8. **Maintenance Detail** (biggest restructure)
   - Drop icon-card grid, switch to card + `DetailRow`/`LinkedDetailRow` pattern
   - Add `Stack.Screen` with title
   - Swap vessel link from inline `PressableCard` to `LinkedDetailRow`
   - Move completion history and status controls to use shared section/card styles
   - Import shared color utils

9. **Calendar Event Detail** (biggest visual restructure)
   - Pull title/badges out of event card into standard title section
   - Drop color bar visual element
   - Drop event card wrapper, switch to standard card + `DetailRow` pattern
   - Swap vessel link from inline `PressableCard` to `LinkedDetailRow`
   - Normalize param handling (`id` instead of `eventId`)
   - Remove `useMemo` wrapper
   - Use `commonStyles.container` (already does, but verify)

### Phase 3: Cleanup

10. Remove all duplicate local styles that now come from `detailScreenStyles`
11. Verify each screen's remaining `StyleSheet.create` only contains styles unique to that screen
12. Remove unused imports from all files

---

## What Stays Unique Per Screen

Each screen keeps its domain-specific sections. The unification targets the shared shell — everything listed above. What remains unique:

| Screen      | Unique Sections                                                                       |
| ----------- | ------------------------------------------------------------------------------------- |
| Maintenance | Completion history list, status toggle buttons, completion form (notes + cost inputs) |
| Issue       | Attachments gallery, comments thread + input                                          |
| Supply      | Multi-step workflow actions (pending→approved→ordered→received)                       |
| Document    | Tags section, file preview card, download/share actions                               |
| Calendar    | headerRight delete button                                                             |

These unique sections should still use the shared `section`, `sectionTitle`, `card`, and `actionButton` styles where applicable.
