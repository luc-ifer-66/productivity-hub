import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PWAInstall } from './PWAInstall';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { useSyncStatus } from '@/lib/sync';
import { useClerk } from '@clerk/clerk-react';
import { CheckCircle, RotateCcw, Wifi, WifiOff, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const { isOnline } = useOffline();
  const { isSyncing } = useSyncStatus();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    } else {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <PWAInstall />
      
      {/* Status Indicator */}
      {showStatus && (
        <div 
          className={`fixed top-10 right-10 px-3 py-2 rounded-md text-sm font-medium z-40 flex items-center gap-2 ${
            isOnline 
              ? 'bg-chart-2 text-chart-2-foreground' 
              : 'bg-destructive text-destructive-foreground'
          }`}
          data-testid="status-indicator"
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Offline
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
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
            
            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="flex items-center gap-2 text-muted-foreground">
                {isSyncing ? (
                  <RotateCcw className="w-4 h-4 animate-spin" data-testid="sync-icon-syncing" />
                ) : (
                  <CheckCircle className="w-4 h-4" data-testid="sync-icon-synced" />
                )}
                <span className="text-xs hidden sm:inline" data-testid="text-sync-status">
                  {isSyncing ? 'Syncing...' : 'Synced'}
                </span>
              </div>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.imageUrl || ''} alt={user?.firstName || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-foreground" data-testid="text-username">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.primaryEmailAddress?.emailAddress || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2" data-testid="menu-profile">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2" data-testid="menu-settings">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive focus:text-destructive" 
                    onClick={() => signOut()}
                    data-testid="menu-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
