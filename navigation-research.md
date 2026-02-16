# Navigation Research

Complete reference for how users move through the Vessel Central app: bottom tab bar, navigation headers, screen transitions, and routing architecture.

---

## Framework

- **Expo Router v6** (file-based routing on top of React Navigation v7)
- Deep link scheme: `natively://`
- Typed routes enabled (`experiments.typedRoutes: true` in app.json)
- No Redux or external state manager for navigation — Expo Router owns the nav state, React Context handles auth/data

---

## Root Stack (`app/_layout.tsx`)

The entire app is a single **Stack navigator** with `headerShown: false` on all screens. Three context providers wrap everything: `ErrorBoundary` > `AuthProvider` > `DataProvider`.

### Registered Screens

| Screen Name | Presentation | Animation | Header |
|---|---|---|---|
| `index` | default (push) | default | hidden |
| `login` | default | default | hidden |
| `signup` | default | default | hidden |
| `forgot-password` | default | default | hidden |
| `(tabs)` | default | default | hidden |
| `modal` | `modal` | default | **shown** (title: "Modal") |
| `formsheet` | `formSheet` | default | **shown** (title: "Form Sheet") |
| `transparent-modal` | `transparentModal` | `fade` | hidden |
| `add-maintenance-task` | `modal` | `slide_from_bottom` | hidden |
| `add-issue` | `modal` | `slide_from_bottom` | hidden |
| `add-document` | `modal` | `slide_from_bottom` | hidden |
| `add-calendar-event` | `modal` | `slide_from_bottom` | hidden |
| `add-supply-request` | `modal` | `slide_from_bottom` | hidden |
| `add-parts-request` | `modal` | `slide_from_bottom` | hidden |
| `issue-detail` | default (push) | default | hidden |
| `document-detail` | default (push) | default | hidden |
| `supply-detail` | default (push) | default | hidden |
| `maintenance-detail` | default (push) | default | hidden |
| `calendar-event-detail` | default (push) | default | hidden |
| `assign-boats` | default (push) | default | hidden |
| `manager-login` | default (push) | default | hidden |
| `notification-settings` | default (push) | default | hidden |
| `analytics` | default (push) | default | hidden |

Key takeaway: The root stack hides headers globally. Every screen that needs a header builds its own custom one, except `modal`, `formsheet`, `notification-settings`, and `assign-boats` which use the native React Navigation header.

---

## Auth Flow

1. App launches at `app/index.tsx` — shows a centered `ActivityIndicator`
2. Checks `AsyncStorage` for `authToken`
3. If token exists: `router.replace('/(tabs)/(home)')`
4. If no token: `router.replace('/login')`
5. Login screen has mock user database with quick-select role buttons (owner/manager/crew)
6. On login: stores `authToken`, `userId`, `userRole`, `userName` in AsyncStorage, then `router.replace('/(tabs)/(home)')`
7. Logout (available on profile, manager dashboard, crew dashboard): `signOut()` then `router.replace('/login')` with a 100ms setTimeout

---

## Tab Layout (`app/(tabs)/_layout.tsx`)

**This is NOT a native Tab navigator.** It's a **Stack navigator** with a custom `FloatingTabBar` component rendered on top. All "tab" screens are Stack.Screen entries with `animation: "none"` so switching tabs has no transition.

### Stack Screens Registered

```
(home), owner, manager, crew, calendar, maintenance, issues, supplies, documents, profile
```

All have `headerShown: false` and `animation: "none"`.

### Role-Based Auto-Redirect

On mount, if the user lands on `(home)`, they are redirected via `router.replace()` to their role-specific dashboard:

- `owner` → `/(tabs)/owner`
- `manager` → `/(tabs)/manager`
- `crew` → `/(tabs)/crew`

Uses a `useRef(hasRedirected)` flag to prevent redirect loops. Flag resets when `userRole` changes.

### Tab Configuration Per Role

**Owner (5 tabs):**

