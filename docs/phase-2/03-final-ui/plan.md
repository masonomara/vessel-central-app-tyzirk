# Final UI Polish & Manual Test Plan

Sequential execution. Each section is a discrete work unit. Fix, verify on device, move on.

---

## Phase 1: Dead-End & Navigation Audit

Walk every navigation path. Mark pass/fail. Fix immediately.

### 1.1Owner Dashboard Navigation Targets

| Source                     | Target                     | Expected                     |
| -------------------------- | -------------------------- | ---------------------------- |
| Fleet vessel card          | `/vessel-detail?id=X`      | Vessel detail with back      |
| Pending approval card      | `/supply-detail?id=X`      | Supply detail with back      |
| Activity log (maintenance) | `/maintenance-detail?id=X` | Maintenance detail with back |
| Activity log (issue)       | `/issue-detail?id=X`       | Issue detail with back       |
| Activity log (supply)      | `/supply-detail?id=X`      | Supply detail with back      |
| Performance card           | `/analytics`               | Analytics screen with back   |
| Expense chart card         | `/analytics`               | Analytics screen with back   |
| Next maintenance card      | `/maintenance-detail?id=X` | Maintenance detail with back |
| Search icon                | GlobalSearch modal         | Modal opens/closes           |
| Profile icon               | `/profile`                 | Profile with back            |

### 1.2Manager Dashboard Navigation Targets

| Source                          | Target                     | Expected                     |
| ------------------------------- | -------------------------- | ---------------------------- |
| Vessel card                     | `/vessel-detail?id=X`      | Vessel detail with back      |
| Pending approval card           | `/supply-detail?id=X`      | Supply detail with back      |
| RealtimeFeed item (issue)       | `/issue-detail?id=X`       | Issue detail with back       |
| RealtimeFeed item (maintenance) | `/maintenance-detail?id=X` | Maintenance detail with back |
| RealtimeFeed item (supply)      | `/supply-detail?id=X`      | Supply detail with back      |
| "View All" requests             | `/(tabs)/supplies`         | Supplies tab                 |
| Maintenance card                | `/maintenance-detail?id=X` | Maintenance detail with back |

### 1.3Crew Dashboard Navigation Targets

| Source              | Target                     | Expected                     |
| ------------------- | -------------------------- | ---------------------------- |
| Task card           | `/maintenance-detail?id=X` | Maintenance detail with back |
| Supply request card | `/supply-detail?id=X`      | Supply detail with back      |
| Vessel card         | `/vessel-detail?id=X`      | Vessel detail with back      |

### 1.4Vessel Detail Sub-Navigation

| Source                | Target                             | Expected                     |
| --------------------- | ---------------------------------- | ---------------------------- |
| "Update Hours" button | `/update-engine-hours?vesselId=X`  | Update screen with back      |
| Open issue card       | `/issue-detail?id=X`               | Issue detail with back       |
| Event card            | `/calendar-event-detail?eventId=X` | Event detail with back       |
| Maintenance card      | `/maintenance-detail?id=X`         | Maintenance detail with back |
| Supply card           | `/supply-detail?id=X`              | Supply detail with back      |
| Document card         | `/document-detail?id=X`            | Document detail with back    |

### 1.5Analytics Navigation

| Source               | Target                | Expected        |
| -------------------- | --------------------- | --------------- |
| Active Tasks card    | `/(tabs)/maintenance` | Maintenance tab |
| Open Issues card     | `/(tabs)/issues`      | Issues tab      |
| Completion Rate card | `/(tabs)/maintenance` | Maintenance tab |
| Supply Requests card | `/(tabs)/supplies`    | Supplies tab    |

**Potential issue**: Owner role has no Issues tab or Supplies tab. Analytics links to `/(tabs)/issues` and `/(tabs)/supplies`. If tapped as owner, these navigate to hidden tabs.

**Fix**: Make the Issues tab and Supplies tab visible to the Owner role in the "More" tab. Update the tab visibility config in `app/(tabs)/_layout.tsx` to include these tabs for the owner role.

### 1.6Tab-Level Add Button Navigation

Each tab's add button (header right) should open the correct modal:

| Tab            | Add Route               | Role Gating    |
| -------------- | ----------------------- | -------------- |
| Maintenance    | `/add-maintenance-task` | owner, manager |
| Issues         | `/add-issue`            | all            |
| Supplies       | `/add-supply-request`   | crew           |
| Documents      | `/add-document`         | owner          |
| Calendar       | `/add-calendar-event`   | all            |
| Contacts       | `/add-contact`          | owner, manager |
| Certifications | `/add-certification`    | owner, manager |
| Charters       | `/add-charter`          | owner, manager |
| Equipment      | `/add-equipment`        | owner, manager |

Verify each opens as a bottom-sheet modal (not a push). Stack registrations already applied in `_layout.tsx`.

---

## Phase 2: Layout & Visual Fixes

### 2.1 Fleet Grid Card Height Inconsistency (Owner Dashboard)

**Problem**: `vesselCard` uses `flex: 1` in a `flexWrap: "wrap"` row. With 3 vessels and `gap: 12`, the third card sits alone on a second row at half-width while the first two split the first row. Cards on different rows can have different heights. Additionally, each role dashboard has its own vessel card implementation -- they should share a single component.

**Fix** -- Single-column layout with shared VesselCard component:

1. Create a reusable `VesselCard` component (or refactor the existing `PressableCard`-based vessel cards) used by all three role dashboards (owner, manager, crew).
2. Layout: single column, full width. Boat image prominent on the left side of the card. Vessel name, location, status on the right.
3. Remove `flexDirection: "row"` and `flexWrap: "wrap"` from fleet grid containers. Remove `flex: 1` from vessel card styles.
4. Ensure identical card appearance across all roles -- same image size, same typography, same spacing.

### 2.2 Safety Margin & Padding Audit (All Screens)

**Problem**: Inconsistent padding/margins across screens. Example: `crew/index.tsx` header has no `paddingHorizontal`, while owner and manager headers have `paddingHorizontal: 20`. Some screens lack proper top/bottom safe area insets.

**Reference**: `app/(tabs)/supplies/index.tsx` handles top and bottom safety margins correctly. Use it as the baseline.

**Fix** -- Audit every screen for:

1. **Top safe area**: Content must not render behind the status bar / Dynamic Island. Verify `useSafeAreaInsets()` or equivalent top padding is applied.
2. **Bottom safe area**: ScrollView `contentContainerStyle` must include `paddingBottom: insets.bottom + N` so content clears the home indicator and tab bar.
3. **Horizontal padding**: All section headers, content blocks, and cards must have consistent `paddingHorizontal: 20` (or equivalent margin). No content flush against screen edges.

Screens to audit:

- All three dashboards (owner, manager, crew)
- All tab screens (calendar, maintenance, issues, supplies, documents, contacts, certifications, charters, equipment)
- All detail screens (vessel-detail, maintenance-detail, issue-detail, supply-detail, document-detail, calendar-event-detail, certification-detail, charter-detail, contact-detail, equipment-detail)
- All modal screens (add-maintenance-task, add-issue, add-document, add-calendar-event, add-supply-request, add-parts-request, add-certification, add-charter, add-contact, add-equipment)
- Utility screens (profile, analytics, assign-boats, update-engine-hours)

### 2.3 Crew Vessel Cards Missing marginHorizontal

**Problem**: Crew dashboard vessel cards are `PressableCard` with no horizontal margin. They'll be full-width with no gutters.

**Fix**: Add `marginHorizontal: 20` to `vesselCard` style, or wrap the vessel map in a view with paddingHorizontal.

```tsx
vesselCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surfaceOne,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  marginHorizontal: 20,  // add this
  borderWidth: 1,
  borderColor: colors.border,
  gap: 12,
},
```

### 2.4 Analytics Chart Overflow

**Problem**: `analytics.tsx` uses `Dimensions.get('window').width` for chart width. On device rotation (if ever allowed) or split-screen, this is stale. More importantly, `screenWidth - 60` assumes 20px padding on each side + 10px chart card padding -- but the actual padding is 20px (scrollContent) + 16px (chartCard padding) = 36px per side = 72px total. Charts may overflow by 12px.

**Fix**:

```tsx
// Replace static screenWidth with dynamic measurement
// In the chart card, use onLayout or calculate correctly:
const chartWidth = screenWidth - 40 - 32; // 20px scroll padding * 2 + 16px chart padding * 2
```

Or more robustly, use `useWindowDimensions()` hook instead of `Dimensions.get()`:

```tsx
import { useWindowDimensions } from "react-native";
// Inside component:
const { width: screenWidth } = useWindowDimensions();
```

### 2.5 Bottom Safe Area on Detail Screens

