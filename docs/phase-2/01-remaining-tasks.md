# Remaining Tasks

## Branding & Assets

- Create proper app icon (currently same image used for icon and splash)
- Create proper splash screen
- Take App Store screenshots across required device sizes

## UI Polish

- The "Add Event", "Add Task" etc screens need to be deeply improved. The create a profile page is pretty good, use that as a framework for the rest.

## Document Viewer

- Fix document viewer -- references fake file URIs (`file://documents/*.pdf`), shows "No File Available" alert on tap

## Login & Auth

- Remove or restyle the "Quick Demo" buttons on the login screen (Owner/Manager/Crew)
- Strip any remaining "Demo Mode" indicators or prototype badges
- Confirm notification placeholder behavior doesn't crash
- Ensure profile notification preferences actually persist (currently UI-only)

## Demo Data

- Replace hardcoded profile data -- email is `user@example.com`, phone is `+1 (555) 123-4567`, location is `San Francisco, CA`
- Replace mock vessel names or confirm they're acceptable demo names ("Azure Dream", "Ocean Pearl", "Sea Breeze")
- Replace mock crew/user names across login and assign-boats screens (John Smith, Emily Brown, etc.)
- Replace `+1 (555) 123-4567` placeholder in member-setup phone field
- Make maintenance task mock data use realistic maritime terminology and dates
- Make supply request mock data realistic
- Make issue mock data realistic
- Make activity log entries realistic

## Legal & Metadata

- Write a privacy policy
- Write App Store metadata (description, keywords, category)
- Write Google Play Store metadata
- Bundle ID review -- `com.vesselcentral.app` may need updating
- App version bump from 1.0.0 if needed

## Crash Fixes & Stability

- Full physical device walkthrough -- every tab, modal, form on iOS
- Full physical device walkthrough on Android
- Fix any layout breaks found across screen sizes
- Kill every dead-end screen (screens that lead nowhere on tap)

## Submission

- Submit to Apple App Store
- Submit to Google Play Store
- Handle first round of review rejection feedback if needed
