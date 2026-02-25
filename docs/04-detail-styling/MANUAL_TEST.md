# Vessel Central — Manual Test Plan

Run this on a physical iOS device and an Android device (or emulators). Test every screen, every tap target, every form. If something crashes or looks broken, stop and note it.

---

## Pre-Test Setup

1. Fresh install — clear AsyncStorage / reinstall the app
2. App launches to login screen
3. Confirm all three quick-login role buttons are visible: **Owner**, **Manager**, **Crew**

---

## 1. Login & Auth Flow

### 1.1 Login Screen

- [ ] App loads without crash
- [ ] Quick login buttons for Owner, Manager, Crew are visible
- [ ] Email/password fields render correctly
- [ ] Tapping "Forgot Password?" navigates to forgot-password screen
- [ ] Forgot Password screen shows "Demo Mode" alert and navigates back on OK
- [ ] Tapping "Sign Up" navigates to signup screen and back works
- [ ] Tapping "Manager Login" navigates to manager-login screen and back works

### 1.2 Quick Login — Owner

- [ ] Tap Owner quick login → navigates to Owner dashboard
- [ ] Tab bar shows: **Owner, Calendar, Maintenance, Documents**
- [ ] No extra or missing tabs

### 1.3 Quick Login — Manager

- [ ] Log out first (Profile → Logout)
- [ ] Tap Manager quick login → navigates to Manager dashboard
- [ ] Tab bar shows: **Manager, Calendar, Maintenance, Issues, Supplies**

### 1.4 Quick Login — Crew

- [ ] Log out first
- [ ] Tap Crew quick login → navigates to Crew dashboard
- [ ] Tab bar shows: **Tasks, Calendar, Issues, Supplies**

---

## 2. Owner Dashboard

Login as **Owner**.

### 2.1 Dashboard Content

- [ ] Fleet Overview section renders vessel cards (Azure Dream, Ocean Pearl, Sea Breeze)
- [ ] Key Metrics section renders stat cards
- [ ] Pending Approvals section shows supply requests
- [ ] Recent Activity section shows activity items
- [ ] No blank sections, no missing data

### 2.2 Navigation from Dashboard

- [ ] Tap a vessel card → navigates to Vessel Detail
- [ ] Tap a stat card → navigates to relevant tab or analytics
- [ ] Tap a pending approval → navigates to Supply Detail
- [ ] Tap an activity item → navigates to correct detail screen
- [ ] Header profile button → navigates to Profile screen
- [ ] Profile screen shows user info, logout button works

### 2.3 Vessel Detail (from dashboard)

- [ ] Title shows vessel name
- [ ] Stats row shows 4 StatCards: Tasks, Issues, Supplies, Docs with counts
- [ ] Active Tasks section lists tasks, each tappable → Maintenance Detail
- [ ] Open Issues section lists issues, each tappable → Issue Detail
- [ ] Pending Supplies lists requests, each tappable → Supply Detail
- [ ] Documents section lists docs, each tappable → Document Detail
- [ ] Back navigation works

---

## 3. Maintenance Tab (Owner or Manager)

### 3.1 List Screen

- [ ] Shows maintenance tasks with search bar and filters
- [ ] Multiple tasks visible (should be 9 total with enriched data)
- [ ] Varied statuses visible: open, in_progress, completed, waiting_on_parts
- [ ] Search filters tasks by title
- [ ] Filter chips filter by status
- [ ] Tap "+ " / add button → opens Add Maintenance Task modal
- [ ] Tap a task card → navigates to Maintenance Detail

### 3.2 Maintenance Detail

- [ ] Shows task title, description, priority badge, status badge
- [ ] Shows vessel name (tappable → Vessel Detail)
- [ ] Shows assigned crew, due date, cost info
- [ ] For completed tasks: shows completion history with notes
- [ ] For waiting_on_parts tasks: status badge shows correctly
- [ ] Back navigation works

