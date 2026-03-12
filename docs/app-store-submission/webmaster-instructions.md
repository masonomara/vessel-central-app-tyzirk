# Webmaster Deployment Instructions

Instructions for deploying legal pages on vesselandco.yachts. Both pages must be live before submitting to the Apple App Store or Google Play Store.

---

## Pages to Deploy

### 1. Privacy Policy

- **Route:** `/privacy` (accessible at `https://www.vesselandco.yachts/privacy`)
- **Source file:** `privacy-policy.md` in the app repository
- **Format:** Convert markdown to HTML. Plain, clean HTML is fine. No special framework needed.
- **Requirements:**
  - Must be publicly accessible (no login wall, no paywall)
  - Must be mobile-responsive (Apple and Google reviewers check on devices)
  - Must load reliably (no broken links, no 404s)

### 2. Support Page

- **Route:** `/support` (accessible at `https://www.vesselandco.yachts/support`)
- **Source file:** `support-page.md` in the app repository
- **Format:** Same as privacy policy -- markdown converted to HTML.
- **Requirements:** Same as privacy policy (public, mobile-responsive, reliable)

---

## Verification Steps

After deployment, confirm:

1. `https://www.vesselandco.yachts/privacy` loads correctly on desktop and mobile
2. `https://www.vesselandco.yachts/support` loads correctly on desktop and mobile
3. No authentication or paywall blocks access
4. Contact email (hello@vesselandco.yachts) is displayed correctly
5. All internal links work (e.g., support page links to privacy page)
