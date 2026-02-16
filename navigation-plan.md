# Navigation Overhaul Plan

Replace the custom FloatingTabBar + Stack-as-tabs system with Expo Router's `NativeTabs` and native `Stack` headers. Result: native platform tab bar, native headers on every screen, deletion of all hand-rolled header/tab-bar code.

---

## Current State Summary

- **SDK 54 / Expo Router 6 / react-native-screens 4.16**
- `app/(tabs)/_layout.tsx` uses a **Stack** navigator (not Tabs) with a custom `FloatingTabBar` overlay
- Tab switching is `router.push()` with `animation: "none"` — no real tab state, no scroll-to-top, no history
- Every tab screen manually renders its own header (title + action buttons) with hardcoded `paddingTop: 60`
- Detail screens build custom back-arrow headers from scratch
- Add-form modals build custom Cancel/Create or back-arrow headers from scratch
- 3 user roles (owner, manager, crew) each see different tabs — driven by `getTabsForRole()` at runtime

### Files to Change or Delete

| File                            | Action                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `components/FloatingTabBar.tsx` | **Delete**                                                                   |
| `app/(tabs)/_layout.tsx`        | **Rewrite** (Stack → NativeTabs)                                             |
| `app/(tabs)/(home)/_layout.tsx` | **Delete** (home group removed)                                              |
| `app/(tabs)/(home)/index.tsx`   | **Move** to `app/(tabs)/home.tsx` or remove                                  |
| `app/_layout.tsx`               | **Edit** (configure root Stack headers)                                      |
| `app/(tabs)/owner.tsx`          | **Edit** (remove custom header)                                              |
| `app/(tabs)/manager.tsx`        | **Edit** (remove custom header)                                              |
| `app/(tabs)/crew.tsx`           | **Edit** (remove custom header)                                              |
| `app/(tabs)/calendar.tsx`       | **Edit** (remove custom header)                                              |
| `app/(tabs)/maintenance.tsx`    | **Edit** (remove custom header)                                              |
| `app/(tabs)/issues.tsx`         | **Edit** (remove custom header)                                              |
| `app/(tabs)/supplies.tsx`       | **Edit** (remove custom header)                                              |
| `app/(tabs)/documents.tsx`      | **Edit** (remove custom header)                                              |
| `app/(tabs)/profile.tsx`        | **Move** to `app/profile.tsx` (no longer a tab, becomes a root stack screen) |
| `app/maintenance-detail.tsx`    | **Edit** (remove custom header)                                              |
| `app/issue-detail.tsx`          | **Edit** (remove custom header)                                              |
| `app/supply-detail.tsx`         | **Edit** (remove custom header)                                              |
| `app/document-detail.tsx`       | **Edit** (remove custom header)                                              |
| `app/calendar-event-detail.tsx` | **Edit** (remove custom header)                                              |
| `app/analytics.tsx`             | **Edit** (remove custom header)                                              |
| `app/add-maintenance-task.tsx`  | **Edit** (remove custom header)                                              |
| `app/add-issue.tsx`             | **Edit** (remove custom header)                                              |
| `app/add-document.tsx`          | **Edit** (remove custom header)                                              |
| `app/add-calendar-event.tsx`    | **Edit** (remove custom header)                                              |
| `app/add-supply-request.tsx`    | **Edit** (remove custom header)                                              |
| `app/add-parts-request.tsx`     | **Edit** (remove custom header)                                              |
| `app/notification-settings.tsx` | **Minor edit** (already uses native header, just verify)                     |
| `app/assign-boats.tsx`          | **Minor edit** (already uses native header, just verify)                     |

---

## Step 1: Restructure the File System

### Problem

NativeTabs requires each tab screen to be a direct child of the tabs layout directory, declared via `NativeTabs.Trigger`. The current `(home)` group is unnecessary — users are immediately redirected away from it. The role-specific dashboards (`owner`, `manager`, `crew`) should remain as separate screens with conditional `hidden` triggers.

### Changes

1. **Delete `app/(tabs)/(home)/` entirely** — remove `_layout.tsx` and `index.tsx`
   - The home `index.tsx` is a fleet overview that's never seen (auto-redirect fires immediately)
   - If the fleet overview is worth keeping, move it to `app/(tabs)/fleet.tsx` and add it as a tab for the owner role

2. **Keep all other tab screens as-is** in `app/(tabs)/`:

   ```
   app/(tabs)/
     _layout.tsx      ← rewrite
     owner.tsx
     manager.tsx
     crew.tsx
     calendar.tsx
     maintenance.tsx
     issues.tsx
     supplies.tsx
     documents.tsx
   ```

   Note: `profile.tsx` moves out of `(tabs)/` to the root `app/` directory (see Step 2).

