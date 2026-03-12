# Vessel Central — Launch Plan

**Date:** March 12, 2026
**Launch Party:** ~March 22, 2026
**PR to Hannah:** https://github.com/hannahbanana-web/vessel-central-app-tyzirk/pull/1

---

## Strategy

Three distribution channels, deployed in parallel. Guests at the party scan a QR code and experience the app instantly.

| Channel         | Audience                          | QR Code                   | Deploy By |
| --------------- | --------------------------------- | ------------------------- | --------- |
| **PWA (web)**   | Everyone (primary)                | Primary QR at event       | March 14  |
| **TestFlight**  | iOS users wanting native feel     | Secondary QR              | March 17  |
| **Android APK** | Android users wanting native feel | Third QR or download link | March 19  |

---

## Part 1: Codebase Prep (Mason — March 12-13)

Everything below must be done before any builds or deploys.

### 1.1 Add Web Platform Guards for Haptics

Two files import `expo-haptics` which will crash on web. Wrap the calls:

**`components/PressableCard.tsx:39`**

```tsx
// Before
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// After
if (Platform.OS !== "web") {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
```

**`app/(tabs)/owner/index.tsx:160`**

```tsx
// Same pattern — wrap the Haptics call with Platform.OS !== "web"
```

Both files already import `Platform` from `react-native`. No other native-only APIs are imported directly in screen code.

### 1.2 Fill In Apple Developer Credentials

Update `eas.json` with real values from Hannah's Apple Developer account:

```json
"ios": {
  "appleId": "hannah@vesselandco.yachts",
  "ascAppId": "6XXXXXXXXX",
  "appleTeamId": "XXXXXXXXXX"
}
```

**Where to find these:**

- `appleId`: The email used to sign in to App Store Connect
- `ascAppId`: App Store Connect → Apps → Vessel & Co. → General → Apple ID (numeric). If the app doesn't exist yet, create it first in App Store Connect with bundle ID `com.vesselcentral.app`
- `appleTeamId`: developer.apple.com → Membership → Team ID

### 1.3 Create the App in App Store Connect (if not already)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: `Vessel & Co.`
   - Primary Language: English (U.S.)
   - Bundle ID: `com.vesselcentral.app`
   - SKU: `vessel-and-co-1`
4. Save — note the Apple ID number, put it in `eas.json` as `ascAppId`

### 1.4 Privacy Policy

TestFlight Beta Review requires a privacy policy URL. The app is configured to point to `https://www.vesselandco.yachts/privacy`.

**If that URL is not live**, create a simple one-page privacy policy and host it. The content can be minimal since the app stores zero user data:

> Vessel & Co. does not collect, store, or transmit any personal data. All information displayed in the app is pre-populated demonstration data stored locally on your device. No analytics, tracking, or third-party services are used.

Options for hosting:

- Add a page to the `vesselandco.yachts` site
- Use a free generator (e.g., termly.io) and host on a simple URL
- Deploy alongside the PWA at `your-pwa-url.vercel.app/privacy`

### 1.5 Verify Web Build Runs

```bash
npm run web
```

Walk through every screen as each role (owner, manager, crew). Fix any crashes. The main risk areas:

- `DropdownRow.tsx:87` uses `ActionSheetIOS` — already behind a `Platform.OS === "ios"` guard, should be fine
- `DateTimePicker` from `@react-native-community/datetimepicker` — verify it renders on web or degrade gracefully
- `expo-splash-screen` — should no-op on web

### 1.6 Generate App Store Screenshots

Capture screenshots from a physical device or iOS Simulator for TestFlight metadata:

- Owner dashboard
- Maintenance list
- Issue detail
- Calendar view
- Login screen

Minimum: 3-5 screenshots. TestFlight is lenient here — they're for the beta description, not a full App Store listing.

---

## Part 2: Progressive Web App Deploy (Mason — March 13-14)

### 2.1 Build

```bash
npm run build:web
```

This runs `expo export -p web && npx workbox generateSW workbox-config.js`, producing:

- `dist/` folder with the web app
- `dist/sw.js` service worker (offline support via Workbox NetworkFirst strategy)

