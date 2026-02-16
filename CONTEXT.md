# Vessel Central Context

> Development context — Last updated: 2026-02-09
> See README.md for stable documentation

## Status

Prototype / proof-of-concept. 100% mock data, no real backend. Supabase configured but never called. App runs in demo mode with hardcoded users.

Recent work focused on auth flow, visual polish (gradients, text contrast), and layout cleanup (deleted duplicate iOS layout file).

---

## Quick Reference

### Primary Entry Points

| File | Purpose |
| --- | --- |
| `app/_layout.tsx` | Root layout — ErrorBoundary, AuthProvider, DataProvider |
| `app/index.tsx` | Auth check, redirects to login or tabs |
| `app/login.tsx` | Login screen (demo mode with mock users) |
| `app/(tabs)/_layout.tsx` | Tab navigation, role-based routing |
| `app.json` | Expo config (SDK 54, bundle IDs, plugins) |
| `eas.json` | EAS Build profiles (dev, preview, production) |

### Key Integration Files

| File | Role |
| --- | --- |
| `contexts/AuthContext.tsx` | Auth state, role management, session persistence |
| `contexts/DataContext.tsx` | All data CRUD — vessels, tasks, issues, supplies, docs (51KB, all mock) |
| `utils/supabase.ts` | Supabase client creation, `isSupabaseConfigured()` fallback check |
| `utils/offlineManager.ts` | Offline queue with exponential backoff (API calls stubbed) |
| `utils/realtimeManager.ts` | EventEmitter-based events (no real subscriptions) |
| `utils/cacheManager.ts` | AsyncStorage cache with TTL (caching mock data) |
| `styles/commonStyles.ts` | Theme — navy/charcoal palette, gradients, shadows, typography |

### Common Patterns

- **State:** React Context API (Auth, Data, Widget) + AsyncStorage persistence
- **Hooks:** `useAuth()`, `useData()`, `useCache()`, `useNotifications()`, `useRealtime()`
- **Components:** Card variants (GlassCard, GradientCard, AnimatedCard, PressableCard, StatCard), GradientContainer, FloatingTabBar
- **Services:** Singleton managers (cacheManager, offlineManager, realtimeManager)
- **Types:** Defined in `types/index.ts` — User, Vessel, MaintenanceTask, Issue, SupplyRequest, Document, Expense, CalendarEvent + role/status enums
- **Platform splits:** `.ios.tsx` variants exist for owner, manager, crew, calendar, profile, home index

---

## Active Work Areas

### Recently Modified

1. `README.md` (modified, uncommitted)
2. `app/(tabs)/_layout.ios.tsx` (deleted, uncommitted)
3. `mason-readthrough.md` (new, uncommitted)
4. `app/_layout.tsx`
5. `app/(tabs)/_layout.tsx`
6. `app/(tabs)/(home)/index.ios.tsx`
7. `components/GradientContainer.tsx`
8. `utils/errorHandler.ts`
9. `contexts/AuthContext.tsx`
10. `styles/commonStyles.ts`

### Feature Flags

| Flag | Location | Effect |
| --- | --- | --- |
| `isSupabaseConfigured()` | `utils/supabase.ts`, `contexts/AuthContext.tsx` | Toggles real vs mock auth |
| `EXPO_PUBLIC_ENABLE_EDIT_MODE` | `babel.config.js` | Enables edit-mode Babel plugins in dev |
| Demo mode | `app/login.tsx`, `app/manager-login.tsx` | Mock user database, demo badge |

---

## Known Issues & Blockers

### TODOs in Code

| Location | Issue |
| --- | --- |
| `app/(tabs)/(home)/index.tsx:275` | TODO: Show quick details modal |
| `app/(tabs)/(home)/index.ios.tsx:233` | TODO: Show quick details modal |
| `utils/errorHandler.ts:151` | TODO: Implement Sentry logging |
| `utils/offlineManager.ts:416` | TODO: Implement actual API calls (simulates with 80% success) |

### Structural Issues

- **No real backend** — every data operation reads/writes mock state in DataContext
- **Document URIs are fake** — `file://documents/...` paths resolve to nothing, will crash on tap
- **Realtime is local only** — EventEmitter, no Supabase subscriptions
- **Notifications are scaffolding** — service exists, no push token retrieval or actual delivery
- **Offline sync is simulated** — queue infrastructure works, `processOfflineAction()` fakes API calls
- **iOS file duplication** — `.ios.tsx` variants exist but are near-identical to base files
- **Bundle IDs are placeholder** — `com.anonymous.Natively` in app.json

### Workarounds in Place

- Supabase client uses `https://placeholder.supabase.co` when env vars missing
- Auth falls back to mock user array with plaintext passwords
- Demo tokens stored as `"demo-token-" + userId` in AsyncStorage

---

## Testing Focus

**No test infrastructure exists.** No jest.config, no `__tests__` directories, no test scripts in package.json. Zero test coverage.

---

## Environment

### Scripts

```
dev       → expo start --tunnel
ios       → expo start --ios
android   → expo start --android
web       → expo start --web
build:web → expo export + workbox SW generation
lint      → eslint
```

### Environment Variables (.env)

```
EXPO_PUBLIC_SUPABASE_URL=        # Not set (falls back to mock)
EXPO_PUBLIC_SUPABASE_ANON_KEY=   # Not set (falls back to mock)
EXPO_PUBLIC_ENABLE_EDIT_MODE=    # Optional, enables dev Babel plugins
```

### Build Config (eas.json)

Three profiles: `development`, `preview`, `production` — all with auto-increment enabled.

---

## Debug Tips

- Auth flow logs to console: "User is authenticated" / "User is not authenticated"
- Managers log: `[OfflineManager]`, `[CacheManager]`, `[ErrorHandler]` prefixes
- Login screens output: "Mock login successful" / "Supabase login successful"
- `ErrorBoundary` wraps entire app at root layout
- `OfflineQueueStatus` component renders at top of app (shows sync state)
- Network polling every 10s via `expo-network` in offlineManager
