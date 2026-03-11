# Vessel & Co. -- Final UI Polish Research Report

## Application Overview

Vessel & Co. is a yacht fleet management app built with React Native 0.81.4, Expo 54, and Expo Router v6 (file-based routing). Three user roles -- Owner, Manager, Crew -- each get a tailored dashboard and tab set. All data is demo/mock with AsyncStorage persistence (DATA_VERSION = 4). Portrait-only. No backend.

---

## Tech Stack

- React 19.1.0, React Native 0.81.4, Expo ~54.0.1
- Expo Router v6 (typed routes, file-based)
- React Navigation 7.x (native-stack, drawer, tabs)
- TypeScript 5.9.3
- AsyncStorage for persistence
- React Native Reanimated ~4.1.0, Gesture Handler
- React Native Chart Kit (analytics)
- React Native Maps v1.20.1
- Expo Haptics, Notifications, Document Picker, Image Picker
- Linear Gradient, Safe Area Context

---

## Navigation Architecture

### Auth Flow
```
/ (index) -> checks AsyncStorage auth token
  -> /login (mock quick-login buttons: Owner, Manager, Crew)
  -> /member-setup (email signup path)
  -> /(tabs)/{role} on successful login
```

### Tab Configuration by Role

**Owner** (8 tabs): Owner Dashboard, Calendar, Maintenance, Documents, Contacts, Certifications, Charters, Equipment

**Manager** (9 tabs): Manager Dashboard, Calendar, Maintenance, Issues, Supplies, Contacts, Certifications, Charters, Equipment

**Crew** (4 tabs): Crew Dashboard, Calendar, Issues, Supplies

### Detail Screens (Stack Push)
- `/vessel-detail?id={id}`
- `/maintenance-detail?id={id}`
- `/issue-detail?id={id}`
- `/supply-detail?id={id}`
- `/document-detail?id={id}`
- `/calendar-event-detail?eventId={id}`
- `/certification-detail?id={id}`
- `/charter-detail?id={id}`
- `/contact-detail?id={id}`
- `/equipment-detail?id={id}`
- `/profile`
- `/analytics`
- `/assign-boats`
- `/update-engine-hours?vesselId={id}`

### Modal Screens (Bottom Sheet Presentation)
- `/add-maintenance-task`
- `/add-issue`
- `/add-document`
- `/add-calendar-event`
- `/add-supply-request`
- `/add-parts-request`
- `/add-certification`
- `/add-charter`
- `/add-contact`
- `/add-equipment`

---

## Screen-by-Screen Breakdown

### Login (/login)
- Quick-login buttons for 3 mock users
- Email/password fields with email flow to /member-setup
- Background image (login.jpg) with gradient overlay

### Owner Dashboard (/(tabs)/owner)
- Greeting + date
- Pending Approvals (supply requests needing approval)
- Recent Activity feed with type filtering
- Fleet Overview grid (3 vessel cards with status, crew count)
- Performance metrics: task completion ring + 6-month expense trend chart
- Next Maintenance card with priority badge
- Header: global search icon + profile icon

### Manager Dashboard (/(tabs)/manager)
- Greeting + date
- Pending Approvals with inline Approve/Reject buttons
- Realtime Feed (5 latest activity items)
- Fleet Status with vessel cards showing completion ring, crew count, active tasks, open issues
- Upcoming Maintenance (top 3)
- Header: global search + profile

### Crew Dashboard (/(tabs)/crew)
- Greeting + date
- My Tasks with checkbox completion
- Supply Requests (crew-created)
- My Vessels (read-only)

### Calendar (/(tabs)/calendar)
- Month grid with colored event dots
- Day selection shows event list below
- Today button, prev/next month navigation
- Add event from header or empty state
- Event types: maintenance, charter, crew-related, other

### Maintenance (/(tabs)/maintenance)
- SectionList with collapsible sections: Open, In Progress, Waiting on Parts, Completed
- Search bar + vessel filter row
- ItemCard with checkbox (crew completes tasks), priority badges, due dates
- Add button: manager/owner only

### Issues (/(tabs)/issues)
- SectionList by status: Open, In Progress, Waiting on Parts, Completed
- Search + vessel filter
- Checkbox completion
- Add button: all roles

### Supplies (/(tabs)/supplies)
- SectionList by status: Needs Approval, Approved, Ordered, Received, Denied
- Inline Approve/Reject on pending items (manager/owner)
- Add button: crew only

### Documents (/(tabs)/documents)
- SectionList by category: Manual, Insurance, Registration, Safety, Warranty, Invoice, Receipt, Other
- Important/expired badges
- Add button: owner only

### Contacts (/(tabs)/contacts)
- SectionList by type: Crew, Vendor, Marina, Emergency, Owner, Other
- Search by name, role, company, email + vessel filter
- Add button: owner/manager

