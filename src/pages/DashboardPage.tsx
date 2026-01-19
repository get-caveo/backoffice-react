import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { CaveoLogo } from '@/components/CaveoLogo';
import { SideNav } from '@/components/SideNav';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <SideNav />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border bg-card">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CaveoLogo className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold text-primary">Caveo</h1>
                <p className="text-xs text-muted-foreground">Smart Wine Inventory</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name || user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area - Empty */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Empty main content area */}
          </div>
        </main>
      </div>
    </div>
  );
}
