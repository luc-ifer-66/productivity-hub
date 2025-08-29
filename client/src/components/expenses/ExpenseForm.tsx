import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { offlineStorage } from '@/lib/db';
import { useOffline } from '@/hooks/useOffline';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { insertExpenseSchema } from '@shared/schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Minus, Plus } from 'lucide-react';

const expenseFormSchema = insertExpenseSchema.extend({
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'utensils' },
  { id: 'transport', name: 'Transportation', icon: 'car' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-text' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'health', name: 'Healthcare', icon: 'heart' },
  { id: 'other', name: 'Other', icon: 'circle' },
];

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      isEMI: false,
      isDebt: false,
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/expense-categories'],
    enabled: !isOffline,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const expenseData = {
        ...data,
        id: crypto.randomUUID(),
        type: selectedType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isOffline) {
        return await offlineStorage.createExpense(expenseData);
      } else {
        const response = await apiRequest('POST', '/api/expenses', { ...data, type: selectedType });
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses/analytics'] });
      form.reset();
      setSelectedType('expense');
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      onSuccess?.();
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
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Add Transaction</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-card-foreground mb-2 block">Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedType === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('expense')}
                className={`flex-1 ${
                  selectedType === 'expense' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                data-testid="button-expense-type-expense"
              >
                <Minus className="w-4 h-4 mr-1" />
                Expense
              </Button>
              <Button
                type="button"
                variant={selectedType === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('income')}
                className={`flex-1 ${
                  selectedType === 'income' 
                    ? 'bg-chart-2 text-chart-2-foreground hover:bg-chart-2/90' 
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                data-testid="button-expense-type-income"
              >
                <Plus className="w-4 h-4 mr-1" />
                Income
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...field} 
                      data-testid="input-expense-amount"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger data-testid="select-expense-category">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCategories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Transaction description..." 
                    {...field} 
                    data-testid="input-expense-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    data-testid="input-expense-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-expense-recurring"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Recurring transaction</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {selectedType === 'expense' && (
            <>
              <FormField
                control={form.control}
                name="isEMI"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-expense-emi"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>EMI Payment</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDebt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-expense-debt"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Debt/Loan</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={createExpenseMutation.isPending}
            data-testid="button-add-transaction"
          >
            {createExpenseMutation.isPending ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
