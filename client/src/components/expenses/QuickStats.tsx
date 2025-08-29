import { useQuery } from '@tanstack/react-query';
import { useOffline } from '@/hooks/useOffline';

export function QuickStats() {
  const { isOffline } = useOffline();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/expenses/analytics'],
    enabled: !isOffline,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount || '0'));
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Today</span>
          <span className="font-medium text-destructive" data-testid="text-stats-today">
            -{formatCurrency('0')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">This Week</span>
          <span className="font-medium text-destructive" data-testid="text-stats-week">
            -{formatCurrency('0')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">This Month</span>
          <span className="font-medium text-destructive" data-testid="text-stats-month">
            -{formatCurrency(analytics?.totalExpenses || '0')}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-3">
          <span className="text-muted-foreground">Balance</span>
          <span className={`font-medium ${
            parseFloat(analytics?.balance || '0') >= 0 ? 'text-chart-2' : 'text-destructive'
          }`} data-testid="text-stats-balance">
            {formatCurrency(analytics?.balance || '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