### Certifications (/(tabs)/certifications)
- SectionList by status: Valid, Expiring Soon (<30 days), Expired
- Search by cert type, crew name + vessel filter
- Add button: owner/manager

### Charters (/(tabs)/charters)
- SectionList by status: Upcoming, In Progress, Completed, Cancelled
- Search by title, itinerary + vessel filter
- Revenue/expense display on cards
- Add button: owner/manager

### Equipment (/(tabs)/equipment)
- SectionList by category: Safety, Water Toys, Navigation, Communication, Anchoring, Tender, Galley, Other
- Condition badges: Good, Fair, Poor, Needs Replacement
- Add button: owner/manager

### Vessel Detail (/vessel-detail)
- Vessel image or icon circle, name, location, status badge
- Engine hours display + "Update Hours" button -> /update-engine-hours
- Engine hour change log
- Collapsible sections: Active Tasks, Open Issues, Pending Supplies, Documents, Calendar Events
- Each item tappable to its detail screen

### Profile (/profile)
- User role badge, name, email, phone, location
- Notification preferences (master toggle + per-category toggles)
- Log Out button with destructive confirmation alert

### Analytics (/analytics)
- Stat cards: Total Expenses, Avg Monthly, Active Tasks, Open Issues
- Charts: Expense Trends (line), Expenses by Category (bar), Task Status Distribution (pie)
- Key Metrics: Completion Rate, Avg Response Time, Supply Requests

---

## Component Library

| Component | Purpose |
|-----------|---------|
| ItemCard | Universal list item -- title, description, vessel, badges, checkbox, actions |
| GroupedListContainer | Groups ItemCards with dividers |
| PressableCard | Generic touchable container with shadow |
| DetailRow | Key-value pair layout for detail screens |
| SearchBar | Text input with search icon |
| FilterRow | Horizontal scrollable filter chips (vessel filter) |
| CollapsibleSectionHeader | Title + count + chevron toggle for SectionLists |
| ProgressRing | Circular progress (task completion, vessel progress) |
| MiniChart | Small bar/line chart for expense trends |
| GlobalSearch | Modal search across all entity types |
| GradientButton | Linear gradient button (primary, accent, success, danger, warning) |
| IconSymbol | Dual-platform icons (SF Symbols + Material) |
| EmptyState | Centered placeholder for empty lists |
| ProfileHeaderButton | Profile access from any tab header |
| RealtimeFeed | Activity stream component |
| ErrorBoundary | App-level error fallback |
| BadgeRow, DetailCellPair, DropdownRow, ValidatedInput | Form/detail helpers |

---

## State Management

### AuthContext
- userRole, userName, userId
- AsyncStorage-backed persistence
- Mock signIn (quick login buttons), signOut clears stored data

### DataContext
- ~90KB of demo data
- 3 vessels: Purely Blu, Ocean Pearl, Sea Breeze
- 4 mock users: Diane (owner), Brett (manager), Marcus (crew), Tanya (crew)
- Full CRUD for: vessels, maintenanceTasks, issues, supplyRequests, documents, contacts, certifications, charterLogs, equipment, calendarEvents
- Comments system on tasks, issues, supplies, documents, charters, equipment
- Activity logging on all mutations
- Engine hour logs with timestamps
- Expense tracking with approval workflow
- Notification system (read/unread)
- Role-based data filtering (getVesselsForUser, getMaintenanceTasksForUser, etc.)

---

## Color System

- Primary: #0A1628 (dark blue)
- Accent: #3B82F6 (bright blue)
- Gold: #C9A84C (premium accent)
- Surfaces: #fbf8f7 (surfaceOne), #f7f2ef (surfaceTwo), #efe4dd (surfaceThree), #ffffff (container)
- Status colors: Green #10B981, Amber #F59E0B, Red #9d2435, Blue #3B82F6
- Badge pairs: Red, Orange, Yellow, Green, Blue, Purple (each with fg/bg)

---

## Demo Data

3 vessels based in US Virgin Islands / British Virgin Islands:
1. **Purely Blu** -- Red Hook, St. Thomas -- 1247 engine hours
2. **Ocean Pearl** -- Nanny Cay, Tortola -- 892 engine hours
3. **Sea Breeze** -- Cruz Bay, St. John -- 2034 engine hours

20+ maintenance tasks, 5+ issues, 6+ supply requests, 7+ documents, multiple contacts, certifications, charter logs, equipment items across all vessels.

---

## Potential Issues for Final Polish

### Layout Concerns
1. **Fleet grid vessel cards** -- flexWrap layout may produce inconsistent heights across cards
2. **Calendar grid on tablet** -- portrait-only may underutilize width
3. **Nested scrolling** -- vessel-detail has multiple collapsible scrollable sections; potential scroll conflicts
4. **Keyboard overlap** -- comment forms on detail screens lack KeyboardAvoidingView; input may be hidden behind keyboard
5. **Section header borders** -- 3.5px subtle borders may be invisible on some devices
6. **Long lists** -- no pagination or virtualization optimization beyond SectionList

