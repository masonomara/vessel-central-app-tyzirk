# Demo Data Implementation Plan

Scope: Replace all mock data with realistic data derived from the Purely Blu ops spreadsheet. No new features, no schema changes, no new screens. Quick wins only.

Branding ("Vessel & Co. Yacht Management") is already correct in `app.json` and `public/manifest.json`. No changes needed.

---

## Step 1: Replace Users (login.tsx)

**File**: `app/login.tsx` lines 31-74

Replace the `MOCK_USERS` array. Based on the spreadsheet's role structure (captain/manager + CC personnel/owner), use aliased names and fill in plausible crew names.

```typescript
const MOCK_USERS: MockUser[] = [
  {
    id: "owner1",
    name: "Diane Sanderson",
    email: "diane@vesselco.com",
    password: "owner123",
    role: "owner",
  },
  {
    id: "manager1",
    name: "Brett Nealson",
    email: "brett@vesselco.com",
    password: "manager123",
    role: "manager",
  },
  {
    id: "crew1",
    name: "Marcus Rivera",
    email: "marcus@vesselco.com",
    password: "crew123",
    role: "crew",
  },
  {
    id: "crew2",
    name: "Tanya Brooks",
    email: "tanya@vesselco.com",
    password: "crew123",
    role: "crew",
  },
];
```

Removes: owner2 (Emily Brown), manager2 (Tom Wilson), crew3 (Jane Smith). Two owners and two managers is unnecessary for a demo with one primary vessel. One owner, one manager, two crew is the realistic ratio for a charter cat.

**Note**: All names are aliases. The spreadsheet contains proprietary client data — real names are not used anywhere in the app.

---

## Step 2: Replace Vessels (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 91-122

```typescript
const [vessels, setVessels] = useState<Vessel[]>([
  {
    id: '1',
    name: 'Purely Blu',
    status: 'active',
    location: 'Red Hook, St. Thomas, USVI',
    crewCount: 3,
    ownerId: 'owner1',
    managerId: 'manager1',
    crewIds: ['crew1', 'crew2'],
  },
  {
    id: '2',
    name: 'Ocean Pearl',
    status: 'active',
    location: 'Nanny Cay, Tortola, BVI',
    crewCount: 2,
    ownerId: 'owner1',
    managerId: 'manager1',
    crewIds: ['crew1'],
  },
  {
    id: '3',
    name: 'Sea Breeze',
    status: 'maintenance',
    location: 'Cruz Bay, St. John, USVI',
    crewCount: 2,
    ownerId: 'owner1',
    managerId: 'manager1',
    crewIds: ['crew2'],
  },
]);
```

Key changes: Primary vessel is Purely Blu. All vessels owned by owner1 (Diane Sanderson), all managed by manager1 (Brett Nealson). Locations are real Caribbean marinas. Sea Breeze is in maintenance (haul out season). Removed owner2/manager2 references.

---

## Step 3: Replace Maintenance Tasks (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 124-367

Replace all 9 tasks. Derived directly from the spreadsheet's "Annual Maintenance Projections" section. Mix of statuses to populate all four SectionList groups (open, in_progress, waiting_on_parts, completed).

