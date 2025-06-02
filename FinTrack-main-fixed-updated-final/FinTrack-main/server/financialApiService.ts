import { Configuration, PlaidApi, PlaidEnvironments, ItemPublicTokenExchangeRequest, AccountsGetRequest, TransactionsGetRequest, InvestmentsHoldingsGetRequest, LinkTokenCreateRequest, CountryCode, Products } from 'plaid';
import axios from 'axios';
import type { FinancialConnection, Account, Transaction } from '@shared/schema';

// Plaid Service for US banks and investment accounts
export class PlaidService {
  private client: PlaidApi;

  constructor() {
    const configuration = new Configuration({
      basePath: this.getPlaidEnvironment(),
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET_KEY,
        },
      },
    });
    this.client = new PlaidApi(configuration);
  }

  private getPlaidEnvironment() {
    switch (process.env.PLAID_ENV) {
      case 'production':
        return PlaidEnvironments.production;
      case 'development':
        return PlaidEnvironments.development;
      default:
        return PlaidEnvironments.sandbox;
    }
  }

  async createLinkToken(userId: string): Promise<string> {
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET_KEY) {
      throw new Error('Plaid API credentials not configured');
    }

    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'FinTrack',
      products: [Products.Transactions, Products.Investments, Products.Assets],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const response = await this.client.linkTokenCreate(request);
    return response.data.link_token;
  }

  async exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string }> {
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET_KEY) {
      throw new Error('Plaid API credentials not configured');
    }

    const request: ItemPublicTokenExchangeRequest = {
      public_token: publicToken,
    };

    const response = await this.client.itemPublicTokenExchange(request);
    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  }

  async getAccounts(accessToken: string) {
    const request: AccountsGetRequest = {
      access_token: accessToken,
    };

    const response = await this.client.accountsGet(request);
    return response.data.accounts.map(account => ({
      plaidAccountId: account.account_id,
      name: account.name,
      type: this.mapPlaidAccountType(account.type, account.subtype),
      balance: account.balances.current?.toString() || '0',
      accountNumber: account.mask || null,
      institution: response.data.item?.institution_id || null,
      apiProvider: 'plaid' as const,
      syncStatus: 'success' as const,
    }));
  }

  async getTransactions(accessToken: string, startDate: Date, endDate: Date) {
    const request: TransactionsGetRequest = {
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };

    const response = await this.client.transactionsGet(request);
    return response.data.transactions.map(transaction => ({
      plaidTransactionId: transaction.transaction_id,
      accountId: transaction.account_id,
      description: transaction.name,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category?.[0] || 'Other',
      date: new Date(transaction.date),
      type: transaction.amount < 0 ? 'expense' : 'income' as const,
    }));
  }

  async getInvestmentHoldings(accessToken: string) {
    const request: InvestmentsHoldingsGetRequest = {
      access_token: accessToken,
    };

    const response = await this.client.investmentsHoldingsGet(request);
    return {
      accounts: response.data.accounts,
      holdings: response.data.holdings,
      securities: response.data.securities,
    };
  }

  private mapPlaidAccountType(type: string, subtype: string | null): string {
    if (type === 'investment') return 'investment';
    if (subtype === '401k' || subtype === 'ira' || subtype === 'roth') return 'retirement';
    if (type === 'depository') {
      if (subtype === 'checking') return 'checking';
      if (subtype === 'savings') return 'savings';
    }
    return 'checking';
  }
}

// Basiq Service for Australian banks
export class BasiqService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BASIQ_API_KEY || '';
    this.baseUrl = process.env.BASIQ_ENV === 'production' 
      ? 'https://au-api.basiq.io' 
      : 'https://au-api.basiq.io';
  }

  async createConnection(institutionId: string, loginCredentials: any): Promise<{ connectionId: string; accessToken: string }> {
    if (!this.apiKey) {
      throw new Error('Basiq API credentials not configured');
    }

    const response = await axios.post(
      `${this.baseUrl}/users/{userId}/connections`,
      {
        institution: { id: institutionId },
        loginCredentials: loginCredentials,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      connectionId: response.data.id,
      accessToken: response.data.id, // Basiq uses connection ID as access token
    };
  }

  async getAccounts(connectionId: string) {
    const response = await axios.get(
      `${this.baseUrl}/users/{userId}/accounts`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          'filter[connection.id]': connectionId,
        },
      }
    );

    return response.data.data.map((account: any) => ({
      basiqAccountId: account.id,
      name: account.displayName || account.accountNo,
      type: this.mapBasiqAccountType(account.class, account.type),
      balance: account.balance.toString(),
      accountNumber: account.accountNo || null,
      institution: account.institution?.shortName || null,
      apiProvider: 'basiq' as const,
      syncStatus: 'success' as const,
    }));
  }

  async getTransactions(connectionId: string, startDate: Date, endDate: Date) {
    const response = await axios.get(
      `${this.baseUrl}/users/{userId}/transactions`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          'filter[connection.id]': connectionId,
          'filter[postDate.gte]': startDate.toISOString().split('T')[0],
          'filter[postDate.lte]': endDate.toISOString().split('T')[0],
        },
      }
    );

    return response.data.data.map((transaction: any) => ({
      basiqTransactionId: transaction.id,
      accountId: transaction.account,
      description: transaction.description,
      amount: Math.abs(parseFloat(transaction.amount)).toString(),
      category: transaction.class || 'Other',
      date: new Date(transaction.postDate),
      type: parseFloat(transaction.amount) < 0 ? 'expense' : 'income' as const,
    }));
  }

  private mapBasiqAccountType(accountClass: string, accountType: string): string {
    if (accountClass === 'investment') return 'investment';
    if (accountClass === 'bank') {
      if (accountType === 'savings') return 'savings';
      if (accountType === 'transaction') return 'checking';
    }
    return 'checking';
  }
}

// Factory for creating the appropriate service
export class FinancialApiFactory {
  static createService(provider: string) {
    switch (provider) {
      case 'plaid':
        return new PlaidService();
      case 'basiq':
        return new BasiqService();
      default:
        throw new Error(`Unsupported financial API provider: ${provider}`);
    }
  }
}