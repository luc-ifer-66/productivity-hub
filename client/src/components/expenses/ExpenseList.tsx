import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { offlineStorage } from '@/lib/db';
import { useOffline } from '@/hooks/useOffline';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'utensils' },
  { id: 'transport', name: 'Transportation', icon: 'car' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-text' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'health', name: 'Healthcare', icon: 'heart' },
  { id: 'other', name: 'Other', icon: 'circle' },
];

export function ExpenseList() {
  const { toast } = useToast();
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['/api/expenses'],
    enabled: !isOffline,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/expense-categories'],
    enabled: !isOffline,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isOffline) {
        await offlineStorage.deleteExpense(id);
      } else {
        await apiRequest('DELETE', `/api/expenses/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/analytics'] });
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
  });

  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const filteredExpenses = expenses.filter((expense: any) => {
    return !selectedCategory || expense.categoryId === selectedCategory;
  });

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpenseMutation.mutate(expenseId);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = availableCategories.find((c: any) => c.id === categoryId);
    return category?.icon || 'circle';
  };

  const getCategoryName = (categoryId: string) => {
    const category = availableCategories.find((c: any) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getTransactionIcon = (type: string, isEMI: boolean, isDebt: boolean) => {
    if (isEMI) return 'home';
    if (isDebt) return 'users';
    return type === 'income' ? 'trending-up' : 'trending-down';
  };

  const getTransactionColor = (type: string, isEMI: boolean, isDebt: boolean) => {
    if (isEMI) return 'bg-chart-4/20 text-chart-4';
    if (isDebt) return 'bg-chart-5/20 text-chart-5';
    return type === 'income' ? 'bg-chart-2/20 text-chart-2' : 'bg-destructive/20 text-destructive';
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/30 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-expense-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {availableCategories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-export-expenses">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-expenses">
            {selectedCategory ? 'No transactions in this category' : 'No transactions yet. Add your first transaction!'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense: any) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                data-testid={`expense-item-${expense.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTransactionColor(expense.type, expense.isEMI, expense.isDebt)}`}>
                    <span className="text-sm font-medium">
                      {expense.type === 'income' ? '+' : '-'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      {expense.description || `${expense.type === 'income' ? 'Income' : 'Expense'} Transaction`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(expense.categoryId)} • {formatDate(expense.date)}
                      {expense.isRecurring && ' • Recurring'}
                      {expense.isEMI && ' • EMI'}
                      {expense.isDebt && ' • Debt'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-medium ${expense.type === 'income' ? 'text-chart-2' : 'text-destructive'}`}>
                      {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid={`button-expense-menu-${expense.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-destructive focus:text-destructive"
                        data-testid={`menu-delete-expense-${expense.id}`}
                      >
                        Delete Transaction
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