| Tab | Route | Icon | Label |
|---|---|---|---|
| owner | `/(tabs)/owner` | `dashboard` | Dashboard |
| calendar | `/(tabs)/calendar` | `event` | Calendar |
| maintenance | `/(tabs)/maintenance` | `build` | Maintenance |
| documents | `/(tabs)/documents` | `description` | Documents |
| profile | `/(tabs)/profile` | `person` | Profile |

**Manager (6 tabs):**

| Tab | Route | Icon | Label |
|---|---|---|---|
| manager | `/(tabs)/manager` | `dashboard` | Dashboard |
| calendar | `/(tabs)/calendar` | `event` | Calendar |
| maintenance | `/(tabs)/maintenance` | `build` | Maintenance |
| issues | `/(tabs)/issues` | `report_problem` | Issues |
| supplies | `/(tabs)/supplies` | `inventory_2` | Supplies |
| profile | `/(tabs)/profile` | `person` | Profile |

**Crew (5 tabs):**

| Tab | Route | Icon | Label |
|---|---|---|---|
| crew | `/(tabs)/crew` | `list` | Tasks |
| calendar | `/(tabs)/calendar` | `event` | Calendar |
| issues | `/(tabs)/issues` | `report_problem` | Issues |
| supplies | `/(tabs)/supplies` | `inventory_2` | Supplies |
| profile | `/(tabs)/profile` | `person` | Profile |

**Fallback (no role set, 2 tabs):**

`(home)` + `profile`

### Tab Differences By Role

- **Owner** gets Documents and Maintenance but not Issues or Supplies tabs
- **Manager** gets all operational tabs (6 total — most tabs of any role)
- **Crew** gets Issues and Supplies but not Maintenance or Documents tabs
- **Calendar** and **Profile** appear for all roles
- Each role has a different "home" dashboard: `owner`, `manager`, or `crew`

---

## FloatingTabBar Component (`components/FloatingTabBar.tsx`)

### Visual Design

- **Position**: Absolute bottom, centered horizontally, z-index 1000
- **Container**: `SafeAreaView` (bottom edge) → `View` → `BlurView`
- **Default width**: `screenWidth / 2.5`
- **Height**: 60px fixed
- **Border radius**: 35px
- **Bottom margin**: 20px
- **Border**: 1.2px solid white (`rgba(255, 255, 255, 1)`)

### Platform Styling

| Platform | Background | Blur |
|---|---|---|
| iOS | `rgba(28, 28, 30, 0.8)` dark / `rgba(255, 255, 255, 0.6)` light | BlurView intensity 80 |
| Android | `rgba(28, 28, 30, 0.95)` dark / `rgba(255, 255, 255, 0.6)` light | None (solid) |
| Web | Same as Android | CSS `backdrop-filter: blur(10px)` |

### Active Tab Indicator

- Animated pill that slides between tabs using `react-native-reanimated`
- Spring animation config: `damping: 20, stiffness: 120, mass: 1`
- Indicator is positioned with `top: 4, left: 2, bottom: 4, borderRadius: 27`
- Width is calculated dynamically: `((100 / tabs.length) - 1)%`
- Color: `rgba(255, 255, 255, 0.08)` in dark mode, `rgba(0, 0, 0, 0.04)` in light mode

### Active Tab Detection Algorithm

Scoring system to determine which tab is active based on `usePathname()`:

1. **Exact route match** → 100 points
2. **Pathname starts with tab route** → 80 points (for nested routes)
3. **Pathname contains tab name** → 60 points
4. **Partial route match after `/(tabs)/`** → 40 points
5. Default to first tab if no match

### Tab Item Rendering

Each tab is a `TouchableOpacity` with `activeOpacity: 0.7` containing:
- `IconSymbol` (24px) — active: `theme.colors.primary`, inactive: `#98989D` (dark) / `#000000` (light)
- `Text` label (9px, fontWeight 500) — active: `theme.colors.primary` + fontWeight 600, inactive: `#98989D` (dark) / `#8E8E93` (light)
- Gap between icon and label: 2px, plus 2px marginTop on label

### Navigation Action

Tab press calls `router.push(tab.route)`. This is a push, not a replace — so tapping the same tab does nothing special (no scroll-to-top or reset behavior).

---

## Screen Headers

The app uses **three distinct header patterns**:

