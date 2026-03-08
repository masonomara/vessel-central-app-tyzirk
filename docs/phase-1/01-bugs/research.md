# Vessel Central - Code Audit

Full codebase analysis covering bugs, code smells, over-engineering, and non-atomic code across all source files.

**Files analyzed:** 75+
**Total issues found:** 134

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 14 |
| High | 26 |
| Medium | 50 |
| Low | 44 |

---

## Critical Issues

### 1. iOS screens are completely broken prototypes shipping as production code

**Files:** All `*.ios.tsx` tab files (`owner.ios.tsx`, `manager.ios.tsx`, `crew.ios.tsx`, `calendar.ios.tsx`, `profile.ios.tsx`, `(home)/index.ios.tsx`)

The `.ios.tsx` files are fundamentally different implementations from their `.tsx` counterparts -- not platform adaptations. They use hardcoded static data, broken logout (`setUserRole(null)` instead of `signOut()`), non-functional buttons with no `onPress` handlers, and fabricated vessel names, expenses, and crew counts. iOS users get an entirely fake, non-interactive experience.

**Fix:** Delete the `.ios.tsx` files or unify them so both platforms share the same logic. Extract only visual differences (SafeAreaView, BlurView) into platform-specific wrappers.

---

### 2. Offline sync randomly fails 20% of the time in production

**File:** `utils/offlineManager.ts:418-427`

`processOfflineAction` does not make real API calls. It simulates a random 20% failure rate with `Math.random() > 0.2`. In production, 1 in 5 offline sync operations will randomly fail and eventually hit the max retry limit, permanently losing user data.

**Fix:** Implement real API calls. This TODO placeholder should never ship.

---

### 3. Supabase placeholder client sends requests to uncontrolled domain

**File:** `utils/supabase.ts:70-78`

When Supabase is not configured, the code creates a client pointed at `https://placeholder.supabase.co` with `placeholder-key`. This makes real HTTP requests to a domain nobody controls. Someone could register that domain and intercept data.

**Fix:** Throw an error on unconfigured access, or return a mock that fails clearly. Do not make network requests to a domain you do not own.

---

### 4. Hardcoded push notification project ID breaks all push notifications

**File:** `utils/notificationService.ts:76`

`projectId: 'your-project-id'` is a placeholder. `getExpoPushTokenAsync` will fail or return an invalid token.

**Fix:** Replace with the actual Expo project ID from app config or environment variables.

---

### 5. `new Image()` does not exist in React Native -- image optimization is broken

**File:** `utils/imageUtils.ts:147-157`

`getImageInfo` uses the HTML DOM `Image` constructor. This does not exist in React Native and will throw at runtime. The entire `optimizeImage` flow depends on this function.

**Fix:** Use React Native's `Image.getSize()` or `expo-image-manipulator`.

---

### 6. Hardcoded credentials shipped in client bundle

**Files:** `app/login.tsx:31-38`, `app/manager-login.tsx:31-35`, `app/signup.tsx:22-27`

Mock passwords (`manager123`, `owner123`, `crew123`) and manager registration codes (`VESSEL2024`, `YACHT2024`) are hardcoded constants in the JS bundle. Anyone can extract them.

**Fix:** Gate mock data behind `__DEV__` so it's stripped from production. Move registration code validation server-side.

---

### 7. Hardcoded fake analytics metric displayed as real data

**File:** `app/analytics.tsx:339`

"Average Response Time" displays `2.3 days` as a hardcoded string. This is fabricated data presented as real analytics.

**Fix:** Calculate from actual issue data or remove the metric.

---

### 8. `useCache` hook causes infinite re-fetch loops

**File:** `hooks/useCache.ts:81, 121-123`

If a consumer passes an inline function as `fetchData` (the natural usage), it's a new reference every render. This makes `loadData` recreate, which triggers the `useEffect`, causing an infinite fetch-render loop that freezes the app.

**Fix:** Use `useRef` to store `fetchData` and remove it from the dependency array.

---

### 9. `useMultiCache` has the same infinite loop problem

