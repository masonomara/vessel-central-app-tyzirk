# Legal & Metadata Research -- Vessel & Co.

Date: 2026-03-10

---

## 1. CODEBASE AUDIT

### 1.1 App Identity (Current State)

| Field | Value | Source |
|---|---|---|
| Display Name | Vessel & Co. Yacht Management | app.json:3 |
| Slug | vessel-and-co | app.json:4 |
| iOS Bundle ID | com.vesselcentral.app | app.json:12 |
| Android Package | com.vesselcentral.app | app.json:23 |
| URL Scheme | vesselcentral | app.json:56 |
| Version | 1.0.0 | app.json:5, package.json:3 |
| Build Number | Auto-incremented via EAS | eas.json:6,10,13 |
| Min iOS | 12.0 | Info.plist:40 |
| Orientation | Portrait | app.json:6 |
| Tablet Support | Yes (iOS) | app.json:11 |
| Framework | Expo 54 / React Native 0.81.4 | package.json |

### 1.2 What the App Does

Role-based yacht/vessel fleet management platform. Three user roles: Owner, Manager, Crew.

**Core modules:**
- Fleet overview with vessel profiles (name, type, LOA, flag, port, engine hours)
- Maintenance task management (recurring/one-time, cost tracking, completion history)
- Issue tracking (priority, assignees, attachments, resolution)
- Supply request workflow (pending > approved > ordered > received > denied)
- Document management (PDFs, images, expiry tracking, permissions)
- Calendar & event scheduling with reminders
- Contact directory (crew, vendors, marinas, emergency)
- Crew certification tracking with expiry alerts
- Charter log management (revenue, expenses, guests, itinerary, broker)
- Equipment inventory (condition, inspection dates, location)
- Expense tracking with approval workflow
- Activity audit logs
- Push & in-app notifications
- Dashboard KPIs per role (owner sees fleet-wide financials, manager sees tasks, crew sees assignments)
- Global search across all entities

### 1.3 Permissions Requested

**iOS (Info.plist):**
- Calendar read/write (NSCalendarsFullAccessUsageDescription)
- Camera (NSCameraUsageDescription)
- Microphone (NSMicrophoneUsageDescription)
- Photo Library (NSPhotoLibraryUsageDescription)
- Reminders read/write (NSRemindersFullAccessUsageDescription)

**Android (AndroidManifest.xml + app.json):**
- INTERNET
- POST_NOTIFICATIONS
- READ_CALENDAR, WRITE_CALENDAR
- READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE
- RECEIVE_BOOT_COMPLETED
- RECORD_AUDIO
- SCHEDULE_EXACT_ALARM
- SYSTEM_ALERT_WINDOW
- VIBRATE

**Permission audit notes:**
- RECORD_AUDIO / Microphone: Used by expo-image-picker for video capture. Justified.
- SYSTEM_ALERT_WINDOW: Standard React Native dev overlay. Should be stripped in production builds (verify).
- READ/WRITE_EXTERNAL_STORAGE: Deprecated on Android 13+. expo-document-picker and expo-image-picker handle scoped storage automatically. May trigger Play Store review questions.

### 1.4 Data Collection & Storage

**Current architecture: 100% local storage. No backend.**

- Auth: Demo-only with mock tokens stored in AsyncStorage
- All data persisted to AsyncStorage under key `@vessel_co_data` (DATA_VERSION 4)
- No remote API calls. No Supabase integration active (env vars prepared but unused).
- No analytics, no crash reporting, no telemetry (EXPO_NO_TELEMETRY=1)
- No third-party auth (no OAuth, no SSO)
- No payment processing
- No ad SDKs

**Data types stored locally:**
- User identity (ID, name, role)
- Vessel information
- Maintenance records with costs
- Issue reports
- Supply requests
- Documents (file URIs)
- Calendar events
- Contacts (name, role, phone, email, company)
- Crew certifications
- Charter logs with financial data
- Equipment inventory
- Expense records
- Activity audit trail
- Notification history

### 1.5 Third-Party Dependencies (Privacy-Relevant)

