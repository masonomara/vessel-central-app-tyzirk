# Vessel Central Project Plan & Proposal

**Prepared for:** Hannah [LAST NAME], Vessel Central
**Prepared by:** Mason O'Mara, O'Mara Technology & Design
**Date:** [DATE]

---

## I. Overview

Vessel Central is a yacht management company that coordinates maintenance, scheduling, documents, and expenses across a fleet of vessels for multiple owners. Today, that coordination runs on spreadsheets — one set for owners and boat managers, another for Hannah's team. Information lives in two places, updates fall through the cracks, and nothing is shared in real time.

Hannah's team built a prototype app to map out what the product should be. It clarified the data model, the user roles (owner, manager, crew), and the core workflows. It did its job — the idea is crystallized. Now it needs to be built for real.

Vessel Central needs a mobile app — iOS and Android — that replaces those spreadsheets with a shared system. Owners see their vessels and costs. Managers assign and track work. Crew mark tasks complete. Documents live in one place. Everyone sees the same data.

---

## II. Project Options

These options are independent paths, not add-ons. Each stands alone as a way forward depending on timeline, budget, and goals.

### II.i Option 1: App Store Demo

**Price:** $4,250
**Hours:** 34
**Timeline:** 3 weeks

Take the existing prototype, make it presentable, and submit it to the App Store. This is not a production app — it's a polished demo. Useful for showing investors, partners, or clients what Vessel Central will be. No real backend, no real data. It looks right and doesn't crash.

| Deliverable                     | Hours | Target   |
| ------------------------------- | ----- | -------- |
| UI Cleanup & Styling            | 15    | Week 1   |
| Crash Fixes & Screen Completion | 10    | Week 1–2 |
| Demo Data & Placeholder Removal | 4     | Week 2   |
| App Store Submission            | 6     | Week 3   |

**UI Cleanup & Styling (15 hrs):** Restyle the app to match Vessel Central's brand. Apply docketadmin.com color palette (off-white, warm tones). Remove visual indicators that this is a prototype — no "Demo Mode" badges, no placeholder phone numbers, no generic vessel names. Every screen looks intentional.

**Crash Fixes & Screen Completion (10 hrs):** Document viewer currently references fake files — it will crash. Detail screens for tasks and issues are thin or dead ends. Fix every screen a user could tap into so nothing breaks during a walkthrough. Apple tests every button; so do we. Full walkthrough on physical iOS and Android devices. Every tab, every modal, every form. Confirm nothing crashes, layouts hold across screen sizes, and the experience feels smooth.

**Demo Data & Placeholder Removal (4 hrs):** Replace mock data with realistic vessel names, maintenance logs, and maritime terminology. Seed enough content that the app feels populated. Remove hardcoded profile data (fake phone numbers, generic locations).

**App Store Submission (6 hrs):** App icons, screenshots, metadata, privacy policy, and submission to Apple and Google. Includes one round of review feedback if initially rejected.

**What this is:** A showpiece. Good for boat shows, pitch meetings, and proving the concept exists.

**What this is not:** A working product. No real accounts, no real data persistence, no backend. Users cannot actually manage vessels with this.

---

### II.ii Option 2: Production App

**Price:** $[X,XXX]–$[X,XXX]
**Hours:** 140–190
**Timeline:** 10 weeks + 2 weeks training + 30 days bug support

A new app, built from scratch with a real backend. Users create real accounts, manage real vessels, track real tasks, and upload real documents. Submitted to the App Store as a functional product. After submission, two weeks of hands-on training so the Vessel Central team can operate independently. Thirty days of bug fixes included after launch.

| Deliverable                            | Hours         | Target      |
| -------------------------------------- | ------------- | ----------- |
| Discovery & Requirements               | 8–12          | Week 1      |
| Auth & User Management                 | 12–18         | Week 2–3    |
| Data Layer (Vessels, Tasks, Documents) | 30–40         | Week 3–5    |
| Document Upload                        | 10–15         | Week 5–6    |
| Calendar & Scheduling                  | 10–15         | Week 5–6    |
| UI Build (Role-Based Views)            | 25–35         | Week 3–7    |
| Testing & Device QA                    | 10–15         | Week 7–8    |
| App Store Submission                   | 8–12          | Week 8–9    |
| Training & Handoff                     | 10–15         | Week 9–10   |
| Bug Fix Window (30 days)               | Up to [X] hrs | Post-launch |

**Discovery & Requirements (4 hrs):** Finalize what a "task" is — fields, statuses, who can complete one. Resolve open questions: estimated vs. actual cost, recurring logic, issue vs. maintenance distinction, calendar behavior. Decisions get documented and become the build spec.

**Auth & User Management (12–18 hrs):** Real authentication. Hannah can create accounts or link organizations to users on the backend. Role-based access: owners see their vessels, managers see their fleets, crew see their assigned tasks. Password reset, session persistence.

