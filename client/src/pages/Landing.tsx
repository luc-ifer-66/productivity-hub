import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Smartphone, Wifi, Users } from "lucide-react";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-foreground">ProductivityHub</h1>
            </div>
            
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Your All-in-One
            <span className="text-primary block">Productivity Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your tasks, track expenses, and organize notes in one seamless, 
            offline-first application that works everywhere.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            data-testid="button-get-started"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-border" data-testid="card-feature-tasks">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-card-foreground">Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organize tasks with projects, priorities, due dates, and smart reminders. 
                Break down complex work into manageable subtasks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-feature-expenses">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-chart-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <CardTitle className="text-xl text-card-foreground">Expense Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track income, expenses, debts, and EMIs. Get detailed analytics and 
                manage recurring payments with comprehensive financial insights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-feature-notes">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-chart-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 00-1 1v6a1 1 0 001 1v1a2 2 0 01-2-2V5zM14 5a2 2 0 00-2-2v1a1 1 0 011 1v6a1 1 0 01-1 1v1a2 2 0 002-2V5z" clipRule="evenodd" />
                  <path d="M6 11V4h8v7H6z" />
                </svg>
              </div>
              <CardTitle className="text-xl text-card-foreground">Smart Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rich text notes with project organization, task linking, and backlinking. 
                Convert note checklists directly into actionable tasks.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PWA Features */}
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <Smartphone className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Install on Phone</span>
              </div>
              <div className="flex flex-col items-center">
                <Wifi className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Works Offline</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Sync Across Devices</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              Works Anywhere, Anytime
            </h2>
            <p className="text-muted-foreground mb-6">
              Install ProductivityHub on your phone for the full app experience. 
              Access your data offline and sync seamlessly when you're back online.
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              data-testid="button-start-now"
            >
              Start Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
