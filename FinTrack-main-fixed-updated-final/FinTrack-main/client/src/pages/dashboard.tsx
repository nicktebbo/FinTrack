import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import PortfolioChart from "@/components/charts/portfolio-chart";
import SpendingChart from "@/components/charts/spending-chart";
import AccountSummary from "@/components/financial/account-summary";
import TransactionList from "@/components/financial/transaction-list";
import AIInsights from "@/components/financial/ai-insights";
import ConnectAccounts from "@/components/financial/connect-accounts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, PiggyBank, CreditCard } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });

      const timeout = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isLoading, toast, navigate]);

  // API data fetching
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery(
    ["/api/dashboard/summary"],
    { enabled: isAuthenticated, retry: false }
  );

  const { data: accounts, isLoading: accountsLoading } = useQuery(
    ["/api/accounts"],
    { enabled: isAuthenticated, retry: false }
  );

  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    ["/api/transactions"],
    { enabled: isAuthenticated, retry: false }
  );

  const { data: insights, isLoading: insightsLoading } = useQuery(
    ["/api/insights"],
    { enabled: isAuthenticated, retry: false }
  );

  // Loading UI
  if (isLoading || summaryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="min-h-screen bg-background text-center p-8">
        <Navbar />
        <p className="text-red-600 font-semibold">Failed to load dashboard summary.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of your financial health</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="metric-gradient-green text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Assets</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(summary?.totalAssets || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
              <p className="text-green-100 text-sm mt-2">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="metric-gradient-blue text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Investments</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(summary?.totalInvestments || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm mt-2">+8.3% this quarter</p>
            </CardContent>
          </Card>

          <Card className="metric-gradient-amber text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Monthly Spending</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(summary?.monthlySpending || 0)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-amber-200" />
              </div>
              <p className="text-amber-100 text-sm mt-2">-5.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="metric-gradient-purple text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Retirement Savings</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(summary?.totalRetirement || 0)}
                  </p>
                </div>
                <PiggyBank className="h-8 w-8 text-purple-200" />
              </div>
              <p className="text-purple-100 text-sm mt-2">On track for goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <PortfolioChart />
          <SpendingChart />
        </div>

        {/* Accounts and Insights */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionList transactions={transactions || []} loading={transactionsLoading} />
          </div>

          <div className="space-y-8">
            <ConnectAccounts />
            <AIInsights insights={insights || []} loading={insightsLoading} />
            <AccountSummary accounts={accounts || []} loading={accountsLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
