# Contract Adaptation Plan: Vessel & Co (Option 1)

Source: `sample-contract.md` (Moor / Digital Marine engagement, $19,500)
Target: Vessel & Co Option 1 — App Store Demo, $4,250

This document maps every section of the sample contract to what needs to change for the Vessel & Co engagement. Sections are grouped by type of change: direct substitution, structural rewrite, removal, or addition.

---

## Preamble (Lines 1-9)

**Type: Rewrite**

| Field          | Sample (Moor)                          | Vessel & Co                                      |
| -------------- | -------------------------------------- | ------------------------------------------------ |
| Effective Date | 19th day of July, 2025                 | 13th day of February, 2025                       |
| Client entity  | Digital Marine, LLC                    | Vessel & Co LLC                                  |
| Client address | 3330 N Narrows Dr, Tacoma, WA 98407    | [Ft. Lauderdale address — need from Hannah]      |
| Agency entity  | O'Mara Technology & Design LLC         | Same                                             |
| Agency address | 1301 Corlies Avenue, Neptune, NJ 07712 | Same                                             |

**WHEREAS clause (line 7) — full rewrite:**

- Moor: "...develop and launch Moor, a modern yacht staffing platform that bridges yacht crew and yacht programs through radius-based matching and streamlined communication"
- Vessel & Co: "...refine and submit Vessel Central, a demonstration mobile application showcasing a yacht management platform for charter operations, maintenance coordination, and vessel oversight"

**Client entity name:** Use "Vessel & Co LLC" in the contract. In the delivery email, note to Hannah: if her legal entity name differs, let Mason know before signing and he'll send an updated version. Client address still needed from Hannah — leave as placeholder.

---

## Article 1: Definitions (Lines 11-41)

**Type: Minor edits**

Most definitions are generic and carry over unchanged. Changes:

- **1.5 Agency Tools** (line 23): Replace "website design, architecture, layout, navigational and functional elements" with "mobile application design, architecture, layout, navigational and functional elements." This is a mobile app, not a website.
- **1.6 Final Works** (line 25): Replace "final source code, visual elements..." — the list is fine as-is but add "mobile application builds" to the enumeration since the deliverable includes compiled iOS/Android app binaries.
- **1.9 Project** (line 31): No change needed (refers to Article 2).
- All other definitions (1.1-1.4, 1.7-1.8, 1.10-1.14): Carry over verbatim.

---

## Article 2: Scope of Work (Lines 43-115)

**Type: Full rewrite.** This is the most heavily changed section. Every subsection needs replacement.

### 2.1 Project Overview (line 45)

**Moor version:** Describes a yacht staffing platform, job board, radius-based matching, competitor positioning vs daywork123.com/findacrew.com.

**Vessel & Co replacement:** The Agency shall provide mobile application refinement and App Store submission services for the Client's yacht management demonstration application, known as Vessel Central. Vessel Central is a mobile application prototype built to demonstrate a shared operational platform for yacht owners, fleet managers, and crew — coordinating maintenance, scheduling, documents, and expenses across a managed fleet. The existing prototype contains role-based dashboards, task management flows, document views, calendar screens, and analytics displays, all populated with demonstration data. The Agency's scope is limited to refining this prototype into a polished, crash-free demonstration suitable for App Store distribution and in-person presentation at industry events.

### 2.2 Project Objectives (lines 47-57)

**Moor version:** 5 objectives (product strategy, functional web platform, investor prototype, brand identity, project documentation).

**Vessel & Co replacement — 4 objectives:**

1. Restyle the existing Vessel Central prototype to reflect the Client's brand identity (off-white palette, warm tones, matching docketadmin.com aesthetic)
2. Resolve all crashes, dead-end screens, and navigation failures so the application performs reliably during in-person demonstrations
3. Replace placeholder and developer-quality mock data with realistic maritime content suitable for a professional audience
4. Submit the application to the Apple App Store and Google Play Store with all required assets, metadata, and compliance materials

