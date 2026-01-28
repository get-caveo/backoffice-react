import { useState, useRef, useEffect } from 'react';
import { useStockStore } from '@/store/stock.store';
import { StockLayout } from '@/components/StockLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ScanBarcode,
  PackagePlus,
  Package,
  X,
  Check,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateMouvementInput } from '@/types/stock';
import type { ProduitConditionnement } from '@/types/product';

interface ReceptionItem {
  id: string;
  conditionnement: ProduitConditionnement;
  quantite: number;
}

export function StockReceptionPage() {
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
        const existingIndex = receptionItems.findIndex(
          (item) => item.conditionnement.id === conditionnement.id
        );

        if (existingIndex >= 0) {
          setReceptionItems((items) =>
            items.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantite: item.quantite + 1 }
                : item
            )
          );
        } else {
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
    <StockLayout
      title="Réception de marchandise"
      description="Scannez les cartons reçus pour créer des entrées de stock"
    >
      <div className="space-y-6">
        {/* Scanner Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              Scanner les articles
            </CardTitle>
            <CardDescription>
              Scannez le code-barre de chaque carton reçu
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
      </div>
    </StockLayout>
  );
}