3. **Update `app/index.tsx`** — change redirect target from `/(tabs)/(home)` to the role-specific dashboard:

   ```ts
   // Instead of always routing to /(tabs)/(home) and relying on a second redirect:
   const role = await AsyncStorage.getItem("userRole");
   if (role === "owner") router.replace("/(tabs)/owner");
   else if (role === "manager") router.replace("/(tabs)/manager");
   else if (role === "crew") router.replace("/(tabs)/crew");
   else router.replace("/login");
   ```

   This eliminates the double-redirect (index → home → role dashboard) and removes the need for the `hasRedirected` ref hack in the tabs layout.

4. **Update login flow** — on successful login, route directly to the role-specific tab:
   ```ts
   router.replace(`/(tabs)/${user.role}`);
   ```

---

## Step 2: Rewrite `app/(tabs)/_layout.tsx` — NativeTabs

### Current

Stack navigator + FloatingTabBar component. Role-based tab array with `router.push()` navigation. Auto-redirect logic.

### New

`NativeTabs` with role-based `hidden` props on each trigger. No custom tab bar, no redirect logic.

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { userRole } = useAuth();

  return (
    <NativeTabs>
      {/* Owner Dashboard */}
      <NativeTabs.Trigger name="owner" hidden={userRole !== "owner"}>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="dashboard" />
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Manager Dashboard */}
      <NativeTabs.Trigger name="manager" hidden={userRole !== "manager"}>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="dashboard" />
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Crew Dashboard */}
      <NativeTabs.Trigger name="crew" hidden={userRole !== "crew"}>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="list" />
        <NativeTabs.Trigger.Label>Tasks</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Calendar — all roles */}
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Icon
          sf={{ default: "calendar", selected: "calendar" }}
          md="event"
        />
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Maintenance — owner + manager only */}
      <NativeTabs.Trigger name="maintenance" hidden={userRole === "crew"}>
        <NativeTabs.Trigger.Icon sf="wrench.and.screwdriver.fill" md="build" />
        <NativeTabs.Trigger.Label>Maintenance</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Issues — manager + crew only */}
      <NativeTabs.Trigger name="issues" hidden={userRole === "owner"}>
        <NativeTabs.Trigger.Icon
          sf="exclamationmark.triangle.fill"
          md="report_problem"
        />
        <NativeTabs.Trigger.Label>Issues</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Supplies — manager + crew only */}
      <NativeTabs.Trigger name="supplies" hidden={userRole === "owner"}>
        <NativeTabs.Trigger.Icon sf="shippingbox.fill" md="inventory_2" />
        <NativeTabs.Trigger.Label>Supplies</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Documents — owner only */}
      <NativeTabs.Trigger name="documents" hidden={userRole !== "owner"}>
        <NativeTabs.Trigger.Icon sf="doc.text.fill" md="description" />
        <NativeTabs.Trigger.Label>Documents</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Profile is NOT a tab — it lives in the root stack and is accessed
          via a headerRight button on every tab screen. See Step 4. */}
    </NativeTabs>
  );
}
```

### Solving the Android 5-tab Maximum

NativeTabs supports a maximum of **5 tabs on Android**. The manager role currently has 6 tabs (Dashboard, Calendar, Maintenance, Issues, Supplies, Profile).

**Solution — Remove Profile from the tab bar.** Profile becomes a persistent avatar/icon button in the `headerRight` of every tab screen. Tapping it pushes the profile screen from the root stack. This frees up a tab slot for every role:

| Role    | Tabs (after removing Profile)                      | Count |
| ------- | -------------------------------------------------- | ----- |
| Owner   | Dashboard, Calendar, Maintenance, Documents        | 4     |
| Manager | Dashboard, Calendar, Maintenance, Issues, Supplies | 5     |
| Crew    | Tasks, Calendar, Issues, Supplies                  | 4     |

All roles are at or under the 5-tab limit. Manager fits exactly.

**What changes:**

- `app/(tabs)/profile.tsx` moves to `app/profile.tsx` — it becomes a regular root stack screen with a native back button
- The Profile `NativeTabs.Trigger` is removed entirely from the tabs layout
- A profile button (person icon or user avatar) is added to `headerRight` on every tab screen, navigating via `router.push('/profile')`
- `app/_layout.tsx` gets a new `<Stack.Screen name="profile" options={{ title: 'Profile' }} />` entry
- The `SafeAreaView edges={["top"]}` wrapper in profile.tsx is removed since the native stack header handles safe area

### What Gets Deleted

- The `FloatingTabBar` import and `<FloatingTabBar tabs={tabs} />` JSX
- The `getTabsForRole()` function
- The `handleRoleRedirect` / `useEffect` / `hasRedirected` ref
- The entire `TabBarItem` type export from FloatingTabBar

### Caveat on `hidden`

The Expo docs warn: "Dynamically hiding tabs will remount the navigator and the state will be reset." Since the role is set once at login and doesn't change during a session, this isn't a problem in practice. But if role-switching is ever added mid-session, the tabs would reset — this is acceptable.

---

## Step 3: Configure the Root Stack Headers (`app/_layout.tsx`)

### Current

All screens have `headerShown: false`. Every screen builds its own header.

### New

Enable native headers globally via `screenOptions`, then override per-screen. The root stack becomes the source of truth for all header behavior.

```tsx
function RootLayoutContent() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600" },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {/* Auth screens — no header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />

        {/* Tabs — header handled by NativeTabs, not root stack */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Demo modals — keep native header */}
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="formsheet"
          options={{ presentation: "formSheet", title: "Form Sheet" }}
        />
        <Stack.Screen
          name="transparent-modal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />

        {/* Add-form modals */}
        <Stack.Screen
          name="add-maintenance-task"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Maintenance Task",
          }}
        />
        <Stack.Screen
          name="add-issue"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Report Issue",
          }}
        />
        <Stack.Screen
          name="add-document"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Upload Document",
          }}
        />
        <Stack.Screen
          name="add-calendar-event"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "New Event",
          }}
        />
        <Stack.Screen
          name="add-supply-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Supplies",
          }}
        />
        <Stack.Screen
          name="add-parts-request"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            title: "Request Parts",
          }}
        />

        {/* Detail screens */}
        <Stack.Screen
          name="maintenance-detail"
          options={{ title: "Task Details" }}
        />
        <Stack.Screen
          name="issue-detail"
          options={{ title: "Issue Details" }}
        />
        <Stack.Screen
          name="supply-detail"
          options={{ title: "Supply Request" }}
        />
        <Stack.Screen name="document-detail" options={{ title: "Document" }} />
        <Stack.Screen
          name="calendar-event-detail"
          options={{ title: "Event Details" }}
        />

        {/* Profile — pushed from headerRight button, not a tab */}
        <Stack.Screen name="profile" options={{ title: "Profile" }} />

        {/* Utility screens */}
        <Stack.Screen name="assign-boats" options={{ title: "Assign Boats" }} />
        <Stack.Screen name="manager-login" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification-settings"
          options={{ title: "Notification Settings" }}
        />
        <Stack.Screen name="analytics" options={{ title: "Analytics" }} />
      </Stack>
    </View>
  );
}
```

### What This Gives Us

- Native back button on all detail/utility screens (no custom `TouchableOpacity` + `router.back()`)
- Native title on all screens
- Consistent header style from one place
- Modal screens get the native drag-to-dismiss affordance plus a native title bar
- `headerBackButtonDisplayMode: 'minimal'` gives a clean chevron-only back button on iOS

---

## Step 4: Add `headerRight` Actions Per Screen

Many tab screens currently have action buttons in the header area (add, search, analytics, filter icons). Move screen-specific actions into `headerRight` using inline `<Stack.Screen options>`. Every tab screen also gets a persistent **profile button** as the rightmost header action — this replaces the old Profile tab.

Analytics and logout buttons are removed from headers. Analytics is accessible from within screen content. Logout lives on the profile screen.

### Profile Header Button

Create a small shared component to avoid repeating the profile button in every screen:

```tsx
// components/ProfileHeaderButton.tsx
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

