# Vessel Central — Project Notes

Compiled from three thinking sessions (initial readthrough, client meeting, scoping).

---

## Client Context

- **Client:** Hannah (and husband) — runs a yacht management business
- **Problem:** Owners/boat managers each have spreadsheets tracking vessel data. Hannah's team has their own spreadsheet. This app is the shared layer replacing all of that.
- **Payments:** Handled off-app via Mercury Finance — not in scope
- **Auth model:** Hannah can either give someone a passcode/account on signup, or people create accounts and Hannah links an organization to them on the backend
- **Deadline:** Live in App Store by March 26th

---

## Assessment of Existing App

The current codebase was vibecoded (Lovable-style). It's a proof of concept, not a production app.

**Worth keeping:**
- Type definitions — data shapes are mapped out
- Context/state management pattern — bloated but functional
- UI patterns and analytics visuals
- Role-based view architecture
- Understanding of data flow

**Not worth keeping (rebuild from scratch):**
- Offline mode — not connected to anything
- Realtime — doesn't work
- Notifications — no backend
- Analytics — no real data source
- Supabase integration — never wired up

**Bottom line:** Too much tech debt to iterate on. A new app should be built, pulling useful pieces (types, data flow patterns, role logic) from this one.

---

## Technical Decisions

- **React Native** — one codebase for iOS and Android, stands up quick
- **Document upload** — Cloudflare R2 (see: [Cloudflare R2 PDF tutorial](https://developers.cloudflare.com/r2/tutorials/summarize-pdf/))
- **Styling** — Reuse colors from docketadmin.com. Off-white, simple, maybe slightly yellowish/brownish tint.

---

## Open Questions & Feature Scoping

### Tasks (core feature)
Tasks are the main unit of work. Need to finalize "what is a task."

**Task fields:**
- Title
- Description
- Vessel
- Priority
- Due Date
- Recurring (reference Google Calendar patterns)
- Issue / Maintenance toggle
- Status (open / in progress / complete)

**Remove:** "Additional notes" field — unnecessary

**Unresolved:**
- Estimated cost vs. actual cost — enter actual cost when marking complete?
- Who can mark a task complete?

### Calendar
- Does it just show tasks?
- Why have a separate calendar AND tasks view? Consider: calendar with a list view instead.

### Overview / Home Screen
- Why have an overview screen? What's on it?
  - Upcoming charters?
  - Next maintenance?
  - Monthly expenses?
  - Ships? (tap to see ship analytics?)

**Possible layout:**
```
[Ships]
[Total Overview]
[Recent Updates]
[View Reports]
```

### Analytics
- Data creation doesn't match the data shown in analytics — need alignment once tasks are defined

---

## Timeline Risk

Mobile dev environments are finicky. App Store approval is unpredictable. Guaranteeing a date should be done cautiously for mobile. End of March is tight.