**File:** `hooks/useCache.ts:155, 180, 186-188`

`loadAllData` depends on `configs`. If the consumer passes the configs array inline (natural usage), infinite loop.

**Fix:** Use `useRef` for configs or JSON-serialize into a stable key.

---

### 10. Widget uses placeholder app group ID

**File:** `contexts/WidgetContext.tsx:7`

`"group.com.<user_name>.<app_name>"` is a literal placeholder string. Widget storage will target a nonexistent group.

**Fix:** Replace with the actual app group ID.

---

### 11. `colors.error` referenced in 3+ files but does not exist in color constants

**Files:** `components/ErrorState.tsx:24`, `components/RealtimeFeed.tsx:25,35`, `app/notification-settings.tsx:529,536`

The `colors` object defines `danger`, not `error`. These references produce `undefined`, rendering icons invisible and buttons with nonsensical background colors like the string `"undefined20"`.

**Fix:** Replace `colors.error` with `colors.danger` everywhere.

---

### 12. Home screen data is entirely hardcoded

**Files:** `app/(tabs)/(home)/index.tsx:92-221`, `app/(tabs)/(home)/index.ios.tsx:50-179`

User names (`'John Smith'`, `'Emily Brown'`), IDs (`'owner1'`), fuel/water percentages (`'85%'`, `'92%'`) are all hardcoded. New users from the database never appear. The same status-mapping ternary chain is copy-pasted 12+ times.

**Fix:** Fetch users from the data context. Extract status mapping to a shared utility.

---

### 13. DataContext is a 1,600-line God Object with ~500 lines of hardcoded seed data

**File:** `contexts/DataContext.tsx:22-1577`

One context manages 9 entity types with 30+ methods. Any mutation re-renders every consumer. The default state initialization contains ~500 lines of hardcoded mock data that ships to production.

**Fix:** Split into domain-specific contexts. Initialize state as empty arrays. Load seed data through a dev-only fixture.

---

### 14. Auth listener runs even when Supabase is disabled

**File:** `contexts/AuthContext.tsx:106-149`

The `onAuthStateChange` listener is registered unconditionally, even when `isSupabaseEnabled` is `false`. The dummy client may silently fail or throw.

**Fix:** Wrap in `if (isSupabaseEnabled)` check.

---

## High Issues

### 15. Stale closures silently drop data in DataContext

**Files:** `contexts/DataContext.tsx:952, 1094, 1174, 1278, 1305-1323, 1341, 1371`

Every `add*` function uses `setX([...x, newItem])` which captures the current array. When `addMaintenanceTask` calls `addActivityLog` in the same render cycle, the second call uses a stale array and the first addition is lost.

**Fix:** Use functional updaters: `setX(prev => [...prev, newItem])`.

---

### 16. `saveData` missing `calendarEvents` in dependency array

**File:** `contexts/DataContext.tsx:840`

The `saveData` `useCallback` omits `calendarEvents` from its dependency array but references it in the function body. Calendar data is persisted stale.

**Fix:** Add `calendarEvents` to the dependency array.

---

### 17. `approveSupplyRequest` reads stale data after state update

**File:** `contexts/DataContext.tsx:1207-1243`

Calls `updateSupplyRequest(id, ...)` which sets state, then immediately reads `supplyRequests.find(r => r.id === id)`. React state updates are async, so the find returns pre-update data. Same in `denySupplyRequest`.

**Fix:** Find the request before calling update, or restructure to avoid reading stale state.

---

### 18. Global polling in `useRealtime` -- first unmount kills all instances

**File:** `hooks/useRealtime.ts:37-43`

`startPolling()` and `stopPolling()` are global operations. If two components use the hook, the first to unmount kills polling for both.

**Fix:** Use reference counting or per-instance intervals.

---

### 19. Auth token stored in plain AsyncStorage

**File:** `contexts/AuthContext.tsx:123`

Access tokens stored in unencrypted AsyncStorage. On Android, this is plaintext.

**Fix:** Use `expo-secure-store`.

---

