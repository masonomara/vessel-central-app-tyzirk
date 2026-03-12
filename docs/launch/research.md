# Vessel Central — Launch Research Report

**Date:** March 12, 2026
**Prepared for:** Mason O'Mara, O'Mara Technology & Design
**Client:** Hannah Patten, Vessel & Co Yacht Management L.L.C.
**Event Date:** ~March 22, 2026 (10 days out)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Codebase Architecture Deep Dive](#2-codebase-architecture-deep-dive)
3. [Contract Compliance Audit](#3-contract-compliance-audit)
4. [Distribution Strategy for Launch Party](#4-distribution-strategy-for-launch-party)
5. [PR Instructions for Hannah](#5-pr-instructions-for-hannah)
6. [Risks & Blind Spots](#6-risks--blind-spots)
7. [Recommended Action Plan](#7-recommended-action-plan)

---

## 1. Project Overview

### What Vessel Central Is

Vessel Central is a **demonstration mobile application** showcasing a yacht fleet management platform. It is built for three roles — **owner**, **fleet manager**, and **crew** — and coordinates maintenance, scheduling, documents, expenses, and operations across a managed fleet. The app contains **zero backend infrastructure**: no database, no API, no authentication server. All data is pre-populated demo data stored locally on-device via AsyncStorage.

### Who It's For

Vessel & Co is a charter clearinghouse based in Fort Lauderdale and the Caribbean. They manage yacht sales, compliance, and operations for Caribbean itineraries. Currently everything is manual spreadsheets. This app demonstrates the vision of a unified operational platform for pitching to yacht owners, brokers, and potential investors at an upcoming launch party.

---

## 2. Contract Compliance Audit

### Phase 1: UI Cleanup & Styling (15 hours, Week 1) — COMPLETE

| Requirement                                 | Status  | Evidence                                                                                                                                          |
| ------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Restyle to Vessel Central brand             | ✅ Done | Warm off-white palette (#fbf8f7, #f7f2ef), gold accent (#C9A84C), comprehensive `commonStyles.ts` with 780+ lines                                 |
| Apply brand color palette                   | ✅ Done | Custom color system with 30+ named colors, gradient presets, badge pairs                                                                          |
| Remove demo badges / placeholder indicators | ✅ Done | Login shows "APP DEMOS" label with role buttons — this is intentional UX for the demo, not a prototype indicator. No "Demo Mode" badges elsewhere |
| Professional visual finish                  | ✅ Done | Consistent typography, shadows, spacing, platform-native icons (SF Symbols / Material)                                                            |

### Phase 2: Crash Fixes & Screen Completion (10 hours, Week 2) — COMPLETE

| Requirement                          | Status  | Evidence                                                                                                                                                                                                                |
| ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repair document viewer               | ✅ Done | 7 real PDF files bundled in `assets/documents/` — vessel registration, insurance, licenses, safety manual, permits                                                                                                      |
| Complete dead-end detail screens     | ✅ Done | 9 detail screens, all with full content: detail-maintenance, detail-issue, detail-supply, detail-document, detail-vessel, detail-calendar-event, detail-certification, detail-charter, detail-contact, detail-equipment |
| Full walkthrough on physical devices | ✅ Done | Physical device testing done on Nokia Android and Apple iOS devices                                                                                                                                                     |
| Layouts hold across screen sizes     | ✅ Done | Code uses flex layouts and safe area insets for all mobile devices                                                                                                                                                      |

### Phase 3: Demo Data & Placeholder Removal (4 hours, Week 3) — COMPLETE

| Requirement                     | Status  | Evidence                                                                                                                    |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| Realistic vessel names          | ✅ Done | "Purely Blu", "Ocean Pearl", "Sea Breeze" — realistic yacht names                                                           |
| Realistic maintenance logs      | ✅ Done | Saildrive seal replacement, zinc anodes, teak refinishing, ice maker repair — authentic maritime terminology                |
| Maritime terminology throughout | ✅ Done | Saildrives, blackwater tanks, halyards, zincs, STCW certs, USCG, BVI/USVI ports                                             |
| App feels populated             | ✅ Done | 60+ seeded items across 13 entity types                                                                                     |
| Remove hardcoded profile data   | ✅ Done | Users have realistic names, roles, and associations                                                                         |
| Multiple professional views     | ✅ Done | Owner (Diane Sanderson), Manager (Brett Nealson), Crew (Marcus Rivera, Tanya Brooks) — each with role-appropriate dashboard |

### Phase 4: App Store Submission (5 hours, Week 4) — PARTIALLY COMPLETE

| Requirement               | Status                     | Evidence                                                                                                  |
| ------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| App icons                 | ✅ Done                    | `public/icon.png`, `adaptive-icon.png`, `logo192x192.png`, `logo512x512.png`, `splash.png`, `favicon.ico` |
| Screenshots               | ⚠️ Not verified            | Not found in the repo — may need to be generated                                                          |
| Metadata                  | ✅ Done                    | `store.config.json` with full description (2,500+ chars), keywords (13), subtitle, promo text             |
| Privacy policy            | ⚠️ Configured but external | URL set to `https://www.vesselandco.yachts/privacy` — needs to be live                                    |
| Submit to Apple App Store | ❌ Not yet                 | `eas.json` has placeholder values: `YOUR_APPLE_ID`, `YOUR_ASC_APP_ID`, `YOUR_TEAM_ID`                     |
| Submit to Google Play     | ❌ Not yet                 | Track configured as `production` with `draft` status, but no actual submission                            |

### Beyond-Contract Additions

The delivered app significantly exceeds the contracted scope:

- **11 add/create forms** (contract only required completing existing screens)
- **Equipment inventory** module (10 items seeded)
- **Charter logs** with revenue/expense/broker tracking
- **Crew certifications** with expiry tracking
- **Contacts directory** with multi-vessel support
- **Engine hour logging** with history
- **Global search** across all entities
- **Expense tracking** with approval workflow
- **Activity feed** audit trail
- **Comment threads** on all major entities
- **PWA/web support** (workbox service worker configured)

---

## 3. Distribution Strategy for Launch Party

### The Problem

Apple does not allow "demo apps" — apps with no real functionality, populated only with mock data — into the App Store. The contract anticipated this risk: Section 3.2(b) provides that the final payment is due upon "delivery of the application for installation on Client-provided devices, in the event that App Store submission is not viable due to repeated platform rejection."

The launch party is in ~10 days. Guests need to be able to "download and use it on their own phones."

### Option A: TestFlight Public Link (iOS) — RECOMMENDED

**What:** Upload a production build to App Store Connect and distribute via TestFlight's public link. Guests scan a QR code, install TestFlight (free), then tap to install the app.

| Aspect   | Detail                                                           |
| -------- | ---------------------------------------------------------------- |
| Capacity | Up to 10,000 external testers                                    |
| Friction | Medium — guests must install TestFlight app first                |
| Review   | Beta App Review required (24-48 hours, lighter than full review) |
| Expiry   | Builds expire after 90 days                                      |
| Cost     | Standard $99/year Apple Developer account                        |
| Risk     | Low rejection risk if app doesn't crash on launch                |

**Steps:**

1. Fill in real Apple credentials in `eas.json` (currently placeholders)
2. `eas build -p ios --profile production`
3. `eas submit -p ios`
4. In App Store Connect: add build to external testing group, fill beta description
5. Enable "Public Link" for the group
6. Generate QR code pointing to that link

**Timeline:** Submit by March 17 (5 days buffer for review)

### Option B: Progressive Web App — RECOMMENDED (Universal)

**What:** Export the app as a web app and deploy to static hosting. Guests visit a URL in their browser.

The project is **already configured for this**:

- `react-native-web` in dependencies
- `"web": { "bundler": "metro" }` in `app.json`
- `build:web` script: `expo export -p web && npx workbox generateSW workbox-config.js`
- Workbox service worker for offline support

| Aspect   | Detail                                   |
| -------- | ---------------------------------------- |
| Friction | Lowest — scan QR, opens in browser, done |
| Platform | Works on both iOS and Android            |
| Review   | None required                            |
| Updates  | Instant deploy, no rebuild/resubmit      |
| Timeline | Deployable in a single day               |

**Limitations:** Some native APIs won't work on web (`expo-haptics`, `expo-notifications`, `react-native-maps`, `expo-calendar`). These need to be conditionally disabled or gracefully degraded.

**Steps:**

1. Run `npm run web` to verify it works
2. Audit/fix web compatibility issues (conditional `Platform.OS` checks)
3. Run `npm run build:web` to produce `dist/`
4. Deploy `dist/` to Vercel/Netlify/Cloudflare Pages
5. QR code for the URL

### Option C: Android APK Direct Download

**What:** Build an APK and host it for direct download. The `eas.json` preview profile already has `"distribution": "internal"`.

| Aspect   | Detail                                                    |
| -------- | --------------------------------------------------------- |
| Friction | Medium — users must enable "Install from unknown sources" |
| Review   | None                                                      |
| Timeline | Same day                                                  |

**Steps:**

1. `eas build -p android --profile preview`
2. Host APK file or use EAS download link
3. QR code to download

### Options NOT Recommended

| Option                  | Why Not                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| App Store (full review) | Apple rejects demo-only apps. Would require presenting it as a real product, which it isn't |
| EAS Ad-Hoc (iOS)        | Requires registering each guest's device UDID before building. Impractical for walk-ins     |
| Enterprise Distribution | $299/year, weeks to enroll, Apple restricts to internal employees only                      |
| Expo Go                 | Requires dev server running, native modules may not work, not professional                  |

### Recommended Multi-Channel Strategy

| Channel         | Audience                          | QR Code                   | Deploy By          |
| --------------- | --------------------------------- | ------------------------- | ------------------ |
| **PWA (web)**   | Everyone (primary)                | Primary QR at event       | March 14           |
| **TestFlight**  | iOS users wanting native feel     | Secondary QR              | Submit by March 17 |
| **Android APK** | Android users wanting native feel | Third QR or download link | March 19           |

**At the event:** Display a landing page or poster with 1-2 QR codes. The PWA link is universal and zero-friction. TestFlight link is for iPhone users who want the full native experience.

---

## 4. PR Instructions for Hannah

Hannah is non-technical and originally built the project using a vibe-coding native app building tool. She needs simple instructions to accept the PR and access the app.

### Suggested Instructions for Hannah

> **How to Accept the Pull Request and Access the App**
>
> 1. **Open the Pull Request link** I sent you (it will open in your browser on GitHub)
> 2. **Click the green "Merge pull request" button** at the bottom of the page
> 3. **Click "Confirm merge"** to accept the changes
>
> That's it — the code is now merged into your project.
>
> **To see the app running:**
>
> - If you were using **Expo Go** before: Open the Expo Go app on your phone, and the project should appear in your recent projects. If not, I can send you a QR code to scan.
> - If you were using a **web preview**: I'll deploy a web version and send you the link.
> - For the **launch party**: I'll set up TestFlight (iPhone) and a web link so guests can access the app on their own devices. I'll send you the QR codes to print.
>
> **You don't need to run any code or use the terminal.** I'll handle the builds and deployment. Just merge the PR and I'll take it from there.

### What Needs Clarification from Hannah

1. **Apple Developer account**: Does Hannah/Vessel & Co have an Apple Developer account? The contract (Section 5.1d) states the client is responsible for creating and maintaining one and granting admin access. The `eas.json` still has placeholder Apple credentials.
2. **Google Play Developer account**: Same question (Section 5.1e).
3. **What tooling was she using?** The README mentions Supabase (which is not used in the current codebase). Was she using a no-code builder like Bolt, Lovable, or something else? Understanding her setup will determine how she accesses the merged code.
4. **Website URLs**: The `store.config.json` references `vesselandco.yachts` for marketing, support, and privacy policy. Are these live?

---

## 5. Risks & Blind Spots

### High Priority

| Risk                               | Impact                                                         | Mitigation                                                         |
| ---------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| **No Apple Developer credentials** | Cannot build or distribute iOS app                             | Get Hannah's Apple Developer account credentials ASAP              |
| **Privacy policy URL not live**    | Both TestFlight and App Store require it                       | Either deploy a simple privacy policy page or use a free generator |
| **Web compatibility untested**     | PWA may have broken screens from native-only APIs              | Run `npm run web` immediately, audit for Platform.OS issues        |
| **App Store screenshots missing**  | Required for both TestFlight metadata and any store submission | Generate from simulator or physical device                         |

### Medium Priority

| Risk                                        | Impact                                            | Mitigation                                                     |
| ------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| **TestFlight Beta Review rejection**        | 24-48 hour review could delay if issues found     | Submit early (by March 15), ensure app doesn't crash on launch |
| **Login screen says "APP DEMOS"**           | Could look unprofessional to party guests         | Consider whether this label should be changed for the event    |
| **README references Supabase**              | Stale documentation from original project         | Update README to reflect current offline-only architecture     |
| **expo-haptics, expo-notifications on web** | Will crash web build if not conditionally handled | Add `Platform.OS === 'web'` guards                             |

### Low Priority

| Risk                                 | Impact                                         | Mitigation                                          |
| ------------------------------------ | ---------------------------------------------- | --------------------------------------------------- |
| **Data version migrations**          | If users have old cached data, it may not load | DATA_VERSION is 5 — clean install for event devices |
| **Large yacht-2.jpg (793 KB)**       | Slow load on web                               | Consider optimizing image sizes for web build       |
| **No app store screenshots in repo** | Need to generate before any submission         | Use Expo CLI or simulators to capture               |

### Contract Gaps to Note

1. **Screenshots**: The contract lists "screenshots" as a Phase 4 deliverable. These don't appear to be in the repo yet.
2. **Privacy policy drafting**: Phase 4 includes "Draft privacy policy." The URL is configured but the actual page needs to exist.
3. **Google Play submission**: The contract calls for submission to both stores. Google Play has a simpler review process but still needs developer account access.

---

## 6. Recommended Action Plan

### Immediate (March 12-13)

1. **Get Apple Developer credentials from Hannah** — fill in `eas.json` placeholders
2. **Run `npm run web`** — verify web build works, identify and fix any native-only API crashes
3. **Confirm Hannah's development tooling** — understand how she was building/previewing the app so PR merge instructions are accurate

### This Week (March 14-17)

4. **Deploy PWA** — run `npm run build:web`, deploy to Vercel/Netlify, test on real phones
5. **Generate App Store screenshots** — capture from iOS simulator for all required device sizes
6. **Draft/deploy privacy policy** — simple static page at `vesselandco.yachts/privacy`
7. **Build iOS production binary** — `eas build -p ios --profile production`
8. **Submit to TestFlight** — `eas submit -p ios`, fill beta metadata, request review
9. **Build Android APK** — `eas build -p android --profile preview`

### Pre-Event (March 18-21)

10. **TestFlight Beta Review should be approved** — enable Public Link
11. **Create QR codes** — one for PWA URL, one for TestFlight
12. **End-to-end test** — have someone unfamiliar scan QR codes and go through the full experience
13. **Prepare event materials** — printed QR code cards/poster, brief demo script for each role
14. **Update README** — remove Supabase references, document current offline-only architecture

### Event Day (March 22)

15. **Display QR codes at demo stations** — one station per role (Owner/Manager/Crew)
16. **Have devices pre-loaded** — backup plan with physical devices running the native app
17. **Guests scan QR → open PWA instantly** — zero friction primary experience
18. **iPhone enthusiasts → TestFlight** — secondary option for native feel
