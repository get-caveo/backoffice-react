import type { LigneVentePOS } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface POSCartItemProps {
  ligne: LigneVentePOS;
  onQuantityChange: (ligneId: number, quantite: number) => void;
  onRemove: (ligneId: number) => void;
  disabled?: boolean;
}

export function POSCartItem({ ligne, onQuantityChange, onRemove, disabled }: POSCartItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      {/* Info produit */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{ligne.produit.nom}</p>
        <p className="text-xs text-muted-foreground">
          {ligne.uniteConditionnement.nom} • {ligne.prixUnitaire.toFixed(2)} €
        </p>
      </div>

      {/* Contrôles quantité */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onQuantityChange(ligne.id, ligne.quantite - 1)}
          disabled={disabled || ligne.quantite <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium">{ligne.quantite}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onQuantityChange(ligne.id, ligne.quantite + 1)}
          disabled={disabled}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Prix total */}
      <div className="w-20 text-right">
        <p className="font-semibold">{ligne.prixTotal.toFixed(2)} €</p>
      </div>

      {/* Supprimer */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => onRemove(ligne.id)}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