### 20. HTML entity `&apos;` renders literally in native alerts

**Files:** `utils/errorHandler.ts:130`, `components/ErrorBoundary.tsx:78`, `app/forgot-password.tsx:75`

`Alert.alert()` renders plain text, not HTML. Users see `&apos;` instead of apostrophes.

**Fix:** Use regular apostrophes.

---

### 21. `notificationService` `sound` property type mismatch

**File:** `utils/notificationService.ts:186, 219`

`shouldPlaySound` returns `boolean`, but `sound` in `NotificationContentInput` expects `string | null`. Passing `true` won't play any sound.

**Fix:** `sound: shouldPlaySound ? 'default' : undefined`.

---

### 22. `errorLogger` posts error data to any origin and monkey-patches React internals

**File:** `utils/errorLogger.ts:35, 196-204`

`postMessage({...}, '*')` leaks stack traces to any parent frame. Accessing `React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` will break on any React update.

**Fix:** Specify target origin. Remove React internals access. Use `ErrorBoundary` instead.

---

### 23. `notificationPreferences` shallow merge destroys nested categories

**File:** `utils/notificationPreferences.ts:42-45`

`{ ...this.preferences, ...updates }` replaces the entire `categories` object if a caller passes it, dropping all other category preferences.

**Fix:** Deep merge for the `categories` field.

---

### 24. Login/signup async errors inside `setTimeout` are unhandled

**Files:** `app/login.tsx:121-138`, `app/manager-login.tsx:118-134`

`setTimeout(async () => { await handleMockLogin(...) }, 1000)` -- if the async function throws, the promise rejection is unhandled and `isLoading` stays `true` forever.

**Fix:** Use `await new Promise(r => setTimeout(r, 1000)); await handleMockLogin(...)` inside the already-async handler.

---

### 25. `add-calendar-event.tsx` uses `user.id`/`user.name` but auth context exports `userId`/`userName`

**File:** `app/add-calendar-event.tsx:26, 93-96`

Every other screen destructures `{ userId, userName }` from `useAuth()`. This file destructures `{ user }` and accesses `user?.id`. If `useAuth()` doesn't export a `user` object, all values are `undefined`.

**Fix:** Use consistent destructuring: `{ userId, userName }`.

---

### 26. `add-maintenance-task.tsx` shows ALL vessels instead of user-filtered

**File:** `app/add-maintenance-task.tsx:26, 215`

Uses `vessels` (all) instead of `getVesselsForUser(userId, userRole)` like every other add screen. Crew can create tasks on vessels they're not assigned to.

**Fix:** Filter with `getVesselsForUser`.

---

### 27. `handleIssuePress` and `handleDocumentPress` do nothing

**Files:** `app/(tabs)/issues.tsx:181-183`, `app/(tabs)/documents.tsx:57-60`

These handlers only `console.log`. Tapping an issue or document card is a no-op for the user.

**Fix:** Implement navigation to detail screens.

---

### 28. Supplies `handleApprove` hardcodes `'manager1'` and `'Sarah Johnson'`

**File:** `app/(tabs)/supplies.tsx:174-175`

Any manager who approves a request is recorded as Sarah Johnson.

**Fix:** Use `userId` and `userName` from `useAuth()`.

---

### 29. `login.tsx` and `manager-login.tsx` are 90% identical (1,200+ lines duplicated)

**Files:** `app/login.tsx` (638 lines), `app/manager-login.tsx` (614 lines)

Same form, validation, mock login flow, styles. The only difference is role filtering.

**Fix:** Extract shared `AuthForm` component.

---

### 30. `completeMaintenanceTask` immediately undoes completion for recurring tasks

**File:** `contexts/DataContext.tsx:1043-1068`

Sets `status: 'open'` and `completedDate: undefined` immediately, making it look like the task was never done. The completion only exists in `completionHistory`.

**Fix:** Create a new task for the next occurrence instead of mutating the existing one.

---

### 31. Constructor-initiated async in 3 singleton classes

