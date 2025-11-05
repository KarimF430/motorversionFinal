import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-primary text-primary-foreground border-b border-primary-border">
      <div className="flex items-center gap-4">
        <SidebarTrigger
          data-testid="button-sidebar-toggle"
          className="text-primary-foreground hover-elevate"
        />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground text-primary rounded font-bold flex items-center justify-center text-sm">
            MO
          </div>
          <h1 className="text-xl font-semibold">MotorOctane Admin</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span>
            Welcome, <span className="font-medium">{user?.name || 'Admin'}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