### 2.3 Project Services (lines 59-83)

**Moor version:** 12 services (kickoff workshop, feature backlog, roadmap, wireframes, brand guidelines, web development, demo development, QA, launch, documentation, post-launch check-ins).

**Vessel & Co replacement — 4 service phases mapped to the proposal:**

1. **UI Cleanup & Styling (15 hours, Week 1):** Restyle the application to match Vessel Central brand. Apply brand color palette. Remove all visual indicators of prototype status (demo badges, placeholder phone numbers, generic vessel names). Ensure every screen appears intentional and professionally finished.

2. **Crash Fixes & Screen Completion (10 hours, Week 2):** Repair the document viewer (currently references non-existent files). Complete thin or dead-end detail screens for tasks and issues. Full walkthrough on physical iOS and Android devices — every tab, modal, and form. Confirm layouts hold across screen sizes and the experience is smooth.

3. **Demo Data & Placeholder Removal (4 hours, Week 3):** Replace mock data with realistic vessel names, maintenance logs, and maritime terminology. Seed content so the app feels populated. Remove hardcoded profile data. Incorporate multiple professional views (owner, crew, broker) suitable for the Client's launch event demo stations.

4. **App Store Submission (5 hours, Week 4):** Create app icons, screenshots, and metadata. Draft privacy policy. Submit to Apple App Store and Google Play Store. Includes one round of review feedback if initially rejected.

**Note:** The hour allocation from the proposal is 15 + 10 + 4 + 6 = 35 hours. The proposal says 34 hours at $4,250. Reconcile — likely the submission phase is 5 hours, not 6, to hit 34. Use 34 total.

### 2.4 Scope Definition and Prioritization (line 85)

**Moor version:** Weekly strategy calls, detailed roadmap, change documentation.

**Vessel & Co replacement:** Simplify. This is a 4-week engagement. Replace "weekly strategy calls" with "regular check-ins" or "communication as needed." The scope is fixed and narrow — there's no evolving roadmap. Rewrite to say: The Agency and Client will communicate regularly during the engagement to review progress and address questions. The scope of work is defined above. Any changes or additions will be documented and subject to the change order process in Article 4.

### 2.5 Workload Adjustment (line 87)

**Moor version:** References "evolving demands of Moor's development."

**Vessel & Co replacement:** Replace "Moor" with "Vessel Central." Otherwise structurally fine — formal change orders for scope expansion. Simplify slightly to match the smaller engagement.

### 2.6 Project Timeline (line 89)

**Moor version:** 16-week duration, target completion Oct 22, 2025, Fort Lauderdale Boat Show Oct 29.

**Vessel & Co replacement:** Agency will use commercially reasonable efforts to complete the Services within a 4-week project duration beginning on the Commencement Date, with a target submission to the Apple App Store and Google Play Store by the end of Week 4. App Store review and approval timelines are outside Agency's control. Client acknowledges that Apple and Google review processes can take 4-5 business days or longer, and that rejection may require rework and resubmission. All timelines are subject to Client's timely performance of obligations as specified herein.

**Note:** Do NOT put March 26 as a hard date. Mason explicitly flagged this risk in emails. The contract should target "end of Week 4 for submission" — not "App Store availability by X date."

### 2.7 Technical Specifications (lines 91-101)

**Moor version:** Browser compatibility, responsive design, load times, Stripe integration, CSV data migration.

**Vessel & Co replacement — mobile-specific:**

1. iOS application compatible with iOS 16 and later
2. Android application compatible with Android 10 (API level 29) and later
3. Application built using React Native / Expo for cross-platform deployment from a single codebase
4. Demonstration data only — no backend database, no API integrations, no user authentication, no persistent data storage

**Critical addition:** Explicit statement that this is a demo. "The application is a demonstration product containing pre-populated sample data. It does not connect to any backend services, does not store or transmit user data, and does not provide functional vessel management capabilities."