**Files:** `utils/searchManager.ts:34-37`, `utils/offlineManager.ts:39-41`, `utils/realtimeManager.ts:33-36`

All three call async methods from constructors and export singletons immediately. Any code using them before initialization completes gets empty/default data.

**Fix:** Add explicit `initialize()` methods with await.

---

### 32. Duplicated logout handler across 6+ files

**Files:** `crew.tsx`, `owner.tsx`, `manager.tsx`, `profile.tsx`, `profile.ios.tsx`, `(home)/index.tsx`

~30 identical lines per file: `Alert.alert`, `signOut()`, error handling, `setTimeout(() => router.replace("/login"), 100)`.

**Fix:** Extract shared `useLogout()` hook.

---

### 33. `setTimeout` for navigation after logout is a race condition

**Files:** Every file with `handleLogout`

The 100ms delay is arbitrary. If state updates are slower, navigation happens before auth clears. If faster, 100ms is wasted.

**Fix:** Use auth state listener to drive navigation.

---

### 34. `ListItem.tsx` calls hooks inside a non-component nested function

**File:** `components/ListItem.tsx:22-44`

`RightAction` is a regular function (not a React component) that calls `useAnimatedStyle`. This violates the Rules of Hooks.

**Fix:** Extract `RightAction` as a proper React component.

---

### 35. `ListItem.tsx` passes wrong prop name to `IconSymbol`

**File:** `components/ListItem.tsx:40`

Uses `name="trash.fill"` but `IconSymbol` expects `ios_icon_name`/`android_material_icon_name`. Icon won't render.

**Fix:** Use correct prop names.

---

### 36. `FilterModal` state initialized from prop never syncs

**File:** `components/FilterModal.tsx:55`

`useState<FilterOptions>(currentFilters)` only reads the initial value. If parent passes new filters, modal shows stale state.

**Fix:** Add `useEffect` to sync when `currentFilters` changes or when `visible` transitions to `true`.

---

### 37. `validateEmail` duplicated in 4 files despite existing utility

**Files:** `app/login.tsx:51-54`, `app/manager-login.tsx:48-51`, `app/signup.tsx:49-52`, `app/forgot-password.tsx:29-32`

A shared `validateEmail` exists in `utils/validation.ts` but each auth screen redefines its own.

**Fix:** Import the shared version.

---

### 38. `getPriorityColor` duplicated across 5+ files

**Files:** `add-supply-request.tsx`, `add-parts-request.tsx`, `add-issue.tsx`, `add-maintenance-task.tsx`, `maintenance-detail.tsx`

Identical switch statement copy-pasted.

**Fix:** Extract to shared utility.

---

### 39. `auth/index.tsx` checks AsyncStorage directly instead of auth context

**File:** `app/index.tsx:22-36`

Reads `AsyncStorage.getItem('authToken')` to decide routing while the actual auth state lives in `AuthContext`. These can desync.

**Fix:** Use auth context state for routing decisions.

---

### 40. `offlineManager.retryAction` crashes on null dereference

**File:** `utils/offlineManager.ts:384`

`(await this.getOfflineQueue()).find(a => a.id === actionId)!.retryCount` uses non-null assertion on a `.find()` result. If the action was removed between calls, this throws.

**Fix:** Add a null check.

---

## Medium Issues

### 41. Auth functions not memoized with `useCallback`
`contexts/AuthContext.tsx:153-460` -- All auth methods are redeclared every render, causing unnecessary re-renders in all consumers.

### 42. Unsafe cast of arbitrary errors to `AuthError`
`contexts/AuthContext.tsx` -- Every catch block uses `error as AuthError`. Network errors, JSON parse errors, etc. will have `undefined` for AuthError-specific fields.

### 43. Date deserialization duplicated between cache and legacy paths
`contexts/DataContext.tsx:628-782` -- ~80 lines of identical date reconstruction logic copy-pasted.

### 44. Hardcoded user roles in activity logs
`contexts/DataContext.tsx:977-978, 1124, 1229` -- Activity logs always use `userRole: 'manager'` instead of the actual user's role.

