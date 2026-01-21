import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useStockStore } from '@/store/stock.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  AlertTriangle,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wine,
} from 'lucide-react';
import { CaveoLogo } from '@/components/CaveoLogo';
import { SideNav } from '@/components/SideNav';
import { cn } from '@/lib/utils';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const {
    alertes,
    alertesCount,
    recentMouvements,
    stock,
    isLoading,
    fetchAlertes,
    fetchRecentMouvements,
    fetchStock,
    startPolling,
  } = useStockStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data
    fetchStock();
    fetchAlertes();
    fetchRecentMouvements(10);

    // Start polling for alerts count
    const stopPolling = startPolling();

    return () => {
      stopPolling();
    };
  }, [fetchStock, fetchAlertes, fetchRecentMouvements, startPolling]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Calculate stats
  const totalProducts = new Set(stock.map((s) => s.produit.id)).size;
  const totalBottles = stock.reduce((acc, s) => acc + s.quantiteUniteBase, 0);
  const lowStockProducts = alertesCount;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
              <p className="text-muted-foreground">
                Vue d'ensemble de votre cave et des alertes
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produits en stock</CardTitle>
                  <Wine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">références actives</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total bouteilles</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBottles.toLocaleString('fr-FR')}</div>
                  <p className="text-xs text-muted-foreground">en unités de base</p>
                </CardContent>
              </Card>

              <Card className={cn(lowStockProducts > 0 && 'border-destructive/50')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertes stock bas</CardTitle>
                  <AlertTriangle
                    className={cn(
                      'h-4 w-4',
                      lowStockProducts > 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      'text-2xl font-bold',
                      lowStockProducts > 0 && 'text-destructive'
                    )}
                  >
                    {lowStockProducts}
                  </div>
                  <p className="text-xs text-muted-foreground">produits sous seuil</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mouvements récents</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentMouvements.length}</div>
                  <p className="text-xs text-muted-foreground">dernières 24h</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Stock Alerts */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Alertes stock bas
                  </CardTitle>
                  <CardDescription>
                    Produits nécessitant un réapprovisionnement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : alertes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Package className="h-8 w-8 mb-2" />
                      <p>Aucune alerte de stock</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alertes.slice(0, 5).map((alerte) => {
                        const manque =
                          (alerte.produit.seuilStockMinimal || 0) - alerte.quantite;
                        return (
                          <div
                            key={alerte.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{alerte.produit.nom}</p>
                              <p className="text-sm text-muted-foreground">
                                {alerte.produit.sku}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-destructive">
                                {alerte.quantite} / {alerte.produit.seuilStockMinimal}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Manque: {manque > 0 ? manque : 0}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {alertes.length > 5 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/dashboard/stock')}
                        >
                          Voir toutes les alertes ({alertes.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Movements */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Mouvements récents
                  </CardTitle>
                  <CardDescription>Dernières entrées et sorties de stock</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recentMouvements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2" />
                      <p>Aucun mouvement récent</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentMouvements.slice(0, 5).map((mouvement) => {
                        const isEntree =
                          mouvement.typeMouvement === 'ENTREE' ||
                          (mouvement.typeMouvement === 'AJUSTEMENT' && mouvement.quantite > 0);
                        return (
                          <div
                            key={mouvement.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'p-2 rounded-full',
                                  isEntree ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                )}
                              >
                                {isEntree ? (
                                  <ArrowDownRight className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{mouvement.produit.nom}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(mouvement.creeLe)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={cn(
                                  'font-medium',
                                  isEntree ? 'text-green-600' : 'text-red-600'
                                )}
                              >
                                {isEntree ? '+' : '-'}
                                {Math.abs(mouvement.quantite)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {mouvement.uniteConditionnement.nom}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {recentMouvements.length > 5 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/dashboard/stock')}
                        >
                          Voir tous les mouvements
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