### 2.2 Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
cd dist
vercel --prod
```

Or use the Vercel dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Import the `dist/` folder or connect the GitHub repo
3. Set output directory to `dist`
4. Deploy

Alternative: Netlify (`netlify deploy --prod --dir=dist`) or Cloudflare Pages.

### 2.3 Custom Domain (Optional)

If `vesselandco.yachts` is available, point a subdomain like `app.vesselandco.yachts` to the Vercel deployment. This makes the QR code destination look professional.

### 2.4 Test on Real Phones

Open the deployed URL on:

- iPhone (Safari)
- Android (Chrome)
- Verify all three role logins work
- Walk through the full app as each role
- Test "Add to Home Screen" on both platforms

### 2.5 Generate QR Code

Use any QR generator (e.g., `qr-code-generator.com`) pointing to the deployed URL.

**Label:** "Scan to try Vessel & Co."

---

## Part 3: TestFlight Public Link (Mason — March 14-17)

### 3.1 Build the iOS Binary

```bash
eas build -p ios --profile production
```

This creates a signed `.ipa` file. The build runs on EAS servers and takes ~15-20 minutes. You'll need to authenticate with your Apple Developer account during the process.

**First time setup:** If EAS hasn't been configured with Apple credentials, it will prompt you to sign in. Use the Apple Developer account credentials.

### 3.2 Submit to App Store Connect

```bash
eas submit -p ios
```

This uploads the `.ipa` to App Store Connect. Select the latest build when prompted.

### 3.3 Set Up TestFlight External Testing

1. Open [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** → **Vessel & Co.** → **TestFlight**
3. The uploaded build should appear under **iOS Builds**
4. Click **External Testing** → **+** → Create a new group (e.g., "Launch Party")
5. Add the build to this group
6. Fill in the required metadata:
   - **What to Test:** "Vessel & Co. is a yacht fleet management demo. Try logging in as Owner, Manager, or Crew to explore the app."
   - **App Description:** Use the description from `store.config.json`
   - **Contact Info:** Your email
   - **Privacy Policy URL:** `https://www.vesselandco.yachts/privacy`
7. Click **Submit for Review**

### 3.4 Wait for Beta App Review

- Typically 24-48 hours, sometimes faster
- **Submit by March 15** to have buffer time
- Beta review is lighter than full App Store review — they check for crashes and basic policy compliance, not the "demo app" minimum functionality rule
- If rejected, you'll get feedback and can resubmit quickly

### 3.5 Enable Public Link

Once approved:

1. Go to **TestFlight** → **External Testing** → your group
2. Toggle **Enable Public Link**
3. Copy the link (it looks like `https://testflight.apple.com/join/XXXXXXXX`)

### 3.6 Generate QR Code

Create a QR code pointing to the TestFlight public link.

**Label:** "Get the native iOS experience — install via TestFlight"

**Note for guests:** They'll need to install the free TestFlight app from the App Store first, then tap the link to install Vessel & Co. It takes about 30 seconds total.

---

## Part 4: Android APK (Mason — March 17-19)

### 4.1 Build the APK

```bash
eas build -p android --profile preview
```

The `preview` profile in `eas.json` already has `"distribution": "internal"`, which produces an APK (not an AAB). Build takes ~15-20 minutes on EAS.

### 4.2 Download & Host the APK

Once the build completes:

```bash
# EAS provides a download URL in the terminal output
# Download the APK
eas build:list --platform android --limit 1
```

Host the APK file:

- Upload to the same Vercel deployment as the PWA (add to `public/` or a separate route)
- Or use the EAS direct download URL
- Or host on Google Drive / Dropbox with a public link

### 4.3 Generate QR Code

QR code pointing to the APK download URL.

**Label:** "Android users — download the native app"

**Note for guests:** They'll need to allow "Install from unknown sources" in their Android settings when prompted. This is standard for apps not from Google Play.

---

## Part 5: PR Instructions for Hannah

The PR is already open: https://github.com/hannahbanana-web/vessel-central-app-tyzirk/pull/1

### Message to Send Hannah

---