**Problem**: Some detail screens (vessel-detail) manually add bottom padding with `insets.bottom + 64`. Others may not. Inconsistent bottom padding means content can be hidden behind the home indicator on iPhones.

**Audit each detail screen** for bottom padding in scrollContent or a footer spacer. Every ScrollView needs either:

- `contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}`, or
- A `<View style={{ height: insets.bottom + 20 }} />` at the bottom of scroll content

### 2.6 Modal Dismiss UX

**Problem**: Add-form modals use `presentation: "modal"` which gives iOS swipe-to-dismiss and a small grab handle. On Android, the user must use the system back gesture. There's no visible close/cancel button in the modal header for some forms.

**Audit**: Check each add-form screen for a headerLeft cancel button. The pattern should be:

```tsx
<Stack.Screen
  options={{
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: colors.accent, fontSize: 16 }}>Cancel</Text>
      </TouchableOpacity>
    ),
  }}
/>
```

Verify this exists in:

- `add-maintenance-task.tsx`
- `add-issue.tsx`
- `add-document.tsx`
- `add-calendar-event.tsx`
- `add-supply-request.tsx`
- `add-parts-request.tsx`
- `add-certification.tsx`
- `add-charter.tsx`
- `add-contact.tsx`
- `add-equipment.tsx`

---

## Phase 3: Cross-Screen Consistency

### 3.1 Section Header Pattern

All tab screens use `CollapsibleSectionHeader` + `SectionList`. Verify consistent styling:

- Section header height: 56px
- Font: 17px, weight 600
- Count text: 15px, textTertiary color
- Collapse chevron animation direction

### 3.2 Empty States

When a SectionList section has 0 items after filtering, verify the empty state renders. Check:

- Maintenance with impossible status filter
- Issues with all completed
- Supplies with no denied items
- Documents with no items in a category
- Calendar day with no events

Each should show `EmptyState` component, not a blank screen.

### 3.3 Badge Consistency

All badges should use `getPriorityBadgeColors()` from `utils/colorUtils.ts` for priority badges and consistent patterns for status badges. Spot-check:

- Maintenance list cards
- Issue list cards
- Supply list cards
- Detail screen header badges

---

## Phase 4: Manual Test Walkthrough

Run this on a physical iOS device. Follow the exact sequence.

### 4.1 Pre-Test

1. Delete the app / clear AsyncStorage
2. `npx expo start` -> scan QR or run on device
3. App loads to login screen

### 4.2 Login

- [ ] Background image loads
- [ ] Wordmark renders centered
- [ ] 3 quick-login buttons visible: Owner, Manager, Crew
- [ ] "Sign in with email" button visible
- [ ] Tap "Sign in with email" -> form animates in
- [ ] Cancel collapses form
- [ ] Tap Owner quick-login -> navigates to Owner Dashboard

### 4.3 Owner Dashboard

- [ ] Greeting shows correct date and "Hello, Diane"
- [ ] Pending Approvals section shows supply requests
- [ ] Tap approval -> supply-detail opens, back works
- [ ] Recent Activity section shows items
- [ ] Tap activity item -> correct detail screen, back works
- [ ] Fleet Overview shows 3 vessel cards
- [ ] Tap vessel card -> vessel-detail opens, back works
- [ ] Performance section: progress ring renders, expense chart renders
- [ ] Tap performance card -> analytics opens, back works
- [ ] Next Maintenance card -> maintenance-detail opens, back works
- [ ] Search icon -> GlobalSearch modal opens, close works
- [ ] Profile icon -> profile opens, back works

### 4.4 Owner Tabs

- [ ] Calendar tab: month grid renders, tap day shows events, tap event -> detail, add event works
- [ ] Maintenance tab: sections render, search works, filter works, tap card -> detail, add button -> modal
- [ ] Documents tab: sections render, search works, tap card -> detail, add button -> modal
- [ ] Contacts tab: sections render, search works, tap card -> detail, add button -> modal
- [ ] Certifications tab: sections render, tap card -> detail, add button -> modal
- [ ] Charters tab: sections render, tap card -> detail, add button -> modal
- [ ] Equipment tab: sections render, tap card -> detail, add button -> modal

### 4.5 Vessel Detail (from Fleet Overview)

