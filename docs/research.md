# Vessel Central — Research Report

## Project Summary

Vessel Central is a mobile app for **Vessel & Co**, a yacht charter management company based in Ft. Lauderdale/Bahamas run by **Hannah Patten** (and her husband). The business coordinates maintenance, scheduling, documents, expenses, and crew management across a fleet of yachts. Currently, all operations run on manual spreadsheets — owners keep theirs, Vessel & Co keeps theirs — and the app is meant to replace that with a shared system.

The client built a "vibecoded" prototype (proof-of-concept generated via AI tooling) to communicate what they want. Mason O'Mara (O'Mara Technology & Design) was engaged to assess it and propose next steps.

**The engagement:** Hannah chose **Option 1 — App Store Demo** at **$4,250 / 34 hours / 4 weeks**. This is a polished demo with no backend, no real data, no user accounts. It's a showpiece for boat shows and pitch meetings. Contract pending signature + 50% deposit. **Target: App Store submission by March 26, 2025.**

---

## Codebase Analysis

### Tech Stack

| Layer         | Technology                                                        |
| ------------- | ----------------------------------------------------------------- |
| Framework     | Expo 54 / React Native 0.81.4                                     |
| Language      | TypeScript 5.9                                                    |
| React         | React 19.1.0                                                      |
| Routing       | expo-router 6.0 (file-based)                                      |
| Navigation    | @react-navigation (drawer, stack, tabs)                           |
| State         | React Context API (AuthContext, DataContext, WidgetContext)       |
| Backend       | Supabase 2.84 (configured but not connected — 100% mock fallback) |
| Styling       | StyleSheet + expo-linear-gradient + expo-blur                     |
| Animations    | react-native-reanimated 4.1                                       |
| Storage       | AsyncStorage                                                      |
| Notifications | expo-notifications (infrastructure only, no delivery)             |
| Charts        | react-native-chart-kit                                            |
| Maps          | react-native-maps                                                 |
| Web           | react-native-web + Workbox PWA                                    |

### Project Structure

```
vessel-central/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/             # Tab navigation (role-aware)
│   │   ├── (home)/         # Home dashboard (with .ios.tsx variants)
│   │   ├── owner.tsx       # Owner dashboard
│   │   ├── manager.tsx     # Manager dashboard
│   │   ├── crew.tsx        # Crew task list
│   │   ├── calendar.tsx    # Calendar view
│   │   ├── maintenance.tsx # Maintenance tasks
│   │   ├── issues.tsx      # Issue tracking
│   │   ├── supplies.tsx    # Supply requests
│   │   ├── documents.tsx   # Document management
│   │   └── profile.tsx     # User profile
│   ├── add-*.tsx           # Modal screens for creating entities
│   ├── *-detail.tsx        # Detail screens
│   ├── login.tsx           # Mock login (hardcoded users)
│   ├── analytics.tsx       # Analytics dashboard
│   └── _layout.tsx         # Root layout (providers, error boundary)
├── components/             # 26 UI components
├── contexts/               # AuthContext, DataContext, WidgetContext
├── hooks/                  # useAuth, useData, useCache, useRealtime, useNotifications
├── utils/                  # Services (cache, offline, realtime, notifications, validation, etc.)
├── types/                  # TypeScript type definitions
├── styles/                 # Color system, typography, shadows
├── docs/                   # 16 implementation docs (caching, notifications, performance, etc.)
└── mason-docs/             # Project planning & proposal documents
```

### Authentication System

Dual-mode: Supabase (when env vars set) or mock fallback (default).

Currently runs in **mock mode** with 6 hardcoded users:

| ID       | Name          | Email              | Role    | Password   |
| -------- | ------------- | ------------------ | ------- | ---------- |
| owner1   | John Smith    | john@vesselco.com  | owner   | owner123   |
| owner2   | Emily Brown   | emily@vesselco.com | owner   | owner123   |
| manager1 | Sarah Johnson | sarah@vesselco.com | manager | manager123 |
| manager2 | Tom Wilson    | tom@vesselco.com   | manager | manager123 |
| crew1    | Mike Davis    | mike@vesselco.com  | crew    | crew123    |
| crew3    | Jane Smith    | jane@vesselco.com  | crew    | crew123    |