### 2.8 Success Criteria (lines 103-113)

**Moor version:** Bug-free platform, payment processing, form validation, demo prototype, investor documentation.

**Vessel & Co replacement:**

1. A mobile application free from crashes during standard navigation and walkthrough of all screens
2. Professional visual presentation consistent with Client's brand identity
3. Realistic demonstration data suitable for presentation to yacht owners, crew, and brokers
4. Successful submission to the Apple App Store and Google Play Store (approval subject to platform review)

### 2.9 Communication Hours and Protocol (line 115)

**Moor version:** 9-5 EST, 2-hour urgent response, Discord + email, weekly status calls.

**Vessel & Co replacement:** Keep 9-5 EST hours and 2-hour urgent response window. **Email only** — remove all Discord references, "shared project channel," and "Agency Principal" messaging language. Replace with: "For formal communication, the Agency uses email. Mason O'Mara will serve as the primary point of contact." Check-ins as needed during the 4-week engagement, not formal weekly calls.

---

## Article 3: Fees and Charges (Lines 117-141)

**Type: Rewrite financial terms.**

### 3.1 Fees (lines 119-123)

| Field         | Moor    | Vessel & Co |
| ------------- | ------- | ----------- |
| Total Fee     | $19,500 | $4,250      |
| Overtime rate | $172/hr | $150/hr     |

Remove "all applicable Canadian and U.S. sales, use, or value-added taxes" — no Canadian connection in this engagement. Keep "all applicable U.S. sales, use, or value-added taxes."

### 3.2 Payment Schedule (lines 125-133)

**Moor version:** 3 payments (33% / 33% / 34%) at signing, design approval, and launch.

**Vessel & Co replacement — 2 payments per email agreement:**

1. **Deposit (Contract Signing):** $2,125 (50%) due upon execution of this Agreement
2. **Final Payment:** $2,125 (50%) due upon the first of the following to occur:
   - Successful submission of the application to the Apple App Store and Google Play Store; OR
   - Delivery of the application for installation on Client-provided devices, in the event that App Store submission is not viable due to repeated platform rejection (defined as two or more rejections after remediation of initial review feedback)

Payment methods: Keep same (ACH, credit card, PayPal with fee responsibility on Client).

**Note:** This two-trigger structure protects both parties. Mason isn't held hostage by Apple's review process, and Hannah gets a usable deliverable either way. The "pivot to local devices" fallback was explicitly agreed to in the email exchange.

### 3.3 Additional Costs (lines 135)

**Moor version:** Domain, hosting, Stripe fees, SSL, stock photography.

**Vessel & Co replacement:** Strip Stripe, domain, hosting, and SSL references. Replace with:

- Apple Developer Program enrollment ($99/year) — Client's responsibility
- Google Play Developer registration ($25 one-time) — Client's responsibility
- Any stock photography, illustration, or licensed assets required for App Store listings or in-app content

**Note:** Hannah confirmed she already has an Apple dev account. Google Play status unknown. The contract should list both as Client responsibilities regardless.

### 3.4 Taxes (line 137)

**Carry over verbatim.** No changes needed.

### 3.5 Invoices (line 139)

**Carry over verbatim.** The late payment and withholding terms are generic and apply. Remove "disable access to any hosted services" — there are no hosted services in Option 1. Or keep it as future-proofing. Minor.

### 3.6 Third-Party Service Fees (line 141)

**Carry over verbatim.** Generic enough to apply.

---

## Article 4: Changes (Lines 143-151)

**Type: Minor edits**

### 4.1 General Changes (line 145)

Replace overtime rate: $172 → $150.

### 4.2 Substantive Changes (line 147)

**Carry over verbatim.** The 10% threshold and change order process applies.

### 4.3 Timing (line 149)

**Carry over verbatim.** Client delay = not Agency's fault. Applies directly.

### 4.4 Testing and Acceptance (line 151)