### 45. `generateId` uses deprecated `substr` and is collision-prone
`contexts/DataContext.tsx:852-854`, `searchManager.ts:280`, `offlineManager.ts:152`, `realtimeManager.ts:62` -- `Date.now() + Math.random().toString(36).substr(2, 9)` can collide within the same millisecond. `.substr()` is deprecated.

### 46. Filter functions not memoized in DataContext
`contexts/DataContext.tsx:857-942` -- `getVesselsForUser`, `getMaintenanceTasksForUser`, etc. are recreated every render and redundantly call each other.

### 47. Notification initialization race condition
`hooks/useNotifications.ts:14-28` -- Listeners set up before `initialize()` completes. Early notifications may be dropped.

### 48. `Blob` not available in React Native
`utils/cacheManager.ts:232` -- `new Blob([data]).size` throws on Android without a polyfill.

### 49. Weak `sanitizeInput` gives false sense of security
`utils/validation.ts:211-213` -- Only strips `<` and `>`. Misses `"`, `'`, `&`, backticks.

### 50. `searchManager` search function has ~120 lines of duplicated blocks
`utils/searchManager.ts:155-272` -- Near-identical search logic for each entity type.

### 51. Document filter inconsistency in `searchManager`
`utils/searchManager.ts:231-234` -- Documents skip `matchesFilters()` unlike other entity types.

### 52. `realtimeManager` mixes EventEmitter and manual subscribers
`utils/realtimeManager.ts:27-113` -- Two overlapping event systems that could diverge.

### 53. `realtimeManager` polling emits events nobody listens to
`utils/realtimeManager.ts:148-159` -- Emits `'poll'` events but nothing handles them.

### 54. `notificationPreferences.resetToDefaults` uses shallow clone on nested object
`utils/notificationPreferences.ts:147-150` -- Mutations to reset preferences also mutate the default constants.

### 55. `fetch()` for local file URIs unreliable in React Native
`utils/imageUtils.ts:138-143` -- Works on iOS, often fails on Android.

### 56. Fallback image dimensions mask errors
`utils/imageUtils.ts:160-162` -- Returns `{ width: 1920, height: 1920, size: 0 }` on failure, producing incorrect calculations.

### 57. `batchUpdates` utility is a no-op
`utils/performanceUtils.ts:81-83` -- Just iterates and calls functions. React 18 batches automatically.

### 58. `measureRenderTime` doesn't measure render time
`utils/performanceUtils.ts:154-163` -- Measures synchronous execution, not React rendering.

### 59. `markEventAsRead` and `markAllAsRead` don't await save
`utils/realtimeManager.ts:125-140` -- Mutate in-memory and fire-and-forget `saveEvents()`. Subsequent reads from storage get stale data.

### 60. `wrapAsync` and `wrapSync` double-handle errors
`utils/errorHandler.ts:188-227` -- Error is handled/logged twice.

### 61. `errorLogger.setupErrorLogging` overwrites `window.onerror` without chaining
`utils/errorLogger.ts:102-116` -- Silently discards any previous handler.

### 62. `offlineManager` interval never cleaned up on module reload
`utils/offlineManager.ts:59-81` -- Hot reload creates duplicate intervals.

### 63. `fileUtils` hardcodes `'current_user'` for uploads
`utils/fileUtils.ts:22, 50, 84, 112` -- All attachments recorded as uploaded by `'current_user'`.

### 64. `fileUtils` uses browser `alert()` instead of `Alert.alert()`
`utils/fileUtils.ts:68` -- Only works on web, not iOS/Android.

### 65. `formatFileSize` duplicated in 4 files
`utils/fileUtils.ts:123`, `utils/imageUtils.ts:200`, `app/add-document.tsx:190`, `app/cache-settings.tsx:89`.

### 66. `calendarUtils.getEventsForMonth` misses multi-month events
`utils/calendarUtils.ts:106-111` -- Only checks `startDate`, not date range overlap.

