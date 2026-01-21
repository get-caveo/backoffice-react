import { usePOSStore } from '@/store/pos.store';
import { POSCartItem } from './POSCartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Percent, X, CreditCard } from 'lucide-react';

interface POSCartProps {
  onPayClick: () => void;
  onRemiseClick: () => void;
  onAnnulerClick: () => void;
}

export function POSCart({ onPayClick, onRemiseClick, onAnnulerClick }: POSCartProps) {
  const {
    venteEnCours,
    modifierQuantite,
    supprimerDuPanier,
    supprimerRemise,
    isLoading,
  } = usePOSStore();

  const lignes = venteEnCours?.lignes ?? [];
  const isEmpty = lignes.length === 0;
  const resteAPayer = (venteEnCours?.montantTotal ?? 0) - (venteEnCours?.montantPaye ?? 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5" />
          Panier
          {lignes.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {lignes.length} article{lignes.length > 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto mb-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
              <p>Panier vide</p>
              <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
            </div>
          ) : (
            lignes.map((ligne) => (
              <POSCartItem
                key={ligne.id}
                ligne={ligne}
                onQuantityChange={modifierQuantite}
                onRemove={supprimerDuPanier}
                disabled={isLoading}
              />
            ))
          )}
        </div>

        {/* Récapitulatif */}
        {!isEmpty && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{venteEnCours?.montantSousTotal.toFixed(2)} €</span>
            </div>

            {venteEnCours?.montantRemise && venteEnCours.montantRemise > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-1">
                  Remise
                  {venteEnCours.typeRemise === 'POURCENTAGE' && (
                    <span className="text-xs">({venteEnCours.valeurRemise}%)</span>
                  )}
                  <button
                    onClick={supprimerRemise}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
                <span>-{venteEnCours.montantRemise.toFixed(2)} €</span>
              </div>
            )}

            {venteEnCours?.montantPaye && venteEnCours.montantPaye > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Déjà payé</span>
                <span>-{venteEnCours.montantPaye.toFixed(2)} €</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{resteAPayer.toFixed(2)} €</span>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onRemiseClick}
              disabled={isEmpty || isLoading}
              className="h-12"
            >
              <Percent className="h-4 w-4 mr-2" />
              Remise
            </Button>
            <Button
              variant="outline"
              onClick={onAnnulerClick}
              disabled={isEmpty || isLoading}
              className="h-12 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>

          <Button
            onClick={onPayClick}
            disabled={isEmpty || isLoading}
            className="w-full h-16 text-xl font-bold"
            size="lg"
          >
            <CreditCard className="h-6 w-6 mr-3" />
            PAYER {!isEmpty && `${resteAPayer.toFixed(2)} €`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
