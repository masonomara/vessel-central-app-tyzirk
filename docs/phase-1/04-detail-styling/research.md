# Vessel Central - Codebase Research

## Tech Stack

- **Framework:** Expo / React Native with Expo Router (file-based routing)
- **React:** 19.1.0, React Native 0.81.4
- **State:** React Context API (AuthContext, DataContext)
- **Storage:** AsyncStorage
- **Platform:** iOS, Android, Web (PWA)

---

## User Roles

| Capability       |     Owner      |    Manager    |          Crew          |
| ---------------- | :------------: | :-----------: | :--------------------: |
| **Dashboard**    |   Owner tab    |  Manager tab  |        Crew tab        |
| **Calendar**     |      Yes       |      Yes      |          Yes           |
| **Maintenance**  |      View      |   Full CRUD   | View + toggle complete |
| **Issues**       |       No       | View + manage |     Report + view      |
| **Supplies**     | View + approve | Approve/deny  |     Request + view     |
| **Documents**    |   Full CRUD    |      No       |           No           |
| **Assign boats** |       No       |      Yes      |           No           |
| **Analytics**    |      Yes       |      Yes      |           No           |
| **Expenses**     |      View      |      No       |           No           |

---

## All Screens (41 files)

### Tab Screens (8)

| Screen            | File                           | Accessible By        |
| ----------------- | ------------------------------ | -------------------- |
| Owner Dashboard   | `(tabs)/owner/index.tsx`       | Owner                |
| Manager Dashboard | `(tabs)/manager/index.tsx`     | Manager              |
| Crew Dashboard    | `(tabs)/crew/index.tsx`        | Crew                 |
| Calendar          | `(tabs)/calendar/index.tsx`    | Owner, Manager, Crew |
| Maintenance       | `(tabs)/maintenance/index.tsx` | Owner, Manager       |
| Issues            | `(tabs)/issues/index.tsx`      | Manager, Crew        |
| Supplies          | `(tabs)/supplies/index.tsx`    | Manager, Crew        |
| Documents         | `(tabs)/documents/index.tsx`   | Owner                |

### Detail Screens (6)

| Screen                | File                        | Accessible By        |
| --------------------- | --------------------------- | -------------------- |
| Maintenance Detail    | `maintenance-detail.tsx`    | Owner, Manager, Crew |
| Issue Detail          | `issue-detail.tsx`          | Manager, Crew        |
| Supply Detail         | `supply-detail.tsx`         | Owner, Manager, Crew |
| Document Detail       | `document-detail.tsx`       | Owner                |
| Calendar Event Detail | `calendar-event-detail.tsx` | Owner, Manager, Crew |
| Vessel Detail         | `vessel-detail.tsx`         | Owner, Manager, Crew |

### Modal/Form Screens (6)

| Screen               | File                       | Accessible By        |
| -------------------- | -------------------------- | -------------------- |
| Add Maintenance Task | `add-maintenance-task.tsx` | Manager              |
| Add Issue            | `add-issue.tsx`            | Manager, Crew        |
| Add Supply Request   | `add-supply-request.tsx`   | Manager, Crew        |
| Add Parts Request    | `add-parts-request.tsx`    | Crew                 |
| Add Document         | `add-document.tsx`         | Owner                |
| Add Calendar Event   | `add-calendar-event.tsx`   | Owner, Manager, Crew |

### Utility Screens (4)

| Screen                | File                        | Accessible By        |
| --------------------- | --------------------------- | -------------------- |
| Profile               | `profile.tsx`               | Owner, Manager, Crew |
| Assign Boats          | `assign-boats.tsx`          | Manager              |
| Notification Settings | `notification-settings.tsx` | Owner, Manager, Crew |
| Analytics             | `analytics.tsx`             | Owner, Manager       |

### Auth Screens (5)

| Screen          | File                  | Accessible By         |
| --------------- | --------------------- | --------------------- |
| Index (Splash)  | `index.tsx`           | All (unauthenticated) |
| Login           | `login.tsx`           | All (unauthenticated) |
| Sign Up         | `signup.tsx`          | All (unauthenticated) |
| Forgot Password | `forgot-password.tsx` | All (unauthenticated) |
| Manager Login   | `manager-login.tsx`   | All (unauthenticated) |

---

## All Components (14)