### 67. `isOverdue` and `formatDueDate` disagree on boundary
`utils/dateUtils.ts:46-61` -- `isOverdue` uses timestamp comparison while `formatDueDate` uses day flooring. A task due today can show as both "Due today" and "overdue".

### 68. `Dimensions.get('window').width` captured at module level
`app/analytics.tsx:12` -- Never updates on orientation change or split-screen.

### 69. `addSupplyRequest` and similar mutations not awaited in try/catch
`app/add-supply-request.tsx:108`, `add-parts-request.tsx:176`, `add-issue.tsx:260`, `add-document.tsx:155`, `add-calendar-event.tsx:82`, `add-maintenance-task.tsx:127` -- Errors not caught, success shown regardless.

### 70. `event.createdAt.toLocaleDateString()` assumes Date object
`app/calendar-event-detail.tsx:228` -- If from JSON/AsyncStorage, it's a string and will throw.

### 71. `.replace('_', ' ')` only replaces first underscore
`components/FilterModal.tsx:119`, `app/maintenance-detail.tsx:112,273`, `app/calendar-event-detail.tsx:149`, `app/(tabs)/maintenance.tsx:118`, `app/(tabs)/issues.tsx:112,254` -- `waiting_on_parts` becomes `waiting on_parts`.

### 72. `add-maintenance-task.tsx` uses hardcoded `'crew_temp_id'`
`app/add-maintenance-task.tsx:432` -- Assigned user ID is a literal string that never resolves to a real ID.

### 73. Unit selector shown twice in supply request form
`app/add-supply-request.tsx:213-268` -- Same units appear in compact row and full list.

### 74. `ValidatedInput` validation runs twice on change
`components/ValidatedInput.tsx:49-76` -- Both `useEffect` and `handleChangeText` perform identical validation.

### 75. `PressableCard` has unused `isPressed` state causing re-renders
`components/PressableCard.tsx:31` -- State is set on press/release but never read.

### 76. `StatCard` has duplicated JSX for pressable vs non-pressable
`components/StatCard.tsx:91-133` -- ~40 lines duplicated; only difference is the wrapper.

### 77. `GlobalSearch` uses stale memoized search history
`components/GlobalSearch.tsx:26` -- Memoized on `[visible]`, never updates during a session.

### 78. `GradientButton` icon requires both platform props to render
`components/GradientButton.tsx:72-73` -- If only `icon` is passed, no icon renders. Silent failure.

### 79. `OfflineQueueStatus` has no error handling on async operations
`components/OfflineQueueStatus.tsx:34-38` -- Unhandled rejections.

### 80. `OfflineQueueStatus` uses `any[]` for queue state
`components/OfflineQueueStatus.tsx:17` -- No type safety for queue items.

### 81. `manager.tsx` recomputes task filters inside render loop
`app/(tabs)/manager.tsx:248-254` -- O(n*m) per render instead of pre-computing a map.

### 82. `_layout.tsx` (tabs) redirect logic has timing issue
`app/(tabs)/_layout.tsx:33-40` -- Two effects on `userRole` can cause double redirects.

### 83. `colors.grey` referenced but not defined
`styles/commonStyles.ts` vs `maintenance.tsx:30`, `issues.tsx:29`, `supplies.tsx:33`, `documents.tsx:491` -- Will be `undefined`.

### 84. `CacheStatus.loadCacheStatus` missing from useEffect deps
`components/CacheStatus.tsx:26` -- Stale closure risk.

### 85. `notification-settings.tsx` time picker inconsistency
`app/notification-settings.tsx:85-93` -- Picker auto-closes on Android but stays open on iOS.

### 86. `add-parts-request.tsx` uses `ValidatedInput` on some fields but raw `TextInput` on others
`app/add-parts-request.tsx:260-297` -- Inconsistent validation UX.

### 87. Search results navigate to list pages instead of specific items
`components/GlobalSearch.tsx:60-71` -- Only maintenance results go to a detail page.

### 88. `MiniChart` can crash on large arrays
`components/MiniChart.tsx:24` -- `Math.max(...data)` exceeds call stack on very large arrays.