| Package | Privacy Impact |
|---|---|
| @react-native-async-storage/async-storage | Local only. No network. |
| react-native-maps | Google Maps SDK on Android -- collects device/location metadata per Google TOS. Apple Maps on iOS. |
| expo-notifications | Uses APNs (iOS) and FCM (Android) -- push tokens transmitted to Apple/Google. |
| expo-image-picker | Device camera/photos access. No network. |
| expo-document-picker | File system access. No network. |
| expo-calendar | Device calendar access. No network. |
| react-native-chart-kit | Local rendering. No network. |

**Critical note:** react-native-maps with Google Maps on Android will trigger Google Play Data Safety disclosures for approximate location and device identifiers, even if the app itself doesn't request location permission.

### 1.6 Apple Privacy Manifest (PrivacyInfo.xcprivacy)

Current state at `ios/VesselCoYachtManagement/PrivacyInfo.xcprivacy`:
- NSPrivacyTracking: false
- NSPrivacyCollectedDataTypes: empty array
- Accessed API types: FileTimestamp, UserDefaults, DiskSpace, SystemBootTime (standard React Native reasons)

This will need updating if any data collection is added pre-launch. Currently accurate for a local-only app.

---

## 2. APPLE APP STORE REQUIREMENTS

### 2.1 Required Metadata Fields

| Field | Limit | Status |
|---|---|---|
| App Name | 30 chars | Need to finalize (currently "Vessel & Co. Yacht Management" = 33 chars -- TOO LONG) |
| Subtitle | 30 chars | Not written |
| Description | 4000 chars | Not written |
| Keywords | 100 chars (comma-separated) | Not written |
| Promotional Text | 170 chars | Not written |
| What's New | 4000 chars | Not written |
| Privacy Policy URL | Required | Not created |
| Support URL | Required | Not created |
| Marketing URL | Optional | Not created |
| Category (Primary) | Required | Not set |
| Category (Secondary) | Optional | Not set |
| Age Rating | Required | Not set |
| Copyright | Required | Not set |

### 2.2 Category Options (Relevant)

- **Business** (best fit -- fleet management, operations, professional tool)
- Productivity (secondary option)
- Travel (weaker fit)
- Utilities (weaker fit)

Recommendation: Primary = **Business**, Secondary = **Productivity**

### 2.3 Screenshots Required

| Device | Size (pixels) | Required |
|---|---|---|
| iPhone 6.9" (16 Pro Max) | 1320 x 2868 | Yes |
| iPhone 6.7" (15 Plus/Pro Max) | 1290 x 2796 | Yes |
| iPhone 6.5" (11 Pro Max) | 1242 x 2688 or 1284 x 2778 | Yes |
| iPhone 5.5" (8 Plus) | 1242 x 2208 | Yes |
| iPad Pro 13" | 2048 x 2732 | Yes (if tablet supported) |
| iPad Pro 11" | 1668 x 2388 | Yes (if tablet supported) |

Min 1, max 10 screenshots per device size. App preview videos optional (15-30 sec).

### 2.4 Age Rating Questionnaire

This app contains:
- No violence, gambling, horror, alcohol/drugs/tobacco references
- No unrestricted web access (WebView is used but for controlled content)
- No user-generated content sharing between users (local only)
- No contests or simulated gambling

Expected rating: **4+**

### 2.5 App Review Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Demo-only auth with no real backend | HIGH | Apple may reject as "demo/trial" or "not fully functional." Need clear explanation that it's a standalone management tool with local data, or integrate Supabase before submission. |
| Quick Demo buttons on login | MEDIUM | Remove or hide. Apple flags test/demo UI. |
| Permissions without clear use | MEDIUM | Ensure all permission prompts have clear, specific usage descriptions. Current ones are good. |
| No account deletion mechanism | HIGH | Apple requires account deletion if you offer account creation. Since auth is demo/local, this may be moot -- but verify. |
| Privacy policy required | HIGH | Must exist at a publicly accessible URL before submission. |

### 2.6 EAS Metadata (store.config.json)

Expo supports a `store.config.json` for automated metadata submission:

```json
{
  "configVersion": 0,
  "apple": {
    "info": {
      "en-US": {
        "title": "",
        "subtitle": "",
        "description": "",
        "keywords": [],
        "releaseNotes": "",
        "promoText": "",
        "marketingUrl": "",
        "supportUrl": "",
        "privacyPolicyUrl": "",
        "privacyChoicesUrl": ""
      }
    }
  }
}
```