| Component           | File                      | Used By (screen count) |
| ------------------- | ------------------------- | ---------------------- |
| IconSymbol          | `IconSymbol.tsx`          | 22 screens             |
| PressableCard       | `PressableCard.tsx`       | 8 screens              |
| ProfileHeaderButton | `ProfileHeaderButton.tsx` | 8 screens (all tabs)   |
| StatCard            | `StatCard.tsx`            | 3 screens              |
| ProgressRing        | `ProgressRing.tsx`        | 2 screens              |
| GlobalSearch        | `GlobalSearch.tsx`        | 2 screens              |
| GradientButton      | `GradientButton.tsx`      | 1 screen               |
| MiniChart           | `MiniChart.tsx`           | 1 screen               |
| RealtimeFeed        | `RealtimeFeed.tsx`        | 1 screen               |
| FilterModal         | `FilterModal.tsx`         | 1 screen               |
| LinkedDetailRow     | `LinkedDetailRow.tsx`     | 3 screens              |
| ValidatedInput      | `ValidatedInput.tsx`      | 1 screen               |
| EmptyState          | `EmptyState.tsx`          | 0 screens (unused)     |
| ErrorBoundary       | `ErrorBoundary.tsx`       | 1 (root layout)        |

---

## Screen Interconnection Map

### Owner Dashboard `(tabs)/owner/index.tsx`

**Components:** IconSymbol, StatCard, ProgressRing, MiniChart, PressableCard, GradientButton, GlobalSearch, ProfileHeaderButton

| Navigates To              | Method      |
| ------------------------- | ----------- |
| `/(tabs)/supplies`        | router.push |
| `/analytics`              | router.push |
| `/vessel-detail?id=`      | router.push |
| `/maintenance-detail?id=` | router.push |
| `/issue-detail?id=`       | router.push |
| `/supply-detail?id=`      | router.push |

**Data methods:** getVesselsForUser, getMaintenanceTasksForUser, getExpensesForUser, getActivityLogsForUser, getSupplyRequestsForUser, getIssuesForUser

---

### Manager Dashboard `(tabs)/manager/index.tsx`

**Components:** PressableCard, StatCard, ProgressRing, GlobalSearch, RealtimeFeed, ProfileHeaderButton, IconSymbol

| Navigates To              | Method      |
| ------------------------- | ----------- |
| `/(tabs)/supplies`        | router.push |
| `/(tabs)/maintenance`     | router.push |
| `/(tabs)/issues`          | router.push |
| `/assign-boats`           | router.push |
| `/analytics`              | router.push |
| `/vessel-detail?id=`      | router.push |
| `/issue-detail?id=`       | router.push |
| `/maintenance-detail?id=` | router.push |
| `/supply-detail?id=`      | router.push |
| `/add-maintenance-task`   | router.push |

**Data methods:** getVesselsForUser, getMaintenanceTasksForUser, getSupplyRequestsForUser, getIssuesForUser, approveSupplyRequest, denySupplyRequest

---

### Crew Dashboard `(tabs)/crew/index.tsx`

**Components:** PressableCard, IconSymbol, ProfileHeaderButton

| Navigates To              | Method      |
| ------------------------- | ----------- |
| `/vessel-detail?id=`      | router.push |
| `/maintenance-detail?id=` | router.push |
| `/supply-detail?id=`      | router.push |
| `/add-issue`              | router.push |
| `/add-parts-request`      | router.push |
| `/add-supply-request`     | router.push |

**Data methods:** getVesselsForUser, getMaintenanceTasksForUser, getSupplyRequestsForUser, updateMaintenanceTask

---

### Calendar `(tabs)/calendar/index.tsx`

**Components:** ProfileHeaderButton, IconSymbol, PressableCard

| Navigates To                 | Method      |
| ---------------------------- | ----------- |
| `/calendar-event-detail?id=` | router.push |
| `/add-calendar-event`        | router.push |

**Data methods:** calendarEvents, getCalendarEventsForUser, deleteCalendarEvent, updateCalendarEvent

---

### Maintenance `(tabs)/maintenance/index.tsx`

**Components:** IconSymbol, FilterModal, ProfileHeaderButton

| Navigates To              | Method      |
| ------------------------- | ----------- |
| `/maintenance-detail?id=` | router.push |
| `/add-maintenance-task`   | router.push |

**Data methods:** maintenanceTasks

---

### Issues `(tabs)/issues/index.tsx`

**Components:** IconSymbol, ProfileHeaderButton

| Navigates To        | Method      |
| ------------------- | ----------- |
| `/issue-detail?id=` | router.push |
| `/add-issue`        | router.push |

**Data methods:** issues

---