Login flow: credentials checked against array, demo token stored in AsyncStorage, redirect to role-specific dashboard.

The AuthContext (531 lines) has full Supabase support including MFA enrollment/verification, session refresh, password reset — all unused in current mock mode.

### Role-Based Navigation

Each role gets different tabs:

- **Owner:** Dashboard, Calendar, Maintenance, Documents, Profile
- **Manager:** Dashboard, Calendar, Maintenance, Issues, Supplies, Profile
- **Crew:** Tasks, Calendar, Issues, Supplies, Profile

Custom `FloatingTabBar` with spring-animated indicators handles the bottom navigation.

### Data Architecture

`DataContext.tsx` (1,586 lines) is the central data store. **100% mock data, 0% backend integration.**

Entities and mock counts:

- **Vessels:** 3 (Azure Dream, Ocean Pearl, Sea Breeze)
- **MaintenanceTasks:** 3 (engine service, safety check, deck cleaning)
- **Issues:** 3 (deck leak, engine noise, hull inspection)
- **SupplyRequests:** mock data
- **Documents:** mock data (insurance, manuals, registration)
- **CalendarEvents:** mock data
- **Expenses:** mock data
- **ActivityLogs:** auto-generated
- **Notifications:** auto-generated

Full CRUD operations exist (add, update, delete) — they all manipulate in-memory state and return Promises. AsyncStorage save/load is implemented but there's no real persistence beyond session.

### Data Models

Key types defined in `types/index.ts` (211 lines):

- **User:** id, name, role, email, avatar
- **Vessel:** id, name, status (active/maintenance/charter/docked), location, crewCount, ownerId, managerId, crewIds
- **MaintenanceTask:** title, description, vesselId, assignedTo, status, priority, dueDate, isRecurring, frequency, estimatedCost, actualCost, attachments, completionHistory
- **Issue:** title, description, vesselId, reportedBy, assignedTo, status, priority, category, location, attachments, comments
- **SupplyRequest:** itemName, quantity, unit, vesselId, requestedBy, status (pending/approved/denied/ordered/received), priority
- **Document:** title, description, category (manual/insurance/registration/safety/warranty/invoice/receipt/other), vesselId, fileUri, expiryDate, tags
- **CalendarEvent:** title, type (maintenance/charter/inspection/crew_change/provisioning/meeting/other), status, startDate, endDate, allDay, attendees, reminders
- **Expense:** title, amount, category, vesselId, date, paidBy, status, relatedTaskId, relatedSupplyId

### UI & Design System

Dark-mode-only design with a navy/charcoal palette:

| Token         | Value   | Use            |
| ------------- | ------- | -------------- |
| primary       | #0A2540 | Deep navy      |
| background    | #0A0E14 | Near black     |
| card          | #151B24 | Card surfaces  |
| accent        | #3B82F6 | Bright blue    |
| gold          | #D4AF37 | Premium accent |
| text          | #FFFFFF | Primary text   |
| textSecondary | #A8B5C7 | Secondary text |

Key UI components: GradientContainer, GlassCard (blur + gradient), GradientButton, StatCard, ProgressRing, MiniChart, AnimatedCard, FloatingTabBar, EmptyState/LoadingState/ErrorState.

Consistent 12-16px border radius, 8/12/16/20/24px spacing increments.

### Utility Services (Built but Unused in Practice)

- **CacheManager:** AsyncStorage with TTL (5min/30min/24hr/never)
- **OfflineManager:** Queue with exponential backoff, network polling every 10s — but `processOfflineAction()` fakes API calls with 80% simulated success
- **RealtimeManager:** Local EventEmitter only, no Supabase subscriptions
- **NotificationService:** Expo Notifications setup, channel config, badge management — no actual push delivery
- **SearchManager:** Full-text search across entities
- **ErrorHandler:** Centralized logging with TODO for Sentry

### Build & Deployment

- Dev: `expo start --tunnel`
- Build profiles in `eas.json`: development, preview, production
- PWA support via Workbox
- **Bundle ID:** `com.anonymous.Natively` (placeholder — needs to change)
- **App name in config:** "Vessel Central"

### Known Issues & Tech Debt

**Critical:**

1. No real backend — all data is in-memory mock
2. Document URIs are fake (`file://documents/...`) — will crash on tap
3. No real-time functionality — EventEmitter only
4. Zero test coverage

