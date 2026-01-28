import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockStore } from '@/store/stock.store';
import { StockLayout } from '@/components/StockLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StockAlertesPage() {
  const navigate = useNavigate();
  const { alertes, isLoading, fetchAlertes } = useStockStore();

  useEffect(() => {
    fetchAlertes();
  }, [fetchAlertes]);

  return (
    <StockLayout
      title="Alertes stock"
      description="Produits dont le stock est inférieur au seuil minimal"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertes stock bas
            </CardTitle>
            <CardDescription>
              {alertes.length} produit{alertes.length > 1 ? 's' : ''} sous le seuil
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchAlertes()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            {alertes.length > 0 && (
              <Button size="sm" onClick={() => navigate('/dashboard/gestion-stock/commandes')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Commander
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : alertes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2 text-green-600" />
              <p className="text-green-600">Aucune alerte de stock</p>
              <p className="text-sm">Tous les produits sont au-dessus du seuil minimal</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Produit</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Stock actuel</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Seuil</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Manque</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Réappro auto</th>
                  </tr>
                </thead>
                <tbody>
                  {alertes.map((item) => {
                    const manque = item.produit.seuilStockMinimal - item.quantite;
                    return (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/dashboard/products/${item.produit.id}`)}
                      >
                        <td className="py-3 px-4">
                          <code className="text-sm bg-muted px-2 py-0.5 rounded">{item.produit.sku}</code>
                        </td>
                        <td className="py-3 px-4 font-medium">{item.produit.nom}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-destructive font-medium">{item.quantite}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {item.produit.seuilStockMinimal}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-destructive font-medium">-{manque}</span>
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
                            {item.produit.reapproAuto ? 'Oui' : 'Non'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </StockLayout>
  );
}