### 89. `ErrorBoundary` renders HTML entity literally
`components/ErrorBoundary.tsx:78` -- `We&apos;re sorry` displayed as-is in React Native.

### 90. Fake loading delays in pagination
`app/(tabs)/maintenance.tsx:230-241`, `issues.tsx:190-200`, `documents.tsx:67-77` -- `setTimeout(fn, 300)` on already-loaded data.

---

## Low Issues

### 91. `MFAFactors` returns `any[]`
`contexts/AuthContext.tsx:425` -- Should use Supabase `Factor` type.

### 92. Excessive `console.log` across entire codebase
50+ debug logs including sensitive data (user IDs, emails, tokens). Should be gated behind `__DEV__` or use a proper logger.

### 93. Unused `storage` variable in `WidgetContext`
`contexts/WidgetContext.tsx:6-8` -- Created at module scope but never read.

### 94. `.bind(notificationService)` creates new references every render
`hooks/useNotifications.ts:59-64` -- Defeats memoization.

### 95. Hardcoded notification routes as string literals
`hooks/useNotifications.ts:35-43` -- Will break silently if routes change.

### 96. Deprecated `String.prototype.substr()` in 4 files
`searchManager.ts:280`, `offlineManager.ts:152`, `realtimeManager.ts:62`, `DataContext.tsx:853`.

### 97. `memoize` uses `JSON.stringify` for cache keys
`utils/performanceUtils.ts:52-75` -- Objects with different key order produce different keys. No TTL.

### 98. `customStorage` wrapper in supabase.ts silently swallows errors
`utils/supabase.ts:12-36` -- Supabase's auth may need to see these errors.

### 99. Duplicated validation preamble in `validation.ts`
`utils/validation.ts:55-92` -- Three validators duplicate the same "is required" + "is NaN" checks.

### 100. `createValidator` uses `any` type
`utils/validation.ts:273-280` -- Should be generic.

### 101. `searchManager.ts` SearchResult `data` field is `any`
`utils/searchManager.ts:10` -- Loses type safety.

### 102. `errorLogger` dead code -- `originalConsoleLog`/`originalConsoleWarn` captured but unused
`utils/errorLogger.ts:134-135` -- Referenced code is commented out.

### 103. `errorLogger.recentErrors` unbounded object
`utils/errorLogger.ts:6-8` -- Grows without limit during error storms.

### 104. `Date.now().toString()` IDs in `fileUtils` can collide
`utils/fileUtils.ts:17, 45, 79, 106` -- No random suffix.

### 105. `calendarUtils.getMonthName` uses hardcoded English array
`utils/calendarUtils.ts:121-127` -- Other functions use `toLocaleString`.

### 106. `cacheManager.cacheHelpers` is a trivial wrapper adding no value
`utils/cacheManager.ts:302-343` -- Just looks up a key and calls the manager.

### 107. `cacheManager.refreshCache` is non-atomic (remove then set)
`utils/cacheManager.ts:334-342` -- Gap between remove and set. Just call `set` which overwrites.

### 108. Verbose cache logging in production
`utils/cacheManager.ts:65-273` -- Every hit, miss, set, and remove logs to console.

### 109. `constants/Colors.ts` (461 lines) appears mostly unused
Contains `backgroundColors` (218 hex values), `emojies` [sic] (350+ emojis), `zincColors`. App uses `colors` from `commonStyles.ts` instead.

### 110. `button.tsx` filename breaks PascalCase convention
All other component files use PascalCase.

### 111. `button.tsx` has dual export (named + default)
Can cause inconsistent imports.

### 112. `IconCircle` renders a rounded square, not a circle
`components/IconCircle.tsx:24` -- Uses `borderRadius: 12` instead of `size / 2`.

### 113. `ProgressRing` doesn't clamp progress values
Values >100 or <0 render incorrectly.

### 114. `AnimatedCard` `fade` animation also slides
`components/AnimatedCard.tsx:36-41` -- "fade" behaves identically to "slide".

