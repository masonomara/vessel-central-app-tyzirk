# Plan: Legal & Metadata Preparation for App Store Submission

## Context

Vessel & Co. is a yacht fleet management app (Expo 54 / React Native) at version 1.0.0, ready for first submission to Apple App Store and Google Play Store. No privacy policy, store metadata, or store config exists. The app name exceeds the 30-character limit on both stores. All data is currently local-only (AsyncStorage, no backend). Several config and metadata files need creation or modification.

## Resolved Decisions

| Decision         | Answer                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| App display name | **Vessel & Co.** (12 chars). "Yacht Management" goes in subtitle/short description.            |
| Bundle ID        | **Keep `com.vesselcentral.app`**. No changes.                                                  |
| Publisher        | **Vessel and Co Yacht Management L.L.C.**, 7901 4th St N STE 300, St. Petersburg, FL 33702, US |
| Contact email    | **hello@vesselandco.yachts**                                                                   |
| Domain           | **https://www.vesselandco.yachts/**                                                            |
| Pricing          | **Free**                                                                                       |
| Demo login       | **Keep Quick Login buttons**, restyle as proper "Try Demo" feature                             |

---

## Step-by-Step Plan

### Step 1: Shorten App Name

**Files:**

- `app.json:3` -- change `"name"` to `"Vessel & Co."`
- `ios/VesselCoYachtManagement/Info.plist:10` -- change `CFBundleDisplayName` to `"Vessel &amp; Co."`

### Step 2: Set Version & Build Numbers Explicitly

**File:** `app.json`

- Add `"buildNumber": "1"` under `ios` block
- Add `"versionCode": 1` under `android` block
- Keep `version: "1.0.0"`

### Step 3: Write Privacy Policy

**Create:** `docs/legal/privacy-policy.md`

Full privacy policy for Vessel and Co Yacht Management L.L.C. covering:

- Data collected: user-provided info (names, contacts, vessel data, documents, photos), all stored locally on-device
- No server transmission, no analytics, no tracking, no ads
- Third-party SDKs: Google Maps SDK (Android) collects approximate location and device identifiers; APNs/FCM receive push tokens
- Storage: local AsyncStorage, not encrypted at rest
- Retention: until uninstall or manual data clear
- Children: not directed at children under 13
- User rights: delete all data via uninstall or clear app data; GDPR rights (access, rectify, delete)
- Contact: hello@vesselandco.yachts
- Effective date: 2026-03-10

To be hosted at `https://www.vesselandco.yachts/privacy`

<!-- can we find a standard one of these online that is reputable rather than tryign to make our own? -->

<!-- what about the /supprt page info? -->

<!-- need instructiosn to give to vessel and co webmaster -->

### Step 4: Write App Store Metadata (iOS)

**Create:** `docs/legal/app-store-metadata.md`

| Field                | Value                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Name                 | Vessel & Co.                                                                                  |
| Subtitle             | Yacht Fleet Management (22 chars)                                                             |
| Description          | Full feature description (write up to 4000 chars)                                             |
| Keywords             | yacht,vessel,fleet,management,maintenance,maritime,boat,crew,charter,marine (100 char budget) |
| Promotional Text     | ~170 char tagline                                                                             |
| What's New           | Initial release.                                                                              |
| Category (Primary)   | Business                                                                                      |
| Category (Secondary) | Productivity                                                                                  |
| Age Rating           | 4+                                                                                            |
| Copyright            | 2026 Vessel and Co Yacht Management L.L.C.                                                    |
| Privacy Policy URL   | https://www.vesselandco.yachts/privacy                                                        |
| Support URL          | https://www.vesselandco.yachts/support                                                        |

### Step 5: Write Google Play Store Metadata

**Create:** `docs/legal/play-store-metadata.md`

| Field              | Value                                            |
| ------------------ | ------------------------------------------------ |
| App Name           | Vessel & Co.                                     |
| Short Description  | 80 chars max                                     |
| Full Description   | 4000 chars max (keyword-rich for Play Store SEO) |
| Category           | Business                                         |
| Content Rating     | Everyone / PEGI 3                                |
| Contact Email      | hello@vesselandco.yachts                         |
| Privacy Policy URL | https://www.vesselandco.yachts/privacy           |

