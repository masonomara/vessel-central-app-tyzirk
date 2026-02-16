# Navigation Research: Pressable Elements, Links & Screen Interconnections

## Table of Contents

1. [Pressable Component Inventory](#1-pressable-component-inventory)
2. [Screen-by-Screen Pressable Audit](#2-screen-by-screen-pressable-audit)
3. [Navigation Map](#3-navigation-map)
4. [Missing Navigation Links (Items That Should Navigate But Don't)](#4-missing-navigation-links)
5. [Incomplete Navigation in GlobalSearch](#5-incomplete-navigation-in-globalsearch)
6. [Dead-End Screens (No Outbound Navigation)](#6-dead-end-screens)
7. [Summary of All Issues](#7-summary-of-all-issues)

---

## 1. Pressable Component Inventory

### Reusable Pressable Components

| Component             | File                                 | Navigates?                  | Notes                                                                                                                                           |
| --------------------- | ------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `PressableCard`       | `components/PressableCard.tsx`       | Only if `onPress` is passed | Generic animated card with scale animation + haptic feedback. Many usages pass **no** `onPress`, making the card feel pressable but go nowhere. |
| `StatCard`            | `components/StatCard.tsx`            | Only if `onPress` is passed | Wraps content in `TouchableOpacity` when `onPress` exists; otherwise renders a plain `View`.                                                    |
| `GradientButton`      | `components/GradientButton.tsx`      | Depends on caller           | Always has `onPress` (required prop). Always navigates or triggers an action.                                                                   |
| `ProfileHeaderButton` | `components/ProfileHeaderButton.tsx` | **Yes**                     | Always navigates to `/profile`.                                                                                                                 |
| `GlobalSearch`        | `components/GlobalSearch.tsx`        | **Partially**               | Search result items are pressable and navigate, but some routes are incomplete (see Section 5).                                                 |
| `RealtimeFeed`        | `components/RealtimeFeed.tsx`        | **No**                      | Activity feed items are plain `View`s. Not pressable at all despite looking like tappable cards.                                                |
| `FilterModal`         | `components/FilterModal.tsx`         | **No** (filter chips only)  | Chips toggle filters; modal close button. No outbound navigation.                                                                               |

---

## 2. Screen-by-Screen Pressable Audit

### Auth Screens

#### `login.tsx`

| Element                   | Type               | Target                                    | Works? |
| ------------------------- | ------------------ | ----------------------------------------- | ------ |
| Sign In button            | `TouchableOpacity` | Validates & navigates to `/(tabs)/{role}` | Yes    |
| Forgot Password?          | `TouchableOpacity` | `/forgot-password`                        | Yes    |
| Sign Up link              | `TouchableOpacity` | `/signup`                                 | Yes    |
| Quick Login (Owner)       | `TouchableOpacity` | `/(tabs)/owner`                           | Yes    |
| Quick Login (Manager)     | `TouchableOpacity` | `/(tabs)/manager`                         | Yes    |
| Quick Login (Crew)        | `TouchableOpacity` | `/(tabs)/crew`                            | Yes    |
| Manager Login button      | `TouchableOpacity` | `/manager-login`                          | Yes    |
| Show/hide password toggle | `TouchableOpacity` | N/A (toggles state)                       | Yes    |

#### `signup.tsx`

| Element           | Type               | Target                      | Works? |
| ----------------- | ------------------ | --------------------------- | ------ |
| Back / Login link | `TouchableOpacity` | `router.back()` or `/login` | Yes    |
| Submit button     | `TouchableOpacity` | Demo mode - alerts          | Yes    |

#### `forgot-password.tsx`

| Element      | Type               | Target                           | Works? |
| ------------ | ------------------ | -------------------------------- | ------ |
| Back link    | `TouchableOpacity` | `router.back()`                  | Yes    |
| Reset button | `TouchableOpacity` | Demo alert, then `router.back()` | Yes    |

---

### Owner Dashboard (`(tabs)/owner/index.tsx`)

| Element                                | Type               | Target                     | Has onPress?     | Issue?                                                                                                                                            |
| -------------------------------------- | ------------------ | -------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search icon (header)                   | `TouchableOpacity` | Opens `GlobalSearch` modal | Yes              | --                                                                                                                                                |
| `ProfileHeaderButton` (header)         | `TouchableOpacity` | `/profile`                 | Yes              | --                                                                                                                                                |
| **Vessel cards** (fleet grid)          | `PressableCard`    | **None**                   | **No `onPress`** | **BUG: Vessel cards animate on press but navigate nowhere. Should navigate to a vessel detail screen or the maintenance tab filtered by vessel.** |
| StatCard "Monthly Expenses"            | `StatCard`         | `/analytics`               | Yes              | --                                                                                                                                                |
| StatCard "Active Tasks"                | `StatCard`         | `/(tabs)/maintenance`      | Yes              | --                                                                                                                                                |
| StatCard "Open Issues"                 | `StatCard`         | `/(tabs)/issues`           | Yes              | --                                                                                                                                                |
| StatCard "Pending Approvals"           | `StatCard`         | `/(tabs)/supplies`         | Yes              | --                                                                                                                                                |
| **Performance card** (completion ring) | `PressableCard`    | **None**                   | **No `onPress`** | **BUG: Animates on press but navigates nowhere. Should link to `/analytics` or `/(tabs)/maintenance`.**                                           |
| **Expense Trend chart card**           | `PressableCard`    | **None**                   | **No `onPress`** | **BUG: Animates on press but navigates nowhere. Should link to `/analytics`.**                                                                    |
| **Next Maintenance card**              | `PressableCard`    | **None**                   | **No `onPress`** | **BUG: Animates on press but navigates nowhere. Should link to `/maintenance-detail?id={taskId}`.**                                               |
| **Pending Approval cards**             | `PressableCard`    | **None**                   | **No `onPress`** | **BUG: Animates on press but navigates nowhere. Should link to `/supply-detail?id={approvalId}`.**                                                |
| "Review All Requests" button           | `GradientButton`   | `/(tabs)/supplies`         | Yes              | --                                                                                                                                                |
| **Activity log cards**                 | `PressableCard`    | **None**                   | **No `onPress`** | **BUG: Animates on press but navigates nowhere. Should link to the relevant detail screen based on `log.type`.**                                  |

---

### Manager Dashboard (`(tabs)/manager/index.tsx`)

| Element                            | Type               | Target                       | Has onPress?      | Issue?                                                                                                    |
| ---------------------------------- | ------------------ | ---------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| Search icon (header)               | `TouchableOpacity` | Opens `GlobalSearch`         | Yes               | --                                                                                                        |
| `ProfileHeaderButton` (header)     | `TouchableOpacity` | `/profile`                   | Yes               | --                                                                                                        |
| StatCard "Vessels"                 | `StatCard`         | `/assign-boats`              | Yes               | --                                                                                                        |
| StatCard "Urgent Tasks"            | `StatCard`         | `/(tabs)/maintenance`        | Yes               | --                                                                                                        |
| StatCard "Open Issues"             | `StatCard`         | `/(tabs)/issues`             | Yes               | --                                                                                                        |
| StatCard "Pending Approvals"       | `StatCard`         | `/(tabs)/supplies`           | Yes               | --                                                                                                        |
| **Fleet Status vessel cards**      | Plain `View`       | **None**                     | **Not pressable** | **MISSING: Vessel cards are not tappable. Should navigate to vessel detail or filtered maintenance.**     |
| **RealtimeFeed activity items**    | Plain `View`       | **None**                     | **Not pressable** | **MISSING: Feed items look like cards but are not tappable. Should navigate to relevant detail screens.** |
| Approve button (on approval cards) | `TouchableOpacity` | Calls `approveSupplyRequest` | Yes               | Action only, no nav                                                                                       |
| Reject button (on approval cards)  | `TouchableOpacity` | Calls `denySupplyRequest`    | Yes               | Action only, no nav                                                                                       |
| "View All Requests" button         | `TouchableOpacity` | `/(tabs)/supplies`           | Yes               | --                                                                                                        |
| **Upcoming Maintenance cards**     | Plain `View`       | **None**                     | **Not pressable** | **MISSING: Maintenance preview cards should navigate to `/maintenance-detail?id={taskId}`.**              |
| Quick Action: "Assign Boats"       | `TouchableOpacity` | `/assign-boats`              | Yes               | --                                                                                                        |
| Quick Action: "Schedule Task"      | `TouchableOpacity` | `/add-maintenance-task`      | Yes               | --                                                                                                        |
| Quick Action: "View Analytics"     | `TouchableOpacity` | `/analytics`                 | Yes               | --                                                                                                        |

---

### Crew Dashboard (`(tabs)/crew/index.tsx`)

| Element                            | Type               | Target                  | Has onPress?      | Issue?                                                                                                                       |
| ---------------------------------- | ------------------ | ----------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ProfileHeaderButton` (header)     | `TouchableOpacity` | `/profile`              | Yes               | --                                                                                                                           |
| **Vessel cards**                   | Plain `View`       | **None**                | **Not pressable** | **MISSING: Should be tappable.**                                                                                             |
| **Stat cards** (Pending/Completed) | Plain `View`       | **None**                | **Not pressable** | Acceptable as summary cards, but could link to filtered lists.                                                               |
| Task cards                         | `TouchableOpacity` | Toggles task completion | Yes               | **ISSUE: Only toggles completion. No way to navigate to `/maintenance-detail?id={taskId}` - crew cannot view task details.** |
| **Supply request cards**           | Plain `View`       | **None**                | **Not pressable** | **MISSING: Should navigate to `/supply-detail?id={requestId}`.**                                                             |
| Quick Action: "Report Issue"       | `TouchableOpacity` | `/add-issue`            | Yes               | --                                                                                                                           |
| Quick Action: "Request Parts"      | `TouchableOpacity` | `/add-parts-request`    | Yes               | --                                                                                                                           |
| Quick Action: "Request Supplies"   | `TouchableOpacity` | `/add-supply-request`   | Yes               | --                                                                                                                           |

---

### Calendar Screen (`(tabs)/calendar/index.tsx`)

| Element                        | Type               | Target                                | Has onPress? | Issue? |
| ------------------------------ | ------------------ | ------------------------------------- | ------------ | ------ |
| Add event icon (header)        | `TouchableOpacity` | `/add-calendar-event`                 | Yes          | --     |
| `ProfileHeaderButton` (header) | `TouchableOpacity` | `/profile`                            | Yes          | --     |
| Previous/Next month arrows     | `TouchableOpacity` | Changes month (state)                 | Yes          | --     |
| Today button                   | `TouchableOpacity` | Resets to today (state)               | Yes          | --     |
| Calendar day cells             | `TouchableOpacity` | Selects date (state)                  | Yes          | --     |
| Event items                    | `TouchableOpacity` | `/calendar-event-detail?eventId={id}` | Yes          | --     |
| "Add Event" (empty state)      | `TouchableOpacity` | `/add-calendar-event`                 | Yes          | --     |

**Fully wired.** No missing navigation.

---

### Maintenance Screen (`(tabs)/maintenance/index.tsx`)

| Element                           | Type               | Target                               | Has onPress? |
| --------------------------------- | ------------------ | ------------------------------------ | ------------ |
| Add task icon (header)            | `TouchableOpacity` | `/add-maintenance-task`              | Yes          |
| `ProfileHeaderButton` (header)    | `TouchableOpacity` | `/profile`                           | Yes          |
| Filter button                     | `TouchableOpacity` | Opens `FilterModal`                  | Yes          |
| Task cards                        | `TouchableOpacity` | `/maintenance-detail?id={taskId}`    | Yes          |
| "Load More" / "Create First Task" | `TouchableOpacity` | Pagination / `/add-maintenance-task` | Yes          |

**Fully wired.** No missing navigation.

---

### Issues Screen (`(tabs)/issues/index.tsx`)

| Element                        | Type               | Target                       | Has onPress? |
| ------------------------------ | ------------------ | ---------------------------- | ------------ |
| Add issue icon (header)        | `TouchableOpacity` | `/add-issue`                 | Yes          |
| `ProfileHeaderButton` (header) | `TouchableOpacity` | `/profile`                   | Yes          |
| Filter chips                   | `TouchableOpacity` | Toggles filter (state)       | Yes          |
| Issue cards                    | `TouchableOpacity` | `/issue-detail?id={issueId}` | Yes          |
| "Load More"                    | `TouchableOpacity` | Pagination                   | Yes          |

**Fully wired.** No missing navigation.

---

### Supplies Screen (`(tabs)/supplies/index.tsx`)

| Element                             | Type               | Target                          | Has onPress? |
| ----------------------------------- | ------------------ | ------------------------------- | ------------ |
| Add supply icon (header, crew only) | `TouchableOpacity` | `/add-supply-request`           | Yes          |
| `ProfileHeaderButton` (header)      | `TouchableOpacity` | `/profile`                      | Yes          |
| Filter chips                        | `TouchableOpacity` | Toggles filter (state)          | Yes          |
| Supply request cards                | `TouchableOpacity` | `/supply-detail?id={requestId}` | Yes          |
| Approve/Deny buttons (manager)      | `TouchableOpacity` | Action only                     | Yes          |

**Fully wired.** No missing navigation.

---

### Documents Screen (`(tabs)/documents/index.tsx`)

| Element                        | Type               | Target                        | Has onPress? |
| ------------------------------ | ------------------ | ----------------------------- | ------------ |
| Add document icon (header)     | `TouchableOpacity` | `/add-document`               | Yes          |
| `ProfileHeaderButton` (header) | `TouchableOpacity` | `/profile`                    | Yes          |
| Filter chips                   | `TouchableOpacity` | Toggles filter (state)        | Yes          |
| Document cards                 | `TouchableOpacity` | `/document-detail?id={docId}` | Yes          |
| "Load More"                    | `TouchableOpacity` | Pagination                    | Yes          |

**Fully wired.** No missing navigation.

---

### Detail Screens

#### `maintenance-detail.tsx`

| Element                  | Type               | Target                                     |
| ------------------------ | ------------------ | ------------------------------------------ |
| Status change buttons    | `TouchableOpacity` | Updates status (action)                    |
| Complete button          | `TouchableOpacity` | Completes task, then `router.back()`       |
| **Vessel name**          | Plain `Text`       | **MISSING: Should link to vessel detail**  |
| **Assigned person name** | Plain `Text`       | **MISSING: Should link to person profile** |

#### `issue-detail.tsx`

| Element                     | Type               | Target                                     |
| --------------------------- | ------------------ | ------------------------------------------ |
| Send comment button         | `TouchableOpacity` | Adds comment (action)                      |
| Start Work / Mark Resolved  | `TouchableOpacity` | Updates status (action)                    |
| **Vessel name**             | Plain `Text`       | **MISSING: Should link to vessel detail**  |
| **Reporter/Assignee names** | Plain `Text`       | **MISSING: Should link to person profile** |

#### `supply-detail.tsx`

| Element                      | Type               | Target                                     |
| ---------------------------- | ------------------ | ------------------------------------------ |
| Approve / Deny buttons       | `TouchableOpacity` | Action, then `router.back()`               |
| **Vessel name**              | Plain `Text`       | **MISSING: Should link to vessel detail**  |
| **Requester/Approver names** | Plain `Text`       | **MISSING: Should link to person profile** |

#### `document-detail.tsx`

| Element                | Type               | Target                                    |
| ---------------------- | ------------------ | ----------------------------------------- |
| "Open Document" button | `TouchableOpacity` | Shows alert (placeholder)                 |
| **Vessel name**        | Plain `Text`       | **MISSING: Should link to vessel detail** |

#### `calendar-event-detail.tsx`

| Element                      | Type               | Target                                      |
| ---------------------------- | ------------------ | ------------------------------------------- |
| Delete button (header)       | `TouchableOpacity` | Deletes event, then `router.back()`         |
| Mark Complete / Cancel Event | `TouchableOpacity` | Updates status (action)                     |
| **Vessel name**              | Plain `Text`       | **MISSING: Should link to vessel detail**   |
| **Attendee names**           | Plain `Text`       | **MISSING: Should link to person profiles** |

---

### Profile Screen (`profile.tsx`)

| Element               | Type               | Target                          |
| --------------------- | ------------------ | ------------------------------- |
| Notifications setting | `TouchableOpacity` | `/notification-settings`        |
| Log Out button        | `TouchableOpacity` | Logs out, navigates to `/login` |

---

### Analytics Screen (`analytics.tsx`)

**No pressable navigation elements.** Read-only dashboard with charts and metric cards. None of the stat cards or metric cards are tappable.

**MISSING:** Stat cards should link to their source screens (Active Tasks -> maintenance, Open Issues -> issues, Supply Requests -> supplies).

---

## 3. Navigation Map

### Complete Screen Interconnection Graph

```
LOGIN FLOW:
  login ──> forgot-password
  login ──> signup
  login ──> manager-login
  login ──> (tabs)/owner    (via auth)
  login ──> (tabs)/manager  (via auth)
  login ──> (tabs)/crew     (via auth)
  signup ──> login (back)
  forgot-password ──> login (back)

OWNER DASHBOARD:
  (tabs)/owner ──> GlobalSearch (modal)
  (tabs)/owner ──> /profile
  (tabs)/owner ──> /analytics          (via StatCard "Monthly Expenses")
  (tabs)/owner ──> (tabs)/maintenance  (via StatCard "Active Tasks")
  (tabs)/owner ──> (tabs)/issues       (via StatCard "Open Issues")
  (tabs)/owner ──> (tabs)/supplies     (via StatCard + "Review All Requests")
  (tabs)/owner ──X  vessel cards (NO DESTINATION)
  (tabs)/owner ──X  performance card (NO DESTINATION)
  (tabs)/owner ──X  expense chart card (NO DESTINATION)
  (tabs)/owner ──X  next maintenance card (NO DESTINATION)
  (tabs)/owner ──X  approval cards (NO DESTINATION)
  (tabs)/owner ──X  activity log cards (NO DESTINATION)

MANAGER DASHBOARD:
  (tabs)/manager ──> GlobalSearch (modal)
  (tabs)/manager ──> /profile
  (tabs)/manager ──> /assign-boats      (via StatCard "Vessels" + Quick Action)
  (tabs)/manager ──> (tabs)/maintenance (via StatCard "Urgent Tasks")
  (tabs)/manager ──> (tabs)/issues      (via StatCard "Open Issues")
  (tabs)/manager ──> (tabs)/supplies    (via StatCard + "View All Requests")
  (tabs)/manager ──> /add-maintenance-task (via Quick Action)
  (tabs)/manager ──> /analytics          (via Quick Action)
  (tabs)/manager ──X  fleet status cards (NOT PRESSABLE)
  (tabs)/manager ──X  activity feed items (NOT PRESSABLE)
  (tabs)/manager ──X  upcoming maintenance cards (NOT PRESSABLE)

CREW DASHBOARD:
  (tabs)/crew ──> /profile
  (tabs)/crew ──> /add-issue          (via Quick Action)
  (tabs)/crew ──> /add-parts-request  (via Quick Action)
  (tabs)/crew ──> /add-supply-request (via Quick Action)
  (tabs)/crew ──X  vessel cards (NOT PRESSABLE)
  (tabs)/crew ──X  task cards (TOGGLE ONLY, no detail nav)
  (tabs)/crew ──X  supply request cards (NOT PRESSABLE)

CALENDAR:
  (tabs)/calendar ──> /profile
  (tabs)/calendar ──> /add-calendar-event
  (tabs)/calendar ──> /calendar-event-detail?eventId={id}

LIST SCREENS (all fully wired):
  (tabs)/maintenance ──> /maintenance-detail?id={id}
  (tabs)/maintenance ──> /add-maintenance-task
  (tabs)/maintenance ──> /profile
  (tabs)/issues ──> /issue-detail?id={id}
  (tabs)/issues ──> /add-issue
  (tabs)/issues ──> /profile
  (tabs)/supplies ──> /supply-detail?id={id}
  (tabs)/supplies ──> /add-supply-request
  (tabs)/supplies ──> /profile
  (tabs)/documents ──> /document-detail?id={id}
  (tabs)/documents ──> /add-document
  (tabs)/documents ──> /profile

DETAIL SCREENS (all dead-ends for cross-entity nav):
  maintenance-detail ──> router.back() (on complete)
  issue-detail ──> (no outbound nav)
  supply-detail ──> router.back() (on approve/deny)
  document-detail ──> (no outbound nav)
  calendar-event-detail ──> router.back() (on delete)

PROFILE:
  /profile ──> /notification-settings
  /profile ──> /login (via logout)

GLOBAL SEARCH:
  GlobalSearch ──> /maintenance-detail?id={id}  (maintenance type)
  GlobalSearch ──> (tabs)/issues                 (issue type - list, NOT detail)
  GlobalSearch ──> (tabs)/supplies               (supply type - list, NOT detail)
  GlobalSearch ──> (tabs)/documents              (document type - list, NOT detail)
  GlobalSearch ──> (tabs)/owner                  (vessel type - dashboard, NOT detail)
```

---

## 4. Missing Navigation Links

### Critical: PressableCards with No `onPress`

These use `PressableCard` which has a press animation (scale + haptics) -- users will tap them expecting navigation, but nothing happens.

| Screen          | Element                            | Line | Suggested Destination                                                                           |
| --------------- | ---------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| Owner Dashboard | Vessel cards (fleet grid)          | ~239 | Vessel detail (new screen) or `/(tabs)/maintenance` filtered by vessel                          |
| Owner Dashboard | Performance card (completion ring) | ~347 | `/analytics` or `/(tabs)/maintenance`                                                           |
| Owner Dashboard | Expense Trend chart card           | ~378 | `/analytics`                                                                                    |
| Owner Dashboard | Next Maintenance card              | ~394 | `/maintenance-detail?id={upcomingMaintenance.id}`                                               |
| Owner Dashboard | Pending Approval cards             | ~459 | `/supply-detail?id={approval.id}`                                                               |
| Owner Dashboard | Activity log cards                 | ~500 | Route based on `log.type`: maintenance -> `/maintenance-detail`, issue -> `/issue-detail`, etc. |

### Critical: Items That Look Tappable But Aren't Wrapped in Pressables

| Screen            | Element                     | Suggested Destination                 |
| ----------------- | --------------------------- | ------------------------------------- |
| Manager Dashboard | Fleet Status vessel cards   | Vessel detail or filtered maintenance |
| Manager Dashboard | RealtimeFeed activity items | Detail screen based on activity type  |
| Manager Dashboard | Upcoming Maintenance cards  | `/maintenance-detail?id={item.id}`    |
| Crew Dashboard    | Vessel cards                | Vessel detail or filtered tasks       |
| Crew Dashboard    | Supply request cards        | `/supply-detail?id={request.id}`      |

### Missing: Crew Task Navigation

| Screen         | Element    | Current Behavior       | Suggested Behavior                                                                                                                                       |
| -------------- | ---------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Crew Dashboard | Task cards | Toggle completion only | Should also navigate to `/maintenance-detail?id={task.id}` (e.g. a detail chevron or separate tap area). Currently crew cannot view task details at all. |

### Missing: Cross-Entity Links in Detail Screens

Every detail screen displays vessel names, person names, etc. as plain text. These should be tappable.

| Detail Screen         | Field                            | Suggested Action                                          |
| --------------------- | -------------------------------- | --------------------------------------------------------- |
| maintenance-detail    | Vessel name                      | Navigate to vessel detail or filter maintenance by vessel |
| maintenance-detail    | Assigned person name             | Navigate to person profile (new screen)                   |
| issue-detail          | Vessel name                      | Navigate to vessel detail                                 |
| issue-detail          | Reported by / Assigned to names  | Navigate to person profile                                |
| supply-detail         | Vessel name                      | Navigate to vessel detail                                 |
| supply-detail         | Requested by / Approved by names | Navigate to person profile                                |
| document-detail       | Vessel name                      | Navigate to vessel detail                                 |
| document-detail       | Uploaded by name                 | Navigate to person profile                                |
| calendar-event-detail | Vessel name                      | Navigate to vessel detail                                 |
| calendar-event-detail | Attendee names                   | Navigate to person profiles                               |

### Missing: Analytics Outbound Links

| Screen    | Element                       | Suggested Destination |
| --------- | ----------------------------- | --------------------- |
| Analytics | Stat card "Active Tasks"      | `/(tabs)/maintenance` |
| Analytics | Stat card "Open Issues"       | `/(tabs)/issues`      |
| Analytics | Metric card "Supply Requests" | `/(tabs)/supplies`    |
| Analytics | Metric card "Completion Rate" | `/(tabs)/maintenance` |

---

## 5. Incomplete Navigation in GlobalSearch

`GlobalSearch` (`components/GlobalSearch.tsx` lines 50-74) handles search result navigation inconsistently:

| Result Type   | Current Behavior                       | Expected Behavior                                                             |
| ------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `maintenance` | `/maintenance-detail?id={id}`          | **Correct**                                                                   |
| `issue`       | `/(tabs)/issues` (list, not detail)    | **Should go to** `/issue-detail?id={id}`                                      |
| `supply`      | `/(tabs)/supplies` (list, not detail)  | **Should go to** `/supply-detail?id={id}`                                     |
| `document`    | `/(tabs)/documents` (list, not detail) | **Should go to** `/document-detail?id={id}`                                   |
| `vessel`      | `/(tabs)/owner`                        | **Should go to** vessel detail (doesn't exist) or at minimum filter by vessel |

Only maintenance results navigate to the actual detail screen. All other types dump the user on the list with no context about what they searched for.

---

## 6. Dead-End Screens

Screens with no outbound navigation links (users must use back button or tab bar):

| Screen                      | Notes                                                       |
| --------------------------- | ----------------------------------------------------------- |
| `analytics.tsx`             | Read-only charts. No tappable cards linking to source data. |
| `notification-settings.tsx` | Settings toggles only. Expected behavior.                   |
| `assign-boats.tsx`          | Assignment actions only. Could link to vessel details.      |
| `maintenance-detail.tsx`    | Actions only (status, complete). No cross-links.            |
| `issue-detail.tsx`          | Actions only (status, comment). No cross-links.             |
| `supply-detail.tsx`         | Actions only (approve/deny). No cross-links.                |
| `document-detail.tsx`       | Open file placeholder only. No cross-links.                 |
| `calendar-event-detail.tsx` | Actions only (complete, cancel, delete). No cross-links.    |

---

## 7. Summary of All Issues

### High Priority -- Broken UX (users tap and nothing happens)

1. **Owner Dashboard: 6 PressableCard instances with no `onPress`** -- Cards animate on press (scale down + haptic feedback), creating an expectation of navigation, then do nothing.
   - Vessel cards (~line 239)
   - Performance card (~line 347)
   - Expense chart card (~line 378)
   - Next Maintenance card (~line 394)
   - Pending Approval cards (~line 459)
   - Activity log cards (~line 500)

2. **Crew Dashboard: Task cards only toggle, never show details** -- Crew members have no way to view full task details (description, notes, history, due date context). The only interaction is a completion toggle.

### Medium Priority -- Missing expected navigation

3. **Manager Dashboard: 3 card types are not pressable at all** -- Fleet Status vessel cards, RealtimeFeed items, and Upcoming Maintenance cards are plain `View`s with no touch handling despite looking like interactive cards.

4. **Crew Dashboard: Vessel cards and Supply request cards are not pressable** -- Plain `View`s that users would expect to tap.

5. **GlobalSearch navigates to list screens instead of detail screens** for issues, supplies, documents, and vessels -- defeats the purpose of search.

### Low Priority -- Polish / cross-linking

6. **Detail screens have no cross-entity links** -- Vessel names, person names shown as plain text across all 5 detail screens. Making these tappable would create a richer navigation web.

7. **Analytics screen has no outbound links** -- Stat/metric cards could link to their corresponding tab screens.

8. **Missing screen: Vessel Detail** -- Multiple places would benefit from a dedicated vessel detail screen (fleet cards on all dashboards, vessel names in detail screens, vessel search results). No `/vessel-detail` route exists.

9. **Missing screen: Crew/Person Profile** -- Person names appear throughout detail screens (assigned to, reported by, approved by, attendees) but there's no way to view a person's profile or their work.
