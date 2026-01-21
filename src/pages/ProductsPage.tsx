import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '@/store/product.store';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Search,
  Wine,
  Edit,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Produit } from '@/types/product';

export function ProductsPage() {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    filters,
    fetchProducts,
    deleteProduct,
    setFilters,
    clearFilters,
  } = useProductStore();

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput || undefined });
    fetchProducts({ ...filters, search: searchInput || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    clearFilters();
    fetchProducts({});
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setShowDeleteConfirm(null);
    } catch {
      // Error is handled in store
    }
  };

  const hasActiveFilters = filters.search || filters.categorieId || filters.domaineId || filters.millesime;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Produits</h2>
            <p className="text-muted-foreground">
              Gérez votre catalogue de vins
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch}>
                  Rechercher
                </Button>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Effacer filtres
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" />
              Liste des produits
              <span className="text-muted-foreground font-normal text-sm">
                ({products.length} produit{products.length > 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Wine className="h-8 w-8 mb-2" />
                <p>Aucun produit trouvé</p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={handleClearFilters} className="mt-2">
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Catégorie</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Domaine</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Millésime</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onView={() => navigate(`/dashboard/products/${product.id}`)}
                        onEdit={() => navigate(`/dashboard/products/${product.id}/edit`)}
                        onDelete={() => setShowDeleteConfirm(product.id)}
                        showDeleteConfirm={showDeleteConfirm === product.id}
                        onConfirmDelete={() => handleDelete(product.id)}
                        onCancelDelete={() => setShowDeleteConfirm(null)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface ProductRowProps {
  product: Produit;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function ProductRow({
  product,
  onView,
  onEdit,
  onDelete,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: ProductRowProps) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-3 px-4">
        <code className="text-sm bg-muted px-2 py-0.5 rounded">{product.sku}</code>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium">{product.nom}</div>
        {product.description && (
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            {product.description}
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-muted-foreground">
        {product.categorie?.nom || '-'}
      </td>
      <td className="py-3 px-4 text-muted-foreground">
        {product.domaine?.nom || '-'}
      </td>
      <td className="py-3 px-4 text-muted-foreground">
        {product.millesime || '-'}
      </td>
      <td className="py-3 px-4">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            product.actif
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          {product.actif ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="py-3 px-4">
        {showDeleteConfirm ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground mr-2">Confirmer ?</span>
            <Button size="sm" variant="destructive" onClick={onConfirmDelete}>
              Oui
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelDelete}>
              Non
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
