import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Account } from "@shared/schema";

interface AccountSummaryProps {
  accounts: Account[];
}

export default function AccountSummary({ accounts }: AccountSummaryProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const maskAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return '****';
    return `****${accountNumber.slice(-4)}`;
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Checking';
      case 'savings':
        return 'Savings';
      case 'investment':
        return 'Investment';
      case 'retirement':
        return 'Retirement';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No accounts found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Connect your bank accounts to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">{account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {maskAccountNumber(account.accountNumber)} • {getAccountTypeLabel(account.type)}
                  </p>
                  {account.institution && (
                    <p className="text-xs text-muted-foreground">{account.institution}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