**Data Safety Section declarations:**

- Personal info (name, email, phone): collected locally, not shared
- Photos/videos: collected locally, not shared
- Files/docs: collected locally, not shared
- App activity (audit logs): collected locally, not shared
- Device/location info: collected by Google Maps SDK (must disclose)
- Data encrypted in transit: N/A (no network)
- Data deletion: uninstall or clear app data

### Step 6: Create store.config.json

**Create:** `store.config.json` (project root)

EAS Metadata config for automated submission via `eas metadata:push`. Populate with values from Steps 4-5.

### Step 7: Add EAS Submit Config

**File:** `eas.json` -- add `submit` block with placeholder Apple Developer / Play Console IDs:

- Android: track=production, releaseStatus=draft
- iOS: appleId, ascAppId, appleTeamId (placeholders for user to fill)

### Step 8: Improve iOS Permission Descriptions

**File:** `ios/VesselCoYachtManagement/Info.plist` (lines 50-63)

Replace generic descriptions with specific ones:

- Calendar: "Vessel & Co. uses your calendar to schedule and sync maintenance tasks, charter events, and crew assignments."
- Camera: "Vessel & Co. uses your camera to capture photos of maintenance issues, equipment inspections, and document scans."
- Microphone: "Vessel & Co. uses your microphone to record audio when capturing video of vessel inspections and issues."
- Photo Library: "Vessel & Co. uses your photo library to attach images to maintenance tasks, issues, and vessel documentation."
- Reminders: "Vessel & Co. uses reminders to alert you about upcoming maintenance deadlines and certification expirations."

### Step 9: Audit Android Permissions

**File:** `android/app/src/main/AndroidManifest.xml`

- Verify `SYSTEM_ALERT_WINDOW` is stripped in production EAS builds (dev-only permission)
- Note `READ/WRITE_EXTERNAL_STORAGE` deprecation on API 33+ (Expo handles scoped storage)
- `RECORD_AUDIO` is legitimate (video capture via expo-image-picker)

### Step 10: Create Asset Checklist

**Create:** `docs/legal/asset-checklist.md`

Document required screenshot/graphic assets with specs and current status for both stores.

<!-- so this is somethign I do later, correct? -->

### Step 11: Restyle Quick Login as "Try Demo"

**File:** `app/login.tsx` (lines 276-330)

Restyle the Quick Login section:

- Change "Quick Login" divider text to "Try Demo" or "Demo Access"
- Ensure it looks like a deliberate product feature, not test UI
- This satisfies Apple review while keeping demo functionality

---

## Files Modified (Summary)

| File                                | Action                                               |
| ----------------------------------- | ---------------------------------------------------- |
| `app.json`                          | Update name, add buildNumber/versionCode             |
| `eas.json`                          | Add submit config block                              |
| `ios/.../Info.plist`                | Update display name, rewrite permission descriptions |
| `android/.../AndroidManifest.xml`   | Audit only (no changes expected)                     |
| `app/login.tsx`                     | Restyle Quick Login as "Try Demo"                    |
| `store.config.json`                 | Create                                               |
| `docs/legal/privacy-policy.md`      | Create                                               |
| `docs/legal/app-store-metadata.md`  | Create                                               |
| `docs/legal/play-store-metadata.md` | Create                                               |
| `docs/legal/asset-checklist.md`     | Create                                               |

---

## Verification

1. Run `npx expo config --type public` -- confirm name=Vessel & Co., version=1.0.0, bundleIdentifier and package unchanged
2. Verify permission strings in Info.plist are specific and descriptive
3. Verify store metadata character counts are within limits
4. Confirm privacy policy accurately reflects actual data practices (local-only, no backend)
5. Confirm store.config.json structure is valid for `eas metadata:push`
6. Confirm icon assets meet store dimension/format specs