### 3.3 Add Maintenance Task

- [ ] Modal slides up correctly
- [ ] Cancel button (header left) dismisses modal
- [ ] All form fields render: title, description, vessel selector, priority, due date, recurring toggle
- [ ] Vessel chips show user's vessels
- [ ] Submit with empty required fields → shows validation alert
- [ ] Fill all required fields → submit succeeds with success alert
- [ ] New task appears in maintenance list after dismissing modal
- [ ] Scroll to bottom — submit button is visible/reachable

---

## 4. Documents Tab (Owner)

### 4.1 List Screen

- [ ] Shows documents with search and category filters
- [ ] Multiple documents visible (should be 7 total)
- [ ] Category filter chips work (All, Manual, Insurance, Registration, etc.)
- [ ] Important badge visible on flagged documents
- [ ] Expired badge visible on expired documents (if any)
- [ ] Tap "+ " / add button → opens Add Document modal
- [ ] Tap a document → navigates to Document Detail

### 4.2 Document Detail

- [ ] Shows document title, category badge
- [ ] Important badge shows if flagged
- [ ] Description section renders
- [ ] Detail card shows: File Name, File Size, File Type, Vessel (tappable), Uploaded By, Uploaded date
- [ ] Expiry date shows with color if expired
- [ ] Tags section shows tag chips
- [ ] Preview card shows file icon, filename, type/size
- [ ] **Download button** → shows demo alert "saved to device" (NOT a crash)
- [ ] **Share button** → shows demo alert "share sheet opened" (NOT a crash)
- [ ] No "Open Document" button exists (removed)
- [ ] Back navigation works

### 4.3 Add Document

- [ ] Modal slides up
- [ ] "Select Document" picker button renders
- [ ] Tap picker → system file picker opens (or shows permission dialog)
- [ ] Title, Description, Vessel, Category, Expiry Date, Tags, Important toggle all render
- [ ] Submit with empty required fields → validation alert
- [ ] Cancel dismisses modal
- [ ] Scroll to bottom — submit button is reachable

---

## 5. Calendar Tab (All Roles)

### 5.1 Calendar Screen

- [ ] Calendar grid renders current month
- [ ] Event dots visible on days with events
- [ ] Tap a day → shows events for that day below
- [ ] Tap an event → navigates to Calendar Event Detail
- [ ] Add event button → opens Add Calendar Event modal
- [ ] If a day has no events → shows "No events scheduled" empty state

### 5.2 Calendar Event Detail

- [ ] Shows event title, type badge, status badge
- [ ] Shows vessel name, location, time range
- [ ] Shows attendees list
- [ ] Shows description and notes if present
- [ ] Back navigation works

### 5.3 Add Calendar Event

- [ ] Modal slides up
- [ ] Event type chips render (maintenance, charter, inspection, etc.)
- [ ] Vessel chips render
- [ ] If no vessels assigned → shows empty vessel message (not a crash)
- [ ] Date/time pickers work on both iOS and Android
- [ ] All Day toggle works
- [ ] Save with empty title → shows validation alert
- [ ] Save with no vessel → shows validation alert
- [ ] Successful save → success alert, modal dismisses
- [ ] Scroll to bottom — form fields at bottom are reachable with keyboard up

---

## 6. Issues Tab (Manager or Crew)

Log in as **Manager** or **Crew**.

### 6.1 List Screen

- [ ] Shows issues with search and filter chips
- [ ] Multiple issues visible (should be 5 total)
- [ ] Filter chips: All, Open, In Progress, Waiting on Parts, Completed
- [ ] Completed issue visible (Galley Faucet Drip)
- [ ] In-progress issue visible (Engine Room Ventilation Fan Noise)
- [ ] Tap an issue → navigates to Issue Detail
- [ ] Add issue button → opens Add Issue modal

### 6.2 Issue Detail