export function ProfileHeaderButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/profile")}>
      <IconSymbol
        ios_icon_name="person.circle"
        android_material_icon_name="account_circle"
        size={28}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
```

### Tab Screens — Use Inline `<Stack.Screen>` Inside Each File

NativeTabs wraps each tab in a native navigator that supports header configuration. Each tab screen should set its own title and headerRight. The profile button is always the rightmost item.

**Pattern for tab screens (example: `maintenance.tsx`):**

```tsx
import { Stack } from 'expo-router';
import { ProfileHeaderButton } from '@/components/ProfileHeaderButton';

export default function MaintenanceScreen() {
  // ... existing logic ...

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Maintenance',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {(userRole === 'manager' || userRole === 'owner') && (
                <TouchableOpacity onPress={handleAddTask}>
                  <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={24} color={colors.accent} />
                </TouchableOpacity>
              )}
              <ProfileHeaderButton />
            </View>
          ),
        }}
      />

      {/* Remove the old <View style={styles.header}> block entirely */}
      <FlatList ... />
    </View>
  );
}
```

### Screen-by-Screen Header Right Actions

Every screen gets the profile button. Additional actions are screen-specific:

| Screen            | Title           | headerRight (left to right)                           |
| ----------------- | --------------- | ----------------------------------------------------- |
| `owner.tsx`       | `"Dashboard"`   | Search button, **Profile**                            |
| `manager.tsx`     | `"Dashboard"`   | Search button, **Profile**                            |
| `crew.tsx`        | `"Tasks"`       | **Profile**                                           |
| `calendar.tsx`    | `"Calendar"`    | Add event button, **Profile**                         |
| `maintenance.tsx` | `"Maintenance"` | Add task button (owner/manager only), **Profile**     |
| `issues.tsx`      | `"Issues"`      | Add issue button, **Profile**                         |
| `supplies.tsx`    | `"Supplies"`    | Add request button (crew only), **Profile**           |
| `documents.tsx`   | `"Documents"`   | Add document button (owner/manager only), **Profile** |

### Dashboard Screens — Title Strategy

The owner, manager, and crew dashboards currently have welcome text + greeting instead of a simple title. The native header title will be a simple string ("Dashboard" or "Tasks"), and the welcome greeting + user name stay as the first element inside the ScrollView content. This is cross-platform consistent.

```tsx
<Stack.Screen options={{ title: 'Dashboard', headerRight: () => (...) }} />
```

### Detail Screens

Detail screens already have their `title` set in the root stack (Step 3). For dynamic titles (showing the actual item name), use inline `<Stack.Screen>`:

```tsx
// maintenance-detail.tsx
<Stack.Screen options={{ title: task?.title || "Task Details" }} />
```

### Add-Form Modals — headerLeft / headerRight

The `add-maintenance-task` screen currently has Cancel (left) and Create (right) text buttons. Move these to the native header:

```tsx
// add-maintenance-task.tsx
<Stack.Screen
  options={{
    title: "New Maintenance Task",
    headerLeft: () => (
      <TouchableOpacity onPress={handleCancel}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
          Cancel
        </Text>
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={handleSubmit}>
        <Text style={{ color: colors.accent, fontSize: 16, fontWeight: "600" }}>
          Create
        </Text>
      </TouchableOpacity>
    ),
  }}
