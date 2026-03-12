# Vessel Central — Launch Plan

**Launch Party:** ~March 22, 2026
**PR to Hannah:** https://github.com/hannahbanana-web/vessel-central-app-tyzirk/pull/1

---

## Strategy

| Channel         | Audience           | Deploy By |
| --------------- | ------------------ | --------- |
| **PWA (web)**   | Everyone (primary) | March 14  |
| **TestFlight**  | iOS native         | March 17  |
| **Android APK** | Android native     | March 19  |

---

## Code Fix Before Builds

Wrap `expo-haptics` calls so the web build doesn't crash (2 files):

- `components/PressableCard.tsx:39`
- `app/(tabs)/owner/index.tsx:160`

```tsx
if (Platform.OS !== "web") {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
```

---

## Channel 1: PWA

```bash
npm run web              # verify it works
npm run build:web        # produces dist/
```

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages. Optionally point `app.vesselandco.yachts` at it. Generate a QR code for the URL.

---

## Channel 2: TestFlight

### Prerequisites

- Fill in `eas.json` with real Apple credentials (`appleId`, `ascAppId`, `appleTeamId`)
- Create the app in App Store Connect if it doesn't exist (bundle ID: `com.vesselcentral.app`)
- Privacy policy must be live at `https://www.vesselandco.yachts/privacy`

### Build & Submit

```bash
eas build -p ios --profile production
eas submit -p ios
```

### Set Up Public Link

1. App Store Connect → Vessel & Co. → TestFlight
2. Create external testing group ("Launch Party")
3. Add the build, fill in beta description, submit for Beta App Review (24-48 hrs)
4. Once approved → enable **Public Link**
5. Generate QR code for the link

---

## Channel 3: Android APK

```bash
eas build -p android --profile preview
```

Host the APK (EAS download link, Vercel, or Google Drive). Generate QR code.

---

## What Hannah Needs To Do

### Merge the PR

1. Open https://github.com/hannahbanana-web/vessel-central-app-tyzirk/pull/1
2. Click **"Merge pull request"** → **"Confirm merge"**

### Share Account Access

- **Apple Developer:** Go to developer.apple.com → Account → Membership → send Mason the **email** and **Team ID**. Invite Mason as Admin in App Store Connect under Users and Access.
- **Google Play:** Share login or invite Mason as a developer (optional — APK can be distributed without it).

### Confirm Website URLs

These need to be live (TestFlight requires a privacy policy):
- `https://www.vesselandco.yachts/privacy`
- `https://www.vesselandco.yachts/support`

If not live, Mason can deploy a simple privacy policy page alongside the PWA.

---

## Event Day

Display QR codes at the party. Recommended: one primary QR for the PWA (works for everyone), one secondary QR for TestFlight (native iOS). Optionally set up 1-3 physical devices pre-loaded with each role (Owner, Manager, Crew).

---

## Timeline

| Date     | Who    | Task                                                    |
| -------- | ------ | ------------------------------------------------------- |
| March 12 | Mason  | Fix Haptics web guard, verify `npm run web`             |
| March 12 | Mason  | Send Hannah PR + credentials message                    |
| March 13 | Hannah | Merge PR, share Apple credentials, confirm URLs         |
| March 13 | Mason  | Build and deploy PWA                                    |
| March 14 | Mason  | PWA live, QR code ready                                 |
| March 14 | Mason  | Fill `eas.json`, create App Store Connect listing        |
| March 15 | Mason  | iOS build → TestFlight submit → Beta Review             |
| March 17 | Mason  | Enable TestFlight Public Link, QR code ready            |
| March 18 | Mason  | Android APK build, host, QR code ready                  |
| March 20 | Mason  | End-to-end test, send Hannah final QR codes             |
| March 22 | Both   | Launch party                                            |

---

## Checklist

### Mason

- [ ] Fix Haptics web guards (2 files)
- [ ] Verify web build (`npm run web`)
- [ ] Build and deploy PWA
- [ ] Send Hannah merge + credentials message
- [ ] Fill `eas.json` with Apple credentials
- [ ] Create app in App Store Connect
- [ ] Ensure privacy policy URL is live
- [ ] `eas build` + `eas submit` for iOS
- [ ] Set up TestFlight external group + Public Link
- [ ] `eas build` for Android APK, host it
- [ ] Generate all QR codes
- [ ] End-to-end test on real phones
- [ ] Send Hannah final QR materials

### Hannah

- [ ] Merge PR
- [ ] Share Apple Developer credentials + invite Mason as Admin
- [ ] Confirm privacy/support URLs are live
- [ ] Print QR codes for the event