```typescript
const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
  {
    id: '1',
    title: 'Saildrive Seal Replacement',
    description: 'Replace saildrive seals on both port and starboard. Port saildrive currently has water intrusion. Starboard had water earlier in season.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: 'crew1',
    assignedToName: 'Marcus Rivera',
    assignedToType: 'crew',
    status: 'waiting_on_parts',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [
      {
        id: 'c1',
        userId: 'manager1',
        userName: 'Brett Nealson',
        userRole: 'manager',
        text: 'Seal kits ordered from Yanmar dealer in St. Thomas. ETA 2 weeks. Schedule for next haul out.',
        attachments: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    completionHistory: [],
    category: 'Mechanical',
    estimatedCost: 1200,
    notes: 'Requires haul out. Coordinate with Subbase Drydock.',
  },
  {
    id: '2',
    title: 'Blackwater Tank Meter Repair',
    description: 'Both sides blackwater tank meters not working. Always read zero regardless of tank level.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: 'crew1',
    assignedToName: 'Marcus Rivera',
    assignedToType: 'crew',
    status: 'open',
    priority: 'medium',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [],
    category: 'Plumbing',
    estimatedCost: 320,
    notes: 'Likely sensor replacement. Check wiring first.',
  },
  {
    id: '3',
    title: 'Halyard Replacement',
    description: 'Replace halyard tied to front starboard mermaid seat rail. Line is frayed at top of mast at pulley.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: null,
    assignedToName: null,
    assignedToType: null,
    status: 'open',
    priority: 'high',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [],
    category: 'Rigging',
    estimatedCost: 350,
    notes: 'Requires going up the mast. Need bosun chair and calm conditions.',
  },
  {
    id: '4',
    title: 'Ice Maker Repair',
    description: 'Ice maker runs but does not produce ice. Compressor cycles normally but no ice formation.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: 'crew2',
    assignedToName: 'Tanya Brooks',
    assignedToType: 'crew',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [
      {
        id: 'c2',
        userId: 'crew2',
        userName: 'Tanya Brooks',
        userRole: 'crew',
        text: 'Checked water inlet line — flow is fine. Suspect compressor relay or low refrigerant. Relay on order.',
        attachments: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    completionHistory: [],
    category: 'Mechanical',
    estimatedCost: 85,
    notes: 'Located behind fridge/icemaker cabinet, starboard side.',
  },
  {
    id: '5',
    title: 'Teak Cockpit Table Refinish',
    description: 'Sand and refinish teak cockpit table. Fill screw holes in bottom with marine filler — screws have been oversized and still pulled out.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: 'crew1',
    assignedToName: 'Marcus Rivera',
    assignedToType: 'crew',
    status: 'open',
    priority: 'low',
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [],
    category: 'Woodwork',
    estimatedCost: 120,
    notes: 'Use Semco teak oil after sanding. 220-grit finish.',
  },
  {
    id: '6',
    title: 'Starboard Rear Bath Hatch Re-seal',
    description: 'Starboard rear bath hatch leaks. Suspected the hatch itself needs removal and reinstallation — issue does not appear to be the seal.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: null,
    assignedToName: null,
    assignedToType: null,
    status: 'open',
    priority: 'high',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [],
    category: 'Hull/Deck',
    estimatedCost: 65,
    notes: '',
  },
  {
    id: '7',
    title: 'Zinc Anode Replacement',
    description: 'Replace all zinc anodes — saildrives, props, and hull zincs. New zincs staged in starboard hatch behind fridge/icemaker cabinet.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: 'crew1',
    assignedToName: 'Marcus Rivera',
    assignedToType: 'crew',
    status: 'completed',
    priority: 'high',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRecurring: true,
    frequency: 'quarterly',
    frequencyValue: 1,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [
      {
        id: 'ch1',
        taskId: '7',
        completedBy: 'crew1',
        completedByName: 'Marcus Rivera',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'All 12 zincs replaced. Old ones were 60-70% depleted. Hull zincs required diving.',
        attachments: [],
        cost: 480,
      },
    ],
    category: 'Mechanical',
    estimatedCost: 480,
    actualCost: 480,
    notes: 'Requires haul out for saildrive/prop zincs. Hull zincs can be done in water.',
  },
  {
    id: '8',
    title: 'External Metal Insulator Wax',
    description: 'Apply insulator wax to all external metal fittings to prevent corrosion and electrolysis.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: 'crew2',
    assignedToName: 'Tanya Brooks',
    assignedToType: 'crew',
    status: 'in_progress',
    priority: 'low',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRecurring: true,
    frequency: 'quarterly',
    frequencyValue: 1,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [],
    category: 'Hull/Deck',
    estimatedCost: 45,
    notes: 'Bow rails, stanchions, cleats, windlass housing.',
  },
  {
    id: '9',
    title: 'Mermaid Seat Replacement',
    description: 'Replace both mermaid seats. Current seats are weathered and cushion foam is degrading.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    assignedTo: null,
    assignedToName: null,
    assignedToType: null,
    status: 'open',
    priority: 'medium',
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isRecurring: false,
    createdBy: 'manager1',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
    completionHistory: [],
    category: 'Hull/Deck',
    estimatedCost: 2400,
    notes: 'Custom order. Get measurements before ordering.',
  },
]);
```

Status distribution: 4 open, 2 in_progress, 1 waiting_on_parts, 1 completed, 1 open (long-term). All populate the dashboard sections.

---

## Step 4: Replace Issues (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 369-515

Derived from spreadsheet "Open Issues by System" breakdown. Keep 5 issues, matching the current count, but with realistic content from the systems listed.

```typescript
const [issues, setIssues] = useState<Issue[]>([
  {
    id: '1',
    title: 'Port Navigation Light Intermittent',
    description: 'Port side navigation light cuts out intermittently. Checked bulb — connection appears loose at fixture base.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    reportedBy: 'crew1',
    reportedByName: 'Marcus Rivera',
    assignedTo: null,
    assignedToName: null,
    status: 'open',
    priority: 'high',
    category: 'Electrical',
    location: 'Port Side',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    attachments: [],
    comments: [
      {
        id: 'c1',
        userId: 'manager1',
        userName: 'Brett Nealson',
        userRole: 'manager',
        text: 'Safety issue — need this resolved before next charter. Check the wiring run from the panel to the fixture.',
        attachments: [],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '2',
    title: 'Salon Overhead LED Strip Flickering',
    description: 'LED strip lighting in main salon flickers when generator is running. Steady on shore power.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    reportedBy: 'crew2',
    reportedByName: 'Tanya Brooks',
    assignedTo: 'crew1',
    assignedToName: 'Marcus Rivera',
    status: 'in_progress',
    priority: 'medium',
    category: 'Lighting',
    location: 'Main Salon',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    attachments: [],
    comments: [
      {
        id: 'c2',
        userId: 'crew1',
        userName: 'Marcus Rivera',
        userRole: 'crew',
        text: 'Likely a voltage regulation issue from the generator. Testing with multimeter tomorrow.',
        attachments: [],
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '3',
    title: 'Chartplotter GPS Signal Dropping',
    description: 'Garmin chartplotter loses GPS fix every 10-15 minutes. Requires power cycle to regain signal. Antenna connections checked — appear tight.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    reportedBy: 'manager1',
    reportedByName: 'Brett Nealson',
    assignedTo: null,
    assignedToName: null,
    status: 'open',
    priority: 'high',
    category: 'Electronics',
    location: 'Helm Station',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    attachments: [],
    comments: [
      {
        id: 'c3',
        userId: 'manager1',
        userName: 'Brett Nealson',
        userRole: 'manager',
        text: 'May need antenna replacement. Called Garmin support — they suggest a firmware update first.',
        attachments: [],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: '4',
    title: 'Dinghy Outboard Pull-Start Cord Fraying',
    description: 'Pull-start cord on dinghy outboard is visibly fraying near the handle. Will snap soon if not replaced.',
    vesselId: '1',
    vesselName: 'Purely Blu',
    reportedBy: 'crew1',
    reportedByName: 'Marcus Rivera',
    assignedTo: 'crew1',
    assignedToName: 'Marcus Rivera',
    status: 'open',
    priority: 'medium',
    category: 'Dinghy',
    location: 'Dinghy',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    attachments: [],
    comments: [],
  },
  {
    id: '5',
    title: 'Bimini Stitching Coming Apart',
    description: 'Port side bimini top stitching separating along the forward seam. About 18 inches of thread pulled loose.',
    vesselId: '2',
    vesselName: 'Ocean Pearl',
    reportedBy: 'crew1',
    reportedByName: 'Marcus Rivera',
    assignedTo: null,
    assignedToName: null,
    status: 'completed',
    priority: 'medium',
    category: 'Sails/Canvas',
    location: 'Cockpit',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    attachments: [],
    comments: [
      {
        id: 'c4',
        userId: 'crew2',
        userName: 'Tanya Brooks',
        userRole: 'crew',
        text: 'Re-stitched with UV-resistant Tenara thread. Holding well.',
        attachments: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  },
]);
```

