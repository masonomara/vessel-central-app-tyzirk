# Remaining Tasks

## UI/Polish



## App Submission

### Phase 1: Config & Identity Updates

- [ ] Fill in Apple Developer credentials in `eas.json` (appleId, ascAppId, appleTeamId)
- [ ] Fill in Google Play service account key path in `eas.json`

### Phase 2: Privacy Policy & Legal Pages

- [x] Send `privacy-policy.md`, `support-page.md`, and `webmaster-instructions.md` to webmaster
- [ ] Webmaster deploys privacy policy to `https://www.vesselandco.yachts/privacy`
- [ ] Webmaster deploys support page to `https://www.vesselandco.yachts/support`
- [ ] Verify both URLs are live and publicly accessible

### Phase 3: App Store Metadata (iOS)

- [x] Review and approve all App Store copy
- [x] Verify keyword strategy (search for competitors, check for conflicts)

### Phase 4: Google Play Store Metadata

- [x] Review and approve all Play Store copy
- [ ] Complete IARC content rating questionnaire in Play Console (answers documented in metadata file)
- [ ] Fill out Data Safety form in Play Console using documented declarations

### Phase 5: Native Config Cleanup

- [ ] Run `eas build --profile production --platform ios` and verify permission strings in output
- [ ] Run `eas build --profile production --platform android` and verify `SYSTEM_ALERT_WINDOW` is stripped

### Phase 6: Login Screen Update

- [ ] Review on physical device to confirm it looks intentional, not like test UI
- [ ] Prepare App Review notes: "Tap any demo role button on the login screen to access the app with sample data."

### Phase 7: Asset Checklist (Reference for Later)

- [x] Verify `public/icon.png` is 1024x1024, no alpha channel
- [x] Verify `public/adaptive-icon.png` meets Android adaptive icon spec
- [ ] Export 512x512 hi-res icon for Play Store
- [ ] Create 1024x500 feature graphic for Play Store
- [ ] Capture screenshots across all required device sizes (deferred until UI polish is complete)

### Phase 8: Final Verification

- [ ] Confirm privacy policy and support URLs are live
- [ ] Confirm Apple Developer and Google Play Console accounts are active
- [ ] Do a final read-through of all legal and metadata documents