**Data Layer (30–40 hrs):** Backend database for vessels, tasks, and documents. All create, read, update, delete operations. Tasks include: title, description, vessel, priority, due date, recurring option, issue/maintenance type, status, and cost fields. Data syncs across all users.

**Document Upload (10–15 hrs):** Upload, store, and retrieve vessel documents (insurance, registration, certifications). Cloudflare R2 storage. View and download in-app. Category filtering and expiry tracking.

**Calendar & Scheduling (10–15 hrs):** Calendar showing tasks by due date with a list view option. One screen, two modes — not a separate calendar and tasks tab.

**UI Build (25–35 hrs):** Clean interfaces for each role. Styling matches Vessel Central brand. Home screen shows what matters: upcoming work, vessels, recent activity. Built for utility, not decoration.

**Testing & Device QA (10–15 hrs):** Physical device testing, iOS and Android. Every flow, every edge case. Fix before submission.

**App Store Submission (8–12 hrs):** Full submission to Apple and Google including assets, metadata, and privacy policy. One round of review feedback included.

**Training & Handoff (10–15 hrs, 2 weeks post-submission):** Walk Hannah's team through the app and backend. How to add users, manage organizations, handle common tasks. Documentation for reference. Goal: Vessel Central operates the app without Mason.

**Bug Fix Window (up to [X] hrs, 30 days post-launch):** Bugs reported within 30 days of App Store approval are fixed at no additional charge, up to [X] hours. Covers functional bugs only — not new features, design changes, or scope additions.

---

### II.iii Option 3: Full-Scale Product

**Price:** $[X,XXX]–$[X,XXX]
**Hours:** 280–380
**Timeline:** 20+ weeks

Everything in Option 2, plus the infrastructure to run Vessel Central as a scalable platform. Push notifications keep users informed without opening the app. Analytics give owners real visibility into costs and maintenance trends. A web-based admin dashboard lets Hannah's team manage everything without developer support. Designed for growth — multiple organizations, dozens of vessels, hundreds of users.

| Deliverable                     | Hours   | Target     |
| ------------------------------- | ------- | ---------- |
| Option 2 (all)                  | 140–190 | Week 10    |
| Push Notifications              | 10–15   | Week 11–12 |
| Analytics & Reporting           | 20–30   | Week 12–14 |
| Admin Dashboard (Web)           | 40–55   | Week 14–18 |
| Multi-Org Scaling & Permissions | 15–20   | Week 18–19 |
| Advanced Document Management    | 10–15   | Week 19–20 |
| Training, Handoff & Bug Support | 15–20   | Week 20+   |

**Push Notifications (10–15 hrs):** Task assignments, status changes, approaching due dates, and document expirations trigger real push notifications. Users configure what they receive.

**Analytics & Reporting (20–30 hrs):** Expense trends by vessel, task completion rates, maintenance history, and cost tracking (estimated vs. actual). Exportable reports. Data owners and managers actually use to make decisions.

**Admin Dashboard (40–55 hrs):** Web application for Hannah's team. Manage organizations, users, vessels, roles, and permissions. View system-wide activity. Onboard new clients without touching code or database.

**Multi-Org Scaling & Permissions (15–20 hrs):** Support for multiple organizations with isolated data. Granular permissions beyond the three base roles. Built so Vessel Central can onboard new yacht management clients as separate tenants.

**Advanced Document Management (10–15 hrs):** Version history, bulk upload, automated expiry reminders, document templates. The difference between "we store files" and "we manage documents."

**Training, Handoff & Bug Support (15–20 hrs):** Extended training across all systems (app, admin dashboard, backend). Full documentation. 30-day bug fix window with higher hour cap to cover the larger surface area.

---

## III. Why Mason O'Mara

I'm a product designer and software engineer. I build the things I design — fewer handoffs, fewer misunderstandings, faster delivery. I assessed the existing prototype top to bottom and know exactly what's reusable and what needs rebuilding.

The prototype did the hard work of clarifying what Vessel Central needs. I'm here to build it.

Portfolio: omaratechnologydesign.com

---

## IV. Considerations

**App Store Timing:** Apple's review process is unpredictable — approval can take days or weeks, and rejection means rework and resubmission. Timelines target _submission_ dates. Availability in the App Store depends on Apple.

**Scope:** Each deliverable includes revision time. Significant scope changes (new features, new user roles, integrations not listed here) require a change order and additional charges. Clear decisions during discovery keep this on track.

**Client Dependencies:** Speed depends on timely feedback, especially during discovery and UI review. Brand assets, logos, and sample vessel data should be delivered in Week 1.

**What's Not Included (all options):** Payment/billing integration (handled via Mercury), marketing website, third-party API integrations beyond document storage.

---

## V. Next Steps

1. Reply with preferred option to schedule a kickoff call
2. Finalize proposal, project plan, and contract
3. Deliver brand assets and sample vessel/task data to Mason
4. Schedule discovery session within first week
