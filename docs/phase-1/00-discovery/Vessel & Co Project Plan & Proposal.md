Vessel & Co Project Plan & Proposal
Prepared for: Hannah Patten, Vessel & Co
Prepared by: Mason O'Mara, O'Mara Technology & Design
Date: Monday, Feb 9th 2025

Overview
Vessel & Co is a charter clearinghouse that coordinates yacht sales, compliance, and operational oversight out of Fort Lauderdale and the Bahamas for Caribbean itineraries. They manage maintenance, scheduling, documents, and expenses across a fleet of vessels for multiple owners. The clearinghouse work is done manually. Owners keep their own spreadsheets. Vessel & Co keeps theirs. When something changes, someone updates both. Things slip. As the operation grows, Vessel & Co needs synchronous communication between owners and the points of contact they manage at respective ports - the contacts handling maintenance, provisioning, and documentation on the ground.
To get ahead of this, the team built a prototype mobile app. It maps out exactly what the product should be: role-based dashboards for owners, managers, and crew, with screens for tasks, documents, supplies, calendar, and analytics. It looks like an app. Underneath, everything is mock data. No database, no authentication, no file storage. It cannot manage a vessel, but it does demonstrate an understanding of the final product.
Vessel & Co wants Vessel Central as a single shared system between boat owners and Vessel & Co. An owner opens the app and sees their boats - what maintenance is upcoming, what it costs. A manager assigns tasks, tracks progress, uploads inspection documents. A crew member checks what's due and marks it done. Charter calendars, crew certifications, insurance deadlines, and work orders live in one place instead of scattered files. The data is real, it persists, and everyone sees the same thing. The app is in the App Store. What remains is execution: a real backend, real authentication, real file storage, and App Store submission.

Project Options
These options are independent paths, not add-ons. Each stands alone as a way forward depending on timeline, budget, and goals.
II.i Option 1: App Store Demo
Price: $4,250
Hours: 34
Timeline: 4 weeks
Take the existing prototype, make it presentable, and submit it to the App Store. This is not a production app - it's a polished demo. Useful for showing investors, partners, or clients what Vessel Central will be. No real backend, no real data. It looks right and doesn't crash.

Deliverable
Hours
Target
UI Cleanup & Styling
15
Week 1
Crash Fixes & Screen Completion
10
Week 2
Demo Data & Placeholder Removal
4
Week 3
App Store Submission
6
Week 4

UI Cleanup & Styling: Restyle the app to match Vessel Central's brand. Design and apply brand color palette (off-white, warm tones). Remove visual indicators that this is a prototype. No "Demo Mode" badges, no placeholder phone numbers, no generic vessel names. Every screen looks intentional.
Crash Fixes & Screen Completion: Document viewer currently references fake files — it will crash. Detail screens for tasks and issues are thin or dead ends. Fix every screen a user could tap into so nothing breaks during a walkthrough. Apple tests every button; so do we. Full walkthrough on physical iOS and Android devices. Every tab, every modal, every form. Confirm nothing crashes, layouts hold across screen sizes, and the experience feels smooth.
Demo Data & Placeholder Removal: Replace mock data with realistic vessel names, maintenance logs, and maritime terminology. Seed enough content that the app feels populated. Remove hardcoded profile data (fake phone numbers, generic locations).
App Store Submission: App icons, screenshots, metadata, privacy policy, and submission to Apple and Google. Includes one round of review feedback if initially rejected.
What this is: A showpiece. Good for boat shows, pitch meetings, and proving the concept exists.
What this is not: A working product. No real accounts, no real data persistence, no backend. Users cannot actually manage vessels with this.
II.ii Option 2: Production App
Price: $10,250
Hours: 82
Timeline: 6 weeks + 2 weeks training + 30 days bug support
A new app, built from scratch with a real backend. Users create real accounts, manage real vessels, track real tasks, and upload real documents. Submitted to the App Store as a functional product. After submission, two weeks of hands-on training so the Vessel Central team can operate independently. Thirty days of bug fixes included after launch.

Deliverable
Hours
Target
Discovery & Requirements
4
Week 1
Auth & User Management
8
Week 2
Data Layer
12
Week 3
Document Upload
3
Week 3
Calendar & Scheduling
16
Week 4
UI Build
24
Week 5
Testing & Device QA
6
Week 6
App Store Submission
6
Week 6
Training & Handoff
3
Week 7
Bug Fix WIndow
Up to 6 hours
Post-launch

Discovery & Requirements: Finalize what a "task" is - fields, statuses, who can complete one. Resolve open questions: estimated vs. actual cost, recurring logic, issue vs. maintenance distinction, calendar behavior. Decisions get documented and become the build spec.
Auth & User Management: Real authentication. Hannah can create accounts or link organizations to users on the backend. Role-based access: owners see their vessels, managers see their fleets, crew see their assigned tasks. Password reset, session persistence.
Data Layer: Backend database for vessels, tasks, and documents. All create, read, update, delete operations. Tasks include: title, description, vessel, priority, due date, recurring option, issue/maintenance type, status, and cost fields. Data syncs across all users.
Document Upload: Upload, store, and retrieve vessel documents (insurance, registration, certifications). Cloudflare R2 storage. View and download in-app. Category filtering and expiry.
Calendar & Scheduling: Calendar showing tasks by due date with a list view option. One screen, two modes - not a separate calendar and tasks tab.
UI Build: Clean interfaces for each role. Styling matches Vessel Central brand. Home screen shows what matters: upcoming work, vessels, recent activity. Built for utility, not decoration.
App Store Submission: Full submission to Apple and Google including assets, metadata, and privacy policy. One round of review feedback included.
Training & Handoff: Walk Hannah's team through the app and backend. How to add users, manage organizations, handle common tasks. Documentation for reference. Goal: Vessel Central operates the app without Mason.
Bug Fix Window: Bugs reported within 30 days of App Store approval are fixed at no additional charge, up to 6 hours. Covers functional bugs only - not new features, design changes, or scope additions.
III. About Mason O’Mara
I'm a product designer who builds. My work centers on defining how products work and getting them to users - research, design, development, and launch. I've shipped 19+ client projects across apps, websites, e-commerce, and internal tools, including a yacht staffing platform that acquired 500+ users its first weekend. I understand the tradeoffs between design ideals and technical reality because I work in both. For larger or specialized needs, I bring in trusted collaborators, but the strategy, design, and core development is me.
Portfolio: omaratechnologydesign.com. Recent engagement: moorcrew.com.
IV. Considerations
App Store Timing: Apple's review process is unpredictable; approval can take days or weeks, and rejection means rework and resubmission. Timelines target submission dates. Availability in the App Store depends on Apple.
Scope: Each deliverable includes allotted revision time. Exceeding this requires a change order and additional charges. Clear decisions during discovery keep this on track.
Client Dependencies: Speed depends on timely feedback, especially during discovery and UI review. Brand assets, logos, and sample vessel data should be delivered in Week 1.
What's Not Included (all options): Payment/billing integration (handled via Mercury), marketing website, or third-party API integrations beyond document storage.
V. Next Steps
Please reply with your preferred option to schedule a call (dates in email).
Finalize proposal, project plan, and contract
Deliver all brand assets to Mason for standardization
Schedule discovery session within one week