**High:** 5. iOS `.ios.tsx` file duplicates are nearly identical to base files 6. Push notification infrastructure without delivery 7. Offline sync simulates 80% success rate 8. Bundle ID is placeholder (`com.anonymous.Natively`)

**Medium:** 9. Notification service uses dummy project ID 10. ESLint rules heavily relaxed (unused vars, any type allowed) 11. TODOs in code: Sentry logging, quick details modal, actual API calls

---

## Mason-Docs Analysis

The `mason-docs/` directory contains 12 files documenting the entire engagement from first assessment through proposal and client negotiation. Here's the full breakdown.

### Document Inventory

| File                                     | Purpose                                                             |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `01-initial-readthrough.md`              | Assessment of the vibecoded prototype                               |
| `02-meeting-notes.md`                    | Client meeting notes                                                |
| `03-initial-scoping.md`                  | Technical scoping and design decisions                              |
| `first-thoughts.md`                      | Early design thinking (overlaps with 03)                            |
| `project-notes.md`                       | Compiled notes from all three thinking sessions                     |
| `email-exchange.md`                      | Email thread with Hannah (Feb 9-12)                                 |
| `Vessel & Co Project Plan & Proposal.md` | Finalized proposal sent to client                                   |
| `vessel-central-proposal.md`             | Template/draft version of proposal                                  |
| `situation-appraisal.md`                 | Current vs. desired situation narrative                             |
| `situation-appraisals.md`                | Three versions of the appraisal (direct, narrative, proposal-ready) |
| `samples/sample-project-plan.md`         | Reference proposal for a different project (New Roots)              |
| `samples/sample-proposal.md`             | Empty file                                                          |

### Phase 1: Assessment (01-initial-readthrough.md)

Mason's verdict on the existing prototype:

**Keep:**

- Type definitions
- Context/state management patterns
- UI patterns (role-based views, analytics layout)
- Data flow architecture
- Component structure

**Ditch:**

- Offline mode (overbuilt, not connected)
- Realtime functionality (mock only)
- Notifications system (infrastructure without delivery)
- Analytics backend (no real data to analyze)

**Bottom line:** "Most architecture isn't connected to anything real." The prototype is too debt-laden to iterate on. Should rebuild from scratch, using the prototype as a reference for desired UX.

### Phase 2: Client Meeting (02-meeting-notes.md)

Key facts from the meeting:

- Hannah's team has water industry backgrounds (captains, chefs, stews)
- Mercury Finance handles payments (out of scope)
- Auth model options: passcode on signup OR account creation + backend org linking
- **Hard deadline: App Store by March 26th**

### Phase 3: Scoping (03-initial-scoping.md, first-thoughts.md, project-notes.md)

Technical decisions made:

- **React Native** — one codebase for iOS and Android
- **Cloudflare R2** — document storage via Events uploads
- **Styling** — off-white, simple, yellowish/brownish tint from docketadmin.com (a departure from the current dark navy theme)

Core feature — **Tasks:**

- Fields: Title, Description, Vessel, Priority, Due Date, Recurring, Issue/Maintenance toggle, Status
- Calendar and tasks should be one screen with two views, not separate tabs

Open design questions:

1. Estimated vs. actual cost — when does each get entered?
2. Who can mark tasks complete?
3. Overview screen — what content justifies its existence?
4. Analytics — how does data creation feed what's displayed?

### Phase 4: Proposal (Vessel & Co Project Plan & Proposal.md)

**Sent to Hannah on February 9, 2025.**

Three options presented:

**Option 1: App Store Demo — $4,250 / 34 hours / 4 weeks**

- Week 1: UI cleanup & styling (15 hrs)
- Week 2: Crash fixes & screen completion (10 hrs)
- Week 3: Demo data & placeholder removal (4 hrs)
- Week 4: App Store submission (6 hrs)
- Deliverable: Polished showpiece, no backend, no real data, no accounts

**Option 2: Production App — $10,250 / 82 hours / 6 weeks + 2 weeks training + 30 days bug support**

- Real auth, backend database, document storage (Cloudflare R2)
- Full CRUD for vessels, tasks, documents
- Calendar with list view
- Training handoff + 6 hours bug fixes post-launch