---

## 3. GOOGLE PLAY STORE REQUIREMENTS

### 3.1 Required Metadata Fields

| Field | Limit | Status |
|---|---|---|
| App Name | 30 chars | Same issue as iOS (33 chars) |
| Short Description | 80 chars | Not written |
| Full Description | 4000 chars | Not written |
| App Category | Required | Not set |
| Content Rating | IARC questionnaire | Not completed |
| Privacy Policy URL | Required | Not created |
| Feature Graphic | 1024 x 500 px | Not created |
| App Icon | 512 x 512 px (hi-res) | Need to verify |
| Screenshots | Min 2, max 8 per device type | Not created |
| Target Audience | Required | Not set |
| Data Safety Section | Required | Not completed |
| Contact Email | Required | Not set |

### 3.2 Category Options

- **Business** (best fit)
- Productivity (secondary)
- Tools (weaker fit)

Google Play only allows one category. Recommendation: **Business**

### 3.3 Screenshots Required

| Device | Size | Count |
|---|---|---|
| Phone | 16:9 or 9:16, min 320px, max 3840px | 2-8 |
| 7" Tablet | Same ratios | 0-8 (recommended if tablet supported) |
| 10" Tablet | Same ratios | 0-8 (recommended if tablet supported) |

### 3.4 Data Safety Section

Must declare all data collected, shared, and security practices. Based on current codebase:

**Data collected:**

| Data Type | Collected | Shared | Purpose |
|---|---|---|---|
| Personal info (name, email, phone) | Yes (local) | No | App functionality |
| Photos/videos | Yes (local) | No | Attachments |
| Files & docs | Yes (local) | No | Document management |
| App activity | Yes (local) | No | Audit logs |
| Device info | Possibly (via Google Maps SDK) | Possibly (Google) | Maps rendering |

**Security practices:**
- Data encrypted in transit: N/A (no network in current build)
- Data encrypted at rest: No (AsyncStorage is not encrypted)
- Users can request data deletion: Yes (clear app data)
- Follows Google Play Families Policy: N/A (not targeted at children)

**Critical note:** If Google Maps SDK is included, Google's data collection must be disclosed even if the app doesn't explicitly collect location data. The Maps SDK collects approximate location, device identifiers, and diagnostics.

### 3.5 Content Rating (IARC)

Expected rating: **PEGI 3 / Everyone** -- no objectionable content.

### 3.6 Play Store Review Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Demo-only auth | HIGH | Same concern as Apple. Google may flag as "broken" functionality. |
| Data Safety inaccuracies | HIGH | Must precisely match actual data collection. Underdeclaring = policy violation. |
| Permissions not used in APK | MEDIUM | SYSTEM_ALERT_WINDOW, RECORD_AUDIO -- verify these are stripped in production. |
| No real backend | MEDIUM | Google is slightly more lenient than Apple on standalone apps, but the login screen implies server-based auth. |

---

## 4. BUNDLE ID ANALYSIS

### 4.1 Current: `com.vesselcentral.app`

**Assessment:**
- Format is valid reverse-domain notation
- "vesselcentral" is a reasonable namespace
- ".app" suffix is generic but acceptable
- No trademark conflicts apparent

**Alternatives to consider:**
- `com.vesselandco.app` -- matches brand name more closely
- `com.vesselandco.yachtmanagement` -- more descriptive but verbose
- `co.vessel.app` -- shorter, uses .co TLD (if you own vessel.co domain)

**Important:** Once published, bundle ID cannot change on either store. Choose carefully. If `vesselcentral.com` or `vesselandco.com` is the intended domain, align the bundle ID with it.

### 4.2 Consistency Check

The bundle ID is consistent across:
- app.json iOS bundleIdentifier (line 12)
- app.json Android package (line 23)
- No conflicts detected in native configs

---

## 5. VERSION STRATEGY

### 5.1 Current: 1.0.0

**Recommendation:** Keep 1.0.0 for initial App Store release.

Rationale:
- This is the first public release
- Semantic versioning: 1.0.0 = first stable release
- No reason to bump pre-release
- EAS autoIncrements build numbers automatically

