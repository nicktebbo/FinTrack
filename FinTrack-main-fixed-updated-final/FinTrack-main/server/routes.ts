import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAccountSchema,
  insertTransactionSchema,
  insertGoalSchema,
  insertFinancialConnectionSchema
} from "@shared/schema";
import { PlaidService, FinancialApiFactory } from "./financialApiService";
import { z } from "zod";

// Temporary middleware to simulate authenticated requests
interface AuthedRequest extends Request {
  user: { claims: { sub: string } };
}

const isAuthenticated = (req: AuthedRequest, res: Response, next: Function) => {
  // TODO: Replace this with real authentication (JWT, session, etc.)
  req.user = { claims: { sub: "demo-user-id" } }; // Simulate a user
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // GET current user
  app.get('/api/auth/user', isAuthenticated, async (req: AuthedRequest, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // --- Remaining routes unchanged except for using isAuthenticated ---
  // All routes below are fully usable with the stub auth.

  app.get('/api/accounts', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const accounts = await storage.getAccountsByUserId(req.user.claims.sub);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post('/api/accounts', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const data = insertAccountSchema.parse({ ...req.body, userId: req.user.claims.sub });
      const account = await storage.createAccount(data);
      res.json(account);
    } catch (error) {
      console.error("Create account error:", error);
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getTransactionsByUserId(req.user.claims.sub, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const data = insertTransactionSchema.parse({ ...req.body, userId: req.user.claims.sub });
      const transaction = await storage.createTransaction(data);
      res.json(transaction);
    } catch (error) {
      console.error("Transaction error:", error);
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.get('/api/goals', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const goals = await storage.getGoalsByUserId(req.user.claims.sub);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const goalData = insertGoalSchema.parse({ ...req.body, userId: req.user.claims.sub });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Goal error:", error);
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.get('/api/insights', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const insights = await storage.getInsightsByUserId(req.user.claims.sub);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post('/api/insights/:id/read', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      await storage.markInsightAsRead(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark insight as read" });
    }
  });

  app.get('/api/financial-connections', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const connections = await storage.getFinancialConnectionsByUserId(req.user.claims.sub);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial connections" });
    }
  });

  app.post('/api/plaid/link-token', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const token = await new PlaidService().createLinkToken(req.user.claims.sub);
      res.json({ link_token: token });
    } catch (error) {
      res.status(500).json({ message: "Failed to create link token" });
    }
  });

  app.post('/api/plaid/exchange-token', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const { public_token } = req.body;

      if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET_KEY) {
        return res.status(400).json({ message: "Missing Plaid API credentials" });
      }

      const plaidService = new PlaidService();
      const { accessToken, itemId } = await plaidService.exchangePublicToken(public_token);

      const connection = await storage.createFinancialConnection({
        userId: req.user.claims.sub,
        provider: 'plaid',
        accessToken,
        itemId,
        institutionId: 'unknown',
        institutionName: 'Connected Bank',
      });

      res.json({ success: true, connectionId: connection.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect bank account" });
    }
  });

  app.post('/api/sync-accounts', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getFinancialConnectionsByUserId(userId);

      let syncedCount = 0;

      for (const conn of connections) {
        try {
          const api = FinancialApiFactory.createService(conn.provider);

          if (conn.provider === 'plaid') {
            const accounts = await (api as PlaidService).getAccounts(conn.accessToken);

            for (const acc of accounts) {
              await storage.createAccount({ userId, ...acc });
              syncedCount++;
            }
          }

          await storage.updateFinancialConnection(conn.id, { lastSyncAt: new Date() });
        } catch (err) {
          console.error(`Sync error for connection ${conn.id}:`, err);
        }
      }

      res.json({ success: true, message: `Synced ${syncedCount} accounts.` });
    } catch (error) {
      res.status(500).json({ message: "Sync failed" });
    }
  });

  app.get('/api/dashboard/summary', isAuthenticated, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const [accounts, transactions, goals, insights] = await Promise.all([
        storage.getAccountsByUserId(userId),
        storage.getTransactionsByUserId(userId, 10),
        storage.getGoalsByUserId(userId),
        storage.getInsightsByUserId(userId)
      ]);

      const totalAssets = accounts.reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
      const totalInvestments = accounts.filter(a => a.type === 'investment').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);
      const totalRetirement = accounts.filter(a => a.type === 'retirement').reduce((sum, a) => sum + parseFloat(a.balance || '0'), 0);

      const currentDate = new Date();
      const monthlyExpenses = transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
      });

      const monthlySpending = monthlyExpenses.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || '0')), 0);

      res.json({
        totalAssets,
        totalInvestments,
        totalRetirement,
        monthlySpending,
        accountsCount: accounts.length,
        recentTransactions: transactions.slice(0, 5),
        activeGoals: goals.filter(g => !g.isCompleted),
        unreadInsights: insights.filter(i => !i.isRead)
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  return createServer(app);
}
