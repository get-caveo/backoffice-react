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
  PackagePlus,
  Trash2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockActuel, StockAlerte, MouvementStock, TypeMouvement, CreateMouvementInput } from '@/types/stock';
import type { ProduitConditionnement } from '@/types/product';

type TabType = 'stock' | 'alertes' | 'reception' | 'scanner' | 'mouvements';

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
    { id: 'reception' as TabType, label: 'Réception', icon: PackagePlus },
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
        {activeTab === 'reception' && (
          <ReceptionWorkflow />
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
// Reception Workflow Component
// ============================================================================

interface ReceptionItem {
  id: string;
  conditionnement: ProduitConditionnement;
  quantite: number;
}

function ReceptionWorkflow() {
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [raison, setRaison] = useState('Réception commande fournisseur');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchConditionnementByBarcode, createMouvement, fetchStock, fetchRecentMouvements } = useStockStore();

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = async () => {
    if (!barcode.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const conditionnement = await fetchConditionnementByBarcode(barcode.trim());
      if (conditionnement && conditionnement.produit) {
        // Check if item already in list
        const existingIndex = receptionItems.findIndex(
          (item) => item.conditionnement.id === conditionnement.id
        );

        if (existingIndex >= 0) {
          // Increment quantity
          setReceptionItems((items) =>
            items.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantite: item.quantite + 1 }
                : item
            )
          );
        } else {
          // Add new item
          setReceptionItems((items) => [
            ...items,
            {
              id: `${conditionnement.id}-${Date.now()}`,
              conditionnement,
              quantite: 1,
            },
          ]);
        }
        setBarcode('');
        inputRef.current?.focus();
      } else {
        setSearchError(`Code-barre non trouvé: ${barcode}`);
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
      handleScan();
    }
  };

  const updateQuantity = (id: string, quantite: number) => {
    if (quantite < 1) return;
    setReceptionItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantite } : item))
    );
  };

  const removeItem = (id: string) => {
    setReceptionItems((items) => items.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (receptionItems.length === 0) return;

    setIsSubmitting(true);
    setSearchError(null);

    try {
      // Create stock movements for each item
      for (const item of receptionItems) {
        const mouvementData: CreateMouvementInput = {
          produit: { id: item.conditionnement.produit!.id },
          uniteConditionnement: { id: item.conditionnement.uniteConditionnement.id },
          typeMouvement: 'ENTREE',
          quantite: item.quantite,
          typeReference: 'COMMANDE_FOURNISSEUR',
          raison: raison,
        };
        await createMouvement(mouvementData);
      }

      // Show success and clear
      setSubmitSuccess(true);
      setReceptionItems([]);
      fetchStock();
      fetchRecentMouvements();

      setTimeout(() => {
        setSubmitSuccess(false);
        inputRef.current?.focus();
      }, 3000);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : 'Erreur lors de la validation'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = receptionItems.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <div className="space-y-6">
      {/* Scanner Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Réception de marchandise
          </CardTitle>
          <CardDescription>
            Scannez les cartons reçus pour créer des entrées de stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Scanner un code-barre..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 font-mono"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleScan} disabled={isSearching || !barcode.trim() || isSubmitting}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Raison / Référence</label>
            <Input
              placeholder="Ex: Réception commande CF-2024-001"
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              className="mt-1 max-w-md"
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {searchError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive flex items-center justify-between">
          <span>{searchError}</span>
          <Button variant="ghost" size="sm" onClick={() => setSearchError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span>Réception validée avec succès ! Les mouvements de stock ont été créés.</span>
        </div>
      )}

      {/* Scanned Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Articles scannés
              {totalItems > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                  {totalItems} article{totalItems > 1 ? 's' : ''}
                </span>
              )}
            </span>
            {receptionItems.length > 0 && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Valider la réception
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receptionItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ScanBarcode className="h-8 w-8 mb-2" />
              <p>Aucun article scanné</p>
              <p className="text-sm">Scannez un code-barre pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receptionItems.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="border rounded-lg bg-muted/30 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.conditionnement.produit?.nom}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <code className="bg-muted px-1.5 py-0.5 rounded">
                            {item.conditionnement.produit?.sku}
                          </code>
                          <span>•</span>
                          <span>{item.conditionnement.uniteConditionnement.nom}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantite - 1)}
                            disabled={item.quantite <= 1 || isSubmitting}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantite}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min={1}
                            disabled={isSubmitting}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantite + 1)}
                            disabled={isSubmitting}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Accordion trigger */}
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full flex items-center justify-between px-4 py-2 border-t bg-muted/20 hover:bg-muted/40 transition-colors text-sm text-muted-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <ScanBarcode className="h-3.5 w-3.5" />
                        Code-barre
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                    {/* Accordion content */}
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-200',
                        isExpanded ? 'max-h-24' : 'max-h-0'
                      )}
                    >
                      <div className="px-4 py-3 bg-muted/10 border-t">
                        {item.conditionnement.codeBarre ? (
                          <code className="font-mono text-lg tracking-wider">
                            {item.conditionnement.codeBarre}
                          </code>
                        ) : (
                          <span className="text-muted-foreground italic">Aucun code-barre</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Autres workflows scanner</CardTitle>
          <CardDescription>Idées de fonctionnalités utilisant le scanner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Inventaire
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Scanner les produits et saisir les quantités réelles pour mettre à jour le stock
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-red-600" />
                Préparation commande
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Scanner les articles pour valider le picking d'une commande client
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-green-600" />
                Retour client
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Scanner les articles retournés pour les réintégrer au stock
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-purple-600" />
                Transfert d'emplacement
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Scanner pour déplacer des articles entre zones de stockage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
