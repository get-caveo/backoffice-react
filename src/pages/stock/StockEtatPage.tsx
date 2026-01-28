import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockStore } from '@/store/stock.store';
import { StockLayout } from '@/components/StockLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Warehouse, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockStatusFilter = 'all' | 'low' | 'ok';
type ReapproFilter = 'all' | 'auto' | 'manual';

export function StockEtatPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>('all');
  const [reapproFilter, setReapproFilter] = useState<ReapproFilter>('all');
  const { stock, isLoading, fetchStock } = useStockStore();

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      // Search filter
      const matchesSearch =
        item.produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produit.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const isLowStock = item.quantiteDisponible <= (item.produit.seuilStockMinimal || 0);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'low' && isLowStock) ||
        (statusFilter === 'ok' && !isLowStock);

      // Reappro filter
      const matchesReappro =
        reapproFilter === 'all' ||
        (reapproFilter === 'auto' && item.produit.reapproAuto) ||
        (reapproFilter === 'manual' && !item.produit.reapproAuto);

      return matchesSearch && matchesStatus && matchesReappro;
    });
  }, [stock, searchTerm, statusFilter, reapproFilter]);

  const lowStockCount = useMemo(
    () => stock.filter((item) => item.quantiteDisponible <= (item.produit.seuilStockMinimal || 0)).length,
    [stock]
  );

  return (
    <StockLayout
      title="État du stock"
      description="Vue d'ensemble de votre inventaire de vins"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Stock actuel
            </CardTitle>
            <CardDescription className="flex items-center gap-3">
              <span>{filteredStock.length} produit{filteredStock.length > 1 ? 's' : ''} affiché{filteredStock.length > 1 ? 's' : ''}</span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {lowStockCount} en alerte
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchStock()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Statut :</span>
              <div className="flex rounded-md border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-r-none border-r',
                    statusFilter === 'all' && 'bg-muted'
                  )}
                  onClick={() => setStatusFilter('all')}
                >
                  Tous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-none border-r',
                    statusFilter === 'low' && 'bg-destructive/10 text-destructive'
                  )}
                  onClick={() => setStatusFilter('low')}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Stock bas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-l-none',
                    statusFilter === 'ok' && 'bg-green-100 text-green-700'
                  )}
                  onClick={() => setStatusFilter('ok')}
                >
                  OK
                </Button>
              </div>
            </div>

            {/* Reappro filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Réappro :</span>
              <div className="flex rounded-md border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-r-none border-r',
                    reapproFilter === 'all' && 'bg-muted'
                  )}
                  onClick={() => setReapproFilter('all')}
                >
                  Tous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-none border-r',
                    reapproFilter === 'auto' && 'bg-green-100 text-green-700'
                  )}
                  onClick={() => setReapproFilter('auto')}
                >
                  Auto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-l-none',
                    reapproFilter === 'manual' && 'bg-muted'
                  )}
                  onClick={() => setReapproFilter('manual')}
                >
                  Manuel
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Warehouse className="h-8 w-8 mb-2" />
              <p>Aucun stock trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Produit</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Conditionnement</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantité</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Réservé</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Disponible</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Seuil</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Réappro</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dernier inventaire</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/dashboard/products/${item.produit.id}`)}
                    >
                      <td className="py-3 px-4">
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">{item.produit.sku}</code>
                      </td>
                      <td className="py-3 px-4 font-medium">{item.produit.nom}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.uniteConditionnement.nom}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{item.quantite}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {item.quantiteReservee > 0 ? item.quantiteReservee : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={cn(
                            'font-medium',
                            item.quantiteDisponible <= (item.produit.seuilStockMinimal || 0)
                              ? 'text-destructive'
                              : 'text-green-600'
                          )}
                        >
                          {item.quantiteDisponible}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {item.produit.seuilStockMinimal ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            item.produit.reapproAuto
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {item.produit.reapproAuto ? 'Auto' : 'Manuel'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {item.dernierInventaire
                          ? new Date(item.dernierInventaire).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </StockLayout>
  );
}