- [ ] Shows title, priority badge, status badge, category badge
- [ ] Description section renders
- [ ] **Attachments section** shows if issue has attachments (horizontal scroll of thumbnails)
- [ ] Detail card shows: Vessel (tappable), Reported By, Location, Created, Assigned To (if assigned), Resolved (if resolved)
- [ ] **Comments section** shows pre-populated comments with author and date
- [ ] Comment input field renders at bottom
- [ ] Type a comment → send button activates
- [ ] Tap send → comment appears in list, input clears
- [ ] Empty comment → send button is disabled
- [ ] **Actions section** (Manager/Owner only, not completed):
  - [ ] "Assign to Me" button shows when unassigned
  - [ ] Tap "Assign to Me" → shows alert, issue now shows assigned
  - [ ] "Start Work" button shows for open issues
  - [ ] "Mark Resolved" button shows for in_progress issues
- [ ] Back navigation works

### 6.3 Add Issue

- [ ] Modal slides up
- [ ] If no vessels assigned → shows empty vessel message (not a crash)
- [ ] All fields render: title, description, vessel, priority, category, location
- [ ] Photo attachment buttons work (camera, gallery)
- [ ] Submit with empty fields → validation alerts
- [ ] Successful submit → success alert, modal dismisses
- [ ] New issue appears in issues list
- [ ] Scroll to bottom — submit button reachable

---

## 7. Supplies Tab (Manager or Crew)

### 7.1 List Screen

- [ ] Shows supply requests with search and filter chips
- [ ] Multiple requests visible (should be 6 total)
- [ ] Varied statuses: pending, approved, ordered, received, denied
- [ ] Filter chips work correctly
- [ ] Tap a request → navigates to Supply Detail
- [ ] Add button (Crew) → opens Add Supply Request modal

### 7.2 Supply Detail

- [ ] Shows item name, status badge, priority badge
- [ ] Description section renders
- [ ] Detail card shows: Quantity, Estimated Cost, Actual Cost (if present), Vessel (tappable), Category, Requested By, Created
- [ ] Vendor shows if present
- [ ] Approved By / Approved On show if approved
- [ ] Denial Reason shows if denied
- [ ] Notes section shows if present
- [ ] **Approve/Deny buttons** (Manager/Owner, pending requests):
  - [ ] Approve → confirmation alert → shows approved alert
  - [ ] Deny → confirmation alert → shows denied alert
- [ ] **Mark as Ordered button** (Manager/Owner, approved requests):
  - [ ] Shows for approved requests
  - [ ] Tap → shows "marked as ordered" alert
  - [ ] Status badge updates to "ORDERED"
- [ ] **Mark as Received button** (Manager/Owner, ordered requests):
  - [ ] Shows for ordered requests
  - [ ] Tap → shows "marked as received" alert
  - [ ] Status badge updates to "RECEIVED"
- [ ] Back navigation works

### 7.3 Add Supply Request

- [ ] If no vessels assigned → shows empty vessel message
- [ ] All fields render: item name, description, quantity, unit, cost, vessel, priority, category, notes
- [ ] Submit with empty fields → validation alerts
- [ ] Successful submit → success alert, modal dismisses

### 7.4 Add Parts Request (Crew)

- [ ] If no vessels assigned → shows empty vessel message
- [ ] Info card renders at top
- [ ] All fields: part name, part number, description, quantity, vessel, location, urgency, category, vendor, cost
- [ ] Photo/document attachment buttons work
- [ ] Submit with empty fields → validation alerts
- [ ] Successful submit → success alert, modal dismisses

---

## 8. Crew-Specific Tests

Log in as **Crew**.

### 8.1 Crew Dashboard

- [ ] "My Vessels" section shows assigned vessels
- [ ] Task stats show Pending/Completed counts
- [ ] "My Tasks" section shows assigned tasks with checkboxes
- [ ] Tap a task checkbox → toggles completion
- [ ] Tap a task card → navigates to Maintenance Detail
- [ ] Supply requests section renders
- [ ] Quick action buttons at bottom: Report Issue, Request Parts, Request Supplies
- [ ] Each quick action navigates to correct form