/>
```

Apply the same Cancel/Save pattern to ALL add-form modals for consistency (currently only `add-maintenance-task` has it — the others use a back arrow, which is inconsistent).

---

## Step 5: Remove All Custom Header Code

For every screen listed in the table at the top, do the following:

1. **Delete the custom header `<View>` block** — the `<View style={styles.header}>` containing the back button, title text, and action buttons
2. **Delete the associated styles** — `header`, `headerTop`, `headerActions`, `headerTitle`, `backButton`, `headerSpacer`, `headerButton`, `cancelText`, `saveText`, and any related styles
3. **Remove manual `paddingTop: 60` / `paddingTop: 48`** from container or header styles — the native header handles safe area insets
4. **Remove `SafeAreaView edges={["top"]}`** from profile.tsx — the native stack header handles the top safe area now that profile is a root stack screen
5. **Remove bottom padding hacks** (`paddingBottom: 120`, `contentContainerWithTabBar`) — NativeTabs handles the bottom inset automatically for tab screens. Profile no longer needs tab bar padding since it's a pushed stack screen.
6. **Remove logout buttons from dashboard headers** (owner, manager, crew) — logout now lives exclusively on the profile screen, accessible via the persistent headerRight profile button

### What to Keep

- `GlobalSearch` modal overlay — this is a feature, not a header. Keep it as-is, triggered by the headerRight search button
- `FilterModal` in maintenance.tsx — also a feature, not a header. Keep it.

---

## Step 6: Delete FloatingTabBar

1. Delete `components/FloatingTabBar.tsx`
2. Remove the `TabBarItem` type export (used only in the tabs layout)
3. Remove all imports of `FloatingTabBar` from `app/(tabs)/_layout.tsx`
4. Remove the `expo-blur` dependency if nothing else uses `BlurView` (check first)
5. The `react-native-reanimated` dependency stays — it's likely used elsewhere

---

## Step 7: Clean Up the Auth Redirect Flow

### Current Flow (3 hops)

```
app/index.tsx → /(tabs)/(home) → /(tabs)/owner (via useEffect redirect)
```

### New Flow (1 hop)

```
app/index.tsx → /(tabs)/owner (direct, based on stored role)
```

### Changes to `app/index.tsx`

```tsx
export default function Index() {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuthAndRedirect = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        if (!authToken) {
          router.replace("/login");
          return;
        }
        const userRole = await AsyncStorage.getItem("userRole");
        if (userRole === "owner") router.replace("/(tabs)/owner");
        else if (userRole === "manager") router.replace("/(tabs)/manager");
        else if (userRole === "crew") router.replace("/(tabs)/crew");
        else router.replace("/login");
      } catch {
        router.replace("/login");
      }
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}
```

### Changes to Login Screen

After successful login, route to role-specific tab:

```tsx
router.replace(`/(tabs)/${user.role}`);
```

Same for the mock user quick-select buttons.

---

## Step 8: Handle the `notification-settings` and `assign-boats` Screens

These two screens already use the native React Navigation header via inline `<Stack.Screen options>`. After Step 3, they'll inherit the global `screenOptions` from the root stack. Verify their inline options still work and remove any redundant style overrides:

- `notification-settings.tsx`: Remove the inline `headerStyle` and `headerTintColor` since the root stack now provides them
- `assign-boats.tsx`: Same — remove inline `headerStyle` and `headerTintColor`. The in-page "Boat Assignments" title and subtitle can remain as content, but the native header will show "Assign Boats"

---

## Execution Order

| Phase | What                                                                                                                                                                   | Risk                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1     | Delete `(home)` directory, move `profile.tsx` from `(tabs)/` to root `app/`, update auth redirects                                                                     | Low — file moves and routing changes                                    |
| 2     | Rewrite `app/(tabs)/_layout.tsx` to NativeTabs (without profile trigger), delete FloatingTabBar                                                                        | **High** — this is the core change. Test on both platforms immediately. |
| 3     | Update `app/_layout.tsx` root stack with native headers (including new profile screen entry)                                                                           | Medium — headers may need per-screen tuning                             |
| 4     | Create `ProfileHeaderButton` component, then screen-by-screen: remove custom headers, add `<Stack.Screen options>` with title + headerRight (including profile button) | Low per screen, tedious across ~20 files                                |
| 5     | Clean up styles, remove unused paddingTop/paddingBottom, remove SafeAreaView top edges, remove logout from dashboard headers                                           | Low                                                                     |
| 6     | Delete FloatingTabBar.tsx, remove unused deps                                                                                                                          | Low                                                                     |
| 7     | Test all role flows end-to-end                                                                                                                                         | —                                                                       |

Work on Phase 2 and 3 together since they're tightly coupled. Phase 4 can be done screen by screen with testing in between.

---

## Risks

### Decisions Made

1. **Manager 6-tab problem** — Solved. Profile is removed from the tab bar and moved to a persistent `headerRight` button on every screen. Manager now has exactly 5 tabs.

2. **Dashboard title strategy** — Option B. Native header shows "Dashboard" / "Tasks". Welcome greeting stays in scroll content.

3. **Fleet overview** — Delete `(home)/index.tsx`. It was never visible to users. If the fleet overview is needed later, it can be rebuilt as a dedicated screen.

### Known Risks

- **`hidden` remounts the navigator.** If role-switching is ever added mid-session, all tab state resets. Currently fine since role is set at login.
- **NativeTabs is `unstable` API.** Import path is `expo-router/unstable-native-tabs`. The API may change in future SDK versions. This is the documented path forward from Expo; there is no stable alternative for native tabs.
- **FlatList limitations.** The Expo docs note that FlatList doesn't support scroll-to-top or minimize-on-scroll with NativeTabs. The maintenance, issues, and supplies screens use FlatList. This means tapping the active tab won't auto-scroll to top. Acceptable tradeoff, but worth noting. A workaround is wrapping FlatList content in ScrollView if scroll-to-top is critical.
- **No custom tab bar styling.** The native tab bar follows system styling (iOS tab bar, Android bottom navigation). The current glassmorphism/blur aesthetic is gone. This is the explicit tradeoff of going native.

---

## Todo List

### Phase 1 — File System Restructuring

- [x] Delete `app/(tabs)/(home)/_layout.tsx`
- [x] Delete `app/(tabs)/(home)/index.tsx`
- [x] Remove the empty `app/(tabs)/(home)/` directory
- [x] Move `app/(tabs)/profile.tsx` to `app/profile.tsx`
- [x] Update `app/index.tsx` — replace `router.replace('/(tabs)/(home)')` with role-based redirect that reads `userRole` from AsyncStorage and routes directly to `/(tabs)/owner`, `/(tabs)/manager`, or `/(tabs)/crew`
- [x] Update `app/login.tsx` — change post-login redirect from `/(tabs)/(home)` to `/(tabs)/${user.role}`
- [x] Update every mock user quick-select button in `login.tsx` to route to role-specific tab
- [x] Search codebase for any other references to `/(tabs)/(home)` and update them

### Phase 2 — NativeTabs + Delete FloatingTabBar

- [x] Rewrite `app/(tabs)/_layout.tsx` — replace Stack navigator + FloatingTabBar with `NativeTabs` from `expo-router/unstable-native-tabs`
- [x] Add `NativeTabs.Trigger` for `owner` with `hidden={userRole !== "owner"}`
- [x] Add `NativeTabs.Trigger` for `manager` with `hidden={userRole !== "manager"}`
- [x] Add `NativeTabs.Trigger` for `crew` with `hidden={userRole !== "crew"}`
- [x] Add `NativeTabs.Trigger` for `calendar` (all roles, no hidden prop)
- [x] Add `NativeTabs.Trigger` for `maintenance` with `hidden={userRole === "crew"}`
- [x] Add `NativeTabs.Trigger` for `issues` with `hidden={userRole === "owner"}`
- [x] Add `NativeTabs.Trigger` for `supplies` with `hidden={userRole === "owner"}`
- [x] Add `NativeTabs.Trigger` for `documents` with `hidden={userRole !== "owner"}`
- [x] Do NOT add a trigger for `profile` — it is no longer a tab
- [x] Set SF Symbol icons (`sf` prop) and Material icons (`md` prop) on each trigger
- [x] Remove all old imports: `Stack` from `expo-router`, `FloatingTabBar`, `TabBarItem` type, `useRouter`, `useSegments`, `useCallback`, `useRef`
- [x] Remove `getTabsForRole()` function
- [x] Remove `handleRoleRedirect` callback, `hasRedirected` ref, and both `useEffect` hooks
- [x] Delete `components/FloatingTabBar.tsx`
- [x] Check if `expo-blur` `BlurView` is used anywhere else in the codebase — if not, remove `expo-blur` from dependencies
- [x] Verify tab count per role: owner 4, manager 5, crew 4 (all ≤ 5)

### Phase 3 — Root Stack Native Headers

- [x] Edit `app/_layout.tsx` — add global `screenOptions` to the `<Stack>`: `headerStyle`, `headerTintColor`, `headerTitleStyle`, `headerBackButtonDisplayMode: "minimal"`
- [x] Update `index` screen options — keep `headerShown: false`
- [x] Update `login` screen options — keep `headerShown: false`
- [x] Update `signup` screen options — keep `headerShown: false`
- [x] Update `forgot-password` screen options — keep `headerShown: false`
- [x] Update `(tabs)` screen options — keep `headerShown: false` (NativeTabs handles its own headers)
- [x] Update `modal` screen — set `presentation: "modal"`, `title: "Modal"`; remove `headerShown: true` (now default)
- [x] Update `formsheet` screen — set `presentation: "formSheet"`, `title: "Form Sheet"`; remove `headerShown: true`
- [x] Keep `transparent-modal` screen — `presentation: "transparentModal"`, `animation: "fade"`, `headerShown: false`
- [x] Update `add-maintenance-task` — keep `presentation: "modal"`, `animation: "slide_from_bottom"`, add `title: "New Maintenance Task"`, remove `headerShown: false`
- [x] Update `add-issue` — same pattern, `title: "Report Issue"`
- [x] Update `add-document` — same pattern, `title: "Upload Document"`
- [x] Update `add-calendar-event` — same pattern, `title: "New Event"`
- [x] Update `add-supply-request` — same pattern, `title: "Request Supplies"`
- [x] Update `add-parts-request` — same pattern, `title: "Request Parts"`
- [x] Update `maintenance-detail` — set `title: "Task Details"`, remove `headerShown: false`
- [x] Update `issue-detail` — set `title: "Issue Details"`, remove `headerShown: false`
- [x] Update `supply-detail` — set `title: "Supply Request"`, remove `headerShown: false`
- [x] Update `document-detail` — set `title: "Document"`, remove `headerShown: false`
- [x] Update `calendar-event-detail` — set `title: "Event Details"`, remove `headerShown: false`
- [x] Add new `<Stack.Screen name="profile" options={{ title: "Profile" }} />`
- [x] Update `assign-boats` — set `title: "Assign Boats"`, remove `headerShown: false`
- [x] Keep `manager-login` — `headerShown: false`
- [x] Update `notification-settings` — set `title: "Notification Settings"`, remove `headerShown: false`
- [x] Update `analytics` — set `title: "Analytics"`, remove `headerShown: false`

### Phase 4 — ProfileHeaderButton + Screen-by-Screen Header Migration

**New Component**

- [x] Create `components/ProfileHeaderButton.tsx` — `TouchableOpacity` wrapping a person icon, calls `router.push('/profile')` on press

**Tab Screen Headers (remove custom header, add inline `<Stack.Screen options>`)**

- [x] `owner.tsx` — add `<Stack.Screen>` with `title: "Dashboard"`, `headerRight` with search button + `<ProfileHeaderButton />`
- [x] `owner.tsx` — delete the `<View style={styles.header}>` block (greeting, search icon, analytics icon)
- [x] `owner.tsx` — remove logout button/handler from header (keep in profile)
- [x] `owner.tsx` — delete styles: `header`, `headerTop`, `headerActions`, `iconButton`, `iconButtonGradient`, `greeting`
- [x] `manager.tsx` — add `<Stack.Screen>` with `title: "Dashboard"`, `headerRight` with search button + `<ProfileHeaderButton />`
- [x] `manager.tsx` — delete the `<View style={styles.header}>` block
- [x] `manager.tsx` — remove logout button/handler from header
- [x] `manager.tsx` — delete associated header styles
- [x] `crew.tsx` — add `<Stack.Screen>` with `title: "Tasks"`, `headerRight` with `<ProfileHeaderButton />`
- [x] `crew.tsx` — delete the `<View style={styles.header}>` block
- [x] `crew.tsx` — remove logout button/handler from header
- [x] `crew.tsx` — delete associated header styles
- [x] `calendar.tsx` — add `<Stack.Screen>` with `title: "Calendar"`, `headerRight` with add event button + `<ProfileHeaderButton />`
- [x] `calendar.tsx` — delete the `<View style={styles.header}>` block (title + add button)
- [x] `calendar.tsx` — delete styles: `header`, `headerTop`, `headerTitle`, `addButton`
- [x] `maintenance.tsx` — add `<Stack.Screen>` with `title: "Maintenance"`, `headerRight` with add task button (owner/manager only) + `<ProfileHeaderButton />`
- [x] `maintenance.tsx` — delete the `<View style={styles.header}>` block (title + analytics icon + add icon)
- [x] `maintenance.tsx` — delete styles: `header`, `title`, `headerActions`, `iconButton`
- [x] `issues.tsx` — add `<Stack.Screen>` with `title: "Issues"`, `headerRight` with add issue button + `<ProfileHeaderButton />`
- [x] `issues.tsx` — delete the `<View style={styles.header}>` block
- [x] `issues.tsx` — delete styles: `header`, `title`, `addButton`
- [x] `supplies.tsx` — add `<Stack.Screen>` with `title: "Supplies"`, `headerRight` with add request button (crew only) + `<ProfileHeaderButton />`
- [x] `supplies.tsx` — delete the `<View style={styles.header}>` block
- [x] `supplies.tsx` — delete styles: `header`, `title`, `addButton`
- [x] `documents.tsx` — add `<Stack.Screen>` with `title: "Documents"`, `headerRight` with add document button (owner/manager only) + `<ProfileHeaderButton />`
- [x] `documents.tsx` — delete the `<View style={styles.header}>` block
- [x] `documents.tsx` — delete styles: `header`, `title`, `addButton`

**Detail Screen Headers (remove custom header, add dynamic `<Stack.Screen options>`)**

- [x] `maintenance-detail.tsx` — add `<Stack.Screen options={{ title: task?.title || "Task Details" }} />`
- [x] `maintenance-detail.tsx` — delete the `<View style={styles.header}>` block (back button + title + spacer)
- [x] `maintenance-detail.tsx` — delete styles: `header`, `backButton`, `headerTitle`
- [x] `issue-detail.tsx` — add `<Stack.Screen options={{ title: issue?.title || "Issue Details" }} />`
- [x] `issue-detail.tsx` — delete the custom header block (including the one in the error state)
- [x] `issue-detail.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`
- [x] `supply-detail.tsx` — add `<Stack.Screen options={{ title: request?.itemName || "Supply Request" }} />`
- [x] `supply-detail.tsx` — delete the custom header block (including the one in the error state)
- [x] `supply-detail.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`
- [x] `document-detail.tsx` — add `<Stack.Screen options={{ title: doc?.title || "Document" }} />`
- [x] `document-detail.tsx` — delete the custom header block (including the one in the error state)
- [x] `document-detail.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`
- [x] `calendar-event-detail.tsx` — add `<Stack.Screen options={{ title: event?.title || "Event Details" }} />`
- [x] `calendar-event-detail.tsx` — delete the custom header block (including the one in the error state)
- [x] `calendar-event-detail.tsx` — delete styles: `header`, `backButton`, `headerTitle`
- [x] `analytics.tsx` — delete the custom header block (back button + title + spacer)
- [x] `analytics.tsx` — delete styles: `header`, `backButton`, `headerTitle`

**Add-Form Modal Headers (remove custom header, add `headerLeft`/`headerRight`)**

- [x] `add-maintenance-task.tsx` — add `<Stack.Screen>` with `headerLeft` (Cancel text button) and `headerRight` (Create text button)
- [x] `add-maintenance-task.tsx` — delete the `<View style={styles.header}>` block (Cancel + title + Create)
- [x] `add-maintenance-task.tsx` — delete styles: `header`, `headerButton`, `headerTitle`, `cancelText`, `saveText`
- [x] `add-issue.tsx` — add `<Stack.Screen>` with `headerLeft` (Cancel) and `headerRight` (Submit)
- [x] `add-issue.tsx` — delete the custom header block (back button + title + spacer)
- [x] `add-issue.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`
- [x] `add-document.tsx` — add `<Stack.Screen>` with `headerLeft` (Cancel) and `headerRight` (Upload)
- [x] `add-document.tsx` — delete the custom header block
- [x] `add-document.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`
- [x] `add-calendar-event.tsx` — add `<Stack.Screen>` with `headerLeft` (Cancel) and `headerRight` (Create)
- [x] `add-calendar-event.tsx` — delete the custom header block
- [x] `add-calendar-event.tsx` — delete styles: `header`, `backButton`, `headerTitle`
- [x] `add-supply-request.tsx` — add `<Stack.Screen>` with `headerLeft` (Cancel) and `headerRight` (Submit)
- [x] `add-supply-request.tsx` — delete the custom header block
- [x] `add-supply-request.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`
- [x] `add-parts-request.tsx` — add `<Stack.Screen>` with `headerLeft` (Cancel) and `headerRight` (Submit)
- [x] `add-parts-request.tsx` — delete the custom header block
- [x] `add-parts-request.tsx` — delete styles: `header`, `backButton`, `headerTitle`, `headerSpacer`

**Existing Native Header Screens (verify/clean up)**

- [x] `notification-settings.tsx` — remove inline `headerStyle` and `headerTintColor` (now inherited from root)
- [x] `assign-boats.tsx` — remove inline `headerStyle` and `headerTintColor` (now inherited from root)

### Phase 5 — Style Cleanup

- [x] `owner.tsx` — remove `paddingTop: 60` from any container/header styles (already clean — no paddingTop hack existed; removed unused `useTheme`/`theme` and `headerTop` style)
- [x] `manager.tsx` — remove `paddingTop: 60` from any container/header styles (already clean; removed unused `useTheme`/`theme`)
- [x] `crew.tsx` — remove `paddingTop: 60` from any container/header styles (already clean; removed unused `useTheme`/`theme`)
- [x] `calendar.tsx` — remove `paddingTop` from `scrollContent` style (already clean; removed unused `Platform` import)
- [x] `maintenance.tsx` — remove `paddingTop: 60` from header style (header deleted in Phase 4; removed unused `useTheme`/`theme`)
- [x] `issues.tsx` — remove `paddingTop: 60` from header style (header deleted in Phase 4; removed unused `useTheme`/`theme`)
- [x] `supplies.tsx` — remove `paddingTop: 60` from header style (header deleted in Phase 4; removed unused `useTheme`/`theme`)
- [x] `documents.tsx` — remove `paddingTop: 60` from header style (header deleted in Phase 4; removed unused `useTheme`/`theme`)
- [x] `profile.tsx` — remove `SafeAreaView` wrapper with `edges={["top"]}`, replace with a plain `View`
- [x] `profile.tsx` — remove `contentContainerWithTabBar` style and its platform conditional
- [x] `maintenance-detail.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `issue-detail.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `supply-detail.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `document-detail.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `calendar-event-detail.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `analytics.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `add-maintenance-task.tsx` — remove `paddingTop: 60`/`48` from header style (header deleted in Phase 4)
- [x] `add-issue.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `add-document.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `add-calendar-event.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `add-supply-request.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] `add-parts-request.tsx` — remove `paddingTop` from header style (header deleted in Phase 4)
- [x] All tab screens — remove `paddingBottom: 120` and any `contentContainerWithTabBar` bottom padding hacks (already clean — all use paddingBottom: 20)
- [x] Remove `handleLogout` function and logout button from `owner.tsx` header area (already removed in Phase 4)
- [x] Remove `handleLogout` function and logout button from `manager.tsx` header area (already removed in Phase 4)
- [x] Remove `handleLogout` function and logout button from `crew.tsx` header area (already removed in Phase 4)
- [x] Verify `profile.tsx` still has its own logout button and `handleLogout` function ✓

### Phase 6 — Dependency Cleanup

- [ ] Delete `components/FloatingTabBar.tsx` (if not already done in Phase 2)
- [ ] Grep codebase for any remaining imports of `FloatingTabBar` — remove them
- [ ] Grep codebase for any remaining imports of `TabBarItem` type — remove them
- [ ] Check if `expo-blur` is imported anywhere other than FloatingTabBar — if not, run `npx expo install --fix` or remove from `package.json`
- [ ] Verify `react-native-reanimated` is still used elsewhere (it likely is) — keep it

### Phase 7 — Testing

- [ ] Test owner login → lands on owner Dashboard tab with correct 4 tabs visible
- [ ] Test manager login → lands on manager Dashboard tab with correct 5 tabs visible
- [ ] Test crew login → lands on crew Tasks tab with correct 4 tabs visible
- [ ] Test tab switching for each role — verify no animation, correct screen renders
- [ ] Test profile button appears in headerRight on every tab screen
- [ ] Test tapping profile button pushes profile screen with native back button
- [ ] Test profile screen shows user info, logout button works, navigates back to login
- [ ] Test each detail screen: maintenance-detail, issue-detail, supply-detail, document-detail, calendar-event-detail — native back button works, title shows
- [ ] Test dynamic titles on detail screens (show item name, not just "Task Details")
- [ ] Test each add-form modal: add-maintenance-task, add-issue, add-document, add-calendar-event, add-supply-request, add-parts-request — Cancel/Create buttons in native header, slide-from-bottom animation
- [ ] Test analytics screen — native header with back button, title "Analytics"
- [ ] Test assign-boats screen — native header, title "Assign Boats"
- [ ] Test notification-settings screen — native header, title "Notification Settings"
- [ ] Test GlobalSearch still works from owner/manager dashboard search button
- [ ] Test FilterModal still works in maintenance screen
- [ ] Test logout from profile → redirects to login
- [ ] Test fresh app launch with no stored auth → redirects to login
- [ ] Test fresh app launch with stored auth + role → redirects to correct dashboard
- [ ] Verify no `paddingTop` gaps at the top of any screen (safe area handled by native headers)
- [ ] Verify no extra bottom padding gap on tab screens (NativeTabs handles insets)
- [ ] Test on iOS and Android