**Option 3: Full-Scale Product — pricing TBD / 280-380 hours / 20+ weeks**

- Everything in Option 2 plus push notifications, analytics/reporting, admin web dashboard, multi-org support, advanced document management

### Phase 5: Negotiation (email-exchange.md)

Timeline:

- **Feb 9:** Mason sends proposal
- **Feb 11:** Mason raises concern — only ~30 days to build, test, and submit. Can't guarantee March deadline.
- **Feb 11:** Hannah responds: wants Option 1, will send deposit this week
- **Feb 12:** Mason clarifies Option 1 scope: polished demo, styling only, no backend, no real data, no user accounts. Multiple professional views (owners, crew, brokers). Apple/Google review takes 4-5 days.
- **Feb 12:** Hannah confirms Option 1. Already has Apple dev account.

**Status:** Contract to be signed, 50% deposit to be sent, then development begins.

### Situation Appraisals

Three versions of the same narrative exist for different contexts:

1. **Direct:** Concise — "Vessel & Co has a running business, a clear product vision, and a prototype that documents exactly what they need. The gap is technical execution."
2. **Narrative:** Story-driven, emphasizes the water industry expertise and pain of scaling with spreadsheets.
3. **Proposal-ready:** Formal business language, details all operational scope (maintenance, repairs, crew sourcing, compliance, provisioning, dockage, guest experience).

### Reference Material (samples/)

`sample-project-plan.md` is a complete proposal for a **different project** — New Roots, a food access nonprofit. It serves as a formatting reference for how Mason structures proposals. Three-option model, detailed hour breakdowns, weekly timelines.

---

## The Gap: What Exists vs. What's Needed

### For Option 1 (the chosen engagement)

The prototype is a fully-built React Native app with:

- Role-based dashboards, tab navigation, modal screens
- Complete CRUD flows for all entity types
- Polished UI (gradients, glass effects, animations)
- 26 custom components
- Comprehensive type system
- Infrastructure for caching, offline, notifications (all mock)

What Option 1 requires:

1. **UI Cleanup & Styling (15 hrs)** — The current theme is dark navy. The scoping docs call for off-white with yellowish/brownish tint (docketadmin.com). This is a significant visual overhaul.
2. **Crash Fixes & Screen Completion (10 hrs)** — Document URIs crash on tap. Some iOS variants are near-identical copies. Bundle ID is placeholder.
3. **Demo Data & Placeholder Removal (4 hrs)** — Current mock data is developer-placeholder quality. Needs realistic vessel names, tasks, and content for demo audiences.
4. **App Store Submission (6 hrs)** — Requires changing bundle ID from `com.anonymous.Natively`, creating proper app icons/screenshots, dealing with Apple/Google review.

### Critical Observations

1. **Styling conflict:** The prototype uses a dark navy/charcoal palette. The scoping docs specify off-white with yellowish/brownish tint from docketadmin.com. These are fundamentally different design languages. The styling work will likely be a near-complete visual redesign.

2. **Rebuild vs. iterate tension:** The initial readthrough says "should not be iterated on; should be rebuilt from scratch." But Option 1 is explicitly about iterating on the existing prototype (cleanup, fixes, polish). This tension needs resolution — for a 34-hour demo engagement, rebuilding from scratch isn't feasible.

3. **Over-engineered infrastructure:** The prototype has ~1,600 lines of data context, offline queue management, cache with TTL, notification services, realtime event emitter — none of which matter for a demo app. This adds complexity without value for Option 1. Stripping it back versus leaving it dormant is a judgment call.

4. **March 26 deadline risk:** Mason explicitly flagged this in the email exchange. App Store review is unpredictable. 4 weeks of development + 4-5 days Apple review leaves very little margin.

5. **No contract signed yet:** As of the documents, the engagement is agreed in principle but development hasn't formally started. Contract + 50% deposit are prerequisites.

### Unresolved Design Questions

These remain open from the scoping phase:

1. Estimated vs. actual cost on tasks — when does each get entered?
2. Task completion authority — who can mark tasks complete?
3. Calendar and tasks — one screen, two views? Or separate tabs?
4. Overview/home screen — what content should it show?
5. Analytics alignment — how does data creation map to analytics displays?

For Option 1 (demo with no real data), these are less urgent but still affect screen layout and content decisions.
