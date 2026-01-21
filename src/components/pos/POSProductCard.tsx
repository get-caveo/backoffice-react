import type { Produit } from '@/types/product';
import { Wine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSProductCardProps {
  produit: Produit;
  onClick: () => void;
}

export function POSProductCard({ produit, onClick }: POSProductCardProps) {
  const prixMin = produit.conditionnements?.reduce((min, c) => {
    return c.prixUnitaire < min ? c.prixUnitaire : min;
  }, produit.conditionnements[0]?.prixUnitaire ?? 0);

  const hasStock = produit.conditionnements?.some((c) => c.disponible);

  return (
    <button
      onClick={onClick}
      disabled={!hasStock}
      className={cn(
        'flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all',
        'bg-card hover:bg-accent/50 active:scale-95',
        'min-h-[140px] w-full',
        hasStock
          ? 'border-border hover:border-primary cursor-pointer'
          : 'border-muted opacity-50 cursor-not-allowed'
      )}
    >
      {/* Image ou icône */}
      <div className="w-16 h-16 flex items-center justify-center mb-2">
        {produit.imageUrl ? (
          <img
            src={produit.imageUrl}
            alt={produit.nom}
            className="w-full h-full object-contain rounded"
          />
        ) : (
          <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
            <Wine className="w-8 h-8 text-primary" />
          </div>
        )}
      </div>

      {/* Nom du produit */}
      <div className="text-center flex-1">
        <p className="font-medium text-sm leading-tight line-clamp-2">{produit.nom}</p>
        {produit.millesime && (
          <p className="text-xs text-muted-foreground">{produit.millesime}</p>
        )}
      </div>

      {/* Prix */}
      <div className="mt-2">
        <span className="text-lg font-bold text-primary">
          {prixMin?.toFixed(2)} €
        </span>
      </div>
    </button>
  );
}