### Supplies `(tabs)/supplies/index.tsx`

**Components:** IconSymbol, ProfileHeaderButton

| Navigates To          | Method      |
| --------------------- | ----------- |
| `/supply-detail?id=`  | router.push |
| `/add-supply-request` | router.push |

**Data methods:** supplyRequests, approveSupplyRequest, denySupplyRequest

---

### Documents `(tabs)/documents/index.tsx`

**Components:** IconSymbol, ProfileHeaderButton

| Navigates To           | Method      |
| ---------------------- | ----------- |
| `/document-detail?id=` | router.push |
| `/add-document`        | router.push |

**Data methods:** documents

---

### Vessel Detail `vessel-detail.tsx`

**Components:** IconSymbol, StatCard, PressableCard

| Navigates To              | Method      |
| ------------------------- | ----------- |
| `/maintenance-detail?id=` | router.push |
| `/issue-detail?id=`       | router.push |
| `/supply-detail?id=`      | router.push |
| `/document-detail?id=`    | router.push |

**Data methods:** maintenanceTasks, issues, supplyRequests, documents

---

### Maintenance Detail `maintenance-detail.tsx`

**Components:** IconSymbol, PressableCard

| Navigates To         | Method      |
| -------------------- | ----------- |
| `/vessel-detail?id=` | router.push |
| back                 | router.back |

**Data methods:** updateMaintenanceTask, completeMaintenanceTask

---

### Issue Detail `issue-detail.tsx`

**Components:** IconSymbol, LinkedDetailRow

| Navigates To         | Method      |
| -------------------- | ----------- |
| `/vessel-detail?id=` | router.push |
| back                 | router.back |

**Data methods:** updateIssue, addIssueComment

---

### Supply Detail `supply-detail.tsx`

**Components:** IconSymbol, LinkedDetailRow

| Navigates To         | Method      |
| -------------------- | ----------- |
| `/vessel-detail?id=` | router.push |
| back                 | router.back |

**Data methods:** approveSupplyRequest, denySupplyRequest, updateSupplyRequest

---

### Document Detail `document-detail.tsx`

**Components:** IconSymbol, LinkedDetailRow

| Navigates To         | Method      |
| -------------------- | ----------- |
| `/vessel-detail?id=` | router.push |

**Data methods:** documents

---

### Calendar Event Detail `calendar-event-detail.tsx`

**Components:** IconSymbol, PressableCard

| Navigates To         | Method      |
| -------------------- | ----------- |
| `/vessel-detail?id=` | router.push |
| back                 | router.back |

**Data methods:** deleteCalendarEvent, updateCalendarEvent

---

### Profile `profile.tsx`

**Components:** IconSymbol, GlassView

| Navigates To             | Method                  |
| ------------------------ | ----------------------- |
| `/notification-settings` | router.push             |
| `/login`                 | router.replace (logout) |

**Data methods:** none

---

### Login `login.tsx`

**Components:** IconSymbol

| Navigates To       | Method         |
| ------------------ | -------------- |
| `/(tabs)/owner`    | router.replace |
| `/(tabs)/manager`  | router.replace |
| `/(tabs)/crew`     | router.replace |
| `/forgot-password` | router.push    |
| `/signup`          | router.push    |
| `/manager-login`   | router.push    |

---

## Interconnection Frequency

How many times each screen is navigated TO from other screens. Higher = more central to the app.

