import { useAuthStore } from '@/store/auth.store';
import { useStockStore } from '@/store/stock.store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, AlertTriangle } from 'lucide-react';
import { CaveoLogo } from '@/components/CaveoLogo';
import { SideNav } from '@/components/SideNav';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const { alertesCount, startPolling } = useStockStore();
  const navigate = useNavigate();

  useEffect(() => {
    const stopPolling = startPolling();
    return () => stopPolling();
  }, [startPolling]);

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
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <CaveoLogo className="h-8 w-8" />
              <div className="text-left">
                <h1 className="text-xl font-bold text-primary">Caveo</h1>
                <p className="text-xs text-muted-foreground">Smart Wine Inventory</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {/* Alerts Badge */}
              {alertesCount > 0 && (
                <button
                  onClick={() => navigate('/dashboard/stock')}
                  className="relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{alertesCount} alertes stock</span>
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {user?.prenom} {user?.nom}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