### 8.2 Crew Can't Access Owner-Only Screens

- [ ] No Documents tab visible
- [ ] No Maintenance tab visible (crew sees "Tasks" tab instead)

---

## 9. Analytics Screen (Owner/Manager)

Log in as **Owner** or **Manager**.

### 9.1 Navigation

- [ ] Accessible from Owner dashboard stat cards or Manager quick actions

### 9.2 Content

- [ ] Total Expenses stat card renders with dollar amount
- [ ] Avg Monthly stat card renders
- [ ] Active Tasks stat card renders (tappable → maintenance tab)
- [ ] Open Issues stat card renders (tappable → issues tab)
- [ ] **Expense Trends** line chart renders without crash
- [ ] **Expenses by Category** bar chart renders without crash
- [ ] **Task Status Distribution** pie chart renders without crash
- [ ] **Key Metrics** section:
  - [ ] Completion Rate shows percentage with "X of Y tasks completed"
  - [ ] Average Response Time shows computed value (not "2.3 days" hardcoded)
  - [ ] Supply Requests shows count with pending count
- [ ] Back navigation works

---

## 10. Profile & Settings

### 10.1 Profile Screen

- [ ] Shows user name, email, role
- [ ] Notification settings link → navigates to Notification Settings
- [ ] Logout button → returns to login screen
- [ ] Login persists across app restart (check AsyncStorage)

---

## 11. Edge Cases & Stress Tests

### 11.1 Empty States

- [ ] Filter maintenance to a status with no results → empty state shows
- [ ] Filter issues to "Completed" → shows completed issues (or empty state if none match filter)
- [ ] Filter supplies to "Denied" → shows denied request
- [ ] Search with gibberish text → empty state shows, no crash

### 11.2 Rapid Navigation

- [ ] Quickly tap between all tabs → no crash, no stale data
- [ ] Open detail screen → back → open different detail → back → still works
- [ ] Open form modal → cancel → open again → form is fresh (not stale)

### 11.3 Long Text

- [ ] Issue with long title/description → text wraps properly, doesn't overflow
- [ ] Comment with long text → wraps properly in comment card

### 11.4 Orientation (if applicable)

- [ ] Rotate device → layout adjusts without crash (or lock to portrait if that's the design)

### 11.5 Background/Foreground

- [ ] Background the app → bring back to foreground → still works, data persists

---

## 12. Cross-Platform Checks

### iOS-Specific

- [ ] Safe area: content not hidden behind Dynamic Island/notch
- [ ] Safe area: content not hidden behind home indicator
- [ ] Tab bar: content not hidden behind tab bar
- [ ] Date pickers render as native iOS pickers
- [ ] Keyboard dismisses when tapping outside input fields
- [ ] Scroll bounce feels natural

### Android-Specific

- [ ] Status bar: content not hidden behind status bar
- [ ] Navigation bar: content not hidden behind Android nav bar
- [ ] Back gesture/button works correctly on all screens
- [ ] Date pickers render as native Android pickers
- [ ] Keyboard back button dismisses keyboard
- [ ] No janky scroll behavior

---

## Test Completion Checklist

| Section                | iOS | Android |
| ---------------------- | --- | ------- |
| 1. Login & Auth        |     |         |
| 2. Owner Dashboard     |     |         |
| 3. Maintenance Tab     |     |         |
| 4. Documents Tab       |     |         |
| 5. Calendar Tab        |     |         |
| 6. Issues Tab          |     |         |
| 7. Supplies Tab        |     |         |
| 8. Crew-Specific       |     |         |
| 9. Analytics           |     |         |
| 10. Profile & Settings |     |         |
| 11. Edge Cases         |     |         |
| 12. Cross-Platform     |     |         |