**Version management going forward:**
- `version` in app.json = user-facing version (1.0.0, 1.0.1, 1.1.0, etc.)
- `buildNumber` (iOS) and `versionCode` (Android) = auto-incremented by EAS per build
- Each store submission requires a unique build number, even for the same version

### 5.2 Required Changes

Add explicit build numbers to app.json if not relying entirely on EAS auto-increment:

```json
"ios": {
  "buildNumber": "1"
},
"android": {
  "versionCode": 1
}
```

Currently these are absent from app.json and handled by EAS. This is fine but should be documented.

---

## 6. PRIVACY POLICY REQUIREMENTS

### 6.1 What Must Be Covered

Both Apple and Google require a privacy policy URL. The policy must address:

1. **What data is collected** -- user-provided info (names, contacts, vessel data), device-accessed data (photos, documents, calendar)
2. **How data is stored** -- locally on device via AsyncStorage, not transmitted to servers
3. **Third-party services** -- Google Maps SDK (Android), Apple Push Notification service, Firebase Cloud Messaging
4. **Data sharing** -- none currently
5. **Data retention** -- persists until app is uninstalled or data is manually cleared
6. **Data security** -- local storage, no encryption at rest (AsyncStorage limitation)
7. **Children's privacy** -- not directed at children under 13
8. **User rights** -- data deletion (uninstall or clear data), no account to delete
9. **Contact information** -- developer contact for privacy inquiries
10. **Changes to policy** -- how users will be notified

### 6.2 Hosting

The privacy policy must be at a publicly accessible URL. Options:
- GitHub Pages (free, tied to repo)
- Dedicated website (vesselcentral.com or vesselandco.com)
- Notion public page (not recommended for production)

### 6.3 GDPR / International

If targeting EU users (likely, given maritime industry is global):
- Must include GDPR-compliant language
- Right to access, rectify, delete personal data
- Legal basis for processing (legitimate interest / consent)
- Data controller identification
- DPO contact if applicable

### 6.4 Apple-Specific: App Privacy Details

App Store Connect requires answering Apple's privacy questionnaire:
- Data types collected (select from Apple's taxonomy)
- Whether data is linked to user identity
- Whether data is used for tracking
- Third-party SDKs' data collection

Based on current app: "Data Not Collected" is defensible for first-party code, but Google Maps SDK on Android means the iOS and Android declarations may differ.

---

## 7. OPEN QUESTIONS REQUIRING DECISIONS

### 7.1 Critical (Blocking Submission)

1. **Backend status at launch**: Will the app ship with demo-only local data, or will Supabase be integrated? This fundamentally affects the privacy policy, data safety declarations, and review risk.

2. **Domain / website**: What URL will host the privacy policy and support page? Is there a domain registered (vesselcentral.com, vesselandco.com, etc.)?

3. **Developer account**: Is there an active Apple Developer account ($99/yr) and Google Play Developer account ($25 one-time)?

4. **Business entity**: Is this published under a personal name or a company? Affects copyright line, publisher name on stores, and privacy policy "data controller" section.

5. **App name truncation**: "Vessel & Co. Yacht Management" is 33 characters. Both stores limit to 30. Options:
   - "Vessel & Co." (12 chars) -- use subtitle/short description for "Yacht Management"
   - "Vessel & Co. Yachts" (19 chars)
   - "Vessel & Co. Fleet" (18 chars)
   - Other

### 7.2 Important (Affects Quality of Submission)

6. **Bundle ID finalization**: Keep `com.vesselcentral.app` or change? What domain does the business actually own?

7. **Login flow for reviewers**: Apple requires a demo account for app review. The current Quick Demo buttons work for this, but they look like test UI. Should they be styled as a proper demo mode, or should a real login be implemented?

8. **Google Maps API key**: Is there a production Google Maps API key configured, or is this using a development key? Will be needed for Android builds.

9. **Push notification backend**: expo-notifications is configured, but push notifications require a server to send them. Is this planned pre-launch?

10. **Target markets**: All countries, or specific regions? Affects localization needs and legal requirements.

11. **Pricing model**: Free, paid, freemium, subscription? Affects store listing configuration.

### 7.3 Nice to Have

12. **App preview video**: Worth creating? Significantly improves conversion on App Store.

13. **Localization**: English only for v1, or multi-language?

14. **Support channel**: Email only, or also in-app support / help center?
