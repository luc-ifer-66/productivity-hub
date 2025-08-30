import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { syncManager } from "@/lib/sync";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";

function Router() {
  useEffect(() => {
    // Start sync manager when component mounts
    syncManager.startSync();
    
    return () => {
      syncManager.stopSync();
    };
  }, []);

  return (
    <div className="dark">
      <Switch>
        <SignedOut>
          <Route path="/" component={Landing} />
        </SignedOut>
        <SignedIn>
          <Route path="/" component={Home} />
        </SignedIn>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const publishableKey = "pk_test_dXNlZnVsLWJ1bGxkb2ctMjUuY2xlcmsuYWNjb3VudHMuZGV2JA";
  
  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
