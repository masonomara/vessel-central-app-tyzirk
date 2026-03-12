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

### Step 3: Generate Privacy Policy

**Approach:** Use a reputable free privacy policy generator rather than writing from scratch. Recommended options ranked by fit:

1. **TermsFeed** (recommended) -- free generator, outputs HTML/Markdown/DOCX, hosts it for free with a permanent URL. Covers GDPR, CCPA, CalOPPA. Good fit because it handles mobile apps specifically and gives you a hosted link immediately.
2. **App Privacy Policy Generator** (open source) -- completely free, GitHub-hosted. Simpler output, good for straightforward apps.
3. **Termly** -- free tier available, auto-updates when laws change. More robust but may push toward paid tier.

**Generator inputs to provide:**
- App name: Vessel & Co.
- Company: Vessel and Co Yacht Management L.L.C.
- Address: 7901 4th St N STE 300, St. Petersburg, FL 33702, US
- Contact: hello@vesselandco.yachts
- Platform: iOS and Android mobile app
- Data collected: names, email, phone, photos, documents, calendar events (all local-only)
- Third-party services: Google Maps SDK, Apple Push Notifications, Firebase Cloud Messaging
- Analytics/tracking: none
- Ads: none
- Children under 13: no
- GDPR: yes (maritime industry is global)
- CCPA: yes (Florida LLC, may have California users)

**Output:** `docs/legal/privacy-policy.md` -- the generated policy text, to be hosted at `https://www.vesselandco.yachts/privacy`

### Step 3b: Write Support Page Content

**Create:** `docs/legal/support-page.md`

Content for the `/support` page on vesselandco.yachts. Both stores require a support URL.

Content to include:
- App name and brief description
- Contact email: hello@vesselandco.yachts
- FAQ section covering: how to get started, how to switch roles, how data is stored, how to delete data, how to report a bug
- Link to privacy policy
- App version info

To be hosted at `https://www.vesselandco.yachts/support`

### Step 3c: Webmaster Deployment Instructions

**Create:** `docs/legal/webmaster-instructions.md`

Instructions for the Vessel & Co. webmaster to deploy the legal pages. Contents:

- **Privacy Policy page**: Create `/privacy` route on vesselandco.yachts. Copy content from `docs/legal/privacy-policy.md`. Must be publicly accessible (no login wall). Required before app store submission.
- **Support page**: Create `/support` route. Copy content from `docs/legal/support-page.md`. Must be publicly accessible.
- **Timeline**: Both pages must be live before submitting to either store. Apple and Google verify these URLs during review.
- **Format**: Plain HTML is fine. No special framework needed. Must be mobile-responsive (reviewers check on devices).
- **Updates**: When the privacy policy changes, update the page and add a "Last updated" date at the top.

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

Document required screenshot/graphic assets with specs and current status for both stores. This is a reference checklist only -- the actual screenshots and graphics are captured later during the Submission phase (after UI polish is complete). The checklist ensures nothing is missed when that time comes.

### Step 11: Restyle Quick Login as "Try Demo"

**File:** `app/login.tsx` (lines 276-330)

Restyle the Quick Login section:

- Change "Quick Login" divider text to "Try Demo" or "Demo Access"
- Ensure it looks like a deliberate product feature, not test UI
- This satisfies Apple review while keeping demo functionality

---

## Verification

1. Run `npx expo config --type public` -- confirm name=Vessel & Co., version=1.0.0, bundleIdentifier and package unchanged
2. Verify permission strings in Info.plist are specific and descriptive
3. Verify store metadata character counts are within limits
4. Confirm privacy policy accurately reflects actual data practices (local-only, no backend)
5. Confirm store.config.json structure is valid for `eas metadata:push`
6. Confirm icon assets meet store dimension/format specs

---

## Task List

Legend: `[CLAUDE]` = done by Claude Code, `[HUMAN]` = requires your action, `[BOTH]` = Claude drafts, you review/finalize

### Phase 1: Config & Identity Updates

- [x] `[CLAUDE]` Update app name to "Vessel & Co." in `app.json`
- [x] `[CLAUDE]` Update `CFBundleDisplayName` in `Info.plist`
- [x] `[CLAUDE]` Add `buildNumber: "1"` and `versionCode: 1` to `app.json`
- [x] `[CLAUDE]` Add `submit` block with placeholders to `eas.json`
- [ ] `[HUMAN]` Fill in Apple Developer credentials in `eas.json` (appleId, ascAppId, appleTeamId)
- [ ] `[HUMAN]` Fill in Google Play service account key path in `eas.json`

