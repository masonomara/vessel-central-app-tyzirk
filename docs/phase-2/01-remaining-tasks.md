# Remaining Tasks

## UI Polish

- The "Add Event", "Add Task" etc screens need to be deeply improved. The create a profile page is pretty good, use that as a framework for the rest.
- the analystics cards need to be aligned witht he colors of the rest of the app, and the style of the rest of the app.
- the login screen also needs to be better aligned with the rest of the app.
- run MAUNUAL_WALKTHROUGH and steamroll little style ficxes
- Remove or restyle the "Quick Demo" buttons on the login screen (Owner/Manager/Crew)
- Full physical device walkthrough -- every tab, modal, form on iOS
- Full physical device walkthrough on Android
- Fix any layout breaks found across screen sizes
- Kill every dead-end screen (screens that lead nowhere on tap)

### Phase 1: Config & Identity Updates

- [ ] `[HUMAN]` Fill in Apple Developer credentials in `eas.json` (appleId, ascAppId, appleTeamId)
- [ ] `[HUMAN]` Fill in Google Play service account key path in `eas.json`

### Phase 2: Privacy Policy & Legal Pages

- [x] `[HUMAN]` Send `privacy-policy.md`, `support-page.md`, and `webmaster-instructions.md` to webmaster
- [ ] `[HUMAN]` Webmaster deploys privacy policy to `https://www.vesselandco.yachts/privacy`
- [ ] `[HUMAN]` Webmaster deploys support page to `https://www.vesselandco.yachts/support`
- [ ] `[HUMAN]` Verify both URLs are live and publicly accessible

### Phase 3: App Store Metadata (iOS)

- [x] `[HUMAN]` Review and approve all App Store copy
- [x] `[HUMAN]` Verify keyword strategy (search for competitors, check for conflicts)

### Phase 4: Google Play Store Metadata

- [x] `[HUMAN]` Review and approve all Play Store copy
- [ ] `[HUMAN]` Complete IARC content rating questionnaire in Play Console (answers documented in metadata file)
- [ ] `[HUMAN]` Fill out Data Safety form in Play Console using documented declarations

### Phase 5: Native Config Cleanup

- [ ] `[HUMAN]` Run `eas build --profile production --platform ios` and verify permission strings in output
- [ ] `[HUMAN]` Run `eas build --profile production --platform android` and verify `SYSTEM_ALERT_WINDOW` is stripped

### Phase 6: Login Screen Update

- [ ] `[HUMAN]` Review on physical device to confirm it looks intentional, not like test UI
- [ ] `[HUMAN]` Prepare App Review notes: "Tap any demo role button on the login screen to access the app with sample data."

### Phase 7: Asset Checklist (Reference for Later)

- [x] `[HUMAN]` Verify `public/icon.png` is 1024x1024, no alpha channel
- [x] `[HUMAN]` Verify `public/adaptive-icon.png` meets Android adaptive icon spec
- [ ] `[HUMAN]` Export 512x512 hi-res icon for Play Store
- [ ] `[HUMAN]` Create 1024x500 feature graphic for Play Store
- [ ] `[HUMAN]` Capture screenshots across all required device sizes (deferred until UI polish is complete)

### Phase 8: Final Verification

- [ ] `[HUMAN]` Confirm privacy policy and support URLs are live
- [ ] `[HUMAN]` Confirm Apple Developer and Google Play Console accounts are active
- [ ] `[HUMAN]` Do a final read-through of all legal and metadata documents