- [ ] Vessel image or icon renders
- [ ] Name, location, status badge
- [ ] Engine hours display with current value
- [ ] "Update Hours" -> update-engine-hours screen opens
- [ ] Enter valid hours -> success alert -> back to vessel detail -> hours updated
- [ ] Open Issues section (if any) -> tap -> issue-detail
- [ ] Events section -> tap -> calendar-event-detail
- [ ] Maintenance section -> tap -> maintenance-detail
- [ ] Supplies section -> tap -> supply-detail
- [ ] Documents section -> tap -> document-detail

### 4.6 All Add-Form Modals (Owner)

For each modal, verify:

- [ ] Opens as bottom sheet (not full push)
- [ ] Cancel/close button visible and works
- [ ] All form fields render and are interactive
- [ ] Vessel selector shows available vessels
- [ ] Date pickers work (iOS native style)
- [ ] Submit with empty required fields -> validation alert
- [ ] Fill all fields -> submit -> success alert -> modal dismisses
- [ ] New item appears in parent list
- [ ] Scroll to bottom of form -> submit button is reachable

Modals: add-maintenance-task, add-document, add-calendar-event, add-contact, add-certification, add-charter, add-equipment

### 4.7 Manager Role

- [ ] Log out (Profile -> Log Out -> confirm)
- [ ] Login as Manager (Brett)
- [ ] Dashboard: pending approvals with Approve/Reject buttons
- [ ] Tap Approve -> item disappears from pending
- [ ] Tap Reject -> item disappears from pending
- [ ] RealtimeFeed renders, items are tappable
- [ ] Fleet Status: vessel cards with progress rings
- [ ] Upcoming Maintenance: cards are tappable
- [ ] Maintenance tab: add button visible, functional
- [ ] Issues tab: visible, sections render, add button
- [ ] Supplies tab: visible, inline approve/reject on pending
- [ ] Contacts, Certs, Charters, Equipment: visible, functional

### 4.8 Crew Role

- [ ] Log out, login as Crew (Marcus)
- [ ] Dashboard: "My Tasks" with checkboxes
- [ ] Toggle task checkbox -> status updates
- [ ] Tap task card -> maintenance-detail
- [ ] Supply Requests section renders
- [ ] Tap supply card -> supply-detail
- [ ] My Vessels section -> tap -> vessel-detail
- [ ] Calendar tab: visible, events render
- [ ] Issues tab: visible, add button works
- [ ] Supplies tab: visible, add button works (supply + parts)
- [ ] No Maintenance tab visible
- [ ] No Documents tab visible
- [ ] No Contacts/Certs/Charters/Equipment tabs visible

### 4.9 Detail Screen Completeness

For each detail type, verify:

- [ ] Title section renders (name, badges)
- [ ] All metadata rows render (vessel, dates, assigned to, etc.)
- [ ] Collapsible sections expand/collapse
- [ ] Comments section renders (if applicable)
- [ ] Action buttons work (complete, approve, etc.)
- [ ] Back navigation works from every detail screen

Detail screens: maintenance-detail, issue-detail, supply-detail, document-detail, calendar-event-detail, vessel-detail, certification-detail, charter-detail, contact-detail, equipment-detail

### 4.10 Analytics

- [ ] Reachable from owner dashboard performance cards
- [ ] 4 stat cards render with values
- [ ] Expense Trends line chart renders (no crash)
- [ ] Expenses by Category bar chart renders (no crash)
- [ ] Task Status pie chart renders (no crash)
- [ ] Key Metrics: completion rate, avg response time, supply requests
- [ ] Tappable cards navigate correctly (maintenance, issues, supplies)
- [ ] Owner: issues/supplies cards navigate correctly (tabs now visible via "More")

### 4.11 Profile

- [ ] Shows user name, role badge
- [ ] Email, phone, location display
- [ ] Notification toggle works
- [ ] Category toggles appear when master toggle is on
- [ ] Log Out -> confirmation alert -> returns to login
- [ ] Login persists after backgrounding and reopening app

### 4.12 Edge Cases

- [ ] Search with gibberish -> empty state, no crash
- [ ] Rapidly switch between all tabs -> no crash, no stale UI
- [ ] Open detail -> back -> open different detail -> back -> still works
- [ ] Open modal -> cancel -> open again -> form is fresh
- [ ] Long text in comments/descriptions wraps correctly
- [ ] Background app -> foreground -> data persists

### 4.13 iOS-Specific

