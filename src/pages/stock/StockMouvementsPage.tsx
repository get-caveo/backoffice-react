import { useEffect } from 'react';
import { useStockStore } from '@/store/stock.store';
import { StockLayout } from '@/components/StockLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, RefreshCw, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TypeMouvement } from '@/types/stock';

export function StockMouvementsPage() {
  const { recentMouvements, isLoading, fetchRecentMouvements } = useStockStore();

  useEffect(() => {
    fetchRecentMouvements(50);
  }, [fetchRecentMouvements]);

  const getMouvementIcon = (type: TypeMouvement) => {
    switch (type) {
      case 'ENTREE':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'SORTIE':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'AJUSTEMENT':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'INVENTAIRE':
        return <Package className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMouvementColor = (type: TypeMouvement) => {
    switch (type) {
      case 'ENTREE':
        return 'text-green-600';
      case 'SORTIE':
        return 'text-red-600';
      case 'AJUSTEMENT':
        return 'text-blue-600';
      case 'INVENTAIRE':
        return 'text-purple-600';
      default:
        return '';
    }
  };

  const getMouvementLabel = (type: TypeMouvement) => {
    switch (type) {
      case 'ENTREE':
        return 'Entrée';
      case 'SORTIE':
        return 'Sortie';
      case 'AJUSTEMENT':
        return 'Ajustement';
      case 'INVENTAIRE':
        return 'Inventaire';
      default:
        return type;
    }
  };

  return (
    <StockLayout
      title="Mouvements de stock"
      description="Historique des entrées, sorties et ajustements"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mouvements récents
            </CardTitle>
            <CardDescription>
              Derniers mouvements de stock enregistrés
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchRecentMouvements(50)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentMouvements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Package className="h-8 w-8 mb-2" />
              <p>Aucun mouvement récent</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Produit</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quantité</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Raison</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMouvements.map((mouvement) => (
                    <tr key={mouvement.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(mouvement.creeLe).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getMouvementIcon(mouvement.typeMouvement)}
                          <span className={cn('text-sm font-medium', getMouvementColor(mouvement.typeMouvement))}>
                            {getMouvementLabel(mouvement.typeMouvement)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{mouvement.produit.nom}</p>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{mouvement.produit.sku}</code>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn('font-medium', getMouvementColor(mouvement.typeMouvement))}>
                          {mouvement.typeMouvement === 'SORTIE' ? '-' : '+'}
                          {mouvement.quantite}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {mouvement.uniteConditionnement.nom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {mouvement.raison || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {mouvement.utilisateur.prenom} {mouvement.utilisateur.nom}
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