> **Subject: Vessel Central app is ready — here's how to merge it**
>
> Hey Hannah,
>
> The Vessel Central app is ready for launch. I've submitted a pull request to your GitHub repository with all the changes. Here's what you need to do:
>
> **Step 1: Merge the code (2 minutes)**
>
> 1. Open this link: https://github.com/hannahbanana-web/vessel-central-app-tyzirk/pull/1
> 2. Scroll down and click the green **"Merge pull request"** button
> 3. Click **"Confirm merge"**
>
> That's it for the code. You don't need to run anything or use the terminal.
>
> **Step 2: Apple Developer Account access (needed for TestFlight)**
>
> For the launch party, I need to build the app and distribute it via TestFlight so iPhone users can download it. I need the following from your Apple Developer account:
>
> 1. Go to https://developer.apple.com and sign in
> 2. Click **Account** → **Membership**
> 3. Send me:
>    - The **email address** you use to sign in
>    - Your **Team ID** (shown on the Membership page)
> 4. Then go to https://appstoreconnect.apple.com
>    - If you haven't already, I'll need you to **invite me as an Admin** under Users and Access so I can manage the TestFlight build
>    - Or: share your App Store Connect login so I can set up the app listing and TestFlight
>
> **Step 3: Google Play Developer Account access (if available)**
>
> If you have a Google Play Developer account ($25 one-time fee), send me the login details or invite me as a developer so I can upload the Android version. If you don't have one, that's fine — we'll distribute the Android app as a direct download.
>
> **Step 4: Website URLs**
>
> The app references these URLs for the store listing. Are they live?
>
> - https://www.vesselandco.yachts
> - https://www.vesselandco.yachts/privacy
> - https://www.vesselandco.yachts/support
>
> If not, I can help set up a simple privacy policy page — TestFlight requires one.
>
> **For the launch party:**
>
> I'm setting up three ways for guests to access the app:
>
> 1. **Web app (primary)** — guests scan a QR code and it opens instantly in their phone's browser. Works on iPhone and Android. Zero friction.
> 2. **TestFlight (iPhone)** — for guests who want the full native app experience. They'll need to install the free TestFlight app first.
> 3. **Android download** — direct download link for Android users.
>
> I'll send you the QR codes to print once everything is deployed.
>
> **You don't need to do anything technical beyond merging the PR and sharing the account credentials.** I'll handle all the builds, deployments, and QR codes.
>
> Let me know if you have questions!
>
> — Mason

---

## Part 6: Event Day Setup

### QR Code Display Options

**Option A: Landing page with all links**

Create a simple one-page site (can be a route on the PWA deployment) at e.g. `app.vesselandco.yachts/download` with:

- Vessel & Co. logo
- "Scan with your phone's camera" heading
- Three buttons/links:
  - "Open in Browser" → PWA URL
  - "Get on iPhone (TestFlight)" → TestFlight public link
  - "Get on Android" → APK download
- Single QR code pointing to this landing page

**Option B: Multiple QR codes on a printed card/poster**