- [ ] Content not behind Dynamic Island/notch (safe area)
- [ ] Content not behind home indicator
- [ ] Tab bar doesn't overlap content
- [ ] Date pickers render as native iOS pickers
- [ ] Keyboard dismisses on tap outside
- [ ] Scroll bounce feels natural
- [ ] Modal swipe-to-dismiss works on all add-form screens

---

## Phase 5: Execution Order

1. Apply Phase 1 fixes (navigation audit, owner tab visibility) -- 15 min
2. Apply Phase 2 fixes (layout: vessel cards, padding audit, chart width, bottom safe area, modal dismiss) -- 45 min
3. Apply Phase 3 audits (section headers, empty states, badge consistency) -- 30 min
4. Build and run on device
5. Execute Phase 4 walkthrough top-to-bottom
6. Log every failure
7. Fix failures in priority order (crashes > dead ends > layout > visual)
8. Re-run failed sections only
9. Final full walkthrough pass

---

## TODO List

Legend: `[CLAUDE]` = code changes I will make. `[HUMAN]` = requires physical device, App Store account, or your judgement call.

### Phase 1: Dead-End & Navigation Audit

**[CLAUDE]**

- [x] 1.1 -- Make Issues tab visible to owner role in `app/(tabs)/_layout.tsx` -- removed `hidden` prop entirely so all roles see Issues
- [x] 1.2 -- Make Supplies tab visible to owner role in `app/(tabs)/_layout.tsx` -- removed `hidden` prop entirely so all roles see Supplies
- [x] 1.3 -- Stack.Screen entries already present in `app/_layout.tsx` for all Phase 2 screens (verified: add-certification, add-charter, add-contact, add-equipment as modals; certification-detail, charter-detail, contact-detail, equipment-detail, update-engine-hours as detail screens)

**[HUMAN]**

- [ ] 1.4 -- Walk every row in tables 1.1-1.4 on device. Tap each source, confirm target loads, confirm back button returns. Log any that fail.
- [ ] 1.5 -- Walk table 1.5 (analytics links). Confirm all 4 stat card taps land on the correct tab now that Issues/Supplies are visible to owner.
- [ ] 1.6 -- Walk table 1.6 (add buttons). Confirm each tab's header-right add button opens the correct modal as a bottom sheet.

### Phase 2: Layout & Visual Fixes

**[CLAUDE]**

- [x] 2.1a -- Created shared `VesselCard` component in `components/VesselCard.tsx`. Horizontal layout: vessel image (72x72) on left, name/location/status/crew on right. React.memo optimized.
- [x] 2.1b -- Refactored owner dashboard to use `VesselCard`. Removed fleet grid flexWrap, LinearGradient import, and all old vessel card styles.
- [x] 2.1c -- Refactored manager dashboard to use `VesselCard`. Removed ProgressRing import and all old vessel card styles.
- [x] 2.1d -- Refactored crew dashboard to use `VesselCard`. Removed PressableCard/IconSymbol imports and all old vessel card styles.
- [x] 2.2a -- Fixed crew dashboard header: added `paddingHorizontal: 20`. Owner and manager already had it.
- [x] 2.2b -- Tab screens already use `indexScreenStyles` from commonStyles which provides consistent padding. Verified supplies as reference -- all follow same pattern.
- [x] 2.2c -- Added `paddingBottom: 40` to `detailScreenStyles.scrollContent` in commonStyles.ts. All detail screens using `ds.scrollContent` now have bottom padding.
- [x] 2.2d -- Fixed `add-maintenance-task.tsx` scrollContent missing paddingBottom. Other modals already had adequate padding (verified via audit).
- [x] 2.2e -- Fixed `update-engine-hours.tsx` content style missing paddingBottom. Profile and analytics already had adequate padding.
- [x] 2.3 -- Subsumed by 2.1d. VesselCard component includes `marginHorizontal: 20`.
- [x] 2.4 -- Replaced `Dimensions.get('window').width` with `useWindowDimensions()` in analytics.tsx. Corrected chart width from `screenWidth - 60` to `screenWidth - 72`.
- [x] 2.5 -- Covered by 2.2c (detailScreenStyles.scrollContent now has paddingBottom: 40) and 2.2e (update-engine-hours fixed).
- [x] 2.6a -- Audited all 10 add-form modals. All have headerLeft cancel buttons already present.
- [x] 2.6b -- Verified all cancel buttons call `router.back()`. Form reset happens via component unmount on modal dismiss.

**Also fixed pre-existing type errors:**

