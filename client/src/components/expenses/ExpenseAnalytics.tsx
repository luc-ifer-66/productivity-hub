import { useQuery } from '@tanstack/react-query';
import { useOffline } from '@/hooks/useOffline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';

export function ExpenseAnalytics() {
  const { isOffline } = useOffline();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/expenses/analytics'],
    enabled: !isOffline,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount || '0'));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card data-testid="card-monthly-expenses">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-sm">Monthly Expenses</span>
          </div>
          <p className="text-2xl font-bold text-card-foreground" data-testid="text-monthly-expenses">
            {formatCurrency(analytics?.totalExpenses || '0')}
          </p>
        </CardContent>
      </Card>
      
      <Card data-testid="card-monthly-income">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4 text-chart-2" />
            <span className="text-sm">Monthly Income</span>
          </div>
          <p className="text-2xl font-bold text-card-foreground" data-testid="text-monthly-income">
            {formatCurrency(analytics?.totalIncome || '0')}
          </p>
        </CardContent>
      </Card>
      
      <Card data-testid="card-pending-emis">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CreditCard className="w-4 h-4 text-chart-3" />
            <span className="text-sm">Pending EMIs</span>
          </div>
          <p className="text-2xl font-bold text-card-foreground" data-testid="text-pending-emis">
            {formatCurrency(analytics?.totalEMIs || '0')}
          </p>
        </CardContent>
      </Card>
      
      <Card data-testid="card-total-debts">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4 text-chart-4" />
            <span className="text-sm">Total Debts</span>
          </div>
          <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-debts">
            {formatCurrency(analytics?.totalDebts || '0')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
