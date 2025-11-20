
export type UserRole = 'owner' | 'manager' | 'crew' | null;

export type TaskStatus = 'open' | 'in_progress' | 'waiting_on_parts' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type DocumentCategory = 'manual' | 'insurance' | 'registration' | 'safety' | 'warranty' | 'invoice' | 'receipt' | 'other';

export type SupplyRequestStatus = 'pending' | 'approved' | 'denied' | 'ordered' | 'received';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface Vessel {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'charter' | 'docked';
  location: string;
  crewCount: number;
  ownerId: string;
  managerId: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  vesselId: string;
  vesselName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  assignedToType: 'crew' | 'vendor' | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  completedDate?: Date;
  isRecurring: boolean;
  frequency?: MaintenanceFrequency;
  frequencyValue?: number;
  nextDueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  completionHistory: CompletionRecord[];
  estimatedCost?: number;
  actualCost?: number;
  notes: string;
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
  resolvedAt?: Date;
  attachments: Attachment[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: Date;
  attachments: Attachment[];
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
  vendor?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  deniedReason?: string;
  receivedAt?: Date;
  notes: string;
  attachments: Attachment[];
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
  type: 'task' | 'issue' | 'supply' | 'document' | 'maintenance' | 'approval' | 'comment' | 'system';
  title: string;
  description: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  vesselId?: string;
  vesselName?: string;
  relatedId?: string;
  relatedType?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  type: 'task' | 'issue' | 'supply' | 'maintenance' | 'approval' | 'reminder' | 'alert';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
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
  approvedBy?: string;
  approvedByName?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  attachments: Attachment[];
  relatedTaskId?: string;
  relatedSupplyId?: string;
}
