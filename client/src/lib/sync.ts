import { apiRequest } from './queryClient';
import { offlineStorage, db } from './db';
import { useOffline } from '@/hooks/useOffline';

class SyncManager {
  private syncInProgress = false;
  private syncIntervalId: NodeJS.Timeout | null = null;

  async startSync() {
    if (this.syncIntervalId) return;
    
    // Initial sync
    await this.performSync();
    
    // Set up periodic sync every 30 seconds when online
    this.syncIntervalId = setInterval(async () => {
      if (navigator.onLine) {
        await this.performSync();
      }
    }, 30000);
  }

  stopSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  async performSync() {
    if (this.syncInProgress || !navigator.onLine) return;
    
    this.syncInProgress = true;
    
    try {
      // Get all pending sync items
      const syncQueue = await offlineStorage.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          await this.syncItem(item);
          await offlineStorage.removeSyncQueueItem(item.id!);
        } catch (error) {
          console.error('Sync error for item:', item, error);
          await offlineStorage.incrementSyncRetries(item.id!);
          
          // Remove items that have failed too many times
          if (item.retries >= 3) {
            await offlineStorage.removeSyncQueueItem(item.id!);
          }
        }
      }
      
      // Sync down data from server
      await this.syncFromServer();
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: any) {
    const { type, action, itemId, data } = item;
    
    switch (type) {
      case 'task':
        await this.syncTask(action, itemId, data);
        break;
      case 'expense':
        await this.syncExpense(action, itemId, data);
        break;
      case 'note':
        await this.syncNote(action, itemId, data);
        break;
      case 'project':
        await this.syncProject(action, itemId, data);
        break;
      case 'expense-category':
        await this.syncExpenseCategory(action, itemId, data);
        break;
    }
  }

  private async syncTask(action: string, itemId: string, data: any) {
    switch (action) {
      case 'create':
        await apiRequest('POST', '/api/tasks', data);
        await db.tasks.update(itemId, { syncStatus: 'synced' });
        break;
      case 'update':
        await apiRequest('PUT', `/api/tasks/${itemId}`, data);
        await db.tasks.update(itemId, { syncStatus: 'synced' });
        break;
      case 'delete':
        await apiRequest('DELETE', `/api/tasks/${itemId}`);
        break;
    }
  }

  private async syncExpense(action: string, itemId: string, data: any) {
    switch (action) {
      case 'create':
        await apiRequest('POST', '/api/expenses', data);
        await db.expenses.update(itemId, { syncStatus: 'synced' });
        break;
      case 'update':
        await apiRequest('PUT', `/api/expenses/${itemId}`, data);
        await db.expenses.update(itemId, { syncStatus: 'synced' });
        break;
      case 'delete':
        await apiRequest('DELETE', `/api/expenses/${itemId}`);
        break;
    }
  }

  private async syncNote(action: string, itemId: string, data: any) {
    switch (action) {
      case 'create':
        await apiRequest('POST', '/api/notes', data);
        await db.notes.update(itemId, { syncStatus: 'synced' });
        break;
      case 'update':
        await apiRequest('PUT', `/api/notes/${itemId}`, data);
        await db.notes.update(itemId, { syncStatus: 'synced' });
        break;
      case 'delete':
        await apiRequest('DELETE', `/api/notes/${itemId}`);
        break;
    }
  }

  private async syncProject(action: string, itemId: string, data: any) {
    switch (action) {
      case 'create':
        await apiRequest('POST', '/api/projects', data);
        await db.projects.update(itemId, { syncStatus: 'synced' });
        break;
      case 'update':
        await apiRequest('PUT', `/api/projects/${itemId}`, data);
        await db.projects.update(itemId, { syncStatus: 'synced' });
        break;
      case 'delete':
        await apiRequest('DELETE', `/api/projects/${itemId}`);
        break;
    }
  }

  private async syncExpenseCategory(action: string, itemId: string, data: any) {
    switch (action) {
      case 'create':
        await apiRequest('POST', '/api/expense-categories', data);
        await db.expenseCategories.update(itemId, { syncStatus: 'synced' });
        break;
    }
  }

  private async syncFromServer() {
    try {
      // Fetch latest data from server and update local storage
      const [tasks, expenses, notes, projects] = await Promise.all([
        fetch('/api/tasks').then(res => res.json()),
        fetch('/api/expenses').then(res => res.json()),
        fetch('/api/notes').then(res => res.json()),
        fetch('/api/projects').then(res => res.json()),
      ]);

      // Update local storage with server data
      await this.updateLocalData('tasks', tasks);
      await this.updateLocalData('expenses', expenses);
      await this.updateLocalData('notes', notes);
      await this.updateLocalData('projects', projects);
      
    } catch (error) {
      console.error('Failed to sync from server:', error);
    }
  }

  private async updateLocalData(type: string, serverData: any[]) {
    for (const item of serverData) {
      const localItem = await this.getLocalItem(type, item.id);
      
      if (!localItem) {
        // Item doesn't exist locally, add it
        await this.addLocalItem(type, { ...item, syncStatus: 'synced' });
      } else if (localItem.syncStatus === 'synced' && 
                 new Date(item.updatedAt) > new Date(localItem.updatedAt)) {
        // Server has newer version, update local
        await this.updateLocalItem(type, item.id, { ...item, syncStatus: 'synced' });
      }
    }
  }

  private async getLocalItem(type: string, id: string) {
    switch (type) {
      case 'tasks': return await db.tasks.get(id);
      case 'expenses': return await db.expenses.get(id);
      case 'notes': return await db.notes.get(id);
      case 'projects': return await db.projects.get(id);
      default: return null;
    }
  }

  private async addLocalItem(type: string, item: any) {
    switch (type) {
      case 'tasks': await db.tasks.add(item); break;
      case 'expenses': await db.expenses.add(item); break;
      case 'notes': await db.notes.add(item); break;
      case 'projects': await db.projects.add(item); break;
    }
  }

  private async updateLocalItem(type: string, id: string, updates: any) {
    switch (type) {
      case 'tasks': await db.tasks.update(id, updates); break;
      case 'expenses': await db.expenses.update(id, updates); break;
      case 'notes': await db.notes.update(id, updates); break;
      case 'projects': await db.projects.update(id, updates); break;
    }
  }
}

export const syncManager = new SyncManager();

// Hook for using sync status
export function useSyncStatus() {
  const { isOnline } = useOffline();
  
  return {
    isOnline,
    isSyncing: syncManager['syncInProgress'],
  };
}
