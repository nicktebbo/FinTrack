import {
  users,
  accounts,
  transactions,
  goals,
  insights,
  financialConnections,
  type User,
  type UpsertUser,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type Goal,
  type InsertGoal,
  type Insight,
  type FinancialConnection,
  type InsertFinancialConnection,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Account operations
  getAccountsByUserId(userId: string): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(accountId: number, balance: string): Promise<void>;

  // Transaction operations
  getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByAccountId(accountId: number): Promise<Transaction[]>;

  // Goal operations
  getGoalsByUserId(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(goalId: number, currentAmount: string): Promise<void>;

  // Insight operations
  getInsightsByUserId(userId: string): Promise<Insight[]>;
  createInsight(insight: Omit<Insight, "id" | "createdAt" | "isRead">): Promise<Insight>;
  markInsightAsRead(insightId: number): Promise<void>;

  // Financial connection operations
  getFinancialConnectionsByUserId(userId: string): Promise<FinancialConnection[]>;
  createFinancialConnection(connection: InsertFinancialConnection): Promise<FinancialConnection>;
  updateFinancialConnection(connectionId: number, updates: Partial<FinancialConnection>): Promise<void>;
  deleteFinancialConnection(connectionId: number): Promise<void>;
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

  // Account operations
  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(accounts.createdAt);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db
      .insert(accounts)
      .values({ ...account, updatedAt: new Date() })
      .returning();
    return newAccount;
  }

  async updateAccountBalance(accountId: number, balance: string): Promise<void> {
    await db
      .update(accounts)
      .set({ balance, updatedAt: new Date() })
      .where(eq(accounts.id, accountId));
  }

  // Transaction operations
  async getTransactionsByUserId(userId: string, limit = 50): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({ ...transaction, updatedAt: new Date() })
      .returning();
    return newTransaction;
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date));
  }

  // Goal operations
  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    return db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(goals.createdAt);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({ ...goal, updatedAt: new Date() })
      .returning();
    return newGoal;
  }

  async updateGoalProgress(goalId: number, currentAmount: string): Promise<void> {
    await db
      .update(goals)
      .set({ currentAmount, updatedAt: new Date() })
      .where(eq(goals.id, goalId));
  }

  // Insight operations
  async getInsightsByUserId(userId: string): Promise<Insight[]> {
    return db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.createdAt));
  }

  async createInsight(insight: Omit<Insight, "id" | "createdAt" | "isRead">): Promise<Insight> {
    const [newInsight] = await db
      .insert(insights)
      .values({
        ...insight,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();
    return newInsight;
  }

  async markInsightAsRead(insightId: number): Promise<void> {
    await db
      .update(insights)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(insights.id, insightId));
  }

  // Financial connection operations
  async getFinancialConnectionsByUserId(userId: string): Promise<FinancialConnection[]> {
    return db
      .select()
      .from(financialConnections)
      .where(and(eq(financialConnections.userId, userId), eq(financialConnections.isActive, true)))
      .orderBy(financialConnections.createdAt);
  }

  async createFinancialConnection(connection: InsertFinancialConnection): Promise<FinancialConnection> {
    const [newConnection] = await db
      .insert(financialConnections)
      .values({ ...connection, updatedAt: new Date() })
      .returning();
    return newConnection;
  }

  async updateFinancialConnection(connectionId: number, updates: Partial<FinancialConnection>): Promise<void> {
    await db
      .update(financialConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(financialConnections.id, connectionId));
  }

  async deleteFinancialConnection(connectionId: number): Promise<void> {
    await db
      .update(financialConnections)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(financialConnections.id, connectionId));
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