### 115. `AnimatedCard` missing shared values in useEffect deps
`components/AnimatedCard.tsx:52` -- Technically incorrect per React rules.

### 116. Fragile hex string concatenation for alpha
`components/GlassCard.tsx:27`, `StatCard.tsx:47,63-66` -- Appending `'80'` to color strings breaks if format changes.

### 117. `EmptyState` uses same icon string for both platforms
`components/EmptyState.tsx:19` -- `ios_icon_name={icon as any}` and same value for `android_material_icon_name`.

### 118. `homeData.ts` derives type from array index
`components/homeData.ts:22` -- Fragile if array structure changes.

### 119. Unused styles in `ListItem.tsx`
`components/ListItem.tsx:97-163` -- `swipeable`, `leftContent`, etc. defined but never used.

### 120. `configureReanimatedLogger` called at module scope in `ListItem.tsx`
Affects global logger on import.

### 121. `nickname[0]` crashes on empty string
`components/ListItem.tsx:92` -- `undefined.toUpperCase()` throws.

### 122. Hardcoded 2-tab indicator width in `FloatingTabBar`
`components/FloatingTabBar.tsx:234` -- Dead code, overridden by dynamic style.

### 123. Fragile tab route matching in `FloatingTabBar`
`components/FloatingTabBar.tsx:62-81` -- `.includes()` can produce false positives.

### 124. `CacheStatus.formatBytes` returns NaN for negative input
`components/CacheStatus.tsx:62`.

### 125. `HeaderButtons` show "Not Implemented" alerts
`components/HeaderButtons.tsx:11, 24` -- Placeholder code shipping to users.

### 126. `GradientButton` hardcoded blue shadow for all variants
`components/GradientButton.tsx:90` -- Danger/gold buttons cast blue shadows.

### 127. `FilterModal` inline arrows defeat `memo` on `FilterChip`
`components/FilterModal.tsx:121, 135, 150`.

### 128. Unused `timeRange` state in analytics
`app/analytics.tsx:24` -- Declared but never rendered.

### 129. `Animated` value created but never applied in home screens
`app/(tabs)/(home)/index.tsx:49, 255-266` -- Animation runs but produces no visual effect.

### 130. Excessive `useMemo` for trivial computations
`app/(tabs)/maintenance.tsx:192-208` -- Memoizing simple length comparisons.

### 131. `assign-boats.tsx` modal doesn't reset state on X button
`app/assign-boats.tsx:350` -- Stale selections persist.

### 132. Custom toggle switch instead of native `Switch`
`app/add-document.tsx:420-446` -- Over-engineered when `Switch` is available.

### 133. Inconsistent `paddingTop` for safe area
Multiple files use different hardcoded values instead of `useSafeAreaInsets()`.

### 134. `analytics.tsx` `statusCounts[task.status]++` produces NaN for unknown statuses
`app/analytics.tsx:89` -- No guard for unexpected status values.

---

## Systemic Patterns

These issues recur throughout the codebase and should be addressed as categories:

1. **Platform divergence:** iOS files are broken prototypes. Delete or unify.
2. **Hardcoded data everywhere:** Home screen, analytics, user roles, approver names. Replace with real data.
3. **DRY violations:** `getPriorityColor`, `getStatusColor`, `validateEmail`, `formatFileSize`, `handleLogout`, `generateId` each duplicated 3-6 times.
4. **Stale closures in DataContext:** Every mutation function captures arrays by value instead of using functional updaters.
5. **Unhandled async:** `setTimeout(async () => {})` pattern, missing `await` on mutations in try/catch blocks.
6. **Console logging in production:** 50+ unguarded `console.log` statements, some leaking credentials and user data.
7. **Missing color constant:** `colors.error` and `colors.grey` referenced but never defined.
8. **`.replace()` with string arg:** Only replaces first occurrence throughout. Use regex or `replaceAll`.
9. **Singleton constructors calling async:** Three managers (search, offline, realtime) have race conditions on initialization.
10. **God context:** DataContext manages 9 entity types in 1,600 lines. Every mutation re-renders every consumer.
