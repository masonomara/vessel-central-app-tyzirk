
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MaintenanceTask,
  Issue,
  SupplyRequest,
  Document,
  ActivityLog,
  Notification,
  Vessel,
  Expense,
  CompletionRecord,
  Attachment,
  Comment,
  CalendarEvent,
  EngineHourLog,
  Contact,
  CrewCertification,
  CharterLog,
  Equipment,
} from '../types';

interface DataContextType {
  vessels: Vessel[];
  maintenanceTasks: MaintenanceTask[];
  issues: Issue[];
  supplyRequests: SupplyRequest[];
  documents: Document[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  expenses: Expense[];
  calendarEvents: CalendarEvent[];
  
  getVesselsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Vessel[];
  getMaintenanceTasksForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => MaintenanceTask[];
  getIssuesForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Issue[];
  getSupplyRequestsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => SupplyRequest[];
  getDocumentsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Document[];
  getActivityLogsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => ActivityLog[];
  getNotificationsForUser: (userId: string) => Notification[];
  getExpensesForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Expense[];
  getCalendarEventsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => CalendarEvent[];
  
  updateVessel: (id: string, updates: Partial<Vessel>) => void;
  assignOwnerToVessel: (vesselId: string, ownerId: string, ownerName: string) => void;
  removeOwnerFromVessel: (vesselId: string) => void;
  assignCrewToVessel: (vesselId: string, crewId: string, crewName: string) => void;
  removeCrewFromVessel: (vesselId: string, crewId: string) => void;
  
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  deleteMaintenanceTask: (id: string) => void;
  completeMaintenanceTask: (id: string, record: Omit<CompletionRecord, 'id' | 'taskId'>) => void;
  addMaintenanceComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  addIssueComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  
  addSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplyRequest: (id: string, updates: Partial<SupplyRequest>) => void;
  approveSupplyRequest: (id: string, approvedBy: string, approvedByName: string) => void;
  denySupplyRequest: (id: string, reason: string) => void;
  addSupplyComment: (requestId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  addDocument: (document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  addDocumentComment: (docId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addCalendarEventComment: (eventId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  engineHourLogs: EngineHourLog[];
  getEngineHourLogsForVessel: (vesselId: string) => EngineHourLog[];
  updateEngineHours: (vesselId: string, newHours: number, userId: string, userName: string, userRole: string, notes: string) => void;

  contacts: Contact[];
  getContactsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  certifications: CrewCertification[];
  getCertificationsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => CrewCertification[];
  addCertification: (cert: Omit<CrewCertification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertification: (id: string, updates: Partial<CrewCertification>) => void;
  deleteCertification: (id: string) => void;

  charterLogs: CharterLog[];
  getCharterLogsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => CharterLog[];
  addCharterLog: (log: Omit<CharterLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCharterLog: (id: string, updates: Partial<CharterLog>) => void;
  deleteCharterLog: (id: string) => void;
  addCharterLogComment: (logId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  equipment: Equipment[];
  getEquipmentForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Equipment[];
  addEquipment: (item: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addEquipmentComment: (equipmentId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = '@vessel_co_data';
const DATA_VERSION = 5;

const VESSEL_IMAGES: Record<string, number> = {
  '1': require('../assets/vessels/yacht-1.jpg'),
  '2': require('../assets/vessels/yacht-2.jpg'),
  '3': require('../assets/vessels/yacht-3.webp'),
};

export function DataProvider({ children }: { children: ReactNode }) {
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
      engineHours: 1247,
      image: require('../assets/vessels/yacht-1.jpg'),
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
      engineHours: 892,
      image: require('../assets/vessels/yacht-2.jpg'),
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
      engineHours: 2034,
      image: require('../assets/vessels/yacht-3.webp'),
    },
  ]);

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

  const [engineHourLogs, setEngineHourLogs] = useState<EngineHourLog[]>([
    {
      id: 'eh1',
      vesselId: '1',
      vesselName: 'Purely Blu',
      previousHours: 1200,
      newHours: 1247,
      updatedBy: 'crew1',
      updatedByName: 'Marcus Rivera',
      notes: 'Post-charter check',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'eh2',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      previousHours: 870,
      newHours: 892,
      updatedBy: 'crew1',
      updatedByName: 'Marcus Rivera',
      notes: 'After Tortola run',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'c1',
      name: 'Marcus Rivera',
      role: 'Deckhand / Engineer',
      contactType: 'crew',
      phone: '+1 340-555-0101',
      email: 'marcus@vesselco.com',
      vesselIds: ['1', '2'],
      vesselNames: ['Purely Blu', 'Ocean Pearl'],
      notes: 'Primary crew on Purely Blu',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'c2',
      name: 'Tanya Brooks',
      role: 'Stewardess / Cook',
      contactType: 'crew',
      phone: '+1 340-555-0102',
      email: 'tanya@vesselco.com',
      vesselIds: ['1', '3'],
      vesselNames: ['Purely Blu', 'Sea Breeze'],
      notes: 'Level 2 food hygiene certified',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'c3',
      name: 'Island Marine Services',
      role: 'Marine Mechanic',
      contactType: 'vendor',
      phone: '+1 340-555-0200',
      email: 'service@islandmarine.vi',
      company: 'Island Marine Services LLC',
      vesselIds: ['1', '2', '3'],
      vesselNames: ['Purely Blu', 'Ocean Pearl', 'Sea Breeze'],
      notes: 'Primary vendor for engine and saildrive work',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'c4',
      name: 'Crown Bay Marina',
      role: 'Dockmaster',
      contactType: 'marina',
      phone: '+1 340-555-0300',
      email: 'dock@crownbay.vi',
      company: 'Crown Bay Marina',
      vesselIds: ['1'],
      vesselNames: ['Purely Blu'],
      notes: 'Slip B-14. Monthly rate negotiated through Dec 2026.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'c5',
      name: 'VISAR',
      role: 'Search & Rescue',
      contactType: 'emergency',
      phone: '+1 340-555-0911',
      email: 'ops@visar.vi',
      vesselIds: ['1', '2', '3'],
      vesselNames: ['Purely Blu', 'Ocean Pearl', 'Sea Breeze'],
      notes: 'Virgin Islands Search and Rescue. VHF Ch 16.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [certifications, setCertifications] = useState<CrewCertification[]>([
    {
      id: 'cert1',
      crewId: 'crew1',
      crewName: 'Marcus Rivera',
      certType: 'STCW Basic Safety',
      issuingAuthority: 'USCG',
      certificateNumber: 'STCW-2024-4471',
      issueDate: new Date('2024-06-15'),
      expiryDate: new Date('2029-06-15'),
      vesselId: '1',
      vesselName: 'Purely Blu',
      notes: '',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'cert2',
      crewId: 'crew1',
      crewName: 'Marcus Rivera',
      certType: 'Powerboat Level 2',
      issuingAuthority: 'RYA',
      certificateNumber: 'PB2-2023-1189',
      issueDate: new Date('2023-03-10'),
      expiryDate: new Date('2027-03-10'),
      vesselId: '1',
      vesselName: 'Purely Blu',
      notes: '',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'cert3',
      crewId: 'crew1',
      crewName: 'Marcus Rivera',
      certType: 'First Aid / CPR',
      issuingAuthority: 'Red Cross',
      issueDate: new Date('2024-08-01'),
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      vesselId: '1',
      vesselName: 'Purely Blu',
      notes: 'Renewal scheduled',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'cert4',
      crewId: 'crew2',
      crewName: 'Tanya Brooks',
      certType: 'STCW Basic Safety',
      issuingAuthority: 'USCG',
      certificateNumber: 'STCW-2024-5512',
      issueDate: new Date('2024-04-01'),
      expiryDate: new Date('2029-04-01'),
      vesselId: '1',
      vesselName: 'Purely Blu',
      notes: '',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'cert5',
      crewId: 'crew2',
      crewName: 'Tanya Brooks',
      certType: 'ENG1 Medical',
      issuingAuthority: 'MCA',
      issueDate: new Date('2023-09-15'),
      expiryDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      vesselId: '1',
      vesselName: 'Purely Blu',
      notes: 'EXPIRED - renewal overdue',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'cert6',
      crewId: 'crew2',
      crewName: 'Tanya Brooks',
      certType: 'Food Hygiene Level 2',
      issuingAuthority: 'Highfield',
      issueDate: new Date('2025-01-10'),
      expiryDate: new Date('2028-01-10'),
      vesselId: '1',
      vesselName: 'Purely Blu',
      notes: '',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [charterLogs, setCharterLogs] = useState<CharterLog[]>([
    {
      id: 'ch1',
      title: 'BVI Island Hop',
      vesselId: '1',
      vesselName: 'Purely Blu',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      guestCount: 6,
      guestNames: 'Johnson family',
      itinerary: 'St. Thomas > Jost Van Dyke > Norman Island > Virgin Gorda > St. Thomas',
      departurePort: 'Red Hook, St. Thomas',
      arrivalPort: 'Red Hook, St. Thomas',
      revenue: 18000,
      expenses: 3200,
      brokerName: 'Caribbean Charter Co.',
      brokerCommission: 2700,
      notes: 'Smooth trip. Guests requested same dates next year.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'ch2',
      title: 'St. Thomas Day Charter',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      guestCount: 4,
      itinerary: 'Crown Bay > Christmas Cove > Honeymoon Beach > Crown Bay',
      departurePort: 'Crown Bay, St. Thomas',
      arrivalPort: 'Crown Bay, St. Thomas',
      revenue: 4500,
      expenses: 800,
      notes: 'Guests allergic to shellfish - coordinate provisions.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'ch3',
      title: 'USVI Week Charter',
      vesselId: '1',
      vesselName: 'Purely Blu',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      guestCount: 8,
      guestNames: 'Williams party',
      itinerary: 'Red Hook > St. John > Buck Island > St. Croix > Red Hook',
      departurePort: 'Red Hook, St. Thomas',
      arrivalPort: 'Red Hook, St. Thomas',
      revenue: 28000,
      expenses: 5500,
      brokerName: 'Horizon Yachts',
      brokerCommission: 4200,
      specialRequests: 'Dive gear for 4, paddleboards, sunset cocktail setup each evening',
      notes: 'High-value repeat client. Confirm provisioning 48hrs prior.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'ch4',
      title: 'Private Sunset Cruise',
      vesselId: '3',
      vesselName: 'Sea Breeze',
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      status: 'completed',
      guestCount: 2,
      itinerary: 'Cruz Bay > Caneel Bay > Cruz Bay',
      departurePort: 'Cruz Bay, St. John',
      arrivalPort: 'Cruz Bay, St. John',
      revenue: 1200,
      expenses: 200,
      notes: 'Anniversary celebration. Provided champagne + cheese board.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      comments: [],
    },
  ]);

  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 'eq1',
      name: 'Life Jackets (Adult)',
      description: 'Type I offshore PFDs, USCG approved',
      category: 'safety',
      vesselId: '1',
      vesselName: 'Purely Blu',
      quantity: 12,
      condition: 'good',
      manufacturer: 'Mustang Survival',
      lastInspectionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextInspectionDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
      location: 'Cockpit lazarette',
      notes: 'Replaced 4 units in January',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq2',
      name: 'EPIRB',
      description: 'ACR GlobalFix V4 emergency position indicating radio beacon',
      category: 'safety',
      vesselId: '1',
      vesselName: 'Purely Blu',
      quantity: 1,
      condition: 'good',
      manufacturer: 'ACR Electronics',
      model: 'GlobalFix V4',
      serialNumber: 'ACR-2024-77831',
      lastInspectionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextInspectionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      location: 'Helm station',
      notes: 'Battery replacement due 2027',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq3',
      name: 'Fire Extinguishers',
      description: 'ABC dry chemical, 5lb portable units',
      category: 'safety',
      vesselId: '1',
      vesselName: 'Purely Blu',
      quantity: 6,
      condition: 'fair',
      manufacturer: 'Kidde',
      lastInspectionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'Galley, engine room, salon, each cabin',
      notes: '2 units due for annual service tag',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq4',
      name: 'Paddleboards',
      description: 'Inflatable SUP boards with paddles and pump',
      category: 'water_toys',
      vesselId: '1',
      vesselName: 'Purely Blu',
      quantity: 2,
      condition: 'good',
      manufacturer: 'Red Paddle Co',
      location: 'Foredeck locker',
      notes: '',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq5',
      name: 'Snorkel Sets',
      description: 'Mask, snorkel, and fins combo sets',
      category: 'water_toys',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      quantity: 8,
      condition: 'fair',
      location: 'Swim platform locker',
      notes: '2 masks have scratched lenses - replace next provisioning',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq6',
      name: 'Kayak',
      description: 'Two-person sit-on-top kayak',
      category: 'water_toys',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      quantity: 1,
      condition: 'poor',
      manufacturer: 'Ocean Kayak',
      location: 'Davits',
      notes: 'Hull crack on starboard side. Needs replacement.',
      createdBy: 'crew1',
      createdByName: 'Marcus Rivera',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq7',
      name: 'Radar',
      description: 'Garmin GMR Fantom 24 radome radar',
      category: 'navigation',
      vesselId: '3',
      vesselName: 'Sea Breeze',
      quantity: 1,
      condition: 'good',
      manufacturer: 'Garmin',
      model: 'GMR Fantom 24',
      serialNumber: 'GRM-2023-44219',
      location: 'Mast mount',
      notes: '',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq8',
      name: 'Flare Kit',
      description: 'SOLAS-approved distress flare pack',
      category: 'safety',
      vesselId: '3',
      vesselName: 'Sea Breeze',
      quantity: 1,
      condition: 'needs_replacement',
      lastInspectionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      location: 'Helm station cabinet',
      notes: 'Flares expired last month. Order replacement set.',
      createdBy: 'crew2',
      createdByName: 'Tanya Brooks',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq9',
      name: 'VHF Radio',
      description: 'Fixed-mount DSC VHF marine radio',
      category: 'communication',
      vesselId: '1',
      vesselName: 'Purely Blu',
      quantity: 2,
      condition: 'good',
      manufacturer: 'Standard Horizon',
      model: 'GX6000',
      location: 'Helm station + nav station',
      notes: 'Both units programmed with MMSI',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      comments: [],
    },
    {
      id: 'eq10',
      name: 'Dinghy',
      description: 'AB Inflatables 10ft RIB with 15hp Yamaha',
      category: 'tender',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      quantity: 1,
      condition: 'fair',
      manufacturer: 'AB Inflatables',
      location: 'Davits',
      notes: 'Outboard service due at 100 hours. Currently at 87.',
      createdBy: 'manager1',
      createdByName: 'Brett Nealson',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      comments: [],
    },
  ]);

  // Use ref to track if data has been loaded
  const hasLoadedData = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    if (hasLoadedData.current) {
      return;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);

        if (!parsed._version || parsed._version < DATA_VERSION) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          hasLoadedData.current = true;
          return;
        }

        if (parsed.vessels) {
          setVessels(parsed.vessels.map((v: Vessel) => ({
            ...v,
            image: VESSEL_IMAGES[v.id] ?? v.image,
          })));
        }

        if (parsed.maintenanceTasks) {
          setMaintenanceTasks(parsed.maintenanceTasks.map((task: MaintenanceTask) => ({
            ...task,
            category: task.category || '',
            dueDate: new Date(task.dueDate),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
            nextDueDate: task.nextDueDate ? new Date(task.nextDueDate) : undefined,
          })));
        }

        if (parsed.issues) {
          setIssues(parsed.issues.map((issue: Issue) => ({
            ...issue,
            createdAt: new Date(issue.createdAt),
            updatedAt: new Date(issue.updatedAt),
            resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
          })));
        }

        if (parsed.supplyRequests) {
          setSupplyRequests(parsed.supplyRequests.map((req: SupplyRequest) => ({
            ...req,
            createdAt: new Date(req.createdAt),
            updatedAt: new Date(req.updatedAt),
            approvedAt: req.approvedAt ? new Date(req.approvedAt) : undefined,
            receivedAt: req.receivedAt ? new Date(req.receivedAt) : undefined,
          })));
        }

        if (parsed.documents) {
          setDocuments(parsed.documents.map((doc: Document) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
          })));
        }

        if (parsed.activityLogs) {
          setActivityLogs(parsed.activityLogs.map((log: ActivityLog) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })));
        }

        if (parsed.notifications) {
          setNotifications(parsed.notifications.map((notif: Notification) => ({
            ...notif,
            createdAt: new Date(notif.createdAt),
          })));
        }

        if (parsed.expenses) {
          setExpenses(parsed.expenses.map((exp: Expense) => ({
            ...exp,
            date: new Date(exp.date),
          })));
        }

        if (parsed.calendarEvents) {
          setCalendarEvents(parsed.calendarEvents.map((event: CalendarEvent) => ({
            ...event,
            comments: event.comments || [],
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
          })));
        }

        if (parsed.engineHourLogs) {
          setEngineHourLogs(parsed.engineHourLogs.map((log: EngineHourLog) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })));
        }

        if (parsed.contacts) {
          setContacts(parsed.contacts.map((c: Contact) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })));
        }

