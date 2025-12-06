
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheManager, CACHE_KEYS, CACHE_EXPIRATION, cacheHelpers } from '@/utils/cacheManager';
import { offlineManager } from '@/utils/offlineManager';
import { realtimeManager } from '@/utils/realtimeManager';
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
  
  getVesselsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Vessel[];
  getMaintenanceTasksForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => MaintenanceTask[];
  getIssuesForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Issue[];
  getSupplyRequestsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => SupplyRequest[];
  getDocumentsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Document[];
  getActivityLogsForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => ActivityLog[];
  getNotificationsForUser: (userId: string) => Notification[];
  getExpensesForUser: (userId: string, userRole: 'owner' | 'manager' | 'crew') => Expense[];
  
  updateVessel: (id: string, updates: Partial<Vessel>) => void;
  assignOwnerToVessel: (vesselId: string, ownerId: string, ownerName: string) => void;
  removeOwnerFromVessel: (vesselId: string) => void;
  assignCrewToVessel: (vesselId: string, crewId: string, crewName: string) => void;
  removeCrewFromVessel: (vesselId: string, crewId: string) => void;
  
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  deleteMaintenanceTask: (id: string) => void;
  completeMaintenanceTask: (id: string, record: Omit<CompletionRecord, 'id' | 'taskId'>) => void;
  
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
      crewIds: ['crew1', 'crew2'],
    },
    {
      id: '2',
      name: 'Ocean Pearl',
      status: 'maintenance',
      location: 'Port of Miami',
      crewCount: 6,
      ownerId: 'owner2',
      managerId: 'manager2',
      crewIds: ['crew3'],
    },
    {
      id: '3',
      name: 'Sea Breeze',
      status: 'active',
      location: 'Caribbean Marina',
      crewCount: 5,
      ownerId: 'owner1',
      managerId: 'manager1',
      crewIds: ['crew1'],
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
      assignedTo: 'crew3',
      assignedToName: 'Jane Smith',
      assignedToType: 'crew',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      frequency: 'monthly',
      frequencyValue: 1,
      createdBy: 'manager2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      attachments: [],
      completionHistory: [],
      estimatedCost: 500,
      notes: 'Check expiry dates on all equipment',
    },
    {
      id: '3',
      title: 'Deck Cleaning',
      description: 'Clean and polish main deck area',
      vesselId: '1',
      vesselName: 'Azure Dream',
      assignedTo: 'crew1',
      assignedToName: 'Mike Davis',
      assignedToType: 'crew',
      status: 'open',
      priority: 'high',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      isRecurring: false,
      createdBy: 'manager1',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      completionHistory: [],
      notes: '',
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
    {
      id: '2',
      title: 'Navigation Light Malfunction',
      description: 'Port side navigation light not working',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      reportedBy: 'crew3',
      reportedByName: 'Jane Smith',
      assignedTo: null,
      assignedToName: null,
      status: 'open',
      priority: 'medium',
      category: 'Electrical',
      location: 'Port Side',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
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
    {
      id: '3',
      itemName: 'Safety Equipment',
      description: 'Life jackets and fire extinguishers',
      quantity: 10,
      unit: 'units',
      estimatedCost: 1500,
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      requestedBy: 'crew3',
      requestedByName: 'Jane Smith',
      status: 'pending',
      priority: 'high',
      category: 'Safety',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      notes: 'Urgent replacement needed',
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
    {
      id: '3',
      title: 'Safety Manual',
      description: 'Vessel safety procedures and protocols',
      category: 'safety',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      uploadedBy: 'manager2',
      uploadedByName: 'Tom Wilson',
      uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      fileUri: 'file://documents/safety_manual.pdf',
      fileName: 'safety_manual.pdf',
      fileSize: 5242880,
      fileType: 'application/pdf',
      tags: ['safety', 'manual'],
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
    {
      id: '3',
      type: 'issue',
      title: 'New Issue Reported',
      description: 'Navigation Light Malfunction on Ocean Pearl',
      userId: 'crew3',
      userName: 'Jane Smith',
      userRole: 'crew',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      relatedId: '2',
      relatedType: 'issue',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
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
    {
      id: '3',
      type: 'issue',
      title: 'New Issue Reported',
      message: 'Navigation Light Malfunction on Ocean Pearl',
      userId: 'manager2',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      priority: 'medium',
    },
    {
      id: '4',
      type: 'supply',
      title: 'Supply Request Pending',
      message: 'Safety Equipment request awaiting approval',
      userId: 'manager2',
      read: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      priority: 'high',
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
    {
      id: '2',
      title: 'Maintenance Supplies',
      description: 'Various maintenance supplies and tools',
      amount: 3200,
      category: 'Maintenance',
      vesselId: '2',
      vesselName: 'Ocean Pearl',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paidBy: 'manager2',
      paidByName: 'Tom Wilson',
      approvedBy: 'owner2',
      approvedByName: 'Emily Brown',
      status: 'paid',
      attachments: [],
    },
  ]);

  // Use ref to track if data has been loaded
  const hasLoadedData = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    if (hasLoadedData.current) {
      console.log('Data already loaded, skipping...');
      return;
    }
    
    try {
      console.log('Loading data from cache...');
      
      // Try to load from new cache system first
      const cachedVessels = await cacheManager.get<Vessel[]>(CACHE_KEYS.VESSELS);
      const cachedMaintenanceTasks = await cacheManager.get<MaintenanceTask[]>(CACHE_KEYS.MAINTENANCE_TASKS);
      const cachedIssues = await cacheManager.get<Issue[]>(CACHE_KEYS.ISSUES);
      const cachedSupplyRequests = await cacheManager.get<SupplyRequest[]>(CACHE_KEYS.SUPPLY_REQUESTS);
      const cachedDocuments = await cacheManager.get<Document[]>(CACHE_KEYS.DOCUMENTS);
      const cachedActivityLogs = await cacheManager.get<ActivityLog[]>(CACHE_KEYS.ACTIVITY_LOGS);
      const cachedNotifications = await cacheManager.get<Notification[]>(CACHE_KEYS.NOTIFICATIONS);
      const cachedExpenses = await cacheManager.get<Expense[]>(CACHE_KEYS.EXPENSES);

      // If cache exists, use it
      if (cachedVessels) {
        console.log('Using cached vessels');
        setVessels(cachedVessels);
      }
      
      if (cachedMaintenanceTasks) {
        console.log('Using cached maintenance tasks');
        setMaintenanceTasks(cachedMaintenanceTasks.map((task: MaintenanceTask) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
          nextDueDate: task.nextDueDate ? new Date(task.nextDueDate) : undefined,
        })));
      }
      
      if (cachedIssues) {
        console.log('Using cached issues');
        setIssues(cachedIssues.map((issue: Issue) => ({
          ...issue,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
          resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
        })));
      }
      
      if (cachedSupplyRequests) {
        console.log('Using cached supply requests');
        setSupplyRequests(cachedSupplyRequests.map((req: SupplyRequest) => ({
          ...req,
          createdAt: new Date(req.createdAt),
          updatedAt: new Date(req.updatedAt),
          approvedAt: req.approvedAt ? new Date(req.approvedAt) : undefined,
          receivedAt: req.receivedAt ? new Date(req.receivedAt) : undefined,
        })));
      }
      
      if (cachedDocuments) {
        console.log('Using cached documents');
        setDocuments(cachedDocuments.map((doc: Document) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
        })));
      }
      
      if (cachedActivityLogs) {
        console.log('Using cached activity logs');
        setActivityLogs(cachedActivityLogs.map((log: ActivityLog) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })));
      }
      
      if (cachedNotifications) {
        console.log('Using cached notifications');
        setNotifications(cachedNotifications.map((notif: Notification) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        })));
      }
      
      if (cachedExpenses) {
        console.log('Using cached expenses');
        setExpenses(cachedExpenses.map((exp: Expense) => ({
          ...exp,
          date: new Date(exp.date),
        })));
      }

      // If no cache exists, try legacy storage
      if (!cachedVessels && !cachedMaintenanceTasks) {
        console.log('No cache found, trying legacy storage...');
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          console.log('Data loaded from legacy storage');
          
          if (parsed.vessels) {
            setVessels(parsed.vessels);
          }
          
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
      }
      
      hasLoadedData.current = true;
      console.log('Data loading completed');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const saveData = useCallback(async () => {
    // Only save if data has been loaded
    if (!hasLoadedData.current) {
      return;
    }

    // Debounce saves to prevent excessive writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Saving data to cache...');
        
        // Save to new cache system with appropriate expiration times
        await cacheManager.setMultiple([
          { key: CACHE_KEYS.VESSELS, data: vessels, expiration: CACHE_EXPIRATION.LONG },
          { key: CACHE_KEYS.MAINTENANCE_TASKS, data: maintenanceTasks, expiration: CACHE_EXPIRATION.MEDIUM },
          { key: CACHE_KEYS.ISSUES, data: issues, expiration: CACHE_EXPIRATION.MEDIUM },
          { key: CACHE_KEYS.SUPPLY_REQUESTS, data: supplyRequests, expiration: CACHE_EXPIRATION.MEDIUM },
          { key: CACHE_KEYS.DOCUMENTS, data: documents, expiration: CACHE_EXPIRATION.LONG },
          { key: CACHE_KEYS.ACTIVITY_LOGS, data: activityLogs, expiration: CACHE_EXPIRATION.SHORT },
          { key: CACHE_KEYS.NOTIFICATIONS, data: notifications, expiration: CACHE_EXPIRATION.SHORT },
          { key: CACHE_KEYS.EXPENSES, data: expenses, expiration: CACHE_EXPIRATION.MEDIUM },
        ]);
        
        // Also save to legacy storage for backward compatibility
        const data = {
          vessels,
          maintenanceTasks,
          issues,
          supplyRequests,
          documents,
          activityLogs,
          notifications,
          expenses,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        console.log('Data saved successfully');
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }, 1000); // Save after 1 second of inactivity
  }, [vessels, maintenanceTasks, issues, supplyRequests, documents, activityLogs, notifications, expenses]);

  // Load data from storage on mount only
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data whenever it changes (debounced)
  useEffect(() => {
    saveData();
  }, [saveData]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Filtering functions based on user role and vessel access
  const getVesselsForUser = (userId: string, userRole: 'owner' | 'manager' | 'crew'): Vessel[] => {
    console.log('Getting vessels for user:', userId, userRole);
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

  // Maintenance Task functions
  const addMaintenanceTask = async (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: MaintenanceTask = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMaintenanceTasks([...maintenanceTasks, newTask]);
    
    // Invalidate cache
    await cacheHelpers.invalidateCache('MAINTENANCE_TASKS');
    
    // Add to offline queue if offline
    if (!(await offlineManager.getNetworkStatus())) {
      await offlineManager.addToOfflineQueue({
        type: 'create',
        entity: 'maintenance',
        data: newTask,
      });
    }
    
    // Publish realtime event
    await realtimeManager.publishEvent('task_assigned', {
      title: task.title,
      vesselName: task.vesselName,
    }, task.assignedTo, task.vesselId);
    
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
    const task = maintenanceTasks.find(t => t.id === id);
    
    setMaintenanceTasks(maintenanceTasks.map(task =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
    
    // Invalidate cache
    await cacheHelpers.invalidateCache('MAINTENANCE_TASKS');
    
    // Add to offline queue if offline
    if (!(await offlineManager.getNetworkStatus())) {
      await offlineManager.addToOfflineQueue({
        type: 'update',
        entity: 'maintenance',
        data: { id, updates },
      });
    }
    
    // Publish realtime event
    if (task && updates.status === 'completed') {
      await realtimeManager.publishEvent('task_completed', {
        title: task.title,
        vesselName: task.vesselName,
      }, task.assignedTo, task.vesselId);
    } else if (task) {
      await realtimeManager.publishEvent('maintenance_updated', {
        title: task.title,
        vesselName: task.vesselName,
      }, task.assignedTo, task.vesselId);
    }
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
  const addIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIssue: Issue = {
      ...issue,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setIssues([...issues, newIssue]);
    
    // Invalidate cache
    await cacheHelpers.invalidateCache('ISSUES');
    
    // Add to offline queue if offline
    if (!(await offlineManager.getNetworkStatus())) {
      await offlineManager.addToOfflineQueue({
        type: 'create',
        entity: 'issue',
        data: newIssue,
      });
    }
    
    // Publish realtime event
    const vessel = vessels.find(v => v.id === issue.vesselId);
    if (vessel) {
      await realtimeManager.publishEvent('issue_created', {
        title: issue.title,
        vesselName: issue.vesselName,
        priority: issue.priority,
      }, vessel.managerId, issue.vesselId);
    }
    
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
    
    if (vessel) {
      addNotification({
        type: 'issue',
        title: 'New Issue Reported',
        message: `${issue.title} on ${issue.vesselName}`,
        userId: vessel.managerId,
        priority: issue.priority === 'high' || issue.priority === 'urgent' ? 'high' : 'medium',
      });
    }
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
    
    const vessel = vessels.find(v => v.id === request.vesselId);
    if (vessel) {
      addNotification({
        type: 'supply',
        title: 'New Supply Request',
        message: `${request.itemName} requested for ${request.vesselName}`,
        userId: vessel.managerId,
        priority: request.priority === 'high' || request.priority === 'urgent' ? 'high' : 'medium',
      });
    }
  };

  const updateSupplyRequest = (id: string, updates: Partial<SupplyRequest>) => {
    setSupplyRequests(supplyRequests.map(request =>
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
      // Publish realtime event
      await realtimeManager.publishEvent('supply_approved', {
        itemName: request.itemName,
        vesselName: request.vesselName,
      }, request.requestedBy, request.vesselId);
      
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
      
      addNotification({
        type: 'approval',
        title: 'Supply Request Approved',
        message: `Your request for ${request.itemName} has been approved`,
        userId: request.requestedBy,
        priority: 'medium',
      });
    }
  };

  const denySupplyRequest = async (id: string, reason: string) => {
    updateSupplyRequest(id, {
      status: 'denied',
      deniedReason: reason,
    });
    
    const request = supplyRequests.find(r => r.id === id);
    if (request) {
      // Publish realtime event
      await realtimeManager.publishEvent('supply_denied', {
        itemName: request.itemName,
        vesselName: request.vesselName,
        reason,
      }, request.requestedBy, request.vesselId);
      
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

  // Vessel assignment functions
  const updateVessel = (id: string, updates: Partial<Vessel>) => {
    setVessels(vessels.map(vessel =>
      vessel.id === id ? { ...vessel, ...updates } : vessel
    ));
  };

  const assignOwnerToVessel = (vesselId: string, ownerId: string, ownerName: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) {
      console.log('Vessel not found');
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
      console.log('Vessel not found');
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
      console.log('Vessel not found');
      return;
    }

    const currentCrewIds = vessel.crewIds || [];
    if (currentCrewIds.includes(crewId)) {
      console.log('Crew member already assigned to this vessel');
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

    addNotification({
      type: 'alert',
      title: 'Vessel Assignment',
      message: `You have been assigned to ${vessel.name}`,
      userId: crewId,
      priority: 'medium',
    });
  };

  const removeCrewFromVessel = (vesselId: string, crewId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) {
      console.log('Vessel not found');
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
        getVesselsForUser,
        getMaintenanceTasksForUser,
        getIssuesForUser,
        getSupplyRequestsForUser,
        getDocumentsForUser,
        getActivityLogsForUser,
        getNotificationsForUser,
        getExpensesForUser,
        updateVessel,
        assignOwnerToVessel,
        removeOwnerFromVessel,
        assignCrewToVessel,
        removeCrewFromVessel,
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
