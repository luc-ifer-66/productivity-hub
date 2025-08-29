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
import { insertTaskSchema } from '@shared/schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const taskFormSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const { isOffline } = useOffline();
  const queryClient = useQueryClient();
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      reminderEnabled: false,
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !isOffline,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const taskData = {
        ...data,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isOffline) {
        return await offlineStorage.createTask(taskData);
      } else {
        const response = await apiRequest('POST', '/api/tasks', data);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      form.reset();
      setSelectedPriority('medium');
      toast({
        title: 'Success',
        description: 'Task created successfully',
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
        description: 'Failed to create task',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate({ ...data, priority: selectedPriority });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Add New Task</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter task title..." 
                    {...field} 
                    data-testid="input-task-title"
                  />
                </FormControl>
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
                  <Textarea 
                    placeholder="Enter task description..." 
                    {...field} 
                    data-testid="input-task-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Label</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger data-testid="select-task-project">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-task-due-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      data-testid="input-task-due-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-card-foreground mb-2 block">Priority</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <Button
                  key={priority}
                  type="button"
                  variant={selectedPriority === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPriority(priority)}
                  className={`flex-1 ${
                    selectedPriority === priority 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`button-priority-${priority}`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="reminderEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-task-reminder"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Set reminder notification</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={createTaskMutation.isPending}
            data-testid="button-create-task"
          >
            {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
