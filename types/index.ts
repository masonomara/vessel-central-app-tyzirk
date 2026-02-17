export {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarFilter,
  EventReminder,
} from './calendar';

// Shared enums

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

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

export type ActivityLogType = 'issue' | 'supply' | 'maintenance' | 'approval' | 'document' | 'system';

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
}

export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: 'image' | 'video' | 'document';
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
  assignedTo: string;
  assignedToName: string;
  assignedToType: 'crew' | 'manager';
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
  completionHistory: CompletionRecord[];
  estimatedCost?: number;
  actualCost?: number;
  completedDate?: Date;
  nextDueDate?: Date;
  notes: string;
}

export interface Comment {
  id: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  text: string;
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
  relatedId: string;
  relatedType: string;
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