---

## Step 5: Replace Supply Requests (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 517-652

Derived from spreadsheet maintenance items and parts action statuses.

```typescript
const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([
  {
    id: '1',
    itemName: 'Saildrive Seal Kit',
    description: 'Complete seal kit for Yanmar SD60 saildrive. Need both port and starboard sets.',
    quantity: 2,
    unit: 'kits',
    estimatedCost: 1200,
    vesselId: '1',
    vesselName: 'Purely Blu',
    requestedBy: 'manager1',
    requestedByName: 'Brett Nealson',
    status: 'approved',
    priority: 'urgent',
    category: 'Mechanical Parts',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    vendor: 'Parts & Power, St. Thomas',
    notes: 'Ordered from Yanmar dealer. 2-week lead time.',
    attachments: [],
    comments: [],
  },
  {
    id: '2',
    itemName: 'Zinc Anodes',
    description: 'Replacement zinc anodes for saildrives, props, and hull. Mixed sizes.',
    quantity: 12,
    unit: 'pieces',
    estimatedCost: 480,
    actualCost: 480,
    vesselId: '1',
    vesselName: 'Purely Blu',
    requestedBy: 'crew1',
    requestedByName: 'Marcus Rivera',
    status: 'received',
    priority: 'high',
    category: 'Mechanical Parts',
    approvedBy: 'manager1',
    approvedByName: 'Brett Nealson',
    approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'All 12 received and installed.',
    attachments: [],
    comments: [],
  },
  {
    id: '3',
    itemName: 'Halyard Line - 50m Dyneema',
    description: 'Dyneema SK78 halyard line to replace frayed halyard at mast head.',
    quantity: 1,
    unit: 'roll',
    estimatedCost: 350,
    vesselId: '1',
    vesselName: 'Purely Blu',
    requestedBy: 'manager1',
    requestedByName: 'Brett Nealson',
    status: 'pending',
    priority: 'high',
    category: 'Rigging',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    notes: '12mm diameter, specify pre-stretched.',
    attachments: [],
    comments: [],
  },
  {
    id: '4',
    itemName: 'Teak Oil & Sandpaper',
    description: 'Semco teak oil (2 gallons) and 220-grit marine sandpaper assortment for cockpit table refinish.',
    quantity: 1,
    unit: 'lot',
    estimatedCost: 120,
    vesselId: '1',
    vesselName: 'Purely Blu',
    requestedBy: 'crew1',
    requestedByName: 'Marcus Rivera',
    status: 'ordered',
    priority: 'low',
    category: 'Maintenance Supplies',
    approvedBy: 'manager1',
    approvedByName: 'Brett Nealson',
    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    vendor: 'West Marine, Red Hook',
    notes: 'Semco brand preferred. Natural finish.',
    attachments: [],
    comments: [],
  },
  {
    id: '5',
    itemName: 'Ice Maker Compressor Relay',
    description: 'Replacement compressor relay for onboard ice maker. Part number pending confirmation from manufacturer.',
    quantity: 1,
    unit: 'piece',
    estimatedCost: 85,
    vesselId: '1',
    vesselName: 'Purely Blu',
    requestedBy: 'crew2',
    requestedByName: 'Tanya Brooks',
    status: 'ordered',
    priority: 'medium',
    category: 'Appliance Parts',
    approvedBy: 'manager1',
    approvedByName: 'Brett Nealson',
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Shipping from Miami. 3-5 day delivery.',
    attachments: [],
    comments: [],
  },
  {
    id: '6',
    itemName: 'Blackwater Tank Level Sensor',
    description: 'Replacement tank level sensors for port and starboard blackwater tanks.',
    quantity: 2,
    unit: 'sensors',
    estimatedCost: 320,
    vesselId: '1',
    vesselName: 'Purely Blu',
    requestedBy: 'crew1',
    requestedByName: 'Marcus Rivera',
    status: 'pending',
    priority: 'medium',
    category: 'Plumbing Parts',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    notes: 'Need to confirm sensor model/compatibility before ordering.',
    attachments: [],
    comments: [],
  },
]);
```

