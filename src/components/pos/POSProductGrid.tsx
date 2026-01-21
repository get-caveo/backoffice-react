import { usePOSStore } from '@/store/pos.store';
import { POSProductCard } from './POSProductCard';
import type { Produit } from '@/types/product';
import { cn } from '@/lib/utils';
import { Wine } from 'lucide-react';

interface POSProductGridProps {
  onProductClick: (produit: Produit) => void;
}

export function POSProductGrid({ onProductClick }: POSProductGridProps) {
  const { produits, categories, categorieActiveId, setCategorieActive, isLoading } = usePOSStore();

  // Filtrer les produits par catégorie
  const produitsFiltres = categorieActiveId
    ? produits.filter((p) => p.categorie?.id === categorieActiveId)
    : produits;

  return (
    <div className="flex flex-col h-full">
      {/* Onglets catégories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setCategorieActive(null)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
            'text-sm min-w-[100px]',
            categorieActiveId === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategorieActive(cat.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              'text-sm min-w-[100px]',
              categorieActiveId === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {/* Grille de produits */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : produitsFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Wine className="h-12 w-12 mb-4" />
            <p>Aucun produit dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {produitsFiltres.map((produit) => (
              <POSProductCard
                key={produit.id}
                produit={produit}
                onClick={() => onProductClick(produit)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