**Carry over verbatim.** 5 business day review window. Deemed accepted if no written notice.

---

## Article 5: Client Responsibilities (Lines 153-177)

**Type: Full rewrite.**

**Moor version:** 11 items (kickoff workshop, brand examples, legal disclaimers, IA review, design presentation, domain registration, hosting setup, Stripe account, content audit, boat show attendance, prototype training).

**Vessel & Co replacement:**

Client acknowledges responsibility for:

1. Provide brand assets (logo, color palette, any brand guidelines) within 5 business days of the Commencement Date
2. Provide sample vessel names, fleet details, and any preferred demonstration content for mock data within Week 1
3. Provide timely feedback on design and styling decisions during Week 1 (UI Cleanup phase)
4. Create and maintain an Apple Developer Program account and grant Agency administrator access for app submission
5. Create and maintain a Google Play Developer account and grant Agency access for app submission
6. Review and approve App Store listing content (screenshots, description, privacy policy) within 3 business days of delivery
7. Respond to Agency communications within 2 business days during the engagement period

---

## Article 6: Accreditation/Promotions (Lines 179-181)

**Type: Carry over verbatim.** No project-specific content. Both parties can showcase the work. The opt-out clause ("Client may also request that the work not be included") is already present.

---

## Article 7: Confidential Information (Lines 183-185)

**Type: Carry over verbatim.** Generic confidentiality terms. No project-specific references.

---

## Article 8: Relationship of the Parties (Lines 187-193)

**Type: Carry over verbatim.** Independent contractor, agency agents, no exclusivity. All generic.

---

## Article 9: Warranties and Representations (Lines 195-219)

**Type: Carry over verbatim with one addition.**

All warranty language is generic and applies. However, add a specific warranty disclaimer for the demo nature of the deliverable:

**Addition to 9.2 (Agency warranties):** "Agency makes no warranty that the application will function as a production vessel management tool. The Deliverables are a demonstration application containing pre-populated sample data, and Agency expressly disclaims any warranty regarding the application's fitness for operational vessel management, data storage, or any use beyond demonstration and presentation purposes."

---

## Article 10: Indemnification/Liability (Lines 221-239)

**Type: Carry over verbatim.** All indemnification and liability terms are generic. The liability cap ("limited to the total amount paid by Client") automatically adjusts to $4,250.

---

## Article 11: Term and Termination (Lines 241-257)

**Type: Minor edits.**

### 11.1 Term (line 243)

**Carry over verbatim.** Commencement to delivery of Final Works.

### 11.2 Termination (line 245)

**Reduce to 14 days written notice.** The Moor contract uses 30 days, which for a 4-week engagement would make termination effectively impossible. 14 days is proportionate — gives both parties a meaningful exit window while still providing enough notice to wind down work in progress.

### 11.3-11.4

**Carry over verbatim.**

---

## Article 12: Rights in the Final Deliverables (Lines 259-269)

**Type: Minor edits.**

### 12.1 Final Works (line 261)

**Carry over verbatim.** Full IP assignment on completion + full payment. This is correct — confirmed in email ("You'd have a copy of all the code").

### 12.2-12.4

**Carry over verbatim.** Trademark responsibility, client content, third-party materials — all generic.

### 12.5 Source Code Repository (line 269)

**Carry over verbatim.** "Agency shall maintain project source code in a repository accessible to Client with read-only permissions. Upon final payment, Agency shall transfer full repository ownership and administrative rights to Client."

This matches the email commitment.

---

## Article 13: Rights Reserved to Agency (Lines 271-277)

**Type: Carry over verbatim.** Preliminary works, original artwork, agency tools. All generic IP protections.

---

## Article 14: Compliance with Laws (Lines 279-281)

**Type: Carry over verbatim.** Generic compliance language. ADA/WCAG references are fine to keep — they apply to mobile apps too. Client bears compliance responsibility.

---

## Article 15: General (Lines 283-311)