---

## Step 6: Replace Documents (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 654-784

Map directly from the spreadsheet's certification tracking sections.

```typescript
const [documents, setDocuments] = useState<Document[]>([
  {
    id: '1',
    title: 'Vessel Registration - Purely Blu',
    description: 'Official USCG vessel registration documentation.',
    category: 'registration',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'manager1',
    uploadedByName: 'Brett Nealson',
    uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    expiryDate: new Date('2027-03-15'),
    fileUri: 'file://documents/vessel_registration.pdf',
    fileName: 'vessel_registration_purely_blu.pdf',
    fileSize: 2048000,
    fileType: 'application/pdf',
    tags: ['legal', 'required', 'USCG'],
    isImportant: true,
    comments: [],
  },
  {
    id: '2',
    title: 'Hull & Machinery Insurance',
    description: 'Comprehensive hull and machinery insurance policy. Covers Caribbean operating area.',
    category: 'insurance',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'owner1',
    uploadedByName: 'Diane Sanderson',
    uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    expiryDate: new Date('2027-01-01'),
    fileUri: 'file://documents/hull_insurance.pdf',
    fileName: 'hull_machinery_insurance_2026.pdf',
    fileSize: 3145728,
    fileType: 'application/pdf',
    tags: ['insurance', 'required'],
    isImportant: true,
    comments: [],
  },
  {
    id: '3',
    title: 'USVI DPNR Registration',
    description: 'Department of Planning and Natural Resources vessel registration for USVI waters.',
    category: 'registration',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'manager1',
    uploadedByName: 'Brett Nealson',
    uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    expiryDate: new Date('2026-12-31'),
    fileUri: 'file://documents/dpnr_registration.pdf',
    fileName: 'usvi_dpnr_registration.pdf',
    fileSize: 1572864,
    fileType: 'application/pdf',
    tags: ['registration', 'USVI', 'required'],
    isImportant: true,
    comments: [],
  },
  {
    id: '4',
    title: 'Captain License - Brett Nealson',
    description: 'USCG Master Captain license. Required for commercial charter operations.',
    category: 'safety',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'manager1',
    uploadedByName: 'Brett Nealson',
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    expiryDate: new Date('2027-01-20'),
    fileUri: 'file://documents/captain_license.pdf',
    fileName: 'captain_license_nealson.pdf',
    fileSize: 524288,
    fileType: 'application/pdf',
    tags: ['crew', 'license', 'required'],
    isImportant: true,
    comments: [],
  },
  {
    id: '5',
    title: 'FCC Station License',
    description: 'FCC ship station license for marine radio communications.',
    category: 'registration',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'manager1',
    uploadedByName: 'Brett Nealson',
    uploadedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    expiryDate: new Date('2027-09-01'),
    fileUri: 'file://documents/fcc_license.pdf',
    fileName: 'fcc_station_license.pdf',
    fileSize: 1048576,
    fileType: 'application/pdf',
    tags: ['FCC', 'radio', 'required'],
    isImportant: false,
    comments: [],
  },
  {
    id: '6',
    title: 'Bahamas Import Permit',
    description: 'Cruising permit for Bahamian waters. Required for BVI/Bahamas charter itineraries.',
    category: 'registration',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'manager1',
    uploadedByName: 'Brett Nealson',
    uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    expiryDate: new Date('2026-06-30'),
    fileUri: 'file://documents/bahamas_permit.pdf',
    fileName: 'bahamas_import_permit.pdf',
    fileSize: 524288,
    fileType: 'application/pdf',
    tags: ['Bahamas', 'permit'],
    isImportant: false,
    comments: [],
  },
  {
    id: '7',
    title: 'Safety Manual - Purely Blu',
    description: 'Vessel safety procedures, emergency protocols, and man-overboard drills.',
    category: 'safety',
    vesselId: '1',
    vesselName: 'Purely Blu',
    uploadedBy: 'manager1',
    uploadedByName: 'Brett Nealson',
    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    fileUri: 'file://documents/safety_manual.pdf',
    fileName: 'safety_manual_purely_blu.pdf',
    fileSize: 5242880,
    fileType: 'application/pdf',
    tags: ['safety', 'manual', 'required'],
    isImportant: true,
    comments: [],
  },
]);
```

**Note on PDFs**: No. The `fileUri` values are placeholders (`file://documents/...`). The document viewer is already broken (shows "No File Available" alert on tap) and fixing it is listed under "Out of Scope" at the bottom — it requires bundling real PDF assets and adding a PDF viewer library (e.g., `react-native-pdf`). For this demo data pass, the document *metadata* (titles, expiry dates, categories, tags) is what matters. The actual file opening is a separate task.

---

## Step 7: Replace Activity Logs (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 786-829

