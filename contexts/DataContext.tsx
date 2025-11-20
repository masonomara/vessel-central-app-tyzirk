
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
} from '@/types';

interface DataContextType {
  vessels: Vessel[];
  maintenanceTasks: MaintenanceTask[];
  issues: Issue[];
  supplyRequests: SupplyRequest[];
  documents: Document[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  expenses: Expense[];
  
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  deleteMaintenanceTask: (id: string) => void;
  completeMaintenanceTask: (id: string, record: Omit<CompletionRecord, 'id' | 'taskId'>) => void;
  
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  addIssueComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  
  addSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplyRequest: (id: string, updates: Partial<SupplyRequest>) => void;
  approveSupplyRequest: (id: string, approvedBy: string, approvedByName: string) => void;
  denySupplyRequest: (id: string, reason: string) => void;
  
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = '@vessel_co_data';

export function DataProvider({ children }: { children: ReactNode }) {
  const [vessels, setVessels] = useState<Vessel[]>([
    {
      id: '1',
      name: 'Azure Dream',
      status: 'active',
      location: 'Monaco Yacht Club',
      crewCount: 8,
      ownerId: 'owner1',
      managerId: 'manager1',
    },
    {
      id: '2',
      name: 'Ocean Pearl',
      status: 'maintenance',
      location: 'Port of Miami',
      crewCount: 6,
      ownerId: 'owner1',
      managerId: 'manager1',
    },
  ]);

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      title: 'Engine Service',
      description: 'Complete engine oil change and filter replacement',
      vesselId: '1',
      vesselName: 'Azure Dream',
      assignedTo: 'crew1',
      assignedToName: 'Mike Davis',
      assignedToType: 'crew',
      status: 'open',
      priority: 'medium',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      frequency: 'monthly',
      frequencyValue: 3,
      createdBy: 'manager1',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      completionHistory: [],
      estimatedCost: 2500,
      notes: 'Use synthetic oil only',
    },
    {
      id: '2',
      title: 'Safety Equipment Check',
      description: 'Inspect all life jackets, fire extinguishers, and emergency equipment',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      assignedTo: 'crew2',
      assignedToName: 'Jane Smith',
      assignedToType: 'crew',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      frequency: 'monthly',
      frequencyValue: 1,
      createdBy: 'manager1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      attachments: [],
      completionHistory: [],
      estimatedCost: 500,
      notes: 'Check expiry dates on all equipment',
    },
  ]);

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      title: 'Deck Leak',
      description: 'Water leaking through deck near bow during heavy rain',
      vesselId: '1',
      vesselName: 'Azure Dream',
      reportedBy: 'crew1',
      reportedByName: 'Mike Davis',
      assignedTo: null,
      assignedToName: null,
      status: 'open',
      priority: 'high',
      category: 'Structural',
      location: 'Forward Deck',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      attachments: [],
      comments: [],
    },
  ]);

  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([
    {
      id: '1',
      itemName: 'Cleaning Supplies',
      description: 'Deck cleaning solution, brushes, and microfiber cloths',
      quantity: 5,
      unit: 'units',
      estimatedCost: 250,
      vesselId: '1',
      vesselName: 'Azure Dream',
      requestedBy: 'crew1',
      requestedByName: 'Mike Davis',
      status: 'pending',
      priority: 'low',
      category: 'Cleaning',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      notes: 'Running low on supplies',
      attachments: [],
    },
    {
      id: '2',
      itemName: 'Engine Oil',
      description: 'Synthetic marine engine oil 15W-40',
      quantity: 20,
      unit: 'liters',
      estimatedCost: 800,
      vesselId: '1',
      vesselName: 'Azure Dream',
      requestedBy: 'crew1',
      requestedByName: 'Mike Davis',
      status: 'approved',
      priority: 'medium',
      category: 'Maintenance',
      approvedBy: 'manager1',
      approvedByName: 'Sarah Johnson',
      approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      notes: 'For upcoming engine service',
      attachments: [],
    },
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Vessel Registration',
      description: 'Official vessel registration documents',
      category: 'registration',
      vesselId: '1',
      vesselName: 'Azure Dream',
      uploadedBy: 'manager1',
      uploadedByName: 'Sarah Johnson',
      uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      fileUri: 'file://documents/registration.pdf',
      fileName: 'registration.pdf',
      fileSize: 2048000,
      fileType: 'application/pdf',
      tags: ['legal', 'required'],
      isImportant: true,
    },
    {
      id: '2',
      title: 'Insurance Policy',
      description: 'Comprehensive yacht insurance policy',
      category: 'insurance',
      vesselId: '1',
      vesselName: 'Azure Dream',
      uploadedBy: 'manager1',
      uploadedByName: 'Sarah Johnson',
      uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
      fileUri: 'file://documents/insurance.pdf',
      fileName: 'insurance_policy.pdf',
      fileSize: 3145728,
      fileType: 'application/pdf',
      tags: ['insurance', 'required'],
      isImportant: true,
    },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      type: 'issue',
      title: 'New Issue Reported',
      description: 'Deck Leak reported on Azure Dream',
      userId: 'crew1',
      userName: 'Mike Davis',
      userRole: 'crew',
      vesselId: '1',
      vesselName: 'Azure Dream',
      relatedId: '1',
      relatedType: 'issue',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'supply',
      title: 'Supply Request Approved',
      description: 'Engine Oil request approved',
      userId: 'manager1',
      userName: 'Sarah Johnson',
      userRole: 'manager',
      vesselId: '1',
      vesselName: 'Azure Dream',
      relatedId: '2',
      relatedType: 'supply',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'issue',
      title: 'New Issue Reported',
      message: 'Deck Leak reported on Azure Dream',
      userId: 'manager1',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'high',
    },
    {
      id: '2',
      type: 'supply',
      title: 'Supply Request Pending',
      message: 'Cleaning Supplies request awaiting approval',
      userId: 'manager1',
      read: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: 'medium',
    },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      title: 'Fuel Purchase',
      description: 'Marine diesel fuel',
      amount: 8450,
      category: 'Fuel',
      vesselId: '1',
      vesselName: 'Azure Dream',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paidBy: 'manager1',
      paidByName: 'Sarah Johnson',
      approvedBy: 'owner1',
      approvedByName: 'John Smith',
      status: 'paid',
      attachments: [],
    },
  ]);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData();
  }, [maintenanceTasks, issues, supplyRequests, documents, activityLogs, notifications, expenses]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        console.log('Data loaded from storage');
        
        // Parse dates back to Date objects
        if (parsed.maintenanceTasks) {
          setMaintenanceTasks(parsed.maintenanceTasks.map((task: MaintenanceTask) => ({
            ...task,
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
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      const data = {
        maintenanceTasks,
        issues,
        supplyRequests,
        documents,
        activityLogs,
        notifications,
        expenses,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Data saved to storage');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Maintenance Task functions
  const addMaintenanceTask = (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const updateMaintenanceTask = (id: string, updates: Partial<MaintenanceTask>) => {
    setMaintenanceTasks(maintenanceTasks.map(task =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
  };

  const deleteMaintenanceTask = (id: string) => {
    setMaintenanceTasks(maintenanceTasks.filter(task => task.id !== id));
  };

  const completeMaintenanceTask = (id: string, record: Omit<CompletionRecord, 'id' | 'taskId'>) => {
    const task = maintenanceTasks.find(t => t.id === id);
    if (!task) {
      console.log('Task not found');
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

    // If recurring, calculate next due date
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
          console.log('Unknown frequency');
      }
      updates.nextDueDate = nextDate;
      updates.status = 'open';
      updates.dueDate = nextDate;
      updates.completedDate = undefined;
    }

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

  // Issue functions
  const addIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
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
    
    // Notify manager
    addNotification({
      type: 'issue',
      title: 'New Issue Reported',
      message: `${issue.title} on ${issue.vesselName}`,
      userId: 'manager1',
      priority: issue.priority === 'high' || issue.priority === 'urgent' ? 'high' : 'medium',
    });
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(issues.map(issue =>
      issue.id === id ? { ...issue, ...updates, updatedAt: new Date() } : issue
    ));
  };

  const addIssueComment = (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) {
      console.log('Issue not found');
      return;
    }

    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: new Date(),
    };

    updateIssue(issueId, {
      comments: [...issue.comments, newComment],
    });
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
    
    // Notify manager
    addNotification({
      type: 'supply',
      title: 'New Supply Request',
      message: `${request.itemName} requested for ${request.vesselName}`,
      userId: 'manager1',
      priority: request.priority === 'high' || request.priority === 'urgent' ? 'high' : 'medium',
    });
  };

  const updateSupplyRequest = (id: string, updates: Partial<SupplyRequest>) => {
    setSupplyRequests(supplyRequests.map(request =>
      request.id === id ? { ...request, ...updates, updatedAt: new Date() } : request
    ));
  };

  const approveSupplyRequest = (id: string, approvedBy: string, approvedByName: string) => {
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
      
      // Notify requester
      addNotification({
        type: 'approval',
        title: 'Supply Request Approved',
        message: `Your request for ${request.itemName} has been approved`,
        userId: request.requestedBy,
        priority: 'medium',
      });
    }
  };

  const denySupplyRequest = (id: string, reason: string) => {
    updateSupplyRequest(id, {
      status: 'denied',
      deniedReason: reason,
    });
    
    const request = supplyRequests.find(r => r.id === id);
    if (request) {
      // Notify requester
      addNotification({
        type: 'approval',
        title: 'Supply Request Denied',
        message: `Your request for ${request.itemName} was denied: ${reason}`,
        userId: request.requestedBy,
        priority: 'medium',
      });
    }
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
    setDocuments(documents.map(doc =>
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
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
        addMaintenanceTask,
        updateMaintenanceTask,
        deleteMaintenanceTask,
        completeMaintenanceTask,
        addIssue,
        updateIssue,
        addIssueComment,
        addSupplyRequest,
        updateSupplyRequest,
        approveSupplyRequest,
        denySupplyRequest,
        addDocument,
        updateDocument,
        deleteDocument,
        addActivityLog,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        addExpense,
        updateExpense,
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