### Navigation Concerns
1. **Modal escape on Android** -- add-form modals rely on swipe-to-dismiss (iOS) and system back (Android); no explicit close/cancel button visible in all modals (verify each)
2. **Tab count** -- Owner has 8 tabs, Manager has 9 tabs. On smaller phones, tab labels may truncate or become unusable. Verify scrollable tab bar behavior.
3. **Global search result navigation** -- verify all result types route correctly to their detail screens

### Dead-End Risk Areas
1. **Assign Boats (/assign-boats)** -- verify this screen is reachable and has clear back navigation
2. **Update Engine Hours (/update-engine-hours)** -- verify accessible from vessel-detail and navigates back correctly
3. **Add Parts Request (/add-parts-request)** -- verify reachable from crew dashboard quick actions
4. **Analytics (/analytics)** -- verify accessible from owner/manager dashboard stat cards

### Visual Consistency
1. **Empty states** -- mix of custom empty components and generic EmptyState; verify consistent styling
2. **Badge styling** -- verify all status/priority badges use the same design tokens
3. **Detail screen layouts** -- 10 different detail screens; verify all follow the same visual hierarchy

### Accessibility
1. No explicit accessibilityLabel props visible in component code
2. Small font sizes (12px) on badge text, metadata
3. Checkbox hit slop is 8-10px -- may need larger touch targets

### Performance
1. React.memo on ItemCard -- good
2. useMemo used heavily for computed data -- good
3. AsyncStorage persistence may slow app launch
4. No image caching strategy visible for vessel photos

---

## File Reference

### Core Navigation
- `app/_layout.tsx` -- root layout, providers, stack config
- `app/index.tsx` -- splash/redirect
- `app/login.tsx` -- auth screen
- `app/member-setup.tsx` -- email signup form
- `app/(tabs)/_layout.tsx` -- tab configuration, role-based visibility, badges

### Tab Screens
- `app/(tabs)/owner/index.tsx`
- `app/(tabs)/manager/index.tsx`
- `app/(tabs)/crew/index.tsx`
- `app/(tabs)/calendar/index.tsx`
- `app/(tabs)/maintenance/index.tsx`
- `app/(tabs)/issues/index.tsx`
- `app/(tabs)/supplies/index.tsx`
- `app/(tabs)/documents/index.tsx`
- `app/(tabs)/contacts/index.tsx`
- `app/(tabs)/certifications/index.tsx`
- `app/(tabs)/charters/index.tsx`
- `app/(tabs)/equipment/index.tsx`

### Detail Screens
- `app/vessel-detail.tsx`
- `app/maintenance-detail.tsx`
- `app/issue-detail.tsx`
- `app/supply-detail.tsx`
- `app/document-detail.tsx`
- `app/calendar-event-detail.tsx`
- `app/certification-detail.tsx`
- `app/charter-detail.tsx`
- `app/contact-detail.tsx`
- `app/equipment-detail.tsx`
- `app/profile.tsx`
- `app/analytics.tsx`
- `app/assign-boats.tsx`
- `app/update-engine-hours.tsx`

### Form Modals
- `app/add-maintenance-task.tsx`
- `app/add-issue.tsx`
- `app/add-document.tsx`
- `app/add-calendar-event.tsx`
- `app/add-supply-request.tsx`
- `app/add-parts-request.tsx`
- `app/add-certification.tsx`
- `app/add-charter.tsx`
- `app/add-contact.tsx`
- `app/add-equipment.tsx`

### State
- `contexts/AuthContext.tsx`
- `contexts/DataContext.tsx`

### Styling & Types
- `styles/commonStyles.ts`
- `types/index.ts`
- `types/calendar.ts`

### Components
- `components/ItemCard.tsx`
- `components/GroupedListContainer.tsx`
- `components/PressableCard.tsx`
- `components/GlobalSearch.tsx`
- `components/SearchBar.tsx`
- `components/FilterRow.tsx`
- `components/CollapsibleSectionHeader.tsx`
- `components/ProgressRing.tsx`
- `components/MiniChart.tsx`
- `components/IconSymbol.tsx`
- `components/DetailRow.tsx`
- `components/GradientButton.tsx`
- `components/ProfileHeaderButton.tsx`
- `components/RealtimeFeed.tsx`
- `components/EmptyState.tsx`
- `components/ErrorBoundary.tsx`

### Utilities
- `utils/calendarUtils.ts`
- `utils/colorUtils.ts`
- `utils/dateUtils.ts`
- `utils/fileUtils.ts`
- `utils/imageUtils.ts`
- `utils/searchManager.ts`
- `utils/validation.ts`
- `utils/formatLabel.ts`