```typescript
const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
  {
    id: '1',
    type: 'issue',
    title: 'New Issue Reported',
    description: 'Port Navigation Light Intermittent on Purely Blu',
    userId: 'crew1',
    userName: 'Marcus Rivera',
    userRole: 'crew',
    vesselId: '1',
    vesselName: 'Purely Blu',
    relatedId: '1',
    relatedType: 'issue',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'approval',
    title: 'Supply Request Approved',
    description: 'Saildrive Seal Kit approved by Diane Sanderson',
    userId: 'owner1',
    userName: 'Diane Sanderson',
    userRole: 'owner',
    vesselId: '1',
    vesselName: 'Purely Blu',
    relatedId: '1',
    relatedType: 'supply',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'Task Completed',
    description: 'Zinc Anode Replacement completed on Purely Blu',
    userId: 'crew1',
    userName: 'Marcus Rivera',
    userRole: 'crew',
    vesselId: '1',
    vesselName: 'Purely Blu',
    relatedId: '7',
    relatedType: 'maintenance',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'supply',
    title: 'Supply Received',
    description: 'Zinc Anodes (12 pack) delivered to Purely Blu',
    userId: 'crew1',
    userName: 'Marcus Rivera',
    userRole: 'crew',
    vesselId: '1',
    vesselName: 'Purely Blu',
    relatedId: '2',
    relatedType: 'supply',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    type: 'issue',
    title: 'New Issue Reported',
    description: 'Chartplotter GPS Signal Dropping on Purely Blu',
    userId: 'manager1',
    userName: 'Brett Nealson',
    userRole: 'manager',
    vesselId: '1',
    vesselName: 'Purely Blu',
    relatedId: '3',
    relatedType: 'issue',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
]);
```

---

## Step 8: Replace Notifications (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 831-872

```typescript
const [notifications, setNotifications] = useState<Notification[]>([
  {
    id: '1',
    type: 'issue',
    title: 'New Issue Reported',
    message: 'Port Navigation Light Intermittent on Purely Blu',
    userId: 'manager1',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: 'high',
  },
  {
    id: '2',
    type: 'supply',
    title: 'Supply Request Pending',
    message: 'Halyard Line - 50m Dyneema awaiting approval',
    userId: 'owner1',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    priority: 'high',
  },
  {
    id: '3',
    type: 'issue',
    title: 'New Issue Reported',
    message: 'Chartplotter GPS Signal Dropping on Purely Blu',
    userId: 'manager1',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    priority: 'high',
  },
  {
    id: '4',
    type: 'supply',
    title: 'Supply Request Pending',
    message: 'Blackwater Tank Level Sensor awaiting approval',
    userId: 'owner1',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    priority: 'medium',
  },
]);
```

---

## Step 9: Replace Expenses (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 874-987

```typescript
const [expenses, setExpenses] = useState<Expense[]>([
  {
    id: '1',
    title: 'Fuel - Port & Starboard Tanks',
    description: 'Marine diesel, full tanks at Red Hook fuel dock.',
    amount: 1850,
    category: 'Fuel',
    vesselId: '1',
    vesselName: 'Purely Blu',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    paidBy: 'manager1',
    paidByName: 'Brett Nealson',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    status: 'paid',
    attachments: [],
  },
  {
    id: '2',
    title: 'Marina Slip - March',
    description: 'Monthly slip fee at Red Hook Marina, St. Thomas.',
    amount: 2200,
    category: 'Docking',
    vesselId: '1',
    vesselName: 'Purely Blu',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    paidBy: 'manager1',
    paidByName: 'Brett Nealson',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    status: 'paid',
    attachments: [],
  },
  {
    id: '3',
    title: 'Provisioning - Charter Guests',
    description: 'Food, beverages, and consumables for 7-day charter.',
    amount: 3400,
    category: 'Provisioning',
    vesselId: '1',
    vesselName: 'Purely Blu',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    paidBy: 'manager1',
    paidByName: 'Brett Nealson',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    status: 'paid',
    attachments: [],
  },
  {
    id: '4',
    title: 'Zinc Anodes (12 pack)',
    description: 'Replacement zinc anodes for saildrives, props, and hull.',
    amount: 480,
    category: 'Maintenance',
    vesselId: '1',
    vesselName: 'Purely Blu',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    paidBy: 'crew1',
    paidByName: 'Marcus Rivera',
    approvedBy: 'manager1',
    approvedByName: 'Brett Nealson',
    status: 'paid',
    attachments: [],
  },
  {
    id: '5',
    title: 'Hull Insurance Premium',
    description: 'Annual hull and machinery insurance premium.',
    amount: 8500,
    category: 'Insurance',
    vesselId: '1',
    vesselName: 'Purely Blu',
    date: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000),
    paidBy: 'owner1',
    paidByName: 'Diane Sanderson',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    status: 'paid',
    attachments: [],
  },
  {
    id: '6',
    title: 'Captain License Renewal',
    description: 'USCG Master Captain license renewal fee.',
    amount: 300,
    category: 'Administrative',
    vesselId: '1',
    vesselName: 'Purely Blu',
    date: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
    paidBy: 'manager1',
    paidByName: 'Brett Nealson',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    status: 'paid',
    attachments: [],
  },
  {
    id: '7',
    title: 'Fuel - Tortola Run',
    description: 'Diesel refueling at Nanny Cay, Tortola after BVI charter.',
    amount: 1420,
    category: 'Fuel',
    vesselId: '2',
    vesselName: 'Ocean Pearl',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    paidBy: 'manager1',
    paidByName: 'Brett Nealson',
    approvedBy: 'owner1',
    approvedByName: 'Diane Sanderson',
    status: 'pending',
    attachments: [],
  },
]);
```

