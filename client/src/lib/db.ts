import Dexie, { type EntityTable } from 'dexie';

export interface LocalTask {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  dueDate?: string;
  dueTime?: string;
  reminderEnabled: boolean;
  parentTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface LocalExpense {
  id: string;
  userId: string;
  categoryId?: string;
  type: string;
  amount: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  recurringType?: string;
  isEMI: boolean;
  emiMonths?: number;
  emiRemaining?: number;
  isDebt: boolean;
  debtTo?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface LocalNote {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface LocalProject {
  id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface LocalExpenseCategory {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface SyncQueue {
  id?: number;
  type: 'task' | 'expense' | 'note' | 'project' | 'expense-category';
  action: 'create' | 'update' | 'delete';
  itemId: string;
  data?: any;
  createdAt: Date;
  retries: number;
}

const db = new Dexie('ProductivityHubDB') as Dexie & {
  tasks: EntityTable<LocalTask, 'id'>;
  expenses: EntityTable<LocalExpense, 'id'>;
  notes: EntityTable<LocalNote, 'id'>;
  projects: EntityTable<LocalProject, 'id'>;
  expenseCategories: EntityTable<LocalExpenseCategory, 'id'>;
  syncQueue: EntityTable<SyncQueue, 'id'>;
};

db.version(1).stores({
  tasks: 'id, userId, projectId, completed, priority, dueDate, syncStatus',
  expenses: 'id, userId, categoryId, type, date, isRecurring, isEMI, isDebt, syncStatus',
  notes: 'id, userId, projectId, syncStatus',
  projects: 'id, userId, syncStatus',
  expenseCategories: 'id, userId, syncStatus',
  syncQueue: '++id, type, action, itemId, createdAt'
});

export { db };

// Utility functions for offline storage
export const offlineStorage = {
  // Tasks
  async getTasks(userId: string, projectId?: string) {
    let query = db.tasks.where('userId').equals(userId);
    if (projectId) {
      query = query.and(task => task.projectId === projectId);
    }
    return await query.toArray();
  },

  async createTask(task: Omit<LocalTask, 'syncStatus'>) {
    const taskWithSync = { ...task, syncStatus: 'pending' as const };
    await db.tasks.add(taskWithSync);
    await this.addToSyncQueue('task', 'create', task.id, task);
    return taskWithSync;
  },

  async updateTask(id: string, updates: Partial<LocalTask>) {
    const updatedTask = { ...updates, syncStatus: 'pending' as const, updatedAt: new Date() };
    await db.tasks.update(id, updatedTask);
    await this.addToSyncQueue('task', 'update', id, updates);
    return updatedTask;
  },

  async deleteTask(id: string) {
    await db.tasks.delete(id);
    await this.addToSyncQueue('task', 'delete', id);
  },

  // Expenses
  async getExpenses(userId: string, categoryId?: string) {
    let query = db.expenses.where('userId').equals(userId);
    if (categoryId) {
      query = query.and(expense => expense.categoryId === categoryId);
    }
    return await query.toArray();
  },

  async createExpense(expense: Omit<LocalExpense, 'syncStatus'>) {
    const expenseWithSync = { ...expense, syncStatus: 'pending' as const };
    await db.expenses.add(expenseWithSync);
    await this.addToSyncQueue('expense', 'create', expense.id, expense);
    return expenseWithSync;
  },

  async updateExpense(id: string, updates: Partial<LocalExpense>) {
    const updatedExpense = { ...updates, syncStatus: 'pending' as const, updatedAt: new Date() };
    await db.expenses.update(id, updatedExpense);
    await this.addToSyncQueue('expense', 'update', id, updates);
    return updatedExpense;
  },

  async deleteExpense(id: string) {
    await db.expenses.delete(id);
    await this.addToSyncQueue('expense', 'delete', id);
  },

  // Notes
  async getNotes(userId: string, projectId?: string) {
    let query = db.notes.where('userId').equals(userId);
    if (projectId) {
      query = query.and(note => note.projectId === projectId);
    }
    return await query.toArray();
  },

  async createNote(note: Omit<LocalNote, 'syncStatus'>) {
    const noteWithSync = { ...note, syncStatus: 'pending' as const };
    await db.notes.add(noteWithSync);
    await this.addToSyncQueue('note', 'create', note.id, note);
    return noteWithSync;
  },

  async updateNote(id: string, updates: Partial<LocalNote>) {
    const updatedNote = { ...updates, syncStatus: 'pending' as const, updatedAt: new Date() };
    await db.notes.update(id, updatedNote);
    await this.addToSyncQueue('note', 'update', id, updates);
    return updatedNote;
  },

  async deleteNote(id: string) {
    await db.notes.delete(id);
    await this.addToSyncQueue('note', 'delete', id);
  },

  // Projects
  async getProjects(userId: string) {
    return await db.projects.where('userId').equals(userId).toArray();
  },

  async createProject(project: Omit<LocalProject, 'syncStatus'>) {
    const projectWithSync = { ...project, syncStatus: 'pending' as const };
    await db.projects.add(projectWithSync);
    await this.addToSyncQueue('project', 'create', project.id, project);
    return projectWithSync;
  },

  // Sync queue management
  async addToSyncQueue(type: SyncQueue['type'], action: SyncQueue['action'], itemId: string, data?: any) {
    await db.syncQueue.add({
      type,
      action,
      itemId,
      data,
      createdAt: new Date(),
      retries: 0
    });
  },

  async getSyncQueue() {
    return await db.syncQueue.orderBy('createdAt').toArray();
  },

  async removeSyncQueueItem(id: number) {
    await db.syncQueue.delete(id);
  },

  async incrementSyncRetries(id: number) {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, { retries: item.retries + 1 });
    }
  }
};
