import {
  users,
  projects,
  tasks,
  expenses,
  expenseCategories,
  notes,
  noteLinks,
  taskNoteLinks,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Expense,
  type InsertExpense,
  type ExpenseCategory,
  type InsertExpenseCategory,
  type Note,
  type InsertNote,
  type NoteLink,
  type InsertNoteLink,
  type TaskNoteLink,
  type InsertTaskNoteLink,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, sum } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string, userId: string): Promise<void>;

  // Task operations
  getTasks(userId: string, projectId?: string): Promise<Task[]>;
  getTask(id: string, userId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string, userId: string): Promise<void>;

  // Expense category operations
  getExpenseCategories(userId: string): Promise<ExpenseCategory[]>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;

  // Expense operations
  getExpenses(userId: string, categoryId?: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string, userId: string): Promise<void>;
  getExpenseAnalytics(userId: string, startDate?: string, endDate?: string): Promise<any>;

  // Note operations
  getNotes(userId: string, projectId?: string): Promise<Note[]>;
  getNote(id: string, userId: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: string, userId: string): Promise<void>;

  // Note link operations
  createNoteLink(link: InsertNoteLink): Promise<NoteLink>;
  getNoteLinks(noteId: string): Promise<NoteLink[]>;

  // Task-Note link operations
  createTaskNoteLink(link: InsertTaskNoteLink): Promise<TaskNoteLink>;
  getTaskNoteLinks(taskId?: string, noteId?: string): Promise<TaskNoteLink[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(asc(projects.name));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  }

  // Task operations
  async getTasks(userId: string, projectId?: string): Promise<Task[]> {
    const query = db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    if (projectId) {
      query.where(and(eq(tasks.userId, userId), eq(tasks.projectId, projectId)));
    }

    return await query.orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  // Expense category operations
  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.userId, userId))
      .orderBy(asc(expenseCategories.name));
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [newCategory] = await db.insert(expenseCategories).values(category).returning();
    return newCategory;
  }

  // Expense operations
  async getExpenses(userId: string, categoryId?: string): Promise<Expense[]> {
    const query = db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId));

    if (categoryId) {
      query.where(and(eq(expenses.userId, userId), eq(expenses.categoryId, categoryId)));
    }

    return await query.orderBy(desc(expenses.date));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  async getExpenseAnalytics(userId: string, startDate?: string, endDate?: string): Promise<any> {
    const conditions = [eq(expenses.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(expenses.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(expenses.date, endDate));
    }

    const [totalIncome] = await db
      .select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(and(...conditions, eq(expenses.type, 'income')));

    const [totalExpenses] = await db
      .select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(and(...conditions, eq(expenses.type, 'expense')));

    const [totalDebts] = await db
      .select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(and(...conditions, eq(expenses.isDebt, true)));

    const [totalEMIs] = await db
      .select({ amount: sum(expenses.amount) })
      .from(expenses)
      .where(and(...conditions, eq(expenses.isEMI, true)));

    return {
      totalIncome: totalIncome?.amount || '0',
      totalExpenses: totalExpenses?.amount || '0',
      totalDebts: totalDebts?.amount || '0',
      totalEMIs: totalEMIs?.amount || '0',
      balance: (parseFloat(totalIncome?.amount || '0') - parseFloat(totalExpenses?.amount || '0')).toString(),
    };
  }

  // Note operations
  async getNotes(userId: string, projectId?: string): Promise<Note[]> {
    const query = db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));

    if (projectId) {
      query.where(and(eq(notes.userId, userId), eq(notes.projectId, projectId)));
    }

    return await query.orderBy(desc(notes.updatedAt));
  }

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return note;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(id: string, note: Partial<InsertNote>): Promise<Note> {
    const [updatedNote] = await db
      .update(notes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  }

  // Note link operations
  async createNoteLink(link: InsertNoteLink): Promise<NoteLink> {
    const [newLink] = await db.insert(noteLinks).values(link).returning();
    return newLink;
  }

  async getNoteLinks(noteId: string): Promise<NoteLink[]> {
    return await db
      .select()
      .from(noteLinks)
      .where(eq(noteLinks.fromNoteId, noteId));
  }

  // Task-Note link operations
  async createTaskNoteLink(link: InsertTaskNoteLink): Promise<TaskNoteLink> {
    const [newLink] = await db.insert(taskNoteLinks).values(link).returning();
    return newLink;
  }

  async getTaskNoteLinks(taskId?: string, noteId?: string): Promise<TaskNoteLink[]> {
    let query = db.select().from(taskNoteLinks);

    if (taskId && noteId) {
      query = query.where(and(eq(taskNoteLinks.taskId, taskId), eq(taskNoteLinks.noteId, noteId)));
    } else if (taskId) {
      query = query.where(eq(taskNoteLinks.taskId, taskId));
    } else if (noteId) {
      query = query.where(eq(taskNoteLinks.noteId, noteId));
    }

    return await query;
  }
}

export const storage = new DatabaseStorage();