---

## Step 10: Replace Calendar Events (DataContext.tsx)

**File**: `contexts/DataContext.tsx` lines 989-1114

```typescript
const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
  {
    id: '1',
    title: 'Charter - BVI Island Hop',
    description: '7-day charter through the British Virgin Islands. Pickup Red Hook, drop-off Nanny Cay.',
    type: 'charter',
    status: 'scheduled',
    startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    allDay: true,
    vesselId: '1',
    vesselName: 'Purely Blu',
    location: 'Red Hook, St. Thomas to Nanny Cay, Tortola',
    attendees: ['crew1', 'crew2', 'manager1'],
    attendeeNames: ['Marcus Rivera', 'Tanya Brooks', 'Brett Nealson'],
    createdBy: 'manager1',
    createdByName: 'Brett Nealson',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: '6 guests. Special dietary requirements on file. Snorkel gear requested.',
    reminders: [
      { id: '1', minutes: 10080, method: 'notification' },
      { id: '2', minutes: 2880, method: 'notification' },
    ],
    comments: [],
  },
  {
    id: '2',
    title: 'Provisioning Run',
    description: 'Stock up on provisions for upcoming charter at Cost-U-Less and local markets.',
    type: 'provisioning',
    status: 'scheduled',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    allDay: false,
    vesselId: '1',
    vesselName: 'Purely Blu',
    location: 'Cost-U-Less, St. Thomas',
    attendees: ['crew2'],
    attendeeNames: ['Tanya Brooks'],
    createdBy: 'manager1',
    createdByName: 'Brett Nealson',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'Guest preference sheet attached to charter booking. No shellfish.',
    reminders: [
      { id: '3', minutes: 1440, method: 'notification' },
    ],
    comments: [],
  },
  {
    id: '3',
    title: 'Haul Out - Sea Breeze',
    description: 'Scheduled haul out for bottom paint, saildrive inspection, and hull survey.',
    type: 'maintenance',
    status: 'scheduled',
    startDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
    allDay: true,
    vesselId: '3',
    vesselName: 'Sea Breeze',
    location: 'Subbase Drydock, St. Thomas',
    attendees: ['crew1', 'manager1'],
    attendeeNames: ['Marcus Rivera', 'Brett Nealson'],
    createdBy: 'manager1',
    createdByName: 'Brett Nealson',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'Coordinate saildrive seal replacement during haul out.',
    reminders: [
      { id: '4', minutes: 10080, method: 'notification' },
      { id: '5', minutes: 1440, method: 'notification' },
    ],
    relatedTaskId: '1',
    comments: [],
  },
  {
    id: '4',
    title: 'Safety Inspection',
    description: 'Annual USCG safety equipment inspection. All safety gear must be aboard and current.',
    type: 'inspection',
    status: 'scheduled',
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    allDay: false,
    vesselId: '1',
    vesselName: 'Purely Blu',
    location: 'Red Hook Marina, St. Thomas',
    attendees: ['manager1', 'crew1'],
    attendeeNames: ['Brett Nealson', 'Marcus Rivera'],
    createdBy: 'manager1',
    createdByName: 'Brett Nealson',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'Verify all fire extinguisher tags, PFD count, flare expiry, EPIRB registration.',
    reminders: [
      { id: '6', minutes: 1440, method: 'notification' },
    ],
    comments: [],
  },
  {
    id: '5',
    title: 'Crew Change - Deckhand Rotation',
    description: 'Marcus off for 2 weeks. Temporary deckhand arriving from St. Croix.',
    type: 'crew_change',
    status: 'scheduled',
    startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    allDay: true,
    vesselId: '1',
    vesselName: 'Purely Blu',
    location: 'Red Hook, St. Thomas',
    attendees: ['manager1'],
    attendeeNames: ['Brett Nealson'],
    createdBy: 'manager1',
    createdByName: 'Brett Nealson',
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Need to update vessel crew manifest and brief on emergency procedures.',
    reminders: [
      { id: '7', minutes: 1440, method: 'notification' },
    ],
    comments: [],
  },
]);
```

---

## Step 11: Fix Profile Hardcoded Values (profile.tsx)

**File**: `app/profile.tsx` lines 111-113

Replace hardcoded strings with context-derived values. This requires reading from AuthContext.

Current:

```tsx
<DetailRow label="Email" value="user@example.com" inline />
<DetailRow label="Phone" value="+1 (555) 123-4567" inline />
<DetailRow label="Location" value="San Francisco, CA" inline />
```

Replacement approach: Create a simple lookup map at the top of the component that maps userId to contact info, then reference it.