- [x] Fixed `getPriorityBadgeColors` type error in owner dashboard (changed `string` to `TaskPriority`)
- [x] Fixed missing `category` field in add-maintenance-task.tsx submission object

**[HUMAN]**

- [ ] 2.7 -- Run app on device after fixes. Check every dashboard for vessel card consistency.
- [ ] 2.8 -- Scroll to bottom of every screen on device. Confirm no content hidden behind home indicator or tab bar.
- [ ] 2.9 -- Open every add-form modal. Confirm cancel button visible and functional. Scroll to bottom, confirm submit button reachable.
- [ ] 2.10 -- Open analytics. Confirm charts render without horizontal overflow or clipping.

### Phase 3: Cross-Screen Consistency

**[CLAUDE]**

- [x] 3.1 -- Audited all 9 tab screens. All 8 SectionList screens use `CollapsibleSectionHeader` with consistent props (title, count, collapsed, onToggle). Calendar uses custom headers by design (not a SectionList).
- [x] 3.2 -- Audited all 9 tab screens. All have custom empty state Views with icon + message text when filters produce 0 results. No blank screens.
- [x] 3.3 -- Audited badge patterns. Priority badges use `getPriorityBadgeColors()` consistently. Status/type badges use per-entity helpers (contact type map, certification status, charter status, equipment condition) -- contextually correct since each entity has different status semantics.

**[HUMAN]**

- [ ] 3.4 -- On device, filter each tab to produce 0 results (search gibberish, filter to empty status). Confirm empty state renders with icon and message, no crash.
- [ ] 3.5 -- Visually compare section headers across all tabs. Confirm font size, weight, spacing, chevron animation are identical.
- [ ] 3.6 -- Spot-check badge colors on 3-4 list screens. Confirm visual consistency (same red for "high", same green for "completed", etc).

### Phase 4: Manual Test Walkthrough

**[HUMAN]** -- entire phase is on-device testing.

- [ ] 4.1 -- Fresh install / clear AsyncStorage
- [ ] 4.2 -- Login screen (7 checkpoints)
- [ ] 4.3 -- Owner dashboard (12 checkpoints)
- [ ] 4.4 -- Owner tabs (7 checkpoints)
- [ ] 4.5 -- Vessel detail (10 checkpoints)
- [ ] 4.6 -- Add-form modals, all 7 owner modals (9 checkpoints each = 63 total)
- [ ] 4.7 -- Manager role (12 checkpoints)
- [ ] 4.8 -- Crew role (12 checkpoints)
- [ ] 4.9 -- Detail screen completeness, all 10 screens (6 checkpoints each = 60 total)
- [ ] 4.10 -- Analytics (8 checkpoints)
- [ ] 4.11 -- Profile (6 checkpoints)
- [ ] 4.12 -- Edge cases (6 checkpoints)
- [ ] 4.13 -- iOS-specific (7 checkpoints)

### Phase 5: Fix & Re-Test

**[CLAUDE]**

- [ ] 5.1 -- Fix any crashes found during Phase 4 walkthrough
- [ ] 5.2 -- Fix any dead-end screens found during Phase 4 walkthrough
- [ ] 5.3 -- Fix any layout breaks found during Phase 4 walkthrough
- [ ] 5.4 -- Fix any visual inconsistencies found during Phase 4 walkthrough

**[HUMAN]**

- [ ] 5.5 -- Re-run only the failed sections from Phase 4
- [ ] 5.6 -- Final full walkthrough pass (all sections, all roles)
- [ ] 5.7 -- Fill in Test Completion Matrix below
- [ ] 5.8 -- App Store submission readiness check (icons, splash, metadata)

---

## Test Completion Matrix

| Section             | iPhone | iPad | Android |
| ------------------- | ------ | ---- | ------- |
| 4.2 Login           |        |      |         |
| 4.3 Owner Dashboard |        |      |         |
| 4.4 Owner Tabs      |        |      |         |
| 4.5 Vessel Detail   |        |      |         |
| 4.6 Add-Form Modals |        |      |         |
| 4.7 Manager Role    |        |      |         |
| 4.8 Crew Role       |        |      |         |
| 4.9 Detail Screens  |        |      |         |
| 4.10 Analytics      |        |      |         |
| 4.11 Profile        |        |      |         |
| 4.12 Edge Cases     |        |      |         |
| 4.13 iOS-Specific   |        |      |         |