```
┌─────────────────────────────────────────────┐
│                                             │
│            VESSEL & CO.                     │
│       Yacht Fleet Management                │
│                                             │
│   ┌─────────┐         ┌─────────┐          │
│   │  QR #1  │         │  QR #2  │          │
│   │         │         │         │          │
│   └─────────┘         └─────────┘          │
│   Try it now           iPhone App           │
│   (any phone)          (via TestFlight)     │
│                                             │
│   Log in as Owner, Manager, or Crew         │
│   to explore the app                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Demo Stations (Optional)

Set up 1-3 physical devices at the party, each logged in as a different role:

- **Device 1:** Owner view (Diane Sanderson)
- **Device 2:** Manager view (Brett Nealson)
- **Device 3:** Crew view (Marcus Rivera)

This gives guests immediate access without needing to install anything.

### Quick Demo Script

For anyone walking guests through the app:

> "This is Vessel & Co. — it's an app for managing yacht fleets. Let me show you how it works."
>
> **As Owner:** "Here's the owner dashboard. You can see the fleet at a glance — three vessels in the Caribbean. There are pending supply requests waiting for approval. Let me approve one..." [tap a supply request → Approve]
>
> **As Manager:** "Switch to the manager view. Here are the maintenance tasks. The saildrive seal replacement is urgent and waiting on parts. Let me update the status..." [change status → In Progress]
>
> **As Crew:** "And here's what crew sees — just their assigned tasks and issues. They can report a new issue..." [tap + → show the add issue form]

---

## Timeline Summary

| Date     | Who    | Task                                                             |
| -------- | ------ | ---------------------------------------------------------------- |
| March 12 | Mason  | Add web platform guards for Haptics (2 files)                    |
| March 12 | Mason  | Run `npm run web`, verify and fix web build                      |
| March 12 | Mason  | Send Hannah the PR merge + account credentials message           |
| March 13 | Mason  | Run `npm run build:web`, deploy to Vercel/Netlify                |
| March 13 | Mason  | Test PWA on real phones (iPhone Safari, Android Chrome)          |
| March 13 | Hannah | Merge the PR on GitHub                                           |
| March 13 | Hannah | Share Apple Developer credentials (Team ID, email)               |
| March 13 | Hannah | Share Google Play Developer access (if available)                |
| March 13 | Hannah | Confirm privacy policy URL is live (or Mason deploys one)        |
| March 14 | Mason  | Generate PWA QR code — **primary channel is now live**           |
| March 14 | Mason  | Fill in `eas.json` with real Apple credentials                   |
| March 14 | Mason  | Create app in App Store Connect (if not already)                 |
| March 15 | Mason  | `eas build -p ios --profile production`                          |
| March 15 | Mason  | `eas submit -p ios` → submit to TestFlight                       |
| March 15 | Mason  | Set up external testing group, submit for Beta App Review        |
| March 15 | Mason  | Generate App Store screenshots from simulator                    |
| March 17 | Mason  | Beta Review should be approved — enable Public Link              |
| March 17 | Mason  | Generate TestFlight QR code — **iOS native channel is now live** |
| March 18 | Mason  | `eas build -p android --profile preview`                         |
| March 18 | Mason  | Host APK, generate QR code — **Android channel is now live**     |
| March 19 | Mason  | Create landing page or printed QR cards for the event            |
| March 20 | Mason  | End-to-end test: have someone unfamiliar scan QR codes           |
| March 20 | Mason  | Send Hannah final QR codes / print materials                     |
| March 22 | Both   | Launch party — display QR codes, run demo stations               |

---

## Checklist

### Mason (O'Mara Technology & Design)

- [ ] Add `Platform.OS !== "web"` guards around Haptics calls (2 files)
- [ ] Run `npm run web` — verify all screens work
- [ ] Fix any web build issues found
- [ ] Run `npm run build:web` — produce `dist/`
- [ ] Deploy `dist/` to Vercel/Netlify/Cloudflare Pages
- [ ] Test PWA on real iPhone (Safari) and Android (Chrome)
- [ ] Generate PWA QR code
- [ ] Send Hannah the PR + credentials message
- [ ] Fill in `eas.json` with real Apple Developer credentials
- [ ] Create app in App Store Connect (bundle ID: `com.vesselcentral.app`)
- [ ] Ensure privacy policy URL is live
- [ ] `eas build -p ios --profile production`
- [ ] `eas submit -p ios`
- [ ] Set up TestFlight external testing group
- [ ] Submit for Beta App Review
- [ ] Enable Public Link once approved
- [ ] Generate TestFlight QR code
- [ ] `eas build -p android --profile preview`
- [ ] Host APK file
- [ ] Generate Android QR code
- [ ] Create landing page or print QR materials for event
- [ ] End-to-end test with a fresh person
- [ ] Send Hannah final QR codes

### Hannah (Vessel & Co)

- [ ] Merge the PR: https://github.com/hannahbanana-web/vessel-central-app-tyzirk/pull/1
- [ ] Share Apple Developer credentials (email + Team ID)
- [ ] Invite Mason as Admin in App Store Connect (or share login)
- [ ] Share Google Play Developer access (if available)
- [ ] Confirm `vesselandco.yachts` URLs are live (marketing, privacy, support)
- [ ] Review and approve QR code materials for the event
- [ ] Print QR codes / prepare display for launch party