| Screen                   | Inbound Links | Linked From                                                                                                                                         |
| ------------------------ | :-----------: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/vessel-detail`         |     **9**     | owner, manager, crew, maintenance-detail, issue-detail, supply-detail, document-detail, calendar-event-detail, (vessel-detail itself via sub-items) |
| `/maintenance-detail`    |     **4**     | owner, manager, crew, maintenance tab, vessel-detail                                                                                                |
| `/supply-detail`         |     **4**     | owner, manager, crew, supplies tab, vessel-detail                                                                                                   |
| `/issue-detail`          |     **3**     | owner, manager, issues tab, vessel-detail                                                                                                           |
| `/document-detail`       |     **2**     | documents tab, vessel-detail                                                                                                                        |
| `/calendar-event-detail` |     **1**     | calendar tab                                                                                                                                        |
| `/add-maintenance-task`  |     **2**     | manager, maintenance tab                                                                                                                            |
| `/add-issue`             |     **2**     | crew, issues tab                                                                                                                                    |
| `/add-supply-request`    |     **2**     | crew, supplies tab                                                                                                                                  |
| `/add-parts-request`     |     **1**     | crew                                                                                                                                                |
| `/add-document`          |     **1**     | documents tab                                                                                                                                       |
| `/add-calendar-event`    |     **1**     | calendar tab                                                                                                                                        |
| `/analytics`             |     **2**     | owner, manager                                                                                                                                      |
| `/assign-boats`          |     **1**     | manager                                                                                                                                             |
| `/(tabs)/supplies`       |     **2**     | owner, manager                                                                                                                                      |
| `/(tabs)/maintenance`    |     **1**     | manager                                                                                                                                             |
| `/(tabs)/issues`         |     **1**     | manager                                                                                                                                             |

---

## Priority Matrix

Screens ranked by impact: weighted combination of (1) how many roles access it, (2) how many screens link to/from it, (3) component complexity.

### Tier 1 - Highest Priority (most connected, most users)

| Rank | Screen                 | Roles | Inbound | Outbound | Components | Why                                                                                                              |
| :--: | ---------------------- | :---: | :-----: | :------: | :--------: | ---------------------------------------------------------------------------------------------------------------- |
|  1   | **Vessel Detail**      |   3   |    9    |    4     |     3      | Central hub - every detail screen links here, every dashboard links here. Most interconnected screen in the app. |
|  2   | **Manager Dashboard**  |   1   |    0    |    10    |     7      | Highest outbound navigation (10 targets). Most complex dashboard. Manager is the power-user role.                |
|  3   | **Owner Dashboard**    |   1   |    0    |    6     |     8      | Most components (8). Primary experience for the paying customer.                                                 |
|  4   | **Maintenance Detail** |   3   |    4    |    2     |     2      | Accessed by all 3 roles from 4 different screens. Core workflow screen.                                          |
|  5   | **Supply Detail**      |   3   |    4    |    2     |     2      | Accessed by all 3 roles from 4 screens. Contains approval actions.                                               |

### Tier 2 - High Priority (frequently used paths)

| Rank | Screen              | Roles | Inbound | Outbound | Components | Why                                                       |
| :--: | ------------------- | :---: | :-----: | :------: | :--------: | --------------------------------------------------------- |
|  6   | **Crew Dashboard**  |   1   |    0    |    6     |     3      | Entry point for all crew. 6 outbound links.               |
|  7   | **Issue Detail**    |   2   |    3    |    2     |     2      | Comments workflow, status changes. Linked from 3 screens. |
|  8   | **Calendar**        |   3   |    0    |    2     |     3      | Shared by all roles. Date-based navigation complexity.    |
|  9   | **Maintenance Tab** |   2   |    1    |    2     |     3      | Filtering, pagination, sorting. Used by owner + manager.  |
|  10  | **Supplies Tab**    |   2   |    2    |    2     |     2      | Inline approve/deny actions. Linked from 2 dashboards.    |

### Tier 3 - Medium Priority

| Rank | Screen                    | Roles | Inbound | Outbound | Components | Why                                       |
| :--: | ------------------------- | :---: | :-----: | :------: | :--------: | ----------------------------------------- |
|  11  | **Issues Tab**            |   2   |    1    |    2     |     2      | Standard list screen.                     |
|  12  | **Documents Tab**         |   1   |    0    |    2     |     2      | Owner-only. Simple list.                  |
|  13  | **Document Detail**       |   1   |    2    |    1     |     2      | Owner-only. Read-heavy.                   |
|  14  | **Calendar Event Detail** |   3   |    1    |    2     |     2      | Simple detail view with edit/delete.      |
|  15  | **Add Maintenance Task**  |   1   |    2    |    0     |     1      | Form. Manager-only. Linked from 2 places. |
|  16  | **Analytics**             |   2   |    2    |    0     |     0      | Dashboard. Linked from owner + manager.   |

### Tier 4 - Lower Priority (simple forms, single entry points)

| Rank | Screen                    | Roles | Inbound | Outbound | Components | Why                                  |
| :--: | ------------------------- | :---: | :-----: | :------: | :--------: | ------------------------------------ |
|  17  | **Add Issue**             |   2   |    2    |    0     |     1      | Simple form.                         |
|  18  | **Add Supply Request**    |   2   |    2    |    0     |     1      | Simple form.                         |
|  19  | **Add Calendar Event**    |   3   |    1    |    0     |     1      | Simple form.                         |
|  20  | **Add Document**          |   1   |    1    |    0     |     1      | Simple form. Owner-only.             |
|  21  | **Add Parts Request**     |   1   |    1    |    0     |     2      | Simple form. Crew-only.              |
|  22  | **Profile**               |   3   |    0    |    2     |     2      | Settings. Low interaction frequency. |
|  23  | **Assign Boats**          |   1   |    1    |    0     |     1      | Manager utility.                     |
|  24  | **Notification Settings** |   3   |    1    |    0     |     0      | Preferences screen.                  |

### Tier 5 - Auth (build once, rarely revisit)

| Rank | Screen              | Notes                          |
| :--: | ------------------- | ------------------------------ |
|  25  | **Login**           | Entry point. 6 outbound links. |
|  26  | **Sign Up**         | Registration flow.             |
|  27  | **Manager Login**   | Separate manager auth.         |
|  28  | **Forgot Password** | Recovery flow.                 |
|  29  | **Index (Splash)**  | Redirect-only.                 |

---

## Role Coverage Summary

| Role        |                     Tab Screens                      |                      Detail Screens                       |                                    Forms                                    |                           Utility                           | Total Unique Screens |
| ----------- | :--------------------------------------------------: | :-------------------------------------------------------: | :-------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------: |
| **Owner**   |     4 (owner, calendar, maintenance, documents)      | 5 (maintenance, supply, document, calendar-event, vessel) |                    2 (add-document, add-calendar-event)                     |        3 (profile, notification-settings, analytics)        |        **14**        |
| **Manager** | 4 (manager, calendar, maintenance, issues, supplies) |  4 (maintenance, issue, supply, calendar-event, vessel)   | 3 (add-maintenance-task, add-issue, add-supply-request, add-calendar-event) | 4 (profile, assign-boats, notification-settings, analytics) |        **16**        |
| **Crew**    |         4 (crew, calendar, issues, supplies)         |  4 (maintenance, issue, supply, calendar-event, vessel)   |  4 (add-issue, add-supply-request, add-parts-request, add-calendar-event)   |             2 (profile, notification-settings)              |        **14**        |

---

## Component Dependency Graph

Which components are critical vs. isolated.

### Critical (used across many screens)

- **IconSymbol** - 22/29 screens. Universal icon component.
- **PressableCard** - 8 screens. Primary card interaction pattern.
- **ProfileHeaderButton** - 8 screens. All tab screens.

### Important (used in key screens)

- **StatCard** - 3 screens (owner, manager, vessel-detail). Data visualization.
- **LinkedDetailRow** - 3 screens (issue-detail, supply-detail, document-detail). Detail layout.
- **ProgressRing** - 2 screens (owner, manager). Dashboard metric display.
- **GlobalSearch** - 2 screens (owner, manager). Search functionality.

### Single-Use

- **GradientButton** - owner dashboard only
- **MiniChart** - owner dashboard only
- **RealtimeFeed** - manager dashboard only
- **FilterModal** - maintenance tab only
- **ValidatedInput** - add-parts-request only
- **EmptyState** - unused (0 screens)
- **ErrorBoundary** - root layout only

---

## Navigation Flow Diagram

```
                         LOGIN
                        /  |  \
                 OWNER  MANAGER  CREW
                   |       |       |
    +--------------+-------+-------+--------------+
    |              |       |       |              |
 Calendar    Maintenance Issues  Supplies    Documents
    |              |       |       |              |
    v              v       v       v              v
 Cal-Event    Maint     Issue   Supply        Document
  Detail      Detail   Detail   Detail         Detail
    |              |       |       |              |
    +--------------+-------+-------+--------------+
                         |
                    VESSEL DETAIL ← (central hub)
                    /    |    |    \
              Maint   Issue  Supply  Document
              Detail  Detail Detail  Detail
```

---

## Key Takeaways for Prioritization

1. **Vessel Detail is the most critical screen** - it's the hub that connects everything. Every detail screen links to it, and every dashboard links to it. Style this first.

2. **The three dashboards define the first impression** - Owner, Manager, and Crew dashboards are entry points. Owner dashboard has the most components (8), Manager has the most navigation links (10).

3. **Maintenance and Supply flows are the most cross-role** - Both are accessed by all 3 roles and have high interconnection counts. Styling these consistently matters.

4. **Form screens are the simplest** - All 6 modal forms are structurally similar (form fields + submit). They mostly use only IconSymbol. Style one, apply pattern to all.

5. **EmptyState component is unused** - could be removed or integrated into list screens.

6. **Documents is an isolated flow** - only accessible by owners, with minimal interconnection. Lower priority.
