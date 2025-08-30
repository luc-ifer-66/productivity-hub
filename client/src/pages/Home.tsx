import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseAnalytics } from "@/components/expenses/ExpenseAnalytics";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { QuickStats } from "@/components/expenses/QuickStats";
import { NotesList } from "@/components/notes/NotesList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useState } from "react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // With Clerk, authentication is handled by ClerkProvider

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg mb-8" data-testid="tabs-navigation">
          <TabsTrigger 
            value="tasks" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            data-testid="tab-tasks"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Tasks</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="expenses" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            data-testid="tab-expenses"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
            </svg>
            <span>Expenses</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="notes" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            data-testid="tab-notes"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 00-1 1v6a1 1 0 001 1v1a2 2 0 01-2-2V5zM14 5a2 2 0 00-2-2v1a1 1 0 011 1v6a1 1 0 01-1 1v1a2 2 0 002-2V5z" clipRule="evenodd" />
              <path d="M6 11V4h8v7H6z" />
            </svg>
            <span>Notes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" data-testid="content-tasks">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <TaskForm />
            </div>
            <div className="lg:w-2/3">
              <TaskList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses" data-testid="content-expenses">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ExpenseForm />
              <QuickStats />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <ExpenseAnalytics />
              <ExpenseList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" data-testid="content-notes">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <NotesList 
                selectedNoteId={selectedNote?.id}
                onNoteSelect={setSelectedNote}
                onCreateNote={() => {}}
              />
            </div>
            <div className="lg:col-span-3">
              <NoteEditor note={selectedNote} onNoteUpdate={setSelectedNote} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
