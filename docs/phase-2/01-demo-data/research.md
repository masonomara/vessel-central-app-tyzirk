# Demo Data Research Report

## Source Material: Purely Blu 017 Ops Dashboard

The spreadsheet is the real operational dashboard Vessel & Co ran for their first client, a catamaran called **Purely Blu 017**. It captures the exact data categories and relationships the app needs to replicate with accurate demo data.

---

## Spreadsheet Data Breakdown

### Vessel Identity
- **Name**: Purely Blu (017 is likely a hull or fleet number)
- **Dashboard date**: March 9, 2026
- **Broker login**: `broker` / `charters15%`
- **Siren System**: N (no siren system installed)
- **Named Operator #1**: Brad Needham (captain)
- **Named Operators #2-6**: Empty (single-captain vessel)

### Engine Hours
| Engine | Total Hours | Elapsed Since Change |
|--------|------------|---------------------|
| Port Engine | 1,837 | 146 |
| Starboard Engine | 1,832 | 140 |
| Generator I | 10,669 | 192 |
| Generator II | 0 | 0 |

This data type does not exist in the current app. Engine hours tracking is a core operational metric the app is missing.

### Annual Maintenance Projections (9 items, all $0.00 estimated cost)
1. Both sides blackwater tank meters not working; always read zero
2. Halyard change tied to front starboard mermaid seat rail (frayed at top of mast at pulley)
3. Ice maker not working (runs but doesn't make ice)
4. Insulator wax to external metal
5. New mermaid seats
6. Replace saildrive seals (port has water in now, starboard did earlier in season)
7. Sand and snappy teak cockpit table; fill screws with filler (screws oversized, pulled out)
8. Starboard rear bath hatch leaks; suspected remove/reinstall hatch, not seal
9. Zincs changed - saildrives, props, hull (new zincs in starboard hatch behind fridge/icemaker cabinet)

### Open Issues by Priority
| Priority | Count |
|----------|-------|
| GEN MAINT | 1 |
| HAUL OUT | 2 |
| MINOR | 2 |
| MONITOR | 5 |
| UPGRADE | 2 |
| WARRANTY | 2 |
| **Total** | **14** |

Note: The spreadsheet uses custom priority labels (GEN MAINT, HAUL OUT, MINOR, MONITOR, UPGRADE, WARRANTY) rather than the app's current low/medium/high/urgent scheme. This is a significant mapping challenge.

### Open Issues by System
| System | Count |
|--------|-------|
| Dinghy | 1 |
| Electrical | 1 |
| Electronics | 1 |
| Hull/Deck | 1 |
| Lighting | 3 |
| Miscellaneous | 3 |
| Rigging | 1 |
| Sails/Canvas | 2 |
| **Total** | **13** |

The app currently uses a flat `category` field on issues. The spreadsheet reveals that "system" is how operators actually categorize problems. The app's existing category field maps well here.

### Logged Incidents
- 0 total (only classification: "Property Damage Only" with 0 count)

### Crew Certifications (with expiration dates)
- Visas
- STCW #1, STCW #2
- Radio License
- License (expires 1/20/2027)
- First Aid
- Drug Consortium (Captain: expires 5/31/2025; Crew 1 & 2: no date)
- Dive License/Insurance
- Crew Contract Expiration Date

Most show 12/30/1899 which means "not entered" (Excel epoch zero). Only two have real dates: License (1/20/2027) and Drug Consortium Captain (5/31/2025).

### Vessel Certifications (with expiration dates)
- Vessel Registration (45260 = Excel serial date, ~November 2023)
- Vessel Insurance
- USVI DPNR Registration
- User Guide
- Owners Manual
- MMSI
- MCA Blue Code
- FCC Station
- Dinghy DPNR Registration
- Bahamas Import Permit

### Safety Equipment (with expiration dates)
- PFDs (Sm, Md, Lg) - quantities not entered
- Oxygen
- Liferaft
- Flares
- First Aid Kit
- Fire Extinguishers (7 total, individual tracking)
- EPIRBs

### Recreational Equipment (with expiration dates)
- Water Skis, Wake Board
- Scuba Tanks (60 & 80)
- Regulators, BCDs (Sm, Md, Lg)
- Paddle Boards, Kayaks
- Floating Pad
- Mask/Snorkels, Fins
- Propulsion Vehicles

### Resources / Contacts
- **CC Personnel**: Diana Sanders (no phone/title/email filled)
- **Vendors**: Quantum Sails (no details filled)
- **Brokers**: Empty

### Parts Action Summary
| Status | Count |
|--------|-------|
| (blank) | 0 |
| 1-Required | 2 |
| 5-Received | 1 |
| 6-Complete | 1 |

### Links Section (PENDING)
- Charter Log: PENDING
- Documents Folder: PENDING

---

## Mapping: Spreadsheet to App Entities

### 1. Vessel (replace all three mock vessels with one: Purely Blu)

**Current mock data** (DataContext.tsx:91-122):
- Azure Dream / Monaco Yacht Club / active / 8 crew
- Ocean Pearl / Port of Miami / maintenance / 6 crew
- Sea Breeze / Caribbean Marina / active / 5 crew

**Replacement from spreadsheet**:
- **Purely Blu** / USVI (implied by DPNR registration) / active
- The spreadsheet only covers one vessel. For demo purposes, keep 2-3 vessels but rename the primary to Purely Blu and use realistic Caribbean charter locations (St. Thomas, St. John, Tortola).

**Recommended vessel set**:
| ID | Name | Location | Status |
|----|------|----------|--------|
| 1 | Purely Blu | Red Hook, St. Thomas, USVI | active |
| 2 | Ocean Pearl | Nanny Cay, Tortola, BVI | active |
| 3 | Sea Breeze | Cruz Bay, St. John, USVI | maintenance |

### 2. Users / Crew (replace all mock users)

**Current mock users** (login.tsx:31-74):
- owner1: John Smith, owner2: Emily Brown
- manager1: Sarah Johnson, manager2: Tom Wilson
- crew1: Mike Davis, crew3: Jane Smith

**From spreadsheet**:
- Captain/Operator: **Brad Needham**
- CC Personnel contact: **Diana Sanders**

**Recommended user set**:
| ID | Name | Role | Email |
|----|------|------|-------|
| owner1 | Diana Sanders | owner | diana@vesselco.com |
| manager1 | Brad Needham | manager | brad@vesselco.com |
| crew1 | (invent realistic name) | crew | (crew email) |
| crew2 | (invent realistic name) | crew | (crew email) |

Only two names exist in the spreadsheet. Remaining crew should be plausible maritime names. The broker login credentials should NOT be used in the app -- they're from the charter management side.

### 3. Profile Data (replace hardcoded values)

**Current hardcoded** (profile.tsx:111-113):
- Email: `user@example.com`
- Phone: `+1 (555) 123-4567`
- Location: `San Francisco, CA`

**Fix**: These should pull from the logged-in user's data. The profile screen needs to read from AuthContext or a user profile object rather than hardcoded strings. Location should be USVI-based for the demo.

**member-setup.tsx:143**: Phone placeholder `+1 (555) 123-4567` -- replace with `+1 (340) 555-0100` (340 is the USVI area code).

### 4. Maintenance Tasks (replace 9 generic tasks with spreadsheet items)

**Current mock tasks** (DataContext.tsx:124-367): Generic maritime tasks (Engine Service, Safety Equipment Check, Deck Cleaning, Hull Inspection, Generator Maintenance, Bilge Pump Test, HVAC Filter Replacement, Watermaker Service, Anchor Windlass Inspection).

**Spreadsheet provides 9 real maintenance projections**. Direct mapping:

| # | Spreadsheet Item | App Title | Category | Priority | Status |
|---|-----------------|-----------|----------|----------|--------|
| 1 | Blackwater tank meters not working | Blackwater Tank Meter Repair | Plumbing | medium | open |
| 2 | Halyard change (frayed at mast pulley) | Halyard Replacement - Starboard Mermaid Seat Rail | Rigging | high | open |
| 3 | Ice maker not working | Ice Maker Repair | Mechanical | medium | open |
| 4 | Insulator wax to external metal | External Metal Insulator Wax Application | Hull/Deck | low | open |
| 5 | New mermaid seats | Mermaid Seat Replacement | Hull/Deck | medium | open |
| 6 | Replace saildrive seals (port has water) | Saildrive Seal Replacement - Port & Starboard | Mechanical | urgent | open |
| 7 | Sand and refinish teak cockpit table | Teak Cockpit Table Refinish & Screw Repair | Woodwork | medium | open |
| 8 | Starboard rear bath hatch leak | Starboard Rear Bath Hatch Re-seal | Hull/Deck | high | open |
| 9 | Zincs replacement (saildrives, props, hull) | Zinc Anode Replacement - Full Vessel | Mechanical | high | waiting_on_parts |

Some should be marked as haul-out dependent (items 2, 6, 9 require the vessel to be hauled). The spreadsheet's "HAUL OUT" priority tag tells us this. The app lacks a "requires haul out" flag -- worth noting as a gap.

### 5. Issues (replace 5 generic issues with spreadsheet-derived items)

The spreadsheet's "Open Issues by System" gives us 13 issues across 8 systems. Combined with the maintenance items (which double as issues), realistic issues:

| Title | System/Category | Priority | Status |
|-------|----------------|----------|--------|
| Port navigation light intermittent | Electrical | high | open |
| Salon overhead LED strip flickering | Lighting | medium | open |
| Aft deck courtesy lights out | Lighting | low | open |
| Cockpit spreader light not responding | Lighting | medium | in_progress |
| Dinghy outboard pull-start cord fraying | Dinghy | medium | open |
| Chartplotter GPS signal dropping | Electronics | high | open |
| Starboard hull gelcoat crazing near waterline | Hull/Deck | low | monitor |
| Lazy jack line chafing at spreader | Rigging | medium | open |
| Bimini stitching coming apart (port side) | Sails/Canvas | medium | open |
| Spinnaker snuffer line jammed | Sails/Canvas | low | open |
| Bilge pump float switch sticky | Miscellaneous | high | open |
| Galley fridge door seal loose | Miscellaneous | low | open |
| Cockpit speaker crackling | Miscellaneous | low | open |

### 6. Supply Requests (replace 6 generic requests)

Derived from spreadsheet maintenance items and parts action summary:

| Item | Category | Status | Est. Cost |
|------|----------|--------|-----------|
| Saildrive seal kit (port & starboard) | Mechanical Parts | pending | $1,200 |
| Zinc anodes (saildrives, props, hull) - qty 12 | Mechanical Parts | received | $480 |
| Halyard line - 50m Dyneema | Rigging | pending | $350 |
| Teak oil & sandpaper assortment | Deck Supplies | approved | $120 |
| Ice maker compressor relay | Appliance Parts | ordered | $85 |
| Mermaid seat cushion set (pair) | Furnishings | pending | $2,400 |
| Hatch seal gasket - starboard rear | Hull Parts | approved | $65 |
| Blackwater tank level sensor (pair) | Plumbing Parts | pending | $320 |
| Insulator wax - marine grade (2L) | Cleaning Supplies | approved | $45 |

### 7. Documents (replace 7 generic documents)

The spreadsheet explicitly lists document types tracked:

| Title | Category | Expiry |
|-------|----------|--------|
| Vessel Registration - Purely Blu | registration | 2027-03-15 |
| Hull & Machinery Insurance Policy | insurance | 2027-01-01 |
| USVI DPNR Registration | registration | 2026-12-31 |
| Bahamas Import Permit | registration | 2026-06-30 |
| FCC Station License | registration | 2027-09-01 |
| MMSI Certificate | registration | (none) |
| MCA Blue Code Compliance | safety | 2027-06-01 |
| Owners Manual - Leopard 47 | manual | (none) |
| Captain License - Brad Needham | safety | 2027-01-20 |
| Drug Consortium Certificate - Captain | safety | 2025-05-31 |
| STCW Certificates (x2) | safety | (needs dates) |

### 8. Calendar Events (replace 5 generic events)

Based on spreadsheet context (charter vessel in USVI, March 2026):

| Title | Type | Date | Location |
|-------|------|------|----------|
| Haul Out - Purely Blu | maintenance | 2026-04-15 (offseason) | Subbase Drydock, St. Thomas |
| Saildrive Seal Replacement | maintenance | 2026-04-17 | Subbase Drydock, St. Thomas |
| Pre-Season Safety Inspection | inspection | 2026-10-20 | Red Hook, St. Thomas |
| Charter: Johnson Party (7 day) | charter | 2026-03-15 to 2026-03-22 | BVI itinerary |
| Provisioning Run | provisioning | 2026-03-14 | Cost-U-Less, St. Thomas |
| Crew Change - Deckhand Rotation | crew_change | 2026-04-01 | Red Hook, St. Thomas |
| Drug Consortium Renewal - Captain | meeting | 2025-05-15 | (before expiry 5/31) |

### 9. Expenses (replace 7 generic expenses)

| Title | Amount | Category | Date |
|-------|--------|----------|------|
| Fuel - Port & Starboard Tanks | $1,850 | Fuel | 2026-03-01 |
| Marina Slip - March | $2,200 | Docking | 2026-03-01 |
| Provisioning - Johnson Charter | $3,400 | Provisioning | 2026-03-14 |
| Zinc Anodes (12 pack) | $480 | Maintenance Parts | 2026-02-20 |
| Ice Maker Compressor Relay | $85 | Maintenance Parts | 2026-03-05 |
| Teak Oil & Supplies | $120 | Maintenance Supplies | 2026-02-28 |
| Captain License Renewal Fee | $300 | Administrative | 2026-01-10 |
| Hull Insurance Premium (Annual) | $8,500 | Insurance | 2026-01-01 |

### 10. Activity Logs (replace 3 generic entries)

Current entries (DataContext.tsx:786-829) are sparse. Realistic entries:

- "Brad Needham reported issue: Chartplotter GPS signal dropping" - 2 hours ago
- "Diana Sanders approved supply request: Zinc anodes (12 pack)" - 5 hours ago
- "Brad Needham completed maintenance: Bilge pump inspection" - 1 day ago
- "Supply received: Zinc anodes (12 pack) - delivered to vessel" - 1 day ago
- "Brad Needham created maintenance task: Saildrive Seal Replacement" - 3 days ago
- "System: Captain Drug Consortium certificate expires in 83 days" - 3 days ago

---

## Gaps: What the Spreadsheet Has That the App Does Not

### Critical Missing Features

1. **Engine Hours Tracking**
   - The spreadsheet tracks total hours and elapsed-since-change for port engine, starboard engine, and two generators.
   - The app has no concept of engine hours anywhere in its data model or UI.
   - This is a core operational metric for any vessel management tool.

2. **Crew Certification Tracking**
   - The spreadsheet tracks 10+ certification types per crew member with expiration dates (STCW, Radio License, Drug Consortium, Dive License, Captain License, First Aid, Visas, Crew Contracts).
   - The app's `Document` type can hold some of this, but there is no dedicated crew certification model, no per-crew-member certificate tracking, and no expiration alerting tied to crew.

3. **Vessel Certification / Registration Tracking**
   - The spreadsheet tracks 10 vessel-level certifications (Registration, Insurance, DPNR, MMSI, MCA Blue Code, FCC Station, Dinghy DPNR, Bahamas Import Permit, etc.).
   - The app has a `Document` entity with expiry dates and categories, which partially covers this. But there is no dedicated vessel certification dashboard or summary view.

4. **Safety Equipment Inventory**
   - The spreadsheet tracks individual fire extinguishers (7 of them), PFDs by size, oxygen, liferaft, flares, first aid kit, EPIRBs -- each with expiration dates.
   - The app has no equipment inventory model. This is entirely missing.

5. **Recreational Equipment Inventory**
   - Water skis, wake boards, scuba tanks (60 & 80), BCDs by size, regulators, paddle boards, kayaks, floating pad, snorkels, fins, propulsion vehicles -- all tracked with certification/expiration dates.
   - Completely absent from the app.

6. **Contact Directory**
   - The spreadsheet has structured sections for CC Personnel, Vendors (e.g., Quantum Sails), and Brokers with phone/email/title fields.
   - The app has no contact management feature.

7. **Parts Action Workflow**
   - The spreadsheet tracks parts with statuses: Required, Received, Complete.
   - The app has `add-parts-request.tsx` as a screen but the parts workflow is essentially identical to supply requests. There is no distinct parts tracking tied to maintenance tasks.

8. **Incident Logging**
   - The spreadsheet has a "Logged Incidents" section with classification types (Property Damage Only).
   - The app's `Issue` entity could serve this purpose, but "incident" implies a different severity and reporting structure (insurance, regulatory).

9. **Custom Priority/Category Taxonomy**
   - Spreadsheet uses: GEN MAINT, HAUL OUT, MINOR, MONITOR, UPGRADE, WARRANTY.
   - App uses: low, medium, high, urgent.
   - These don't map cleanly. The spreadsheet's categories carry operational meaning (haul-out dependency, warranty coverage) that severity levels don't capture.

10. **Charter Log**
    - Marked as "PENDING" in the spreadsheet. This implies charter tracking was planned as a core feature.
    - The app has `charter` as a calendar event type, but no dedicated charter management (guest info, itineraries, revenue tracking).

### Medium-Priority Gaps

11. **Siren System Status**: Simple Y/N flag per vessel. Trivial to add.
12. **Named Operators List**: Regulatory requirement -- who is authorized to operate. Not in app.
13. **Elapsed Hours Since Change**: Maintenance intervals based on engine hours, not just calendar dates.
14. **Cost Estimation on Maintenance Projections**: All items show $0.00, but the column exists. The app has `estimatedCost` on maintenance tasks -- this maps directly.

---

## Files That Need Modification

| File | What Changes |
|------|-------------|
| `contexts/DataContext.tsx` | All mock data arrays (vessels, tasks, issues, supplies, documents, events, expenses, activity logs, notifications). This is the single source of truth -- ~1000 lines of mock data starting at line 91. |
| `app/login.tsx` | MOCK_USERS array (lines 31-74). Names, emails, roles. |
| `app/profile.tsx` | Hardcoded email/phone/location (line 111-113). Must read from user data instead. |
| `app/member-setup.tsx` | Phone placeholder (line 143). Change area code to 340. |
| `app/assign-boats.tsx` | References mock user names for vessel assignment. |

### Files That Do NOT Need Changes
- All component files (ItemCard, DetailRow, etc.) -- purely presentational.
- Navigation/layout files -- structure is correct.
- Type definitions -- existing types accommodate the spreadsheet data.
- Utility files -- date/color/search logic is fine.

---

## Execution Order

1. **Replace vessels** in DataContext.tsx. Everything downstream references vesselId/vesselName.
2. **Replace users** in login.tsx and all name references in DataContext.tsx.
3. **Replace maintenance tasks** with spreadsheet items.
4. **Replace issues** with spreadsheet-derived items.
5. **Replace supply requests** with spreadsheet-derived items.
6. **Replace documents** with spreadsheet certification list.
7. **Replace calendar events** with charter-season-appropriate events.
8. **Replace expenses** with realistic amounts.
9. **Replace activity logs and notifications**.
10. **Fix profile.tsx** to read from user context instead of hardcoded values.
11. **Fix member-setup.tsx** placeholder.

Each step can be validated independently by logging in as each role and confirming the data displays correctly.
