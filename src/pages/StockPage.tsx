import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockStore } from '@/store/stock.store';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Warehouse,
  AlertTriangle,
  Search,
  ScanBarcode,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  X,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockActuel, StockAlerte, MouvementStock, TypeMouvement } from '@/types/stock';
import type { ProduitConditionnement } from '@/types/product';

type TabType = 'stock' | 'alertes' | 'scanner' | 'mouvements';

export function StockPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('stock');
  const {
    stock,
    alertes,
    alertesCount,
    recentMouvements,
    isLoading,
    error,
    fetchStock,
    fetchAlertes,
    fetchRecentMouvements,
    clearError,
  } = useStockStore();

  useEffect(() => {
    fetchStock();
    fetchAlertes();
    fetchRecentMouvements();
  }, [fetchStock, fetchAlertes, fetchRecentMouvements]);

  const tabs = [
    { id: 'stock' as TabType, label: 'Stock actuel', icon: Warehouse, count: stock.length },
    { id: 'alertes' as TabType, label: 'Alertes', icon: AlertTriangle, count: alertesCount },
    { id: 'scanner' as TabType, label: 'Scanner', icon: ScanBarcode },
    { id: 'mouvements' as TabType, label: 'Mouvements récents', icon: Package },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion du Stock</h2>
            <p className="text-muted-foreground">
              Consultez et gérez votre inventaire de vins
            </p>
          </div>
          <Button variant="outline" onClick={() => { fetchStock(); fetchAlertes(); fetchRecentMouvements(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      'ml-1 px-2 py-0.5 text-xs rounded-full',
                      tab.id === 'alertes'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'stock' && (
          <StockList stock={stock} isLoading={isLoading} onNavigateToProduct={(id) => navigate(`/dashboard/products/${id}`)} />
        )}
        {activeTab === 'alertes' && (
          <AlertesList alertes={alertes} isLoading={isLoading} onNavigateToProduct={(id) => navigate(`/dashboard/products/${id}`)} />
        )}
        {activeTab === 'scanner' && (
          <BarcodeScanner onNavigateToProduct={(id) => navigate(`/dashboard/products/${id}`)} />
        )}
        {activeTab === 'mouvements' && (
          <MouvementsList mouvements={recentMouvements} isLoading={isLoading} />
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// Stock List Component
// ============================================================================

interface StockListProps {
  stock: StockActuel[];
  isLoading: boolean;
  onNavigateToProduct: (id: number) => void;
}

function StockList({ stock, isLoading, onNavigateToProduct }: StockListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStock = stock.filter(
    (item) =>
      item.produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produit.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Stock actuel
        </CardTitle>
        <CardDescription>Vue d'ensemble de votre inventaire</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dernier inventaire</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => onNavigateToProduct(item.produit.id)}
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
  );
}

// ============================================================================
// Alertes List Component
// ============================================================================

interface AlertesListProps {
  alertes: StockAlerte[];
  isLoading: boolean;
  onNavigateToProduct: (id: number) => void;
}

function AlertesList({ alertes, isLoading, onNavigateToProduct }: AlertesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Alertes stock bas
        </CardTitle>
        <CardDescription>
          Produits dont le stock est inférieur au seuil minimal
        </CardDescription>
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
                      onClick={() => onNavigateToProduct(item.produit.id)}
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
  );
}

// ============================================================================
// Barcode Scanner Component
// ============================================================================

interface BarcodeScannerProps {
  onNavigateToProduct: (id: number) => void;
}

function BarcodeScanner({ onNavigateToProduct }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedConditionnement, setScannedConditionnement] = useState<ProduitConditionnement | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchConditionnementByBarcode, fetchProductStock } = useStockStore();
  const [productStock, setProductStock] = useState<StockActuel[]>([]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    if (!barcode.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setScannedConditionnement(null);
    setProductStock([]);

    try {
      const conditionnement = await fetchConditionnementByBarcode(barcode.trim());
      if (conditionnement && conditionnement.produit) {
        setScannedConditionnement(conditionnement);
        const stock = await fetchProductStock(conditionnement.produit.id);
        setProductStock(stock);
      } else {
        setSearchError(`Aucun produit trouvé pour le code-barre: ${barcode}`);
      }
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : 'Erreur lors de la recherche'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setBarcode('');
    setScannedConditionnement(null);
    setProductStock([]);
    setSearchError(null);
    inputRef.current?.focus();
  };

  const scannedProduct = scannedConditionnement?.produit;

  return (
    <div className="space-y-6">
      {/* Scanner Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5" />
            Scanner de code-barre
          </CardTitle>
          <CardDescription>
            Scannez ou saisissez un code-barre pour trouver un produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Code-barre (EAN-13, UPC...)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 font-mono"
                autoFocus
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !barcode.trim()}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
            {(scannedConditionnement || searchError) && (
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Error */}
      {searchError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {searchError}
        </div>
      )}

      {/* Scanned Product Result */}
      {scannedConditionnement && scannedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Produit trouvé</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToProduct(scannedProduct.id)}
              >
                Voir détails
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <code className="text-sm bg-muted px-2 py-0.5 rounded">{scannedProduct.sku}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium text-lg">{scannedProduct.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conditionnement scanné</p>
                  <p className="font-medium">{scannedConditionnement.uniteConditionnement.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    Prix: {scannedConditionnement.prixUnitaire.toFixed(2)} €
                  </p>
                </div>
                {scannedConditionnement.codeBarre && (
                  <div>
                    <p className="text-sm text-muted-foreground">Code-barre</p>
                    <code className="font-mono">{scannedConditionnement.codeBarre}</code>
                  </div>
                )}
                {scannedProduct.categorie && (
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p>{scannedProduct.categorie.nom}</p>
                  </div>
                )}
                {scannedProduct.domaine && (
                  <div>
                    <p className="text-sm text-muted-foreground">Domaine</p>
                    <p>{scannedProduct.domaine.nom}</p>
                  </div>
                )}
                {scannedProduct.millesime && (
                  <div>
                    <p className="text-sm text-muted-foreground">Millésime</p>
                    <p>{scannedProduct.millesime}</p>
                  </div>
                )}
              </div>

              {/* Stock Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Stock actuel</p>
                {productStock.length === 0 ? (
                  <p className="text-muted-foreground">Aucun stock enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {productStock.map((stockItem) => {
                      const isScannedUnit = stockItem.uniteConditionnement.id === scannedConditionnement.uniteConditionnement.id;
                      return (
                        <div
                          key={stockItem.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg',
                            isScannedUnit ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                          )}
                        >
                          <span className={cn('text-sm', isScannedUnit && 'font-medium')}>
                            {stockItem.uniteConditionnement.nom}
                            {isScannedUnit && ' (scanné)'}
                          </span>
                          <div className="text-right">
                            <p
                              className={cn(
                                'font-bold',
                                stockItem.quantiteDisponible <= (scannedProduct.seuilStockMinimal || 0)
                                  ? 'text-destructive'
                                  : 'text-green-600'
                              )}
                            >
                              {stockItem.quantiteDisponible} disponible
                            </p>
                            {stockItem.quantiteReservee > 0 && (
                              <p className="text-xs text-muted-foreground">
                                ({stockItem.quantiteReservee} réservé)
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Stock Alert */}
                {scannedProduct.seuilStockMinimal !== undefined && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Seuil d'alerte</p>
                    <p className="font-medium">{scannedProduct.seuilStockMinimal} unités</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Réappro auto: {scannedProduct.reapproAuto ? 'Activé' : 'Désactivé'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Mouvements List Component
// ============================================================================

interface MouvementsListProps {
  mouvements: MouvementStock[];
  isLoading: boolean;
}

function MouvementsList({ mouvements, isLoading }: MouvementsListProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Mouvements récents
        </CardTitle>
        <CardDescription>Historique des derniers mouvements de stock</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : mouvements.length === 0 ? (
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
                {mouvements.map((mouvement) => (
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
  );
}