### Pattern 1: Custom In-Page Header (Detail Screens)

Used by: `maintenance-detail`, `issue-detail`, `supply-detail`, `document-detail`, `calendar-event-detail`, `analytics`

```
[< back]     Title Text     [empty spacer]
```

Structure:
- Container: `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`
- Padding: `horizontal: 20`, `top: platform-specific (60 iOS / 48 Android)`, `bottom: 16`
- Back button: `TouchableOpacity` with `padding: 8`, calls `router.back()`
- Back icon: `chevron.left` (iOS) / `arrow_back` (Android), 24px, `colors.text`
- Title: `fontSize: 18`, `fontWeight: '600'`, `color: colors.text`, `flex: 1`, `textAlign: 'center'`
- Right spacer: `View` with `width: 40` (to balance the back button)

### Pattern 2: Custom Modal Header (Add/Create Screens)

Used by: `add-maintenance-task`

```
Cancel     Title Text     Create
```

Structure:
- Container: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`
- Padding: `horizontal: 20`, `top: 60 (iOS) / 48 (Android)`, `bottom: 16`
- Border bottom: `1px` `colors.border`
- Cancel button: `fontSize: 16`, `color: colors.textSecondary`
- Title: `fontSize: 18`, `fontWeight: '600'`, `color: colors.text`
- Create/Save button: `fontSize: 16`, `fontWeight: '600'`, `color: colors.accent`

### Pattern 2b: Custom Modal Header (Other Add Screens)

Used by: `add-issue`, `add-document`, `add-supply-request`, `add-parts-request`, `add-calendar-event`

```
[< back]     Title Text     [empty spacer]
```

Same as Pattern 1 (detail screen header). These modals slide up from the bottom but use a back-arrow header rather than Cancel/Save text buttons.

### Pattern 3: Native React Navigation Header

Used by: `notification-settings`, `assign-boats`

These screens use `<Stack.Screen options={{ ... }}>` inline to configure the native header:
- `notification-settings`: `title: 'Notification Settings'`, `headerStyle: { backgroundColor: colors.background }`, `headerTintColor: colors.text`
- `assign-boats`: `title: 'Assign Boats'`, `headerStyle: { backgroundColor: theme.colors.card }`, `headerTintColor: colors.text`

### Pattern 4: In-Page Section Header (Tab Screens)

Used by: `maintenance`, `issues`, `supplies`, `documents`, `calendar`

```
Title Text                    [action buttons]
```

Structure:
- Container: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`
- Padding: `horizontal: 20`, `top: platform-specific`, `bottom: 16`
- Title: `fontSize: 28-32`, `fontWeight: '700'-'800'`, `color: colors.text`
- Right side: Action buttons (add, search, analytics icons depending on screen)
- No back button — these are top-level tab screens

### Pattern 5: Dashboard Header (Role Dashboards)

Used by: `owner`, `manager`, `crew`

```
Welcome back,
User Name                     [search] [notifications]
```

Structure:
- Two-line greeting ("Welcome back," + user name)
- Right side: icon buttons for search and notifications (owner has both, varies by role)
- No back button

### Profile Screen

Uses `SafeAreaView` with `edges={["top"]}` instead of a custom header. Renders a `GlassView` profile card at the top with the user's avatar, name, and role. Logout button is at the bottom of the scroll content.

---

## Screen Transition Animations

| Transition Type | Animation | Used By |
|---|---|---|
| Tab switch | `none` | All tab screens |
| Detail push | default (platform slide) | All `-detail` screens, analytics |
| Modal slide-up | `slide_from_bottom` | All `add-*` screens |
| Transparent modal | `fade` | `transparent-modal` |
| Form sheet | platform default | `formsheet` |
| Auth redirect | `replace` (no animation) | index → login/tabs |

---

## Global Search (`components/GlobalSearch.tsx`)

- Rendered as a `Modal` overlay, controlled by `visible` prop
- Available on owner and manager dashboards via a search icon button
- Searches across: maintenance tasks, issues, supply requests, documents, vessels
- Uses `searchManager` utility for search logic and history persistence

### Navigation From Search Results