```tsx
// Add inside the component, after useAuth() call:
const USER_PROFILES: Record<string, { email: string; phone: string; location: string }> = {
  owner1: { email: 'diane@vesselco.com', phone: '+1 (340) 775-1001', location: 'St. Thomas, USVI' },
  manager1: { email: 'brett@vesselco.com', phone: '+1 (340) 775-1002', location: 'St. Thomas, USVI' },
  crew1: { email: 'marcus@vesselco.com', phone: '+1 (340) 775-1003', location: 'St. Thomas, USVI' },
  crew2: { email: 'tanya@vesselco.com', phone: '+1 (340) 775-1004', location: 'St. Thomas, USVI' },
};

const profile = USER_PROFILES[userId || ''] || {
  email: userName ? `${userName.split(' ')[0].toLowerCase()}@vesselco.com` : 'user@vesselco.com',
  phone: '+1 (340) 775-1000',
  location: 'St. Thomas, USVI',
};
```

Then replace the three DetailRow lines:

```tsx
<DetailRow label="Email" value={profile.email} inline />
<DetailRow label="Phone" value={profile.phone} inline />
<DetailRow label="Location" value={profile.location} inline />
```

This handles both predefined demo users and custom member-setup users with sensible defaults.

---

## Step 12: Fix Member Setup Phone Placeholder (member-setup.tsx)

**File**: `app/member-setup.tsx` line 143

Change:

```tsx
placeholder="+1 (555) 123-4567"
```

To:

```tsx
placeholder="+1 (340) 555-0100"
```

340 is the USVI area code — matches the demo's Caribbean setting.

---

## Step 13: Bump DATA_VERSION (DataContext.tsx)

**File**: `contexts/DataContext.tsx` line 88

```typescript
const DATA_VERSION = 3;
```

Bumping from 2 to 3 forces a data reset on existing installs so users see the new demo data instead of stale AsyncStorage cache.

---

## Todo List

### Phase 1: Users & Auth (Steps 1, 13)

Foundation layer. Everything else references user IDs and names, so this goes first.

- [x] **1.1** Replace `MOCK_USERS` array in `app/login.tsx` (lines 31-74)
  - Remove owner2, manager2, crew3
  - Add: Diane Sanderson (owner1), Brett Nealson (manager1), Marcus Rivera (crew1), Tanya Brooks (crew2)
  - Update emails to match new names
- [x] **1.2** Bump `DATA_VERSION` from 2 to 3 in `contexts/DataContext.tsx` (line 88)
  - Forces data reset on existing installs
- [x] **1.3** Verify login screen renders correctly with 4 quick-login buttons instead of 6
- [x] **1.4** Test each quick-login role routes to the correct dashboard tab

### Phase 2: Vessels (Step 2)

Vessel IDs and names cascade into every other entity. Must be done before tasks/issues/supplies.

- [x] **2.1** Replace vessels array in `contexts/DataContext.tsx` (lines 91-122)
  - Vessel 1: Purely Blu, Red Hook, St. Thomas, USVI, active
  - Vessel 2: Ocean Pearl, Nanny Cay, Tortola, BVI, active
  - Vessel 3: Sea Breeze, Cruz Bay, St. John, USVI, maintenance
  - All vessels: ownerId=owner1, managerId=manager1
- [x] **2.2** Verify owner dashboard shows all 3 vessels
- [x] **2.3** Verify manager dashboard shows all 3 vessels
- [x] **2.4** Verify crew dashboards show only vessels where crewIds includes their ID
- [x] **2.5** Verify vessel-detail screen renders correctly for each vessel

### Phase 3: Maintenance Tasks (Step 3)

Largest data block. 9 tasks derived from spreadsheet maintenance projections.

- [x] **3.1** Replace maintenanceTasks array in `contexts/DataContext.tsx` (lines 124-367)
  - 9 tasks total: 4 open, 2 in_progress, 1 waiting_on_parts, 1 completed, 1 open (long-term)
  - All tasks use new user names (Marcus Rivera, Tanya Brooks, Brett Nealson)
  - All vesselName values match new vessel names
  - Completed task (Zinc Anode) has completionHistory with cost
  - Waiting task (Saildrive Seal) has comment from manager
  - In-progress task (Ice Maker) has comment from crew
- [x] **3.2** Verify maintenance tab SectionList has items in all 4 status groups
- [x] **3.3** Verify maintenance-detail screen renders correctly (tap into Zinc Anode to confirm completion history)
- [x] **3.4** Verify maintenance-detail screen renders comments (tap into Saildrive Seal)
- [x] **3.5** Verify owner dashboard maintenance summary counts are correct
- [x] **3.6** Verify crew dashboard shows only tasks assigned to logged-in crew member

### Phase 4: Issues (Step 4)

5 issues derived from spreadsheet "Open Issues by System" breakdown.

- [x] **4.1** Replace issues array in `contexts/DataContext.tsx` (lines 369-515)
  - 5 issues: 3 open, 1 in_progress, 1 completed
  - Categories from spreadsheet: Electrical, Lighting, Electronics, Dinghy, Sails/Canvas
  - All user references use new aliased names
  - Comments on issues 1-3 and 5
- [x] **4.2** Verify issues tab SectionList populates correctly
- [x] **4.3** Verify issue-detail screen renders comments thread
- [x] **4.4** Verify manager dashboard shows open issues count

### Phase 5: Supply Requests (Step 5)

6 supply requests tied to maintenance task parts needs.

- [x] **5.1** Replace supplyRequests array in `contexts/DataContext.tsx` (lines 517-652)
  - 6 requests: 2 pending, 2 ordered, 1 approved, 1 received
  - Categories: Mechanical Parts, Rigging, Maintenance Supplies, Appliance Parts, Plumbing Parts
  - Vendors where applicable (Parts & Power, West Marine)
  - All user references use new aliased names
