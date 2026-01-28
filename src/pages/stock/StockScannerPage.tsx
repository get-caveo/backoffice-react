import { StockLayout } from "@/components/StockLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStockStore } from "@/store/stock.store";
import type { ProduitConditionnement } from "@/types/product";
import type { StockActuel } from "@/types/stock";
import { ArrowUpRight, ScanBarcode, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function StockScannerPage() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [scannedConditionnement, setScannedConditionnement] =
    useState<ProduitConditionnement | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [productStock, setProductStock] = useState<StockActuel[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchConditionnementByBarcode, fetchProductStock } = useStockStore();

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
      const conditionnement = await fetchConditionnementByBarcode(
        barcode.trim(),
      );
      setBarcode("");
      if (conditionnement && conditionnement.produit) {
        setScannedConditionnement(conditionnement);
        const stock = await fetchProductStock(conditionnement.produit.id);
        setProductStock(stock);
      } else {
        setSearchError(`Aucun produit trouvé pour le code-barre: ${barcode}`);
      }
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Erreur lors de la recherche",
      );
      setBarcode("");
    } finally {
      setIsSearching(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setBarcode("");
    setScannedConditionnement(null);
    setProductStock([]);
    setSearchError(null);
    inputRef.current?.focus();
  };

  const scannedProduct = scannedConditionnement?.produit;

  return (
    <StockLayout
      title="Scanner"
      description="Recherchez un produit par code-barre"
    >
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
              <Button
                onClick={handleSearch}
                disabled={isSearching || !barcode.trim()}
              >
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
                  onClick={() =>
                    navigate(`/dashboard/products/${scannedProduct.id}`)
                  }
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
                  {/* Product Image */}
                  {scannedProduct.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={scannedProduct.imageUrl}
                        alt={scannedProduct.nom}
                        className="h-48 w-auto object-contain rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <code className="text-sm bg-muted px-2 py-0.5 rounded">
                      {scannedProduct.sku}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium text-lg">{scannedProduct.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Conditionnement scanné
                    </p>
                    <p className="font-medium">
                      {scannedConditionnement.uniteConditionnement.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prix: {scannedConditionnement.prixUnitaire.toFixed(2)} €
                    </p>
                  </div>
                  {scannedConditionnement.codeBarre && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Code-barre
                      </p>
                      <code className="font-mono">
                        {scannedConditionnement.codeBarre}
                      </code>
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
                  <p className="text-sm text-muted-foreground mb-2">
                    Stock actuel
                  </p>
                  {productStock.length === 0 ? (
                    <p className="text-muted-foreground">
                      Aucun stock enregistré
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {productStock.map((stockItem) => {
                        const isScannedUnit =
                          stockItem.uniteConditionnement.id ===
                          scannedConditionnement.uniteConditionnement.id;
                        return (
                          <div
                            key={stockItem.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              isScannedUnit
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-muted/30",
                            )}
                          >
                            <span
                              className={cn(
                                "text-sm",
                                isScannedUnit && "font-medium",
                              )}
                            >
                              {stockItem.uniteConditionnement.nom}
                              {isScannedUnit && " (scanné)"}
                            </span>
                            <div className="text-right">
                              <p
                                className={cn(
                                  "font-bold",
                                  stockItem.quantiteDisponible <=
                                    (scannedProduct.seuilStockMinimal || 0)
                                    ? "text-destructive"
                                    : "text-green-600",
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
                      <p className="text-sm text-muted-foreground">
                        Seuil d'alerte
                      </p>
                      <p className="font-medium">
                        {scannedProduct.seuilStockMinimal} unités
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Réappro auto:{" "}
                        {scannedProduct.reapproAuto ? "Activé" : "Désactivé"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StockLayout>
  );
}
