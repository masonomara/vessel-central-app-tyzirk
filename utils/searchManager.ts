
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaintenanceTask, Issue, SupplyRequest, Document, Vessel } from '@/types';

export interface SearchResult {
  id: string;
  type: 'maintenance' | 'issue' | 'supply' | 'document' | 'vessel';
  title: string;
  subtitle: string;
  data: any;
  relevance: number;
}

export interface SearchFilters {
  types?: Array<'maintenance' | 'issue' | 'supply' | 'document' | 'vessel'>;
  vesselId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  priority?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

class SearchManager {
  private searchHistory: string[] = [];
  private savedFilters: SavedFilter[] = [];

  constructor() {
    this.loadSearchHistory();
    this.loadSavedFilters();
  }

  private async loadSearchHistory() {
    try {
      const stored = await AsyncStorage.getItem('@search_history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  private async saveSearchHistory() {
    try {
      await AsyncStorage.setItem('@search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  private async loadSavedFilters() {
    try {
      const stored = await AsyncStorage.getItem('@saved_filters');
      if (stored) {
        this.savedFilters = JSON.parse(stored).map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
        }));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }

  private async saveSavedFilters() {
    try {
      await AsyncStorage.setItem('@saved_filters', JSON.stringify(this.savedFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  public async addToHistory(query: string) {
    if (!query.trim()) {
      return;
    }

    this.searchHistory = [
      query,
      ...this.searchHistory.filter(q => q !== query),
    ].slice(0, 10);

    await this.saveSearchHistory();
  }

  public getSearchHistory(): string[] {
    return this.searchHistory;
  }

  public async clearSearchHistory() {
    this.searchHistory = [];
    await this.saveSearchHistory();
  }

  public search(
    query: string,
    data: {
      maintenanceTasks: MaintenanceTask[];
      issues: Issue[];
      supplyRequests: SupplyRequest[];
      documents: Document[];
      vessels: Vessel[];
    },
    filters?: SearchFilters
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return results;
    }

    const shouldIncludeType = (type: string) => {
      return !filters?.types || filters.types.includes(type as any);
    };

    const matchesFilters = (item: any, type: string) => {
      if (filters?.vesselId && item.vesselId !== filters.vesselId) {
        return false;
      }
      if (filters?.status && item.status !== filters.status) {
        return false;
      }
      if (filters?.priority && item.priority !== filters.priority) {
        return false;
      }
      return true;
    };

    const calculateRelevance = (text: string, query: string): number => {
      const lowerText = text.toLowerCase();
      if (lowerText === query) {
        return 100;
      }
      if (lowerText.startsWith(query)) {
        return 90;
      }
      if (lowerText.includes(` ${query}`)) {
        return 80;
      }
      if (lowerText.includes(query)) {
        return 70;
      }
      return 0;
    };

    // Search maintenance tasks
    if (shouldIncludeType('maintenance')) {
      data.maintenanceTasks.forEach(task => {
        if (!matchesFilters(task, 'maintenance')) {
          return;
        }

        const titleRelevance = calculateRelevance(task.title, lowerQuery);
        const descRelevance = calculateRelevance(task.description || '', lowerQuery);
        const vesselRelevance = calculateRelevance(task.vesselName, lowerQuery);
        const relevance = Math.max(titleRelevance, descRelevance, vesselRelevance);

        if (relevance > 0) {
          results.push({
            id: task.id,
            type: 'maintenance',
            title: task.title,
            subtitle: `${task.vesselName} • ${task.status}`,
            data: task,
            relevance,
          });
        }
      });
    }

    // Search issues
    if (shouldIncludeType('issue')) {
      data.issues.forEach(issue => {
        if (!matchesFilters(issue, 'issue')) {
          return;
        }

        const titleRelevance = calculateRelevance(issue.title, lowerQuery);
        const descRelevance = calculateRelevance(issue.description || '', lowerQuery);
        const vesselRelevance = calculateRelevance(issue.vesselName, lowerQuery);
        const relevance = Math.max(titleRelevance, descRelevance, vesselRelevance);

        if (relevance > 0) {
          results.push({
            id: issue.id,
            type: 'issue',
            title: issue.title,
            subtitle: `${issue.vesselName} • ${issue.category}`,
            data: issue,
            relevance,
          });
        }
      });
    }

    // Search supply requests
    if (shouldIncludeType('supply')) {
      data.supplyRequests.forEach(supply => {
        if (!matchesFilters(supply, 'supply')) {
          return;
        }

        const itemRelevance = calculateRelevance(supply.itemName, lowerQuery);
        const descRelevance = calculateRelevance(supply.description || '', lowerQuery);
        const vesselRelevance = calculateRelevance(supply.vesselName, lowerQuery);
        const relevance = Math.max(itemRelevance, descRelevance, vesselRelevance);

        if (relevance > 0) {
          results.push({
            id: supply.id,
            type: 'supply',
            title: supply.itemName,
            subtitle: `${supply.vesselName} • ${supply.status}`,
            data: supply,
            relevance,
          });
        }
      });
    }

    // Search documents
    if (shouldIncludeType('document')) {
      data.documents.forEach(doc => {
        if (filters?.vesselId && doc.vesselId !== filters.vesselId) {
          return;
        }

        const titleRelevance = calculateRelevance(doc.title, lowerQuery);
        const descRelevance = calculateRelevance(doc.description || '', lowerQuery);
        const vesselRelevance = calculateRelevance(doc.vesselName, lowerQuery);
        const relevance = Math.max(titleRelevance, descRelevance, vesselRelevance);

        if (relevance > 0) {
          results.push({
            id: doc.id,
            type: 'document',
            title: doc.title,
            subtitle: `${doc.vesselName} • ${doc.category}`,
            data: doc,
            relevance,
          });
        }
      });
    }

    // Search vessels
    if (shouldIncludeType('vessel')) {
      data.vessels.forEach(vessel => {
        const nameRelevance = calculateRelevance(vessel.name, lowerQuery);
        const locationRelevance = calculateRelevance(vessel.location, lowerQuery);
        const relevance = Math.max(nameRelevance, locationRelevance);

        if (relevance > 0) {
          results.push({
            id: vessel.id,
            type: 'vessel',
            title: vessel.name,
            subtitle: `${vessel.location} • ${vessel.status}`,
            data: vessel,
            relevance,
          });
        }
      });
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  public async saveFilter(name: string, filters: SearchFilters): Promise<SavedFilter> {
    const filter: SavedFilter = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      filters,
      createdAt: new Date(),
    };

    this.savedFilters.push(filter);
    await this.saveSavedFilters();

    return filter;
  }

  public getSavedFilters(): SavedFilter[] {
    return this.savedFilters;
  }

  public async deleteSavedFilter(id: string) {
    this.savedFilters = this.savedFilters.filter(f => f.id !== id);
    await this.saveSavedFilters();
  }
}

export const searchManager = new SearchManager();
