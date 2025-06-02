import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Building, Utensils, Car, Home, CreditCard } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const formatCurrency = (amount: string) => {
    const value = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(value));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return <ShoppingCart className="w-5 h-5" />;
      case 'income':
      case 'salary':
        return <Building className="w-5 h-5" />;
      case 'dining':
      case 'food':
        return <Utensils className="w-5 h-5" />;
      case 'transportation':
        return <Car className="w-5 h-5" />;
      case 'housing':
        return <Home className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string, type: string) => {
    if (type === 'income') return 'bg-green-100 text-green-600';
    
    switch (category.toLowerCase()) {
      case 'shopping':
        return 'bg-blue-100 text-blue-600';
      case 'dining':
      case 'food':
        return 'bg-amber-100 text-amber-600';
      case 'transportation':
        return 'bg-purple-100 text-purple-600';
      case 'housing':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const isPositive = (amount: string, type: string) => {
    return type === 'income';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your recent transactions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getCategoryColor(transaction.category, transaction.type)}`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    isPositive(transaction.amount, transaction.type) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {isPositive(transaction.amount, transaction.type) ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {transaction.category}
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