        if (parsed.certifications) {
          setCertifications(parsed.certifications.map((c: CrewCertification) => ({
            ...c,
            issueDate: new Date(c.issueDate),
            expiryDate: new Date(c.expiryDate),
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })));
        }

        if (parsed.charterLogs) {
          setCharterLogs(parsed.charterLogs.map((c: CharterLog) => ({
            ...c,
            comments: c.comments || [],
            startDate: new Date(c.startDate),
            endDate: new Date(c.endDate),
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })));
        }

        if (parsed.equipment) {
          setEquipment(parsed.equipment.map((e: Equipment) => ({
            ...e,
            comments: e.comments || [],
            purchaseDate: e.purchaseDate ? new Date(e.purchaseDate) : undefined,
            lastInspectionDate: e.lastInspectionDate ? new Date(e.lastInspectionDate) : undefined,
            nextInspectionDate: e.nextInspectionDate ? new Date(e.nextInspectionDate) : undefined,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
          })));
        }
      }

      hasLoadedData.current = true;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const saveData = useCallback(async () => {
    if (!hasLoadedData.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const data = {
          _version: DATA_VERSION,
          vessels,
          maintenanceTasks,
          issues,
          supplyRequests,
          documents,
          activityLogs,
          notifications,
          expenses,
          calendarEvents,
          engineHourLogs,
          contacts,
          certifications,
          charterLogs,
          equipment,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }, 1000);
  }, [vessels, maintenanceTasks, issues, supplyRequests, documents, activityLogs, notifications, expenses, calendarEvents, engineHourLogs, contacts, certifications, charterLogs, equipment]);

  // Load data from storage on mount only
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data whenever it changes (debounced)
  useEffect(() => {
    saveData();
  }, [saveData, calendarEvents]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Filtering functions based on user role and vessel access
  const getVesselsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Vessel[] => {
    if (userRole === 'owner') {
      return vessels.filter(v => v.ownerId === userId);
    } else if (userRole === 'manager') {
      return vessels.filter(v => v.managerId === userId);
    } else if (userRole === 'crew') {
      return vessels.filter(v => v.crewIds?.includes(userId));
    }
    return [];
  };

  const getMaintenanceTasksForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): MaintenanceTask[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    
    if (userRole === 'crew') {
      return maintenanceTasks.filter(t => 
        vesselIds.includes(t.vesselId) && t.assignedTo === userId
      );
    }
    
    return maintenanceTasks.filter(t => vesselIds.includes(t.vesselId));
  };

  const getIssuesForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Issue[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    
    if (userRole === 'crew') {
      return issues.filter(i => 
        vesselIds.includes(i.vesselId) && 
        (i.reportedBy === userId || i.assignedTo === userId)
      );
    }
    
    return issues.filter(i => vesselIds.includes(i.vesselId));
  };

  const getSupplyRequestsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): SupplyRequest[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    
    if (userRole === 'crew') {
      return supplyRequests.filter(s => 
        vesselIds.includes(s.vesselId) && s.requestedBy === userId
      );
    }
    
    return supplyRequests.filter(s => vesselIds.includes(s.vesselId));
  };

  const getDocumentsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Document[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    return documents.filter(d => vesselIds.includes(d.vesselId));
  };

  const getActivityLogsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): ActivityLog[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    return activityLogs.filter(a => a.vesselId && vesselIds.includes(a.vesselId));
  };

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications.filter(n => n.userId === userId);
  };

  const getExpensesForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Expense[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    return expenses.filter(e => vesselIds.includes(e.vesselId));
  };

  const getCalendarEventsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): CalendarEvent[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    
    if (userRole === 'crew') {
      return calendarEvents.filter(e => 
        vesselIds.includes(e.vesselId) && e.attendees.includes(userId)
      );
    }
    
    return calendarEvents.filter(e => vesselIds.includes(e.vesselId));
  };

  // Maintenance Task functions
  const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: MaintenanceTask = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMaintenanceTasks([...maintenanceTasks, newTask]);

    addActivityLog({
      type: 'maintenance',
      title: 'Maintenance Task Created',
      description: `${task.title} created for ${task.vesselName}`,
      userId: task.createdBy,
      userName: 'User',
      userRole: 'manager',
      vesselId: task.vesselId,
      vesselName: task.vesselName,
      relatedId: newTask.id,
      relatedType: 'maintenance',
    });
  };

  const updateMaintenanceTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    setMaintenanceTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
  };

  const deleteMaintenanceTask = (id: string) => {
    setMaintenanceTasks(maintenanceTasks.filter(task => task.id !== id));
  };

  const completeMaintenanceTask = (id: string, record: Omit<CompletionRecord, 'id' | 'taskId'>) => {
    const task = maintenanceTasks.find(t => t.id === id);
    if (!task) {
      return;
    }

    const completionRecord: CompletionRecord = {
      ...record,
      id: generateId(),
      taskId: id,
    };

    const updates: Partial<MaintenanceTask> = {
      status: 'completed',
      completedDate: new Date(),
      completionHistory: [...task.completionHistory, completionRecord],
      actualCost: record.cost,
    };

    if (task.isRecurring && task.frequency && task.frequencyValue) {
      const nextDate = new Date(task.dueDate);
      switch (task.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + task.frequencyValue);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (task.frequencyValue * 7));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + task.frequencyValue);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + (task.frequencyValue * 3));
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + task.frequencyValue);
          break;
        default:
          break;
      }
      updates.nextDueDate = nextDate;
      updates.status = 'open';
      updates.dueDate = nextDate;
      updates.completedDate = undefined;
    }

    const costText = record.cost ? ` — Cost: $${record.cost.toLocaleString()}` : '';
    const completionComment: Comment = {
      id: generateId(),
      userId: record.completedBy,
      userName: record.completedByName,
      userRole: 'crew',
      text: `${record.completedByName} completed this task${costText}`,
      isSystemComment: true,
      attachments: [],
      createdAt: new Date(),
    };
    updates.comments = [...(task.comments || []), completionComment];

    updateMaintenanceTask(id, updates);

    addActivityLog({
      type: 'maintenance',
      title: 'Maintenance Task Completed',
      description: `${task.title} completed on ${task.vesselName}`,
      userId: record.completedBy,
      userName: record.completedByName,
      userRole: 'crew',
      vesselId: task.vesselId,
      vesselName: task.vesselName,
      relatedId: id,
      relatedType: 'maintenance',
    });
  };

  const addMaintenanceComment = (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: new Date(),
    };

    setMaintenanceTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, comments: [...(task.comments || []), newComment], updatedAt: new Date() }
        : task
    ));
  };

  // Issue functions
  const addIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIssue: Issue = {
      ...issue,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setIssues([...issues, newIssue]);

    addActivityLog({
      type: 'issue',
      title: 'Issue Reported',
      description: `${issue.title} reported on ${issue.vesselName}`,
      userId: issue.reportedBy,
      userName: issue.reportedByName,
      userRole: 'crew',
      vesselId: issue.vesselId,
      vesselName: issue.vesselName,
      relatedId: newIssue.id,
      relatedType: 'issue',
    });
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev => prev.map(issue =>
      issue.id === id ? { ...issue, ...updates, updatedAt: new Date() } : issue
    ));
  };

  const addIssueComment = (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: new Date(),
    };

    setIssues(prev => prev.map(issue =>
      issue.id === issueId
        ? { ...issue, comments: [...(issue.comments || []), newComment], updatedAt: new Date() }
        : issue
    ));
  };

  // Supply Request functions
  const addSupplyRequest = (request: Omit<SupplyRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: SupplyRequest = {
      ...request,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSupplyRequests([...supplyRequests, newRequest]);
    
    addActivityLog({
      type: 'supply',
      title: 'Supply Request Created',
      description: `${request.itemName} requested for ${request.vesselName}`,
      userId: request.requestedBy,
      userName: request.requestedByName,
      userRole: 'crew',
      vesselId: request.vesselId,
      vesselName: request.vesselName,
      relatedId: newRequest.id,
      relatedType: 'supply',
    });
    
  };

  const updateSupplyRequest = (id: string, updates: Partial<SupplyRequest>) => {
    setSupplyRequests(prev => prev.map(request =>
      request.id === id ? { ...request, ...updates, updatedAt: new Date() } : request
    ));
  };

  const approveSupplyRequest = async (id: string, approvedBy: string, approvedByName: string) => {
    updateSupplyRequest(id, {
      status: 'approved',
      approvedBy,
      approvedByName,
      approvedAt: new Date(),
    });
    
    const request = supplyRequests.find(r => r.id === id);
    if (request) {
      addActivityLog({
        type: 'approval',
        title: 'Supply Request Approved',
        description: `${request.itemName} approved for ${request.vesselName}`,
        userId: approvedBy,
        userName: approvedByName,
        userRole: 'manager',
        vesselId: request.vesselId,
        vesselName: request.vesselName,
        relatedId: id,
        relatedType: 'supply',
      });
    }
  };

  const denySupplyRequest = async (id: string, reason: string) => {
    updateSupplyRequest(id, {
      status: 'denied',
      deniedReason: reason,
    });
  };

  const addSupplyComment = (requestId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: new Date(),
    };

    setSupplyRequests(prev => prev.map(request =>
      request.id === requestId
        ? { ...request, comments: [...(request.comments || []), newComment], updatedAt: new Date() }
        : request
    ));
  };

  // Document functions
  const addDocument = (document: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDocument: Document = {
      ...document,
      id: generateId(),
      uploadedAt: new Date(),
    };
    setDocuments([...documents, newDocument]);
    
    addActivityLog({
      type: 'document',
      title: 'Document Uploaded',
      description: `${document.title} uploaded for ${document.vesselName}`,
      userId: document.uploadedBy,
      userName: document.uploadedByName,
      userRole: 'manager',
      vesselId: document.vesselId,
      vesselName: document.vesselName,
      relatedId: newDocument.id,
      relatedType: 'document',
    });
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const addDocumentComment = (docId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: new Date(),
    };

    setDocuments(prev => prev.map(doc =>
      doc.id === docId
        ? { ...doc, comments: [...(doc.comments || []), newComment] }
        : doc
    ));
  };

  // Activity Log functions
  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: generateId(),
      timestamp: new Date(),
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  // Notification functions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Expense functions
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
    };
    setExpenses([...expenses, newExpense]);
    
    addActivityLog({
      type: 'system',
      title: 'Expense Added',
      description: `${expense.title} - $${expense.amount}`,
      userId: expense.paidBy,
      userName: expense.paidByName,
      userRole: 'manager',
      vesselId: expense.vesselId,
      vesselName: expense.vesselName,
      relatedId: newExpense.id,
      relatedType: 'expense',
    });
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(exp =>
      exp.id === id ? { ...exp, ...updates } : exp
    ));
  };

  // Calendar Event functions
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCalendarEvents([...calendarEvents, newEvent]);
    
    addActivityLog({
      type: 'system',
      title: 'Calendar Event Created',
      description: `${event.title} scheduled for ${event.vesselName}`,
      userId: event.createdBy,
      userName: event.createdByName,
      userRole: 'manager',
      vesselId: event.vesselId,
      vesselName: event.vesselName,
      relatedId: newEvent.id,
      relatedType: 'calendar',
    });

  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...updates, updatedAt: new Date() } : event
    ));
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== id));
  };

  const addCalendarEventComment = (eventId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: new Date(),
    };
    setCalendarEvents(prev => prev.map(event =>
      event.id === eventId
        ? { ...event, comments: [...(event.comments || []), newComment], updatedAt: new Date() }
        : event
    ));
  };

  // Engine hour functions
  const getEngineHourLogsForVessel = (vesselId: string): EngineHourLog[] => {
    return engineHourLogs.filter(log => log.vesselId === vesselId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const updateEngineHours = (vesselId: string, newHours: number, userId: string, userName: string, userRole: string, notes: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) return;
    const previousHours = vessel.engineHours || 0;
    const log: EngineHourLog = {
      id: generateId(),
      vesselId,
      vesselName: vessel.name,
      previousHours,
      newHours,
      updatedBy: userId,
      updatedByName: userName,
      notes,
      timestamp: new Date(),
    };
    setEngineHourLogs(prev => [log, ...prev]);
    setVessels(prev => prev.map(v => v.id === vesselId ? { ...v, engineHours: newHours } : v));
    addActivityLog({
      type: 'system',
      title: 'Engine Hours Updated',
      description: `${vessel.name} engine hours updated from ${previousHours} to ${newHours}`,
      userId,
      userName,
      userRole,
      vesselId,
      vesselName: vessel.name,
    });
  };

  // Contact functions
  const getContactsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Contact[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    return contacts.filter(c => c.vesselIds.some(vid => vesselIds.includes(vid)));
  };

  const addContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setContacts(prev => [...prev, newContact]);
    addActivityLog({
      type: 'contact',
      title: 'Contact Added',
      description: `${contact.name} added to contact directory`,
      userId: contact.createdBy,
      userName: contact.createdByName,
      userRole: 'manager',
      vesselId: contact.vesselIds[0] || '',
      vesselName: contact.vesselNames[0] || '',
      relatedId: newContact.id,
      relatedType: 'contact',
    });
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Certification functions
  const getCertificationsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): CrewCertification[] => {
    if (userRole === 'crew') {
      return certifications.filter(c => c.crewId === userId);
    }
    const userVessels = getVesselsForUser(userId, userRole);
    const crewIds = userVessels.flatMap(v => v.crewIds || []);
    return certifications.filter(c => crewIds.includes(c.crewId));
  };

  const addCertification = (cert: Omit<CrewCertification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCert: CrewCertification = {
      ...cert,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCertifications(prev => [...prev, newCert]);
    addActivityLog({
      type: 'certification',
      title: 'Certification Added',
      description: `${cert.certType} added for ${cert.crewName}`,
      userId: cert.createdBy,
      userName: cert.createdByName,
      userRole: 'manager',
      vesselId: cert.vesselId,
      vesselName: cert.vesselName,
      relatedId: newCert.id,
      relatedType: 'certification',
    });
  };

  const updateCertification = (id: string, updates: Partial<CrewCertification>) => {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c));
  };

  const deleteCertification = (id: string) => {
    setCertifications(prev => prev.filter(c => c.id !== id));
  };

  // Charter log functions
  const getCharterLogsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): CharterLog[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    return charterLogs.filter(c => vesselIds.includes(c.vesselId));
  };

  const addCharterLog = (log: Omit<CharterLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLog: CharterLog = {
      ...log,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCharterLogs(prev => [...prev, newLog]);
    addActivityLog({
      type: 'charter',
      title: 'Charter Log Created',
      description: `${log.title} added for ${log.vesselName}`,
      userId: log.createdBy,
      userName: log.createdByName,
      userRole: 'manager',
      vesselId: log.vesselId,
      vesselName: log.vesselName,
      relatedId: newLog.id,
      relatedType: 'charter',
    });
  };

  const updateCharterLog = (id: string, updates: Partial<CharterLog>) => {
    setCharterLogs(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c));
  };

  const deleteCharterLog = (id: string) => {
    setCharterLogs(prev => prev.filter(c => c.id !== id));
  };

  const addCharterLogComment = (logId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = { ...comment, id: generateId(), createdAt: new Date() };
    setCharterLogs(prev => prev.map(c =>
      c.id === logId ? { ...c, comments: [...(c.comments || []), newComment], updatedAt: new Date() } : c
    ));
  };

  // Equipment functions
  const getEquipmentForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Equipment[] => {
    const userVessels = getVesselsForUser(userId, userRole);
    const vesselIds = userVessels.map(v => v.id);
    return equipment.filter(e => vesselIds.includes(e.vesselId));
  };

  const addEquipment = (item: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: Equipment = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEquipment(prev => [...prev, newItem]);
    addActivityLog({
      type: 'equipment',
      title: 'Equipment Added',
      description: `${item.name} added to ${item.vesselName}`,
      userId: item.createdBy,
      userName: item.createdByName,
      userRole: 'manager',
      vesselId: item.vesselId,
      vesselName: item.vesselName,
      relatedId: newItem.id,
      relatedType: 'equipment',
    });
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e));
  };

  const deleteEquipment = (id: string) => {
    setEquipment(prev => prev.filter(e => e.id !== id));
  };

  const addEquipmentComment = (equipmentId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = { ...comment, id: generateId(), createdAt: new Date() };
    setEquipment(prev => prev.map(e =>
      e.id === equipmentId ? { ...e, comments: [...(e.comments || []), newComment], updatedAt: new Date() } : e
    ));
  };

  // Vessel assignment functions
  const updateVessel = (id: string, updates: Partial<Vessel>) => {
    setVessels(vessels.map(vessel =>
      vessel.id === id ? { ...vessel, ...updates } : vessel
    ));
  };

  const assignOwnerToVessel = (vesselId: string, ownerId: string, ownerName: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) {
      return;
    }

    updateVessel(vesselId, { ownerId });
    
    addActivityLog({
      type: 'system',
      title: 'Owner Assigned',
      description: `${ownerName} assigned as owner of ${vessel.name}`,
      userId: ownerId,
      userName: ownerName,
      userRole: 'owner',
      vesselId: vessel.id,
      vesselName: vessel.name,
    });
  };

  const removeOwnerFromVessel = (vesselId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) {
      return;
    }

    updateVessel(vesselId, { ownerId: '' });
    
    addActivityLog({
      type: 'system',
      title: 'Owner Removed',
      description: `Owner removed from ${vessel.name}`,
      userId: 'system',
      userName: 'System',
      userRole: 'manager',
      vesselId: vessel.id,
      vesselName: vessel.name,
    });
  };

  const assignCrewToVessel = (vesselId: string, crewId: string, crewName: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) {
      return;
    }

    const currentCrewIds = vessel.crewIds || [];
    if (currentCrewIds.includes(crewId)) {
      return;
    }

    updateVessel(vesselId, { 
      crewIds: [...currentCrewIds, crewId],
      crewCount: currentCrewIds.length + 1,
    });
    
    addActivityLog({
      type: 'system',
      title: 'Crew Member Assigned',
      description: `${crewName} assigned to ${vessel.name}`,
      userId: crewId,
      userName: crewName,
      userRole: 'crew',
      vesselId: vessel.id,
      vesselName: vessel.name,
    });
  };

  const removeCrewFromVessel = (vesselId: string, crewId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) {
      return;
    }

    const currentCrewIds = vessel.crewIds || [];
    const updatedCrewIds = currentCrewIds.filter(id => id !== crewId);

    updateVessel(vesselId, { 
      crewIds: updatedCrewIds,
      crewCount: updatedCrewIds.length,
    });
    
    addActivityLog({
      type: 'system',
      title: 'Crew Member Removed',
      description: `Crew member removed from ${vessel.name}`,
      userId: 'system',
      userName: 'System',
      userRole: 'manager',
      vesselId: vessel.id,
      vesselName: vessel.name,
    });
  };

  return (
    <DataContext.Provider
      value={{
        vessels,
        maintenanceTasks,
        issues,
        supplyRequests,
        documents,
        activityLogs,
        notifications,
        expenses,
        calendarEvents,
        getVesselsForUser,
        getMaintenanceTasksForUser,
        getIssuesForUser,
        getSupplyRequestsForUser,
        getDocumentsForUser,
        getActivityLogsForUser,
        getNotificationsForUser,
        getExpensesForUser,
        getCalendarEventsForUser,
        updateVessel,
        assignOwnerToVessel,
        removeOwnerFromVessel,
        assignCrewToVessel,
        removeCrewFromVessel,
        addMaintenanceTask,
        updateMaintenanceTask,
        deleteMaintenanceTask,
        completeMaintenanceTask,
        addMaintenanceComment,
        addIssue,
        updateIssue,
        addIssueComment,
        addSupplyRequest,
        updateSupplyRequest,
        approveSupplyRequest,
        denySupplyRequest,
        addSupplyComment,
        addDocument,
        updateDocument,
        deleteDocument,
        addDocumentComment,
        addActivityLog,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        addExpense,
        updateExpense,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addCalendarEventComment,
        engineHourLogs,
        getEngineHourLogsForVessel,
        updateEngineHours,
        contacts,
        getContactsForUser,
        addContact,
        updateContact,
        deleteContact,
        certifications,
        getCertificationsForUser,
        addCertification,
        updateCertification,
        deleteCertification,
        charterLogs,
        getCharterLogsForUser,
        addCharterLog,
        updateCharterLog,
        deleteCharterLog,
        addCharterLogComment,
        equipment,
        getEquipmentForUser,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        addEquipmentComment,
        loadData,
        saveData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
