import { useState } from 'react';
import type { Produit, ProduitConditionnement } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Wine, Package, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSConditionnementModalProps {
  produit: Produit;
  onSelect: (conditionnement: ProduitConditionnement, quantite: number) => void;
  onClose: () => void;
}

export function POSConditionnementModal({
  produit,
  onSelect,
  onClose,
}: POSConditionnementModalProps) {
  const [selectedConditionnement, setSelectedConditionnement] =
    useState<ProduitConditionnement | null>(
      produit.conditionnements?.find((c) => c.disponible) ?? null
    );
  const [quantite, setQuantite] = useState(1);

  const conditionnements = produit.conditionnements?.filter((c) => c.disponible) ?? [];

  const handleConfirm = () => {
    if (selectedConditionnement) {
      onSelect(selectedConditionnement, quantite);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5" />
            {produit.nom}
            {produit.millesime && (
              <span className="text-muted-foreground font-normal">
                {produit.millesime}
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto">
          {/* Sélection du conditionnement */}
          <div>
            <p className="text-sm font-medium mb-3">Conditionnement</p>
            <div className="grid grid-cols-2 gap-3">
              {conditionnements.map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedConditionnement(cond)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    'hover:border-primary',
                    selectedConditionnement?.id === cond.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {cond.uniteConditionnement.nom}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {cond.prixUnitaire.toFixed(2)} €
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Sélection de la quantité */}
          <div>
            <p className="text-sm font-medium mb-3">Quantité</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                disabled={quantite <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-3xl font-bold w-16 text-center">{quantite}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => setQuantite(quantite + 1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Total */}
          {selectedConditionnement && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {(selectedConditionnement.prixUnitaire * quantite).toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="h-12">
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedConditionnement}
              className="h-12"
            >
              Ajouter au panier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