- [x] **5.2** Verify supplies tab SectionList populates all status groups
- [x] **5.3** Verify supply-detail screen renders correctly
- [x] **5.4** Verify manager dashboard shows pending supply approvals
- [x] **5.5** Verify owner dashboard shows pending supply approvals

### Phase 6: Documents (Step 6)

7 documents mapped from spreadsheet certification tracking sections.

- [x] **6.1** Replace documents array in `contexts/DataContext.tsx` (lines 654-784)
  - 7 documents across categories: registration (4), insurance (1), safety (2)
  - Expiry dates from spreadsheet where available
  - fileUri values remain as placeholders (file://documents/...) — PDF bundling is out of scope
  - All user references use new aliased names
- [x] **6.2** Verify documents tab groups documents by category correctly
- [x] **6.3** Verify document-detail screen renders metadata (title, expiry, tags)
- [x] **6.4** Confirm documents tab only visible for owner role

### Phase 7: Activity Logs & Notifications (Steps 7-8)

Lightweight data that references entities created in Phases 3-6.

- [x] **7.1** Replace activityLogs array in `contexts/DataContext.tsx` (lines 786-829)
  - 5 log entries referencing new entity names and user aliases
  - Types: issue (2), approval (1), maintenance (1), supply (1)
  - Timestamps spread across last 10 days
- [x] **7.2** Replace notifications array in `contexts/DataContext.tsx` (lines 831-872)
  - 4 notifications: 2 for manager1, 2 for owner1
  - Reference new issue/supply names
- [x] **7.3** Verify owner dashboard activity feed shows recent entries
- [x] **7.4** Verify manager dashboard activity feed shows recent entries

### Phase 8: Expenses (Step 9)

7 expenses with realistic Caribbean charter costs.

- [x] **8.1** Replace expenses array in `contexts/DataContext.tsx` (lines 874-987)
  - 7 expenses: Fuel (2), Docking, Provisioning, Maintenance, Insurance, Administrative
  - All user references use new aliased names
  - Mix of statuses: 5 paid, 1 pending, 0 approved (for dashboard variety)
- [x] **8.2** Verify analytics screen chart renders with new expense data
- [x] **8.3** Verify owner dashboard expense summary is correct

### Phase 9: Calendar Events (Step 10)

5 events using Caribbean locations and charter-season context.

- [x] **9.1** Replace calendarEvents array in `contexts/DataContext.tsx` (lines 989-1114)
  - 5 events: charter, provisioning, maintenance (haul out), inspection, crew_change
  - All locations are Caribbean (Red Hook, Nanny Cay, Subbase Drydock, Cost-U-Less)
  - All user references use new aliased names
  - Haul out event links to saildrive seal task via relatedTaskId
- [x] **9.2** Verify calendar month view shows event dots on correct dates
- [x] **9.3** Verify tapping a date shows the event list for that day
- [x] **9.4** Verify calendar-event-detail screen renders correctly

### Phase 10: Profile & Member Setup (Steps 11-12)

Quick fixes to hardcoded UI values.

- [x] **10.1** Add USER_PROFILES lookup map inside profile component in `app/profile.tsx`
  - Map owner1, manager1, crew1, crew2 to email/phone/location
  - Fallback for custom member-setup users
- [x] **10.2** Replace 3 hardcoded DetailRow values with dynamic `profile.*` references in `app/profile.tsx` (lines 111-113)
- [x] **10.3** Change phone placeholder in `app/member-setup.tsx` (line 143) from `+1 (555) 123-4567` to `+1 (340) 555-0100`
- [x] **10.4** Verify profile screen shows correct data for each demo user role
- [x] **10.5** Verify member-setup screen shows updated placeholder

### Phase 11: Full Walkthrough Verification

End-to-end check after all data is in place.

- [x] **11.1** Log in as owner (Diane Sanderson) — verify dashboard, vessels, documents, calendar, analytics, profile
- [x] **11.2** Log in as manager (Brett Nealson) — verify dashboard, maintenance, issues, supplies, calendar, profile
- [x] **11.3** Log in as crew (Marcus Rivera) — verify dashboard, assigned tasks only, issues, supplies, calendar, profile
- [x] **11.4** Log in as crew (Tanya Brooks) — verify different assigned tasks appear vs Marcus
- [x] **11.5** Confirm no references to old names remain (John Smith, Emily Brown, Sarah Johnson, Tom Wilson, Mike Davis, Jane Smith, Sarah Williams)
- [x] **11.6** Confirm no references to old locations remain (Monaco, Miami, "Caribbean Marina")
- [x] **11.7** Confirm no references to old vessel name "Azure Dream" remain in any visible UI
- [x] **11.8** Clear AsyncStorage / reinstall to confirm DATA_VERSION bump triggers fresh data load

---

## Out of Scope

- Document viewer fix (fake `file://` URIs — needs bundled PDFs and a PDF viewer library)
- Engine hours tracking (new feature, not in current data model)
- Crew certification tracking (new feature)
- Safety/recreational equipment inventory (new feature)
- Contact directory (new feature)
- Custom priority taxonomy (schema change)
- Charter log (new feature)
