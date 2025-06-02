import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // checking, savings, investment, retirement
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  accountNumber: varchar("account_number").default(null), // optional
  institution: varchar("institution").default(null), // optional
  isActive: boolean("is_active").default(true),
  // Financial API integration fields
  plaidAccountId: varchar("plaid_account_id").default(null),
  basiqAccountId: varchar("basiq_account_id").default(null),
  apiProvider: varchar("api_provider").default(null), // plaid, basiq, yodlee, manual
  lastSyncAt: timestamp("last_sync_at").default(null),
  syncStatus: varchar("sync_status").default("pending"), // pending, syncing, success, error
  syncError: text("sync_error").default(null),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financialConnections = pgTable("financial_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  provider: varchar("provider").notNull(), // plaid, basiq, yodlee
  accessToken: text("access_token").notNull(),
  itemId: varchar("item_id").default(null), // Plaid item ID
  institutionId: varchar("institution_id").default(null),
  institutionName: varchar("institution_name").default(null),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at").default(null),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  description: varchar("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category").notNull(),
  date: timestamp("date").notNull(),
  type: varchar("type").notNull(), // income, expense, transfer
  // Financial API integration fields
  plaidTransactionId: varchar("plaid_transaction_id").default(null),
  basiqTransactionId: varchar("basiq_transaction_id").default(null),
  apiProvider: varchar("api_provider").default(null), // plaid, basiq, yodlee, manual
  merchantName: varchar("merchant_name").default(null),
  location: text("location").default(null),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default(0),
  targetDate: timestamp("target_date").default(null),
  category: varchar("category").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // spending_alert, investment_opportunity, goal_progress
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull(), // low, medium, high
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAccount = typeof accounts.$inferInsert;
export type Account = typeof accounts.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;

export type InsertGoal = typeof goals.$inferInsert;
export type Goal = typeof goals.$inferSelect;

export type InsertInsight = typeof insights.$inferInsert;
export type Insight = typeof insights.$inferSelect;

export type InsertFinancialConnection = typeof financialConnections.$inferInsert;
export type FinancialConnection = typeof financialConnections.$inferSelect;

// Zod schemas for inserts, omit auto-generated columns
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialConnectionSchema = createInsertSchema(financialConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
