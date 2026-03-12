export {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarFilter,
  EventReminder,
} from './calendar';

// Shared enums

export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'waiting_on_parts';

export type SupplyRequestStatus = 'pending' | 'approved' | 'ordered' | 'received' | 'denied';

export type DocumentCategory =
  | 'manual'
  | 'insurance'
  | 'registration'
  | 'safety'
  | 'warranty'
  | 'invoice'
  | 'receipt'
  | 'other';

export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type NotificationType = 'issue' | 'supply' | 'maintenance' | 'document' | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type ActivityLogType = 'issue' | 'supply' | 'maintenance' | 'approval' | 'document' | 'system' | 'task' | 'contact' | 'certification' | 'charter' | 'equipment';

// Core entities

export type ContactType = 'crew' | 'vendor' | 'marina' | 'emergency' | 'owner' | 'other';
export type CertificationStatus = 'valid' | 'expiring_soon' | 'expired';
export type CharterStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
export type EquipmentCategory = 'safety' | 'water_toys' | 'navigation' | 'communication' | 'anchoring' | 'tender' | 'galley' | 'other';
export type EquipmentCondition = 'good' | 'fair' | 'poor' | 'needs_replacement';

// Core entities

export interface Vessel {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  location: string;
  crewCount: number;
  ownerId: string;
  managerId: string;
  crewIds?: string[];
  engineHours?: number;
  image?: number;
}

export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: 'image' | 'video' | 'document' | 'pdf';
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  mimeType?: string;
}

export interface CompletionRecord {
  id: string;
  taskId: string;
  completedBy: string;
  completedByName: string;
  completedAt: Date;
  notes: string;
  attachments: Attachment[];
  cost?: number;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  vesselId: string;
  vesselName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  assignedToType: 'crew' | 'manager' | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  isRecurring: boolean;
  frequency?: MaintenanceFrequency;
  frequencyValue?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  comments: Comment[];
  completionHistory: CompletionRecord[];
  estimatedCost?: number;
  actualCost?: number;
  completedDate?: Date;
  nextDueDate?: Date;
  category: string;
  notes: string;
}

export interface Comment {
  id: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  text: string;
  isSystemComment?: boolean;
  attachments: Attachment[];
  createdAt: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  vesselId: string;
  vesselName: string;
  reportedBy: string;
  reportedByName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  comments: Comment[];
  resolvedAt?: Date;
}

export interface SupplyRequest {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  actualCost?: number;
  vesselId: string;
  vesselName: string;
  requestedBy: string;
  requestedByName: string;
  status: SupplyRequestStatus;
  priority: TaskPriority;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
  attachments: Attachment[];
  comments: Comment[];
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  receivedAt?: Date;
  deniedReason?: string;
  vendor?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  vesselId: string;
  vesselName: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  expiryDate?: Date;
  fileUri: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  tags: string[];
  isImportant: boolean;
  comments: Comment[];
}

export interface ActivityLog {
  id: string;
  type: ActivityLogType;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  vesselId: string;
  vesselName: string;
  relatedId?: string;
  relatedType?: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: Date;
  priority: NotificationPriority;
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  vesselId: string;
  vesselName: string;
  date: Date;
  paidBy: string;
  paidByName: string;
  approvedBy: string;
  approvedByName: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  attachments: Attachment[];
}

export interface EngineHourLog {
  id: string;
  vesselId: string;
  vesselName: string;
  previousHours: number;
  newHours: number;
  updatedBy: string;
  updatedByName: string;
  notes: string;
  timestamp: Date;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  contactType: ContactType;
  phone: string;
  email: string;
  company?: string;
  vesselIds: string[];
  vesselNames: string[];
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrewCertification {
  id: string;
  crewId: string;
  crewName: string;
  certType: string;
  issuingAuthority: string;
  certificateNumber?: string;
  issueDate: Date;
  expiryDate: Date;
  vesselId: string;
  vesselName: string;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharterLog {
  id: string;
  title: string;
  vesselId: string;
  vesselName: string;
  startDate: Date;
  endDate: Date;
  status: CharterStatus;
  guestCount: number;
  guestNames?: string;
  itinerary: string;
  departurePort: string;
  arrivalPort: string;
  revenue: number;
  expenses: number;
  brokerName?: string;
  brokerCommission?: number;
  specialRequests?: string;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  vesselId: string;
  vesselName: string;
  quantity: number;
  condition: EquipmentCondition;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  location: string;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
}