| Result Type | Navigation Target |
|---|---|
| maintenance | `/maintenance-detail` with `{ id }` param |
| issue | `/(tabs)/issues` (tab, no specific item) |
| supply | `/(tabs)/supplies` (tab, no specific item) |
| document | `/(tabs)/documents` (tab, no specific item) |
| vessel | `/(tabs)/owner` (tab, no specific item) |

Only maintenance results deep-link to a detail screen. All others navigate to the list tab.

---

## Navigation Patterns Used in Code

### Push to detail screen with params
```ts
router.push({ pathname: '/maintenance-detail', params: { id: taskId } });
router.push({ pathname: '/document-detail', params: { id: doc.id } });
router.push({ pathname: '/calendar-event-detail', params: { eventId: event.id } });
```

Note: maintenance/issue/supply detail screens use `id` as the param key. Calendar uses `eventId`.

### Push to modal (add screens)
```ts
router.push('/add-maintenance-task');
router.push('/add-issue');
router.push('/add-calendar-event');
```

### Replace (auth flows, tab redirect)
```ts
router.replace('/login');
router.replace('/(tabs)/(home)');
router.replace('/(tabs)/owner');
```

### Back
```ts
router.back();  // Used by all detail screens and modals
```

### Tab navigation
```ts
router.push('/(tabs)/maintenance');
router.push('/(tabs)/issues');
```

The FloatingTabBar also uses `router.push(tab.route)` for tab switches.

---

## Home Screen Nesting (`app/(tabs)/(home)/`)

Nested stack inside the tabs. Has its own `_layout.tsx` with a single screen:
- `headerShown: Platform.OS === 'ios'` — iOS shows a native header with title "Home", Android/Web hides it
- The home `index.tsx` is a vessel fleet overview with filters, search, and vessel cards
- Users rarely stay here — the role redirect moves them to their dashboard immediately

---

## Content Padding for Tab Bar

Tab screens must account for the floating tab bar at the bottom. This is done through `contentContainerStyle` with extra bottom padding:
- Most screens use `paddingBottom: 120` on `ScrollView`/`FlatList` content containers
- Profile screen uses `Platform.OS !== 'ios' && styles.contentContainerWithTabBar` conditional

---

## Screen Access by Role

| Screen | Owner | Manager | Crew |
|---|---|---|---|
| Owner Dashboard | tab | - | - |
| Manager Dashboard | - | tab | - |
| Crew Dashboard | - | - | tab |
| Calendar | tab | tab | tab |
| Maintenance | tab | tab | - |
| Issues | - | tab | tab |
| Supplies | - | tab | tab |
| Documents | tab | - | - |
| Profile | tab | tab | tab |
| All detail screens | push | push | push |
| All add screens | modal | modal | modal |
| Analytics | push | push | - |
| Assign Boats | push | - | - |
| Notification Settings | push | push | push |

---

## Known Quirks / Design Decisions

1. **Tab bar uses Stack, not Tabs**: The `(tabs)` layout is actually a Stack navigator. Tab switching is `router.push()` with `animation: "none"`. This means there's no native tab state, no tab history, and no scroll-to-top-on-re-tap behavior.

2. **All add-form modals except `add-maintenance-task` use a back-arrow header** instead of Cancel/Save. `add-maintenance-task` is the only one with text-button Cancel/Create in the header.

3. **Search results partially navigate**: Only maintenance search results go to a detail screen. Issue, supply, document, and vessel results navigate to the list tab without selecting the specific item.

4. **Two screens use the native React Navigation header** (`notification-settings`, `assign-boats`) via inline `<Stack.Screen options>`. Every other screen either has no header or builds a custom one.

5. **Home screen exists but is skipped**: `(home)/index.tsx` is rendered momentarily then immediately replaced by the role-specific dashboard. The home layout even has a platform-conditional native header that most users never see.

6. **Tab bar width is fixed at `screenWidth / 2.5`**: This doesn't dynamically account for the number of tabs. Manager role has 6 tabs crammed into the same width as owner/crew with 5 tabs.

7. **Detail screen param key inconsistency**: Most detail screens use `id` as the search param. Calendar event detail uses `eventId`.