### Phase 2: Privacy Policy & Legal Pages

- [x] `[CLAUDE]` Write privacy policy to `docs/legal/privacy-policy.md` (written directly, covers GDPR/CCPA/local-only data)
- [x] `[CLAUDE]` Write support page content (`docs/legal/support-page.md`)
- [x] `[CLAUDE]` Write webmaster deployment instructions (`docs/legal/webmaster-instructions.md`)
- [ ] `[HUMAN]` Review generated privacy policy for accuracy
- [ ] `[HUMAN]` Send `privacy-policy.md`, `support-page.md`, and `webmaster-instructions.md` to webmaster
- [ ] `[HUMAN]` Webmaster deploys privacy policy to `https://www.vesselandco.yachts/privacy`
- [ ] `[HUMAN]` Webmaster deploys support page to `https://www.vesselandco.yachts/support`
- [ ] `[HUMAN]` Verify both URLs are live and publicly accessible

### Phase 3: App Store Metadata (iOS)

- [x] `[CLAUDE]` Write full App Store description (up to 4000 chars)
- [x] `[CLAUDE]` Write subtitle, promotional text, keywords
- [x] `[CLAUDE]` Write all metadata fields to `docs/legal/app-store-metadata.md`
- [x] `[CLAUDE]` Create `store.config.json` with all iOS metadata populated
- [ ] `[HUMAN]` Review and approve all App Store copy
- [ ] `[HUMAN]` Verify keyword strategy (search for competitors, check for conflicts)

### Phase 4: Google Play Store Metadata

- [x] `[CLAUDE]` Write short description (80 chars)
- [x] `[CLAUDE]` Write full description (4000 chars, keyword-optimized for Play Store)
- [x] `[CLAUDE]` Document Data Safety Section declarations in `docs/legal/play-store-metadata.md`
- [ ] `[HUMAN]` Review and approve all Play Store copy
- [ ] `[HUMAN]` Complete IARC content rating questionnaire in Play Console (answers documented in metadata file)
- [ ] `[HUMAN]` Fill out Data Safety form in Play Console using documented declarations

### Phase 5: Native Config Cleanup

- [x] `[CLAUDE]` Rewrite all iOS permission descriptions in `Info.plist` to be specific
- [x] `[CLAUDE]` Audit Android permissions in `AndroidManifest.xml`
- [x] `[CLAUDE]` Verify `PrivacyInfo.xcprivacy` is accurate
- [ ] `[HUMAN]` Run `eas build --profile production --platform ios` and verify permission strings in output
- [ ] `[HUMAN]` Run `eas build --profile production --platform android` and verify `SYSTEM_ALERT_WINDOW` is stripped

### Phase 6: Login Screen Update

- [x] `[CLAUDE]` Restyle Quick Login section in `app/login.tsx` -- change "Quick Login" to "Try Demo"
- [ ] `[HUMAN]` Review on physical device to confirm it looks intentional, not like test UI
- [ ] `[HUMAN]` Prepare App Review notes: "Tap any demo role button on the login screen to access the app with sample data."

### Phase 7: Asset Checklist (Reference for Later)

- [x] `[CLAUDE]` Create `docs/legal/asset-checklist.md` with all required assets, specs, and status
- [ ] `[HUMAN]` Verify `public/icon.png` is 1024x1024, no alpha channel
- [ ] `[HUMAN]` Verify `public/adaptive-icon.png` meets Android adaptive icon spec
- [ ] `[HUMAN]` Export 512x512 hi-res icon for Play Store
- [ ] `[HUMAN]` Create 1024x500 feature graphic for Play Store
- [ ] `[HUMAN]` Capture screenshots across all required device sizes (deferred until UI polish is complete)

### Phase 8: Final Verification

- [x] `[CLAUDE]` Run `npx expo config --type public` and verify output
- [x] `[CLAUDE]` Validate all character counts in metadata files
- [ ] `[HUMAN]` Confirm privacy policy and support URLs are live
- [ ] `[HUMAN]` Confirm Apple Developer and Google Play Console accounts are active
- [ ] `[HUMAN]` Do a final read-through of all legal and metadata documents