**Type: Carry over verbatim with minor edits.**

All subsections (15.1-15.10) are generic boilerplate: modification/waiver, notices, acceptance/execution, no assignment, force majeure, governing law (NJ), severability, headings, integration, counterparts.

**One potential edit in 15.6 (Governing Law):** Confirm New Jersey is correct. Mason is in NJ, so this is standard for his contracts. Keep as-is.

---

## Signature Block (Lines 313-319)

**Type: Direct substitution.**

| Field         | Moor                | Vessel & Co                        |
| ------------- | ------------------- | ---------------------------------- |
| Client entity | DIGITAL MARINE, LLC | VESSEL & CO [or legal entity name] |

Agency side remains: O'MARA TECHNOLOGY & DESIGN LLC.

---

## New Section Needed: Demo Disclaimer / Scope Limitation

**Type: Addition.** This is the single most important difference between the Moor contract and the Vessel & Co contract.

The Moor contract is for a production platform. The Vessel & Co contract is for a demo app with no backend. This distinction needs to be contractually explicit to avoid scope disputes.

**Recommended placement:** Either as Article 2.10 (within Scope) or as a standalone article.

**Content:**

"The Deliverables under this Agreement are limited to a demonstration mobile application. The application will contain pre-populated sample data and will not include:

- Backend database or server infrastructure
- User authentication or account management
- Persistent data storage or data synchronization
- Real-time communication or notifications
- Payment processing or billing integration
- Document upload, storage, or retrieval functionality
- Any integration with third-party services or APIs

The application is intended solely for demonstration, presentation, and investor/partner engagement purposes. It is not a production product and should not be represented to end users as functional vessel management software. Any development of production functionality would constitute a separate engagement under a new agreement."

---

## Summary: Section-by-Section Action List

| Article                    | Action                                        | Effort |
| -------------------------- | --------------------------------------------- | ------ |
| Preamble                   | Rewrite (entities, dates, WHEREAS)            | Medium |
| 1. Definitions             | Minor edits (website → mobile app)            | Low    |
| 2. Scope of Work           | Full rewrite (all subsections)                | High   |
| 3. Fees                    | Rewrite (amounts, schedule, additional costs) | Medium |
| 4. Changes                 | Minor edit (overtime rate)                    | Low    |
| 5. Client Responsibilities | Full rewrite                                  | Medium |
| 6. Accreditation           | Verbatim                                      | None   |
| 7. Confidentiality         | Verbatim                                      | None   |
| 8. Relationship            | Verbatim                                      | None   |
| 9. Warranties              | Verbatim + demo disclaimer addition           | Low    |
| 10. Indemnification        | Verbatim                                      | None   |
| 11. Termination            | Minor edit (30 days → 14 days notice)         | Low    |
| 12. IP Rights              | Verbatim                                      | None   |
| 13. Reserved Rights        | Verbatim                                      | None   |
| 14. Compliance             | Verbatim                                      | None   |
| 15. General                | Verbatim                                      | None   |
| Signature                  | Entity name swap                              | Low    |
| NEW: Demo Disclaimer       | Write from scratch                            | Medium |

---

## Resolved Decisions

All open items have been decided:

| # | Item | Decision |
|---|------|----------|
| 1 | Client legal entity name | Use "Vessel & Co LLC." Note in delivery email: if the legal name differs, let Mason know before signing for an updated version. Client address still TBD — leave as placeholder. |
| 2 | Effective date | February 13, 2025 |
| 3 | Overtime rate | $150/hr |
| 4 | Termination notice period | 14 days |
| 5 | Communication channel | Email only |
| 6 | Google Play submission | Yes, both Apple and Google Play |
| 7 | Final payment trigger | Whichever comes first: (a) successful App Store + Google Play submission, or (b) delivery for local device installation if the app hits 2+ rejections after remediation. One round of rejection feedback is included in scope; on a second rejection, pivot to local device delivery. |
