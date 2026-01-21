import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore } from '@/store/product.store';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wine,
  Package,
  Truck,
  Thermometer,
  Grape,
  Calendar,
  Barcode,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ScanBarcode,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showBarcode, setShowBarcode] = useState(false);
  const [expandedConds, setExpandedConds] = useState<Set<number>>(new Set());

  const toggleCondExpanded = (condId: number) => {
    setExpandedConds((prev) => {
      const next = new Set(prev);
      if (next.has(condId)) {
        next.delete(condId);
      } else {
        next.add(condId);
      }
      return next;
    });
  };

  const {
    selectedProduct: product,
    isLoading,
    error,
    fetchProduct,
    deleteProduct,
    clearSelectedProduct,
  } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id, 10));
    }

    return () => {
      clearSelectedProduct();
    };
  }, [id, fetchProduct, clearSelectedProduct]);

  const handleDelete = async () => {
    if (!product) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(product.id);
        navigate('/dashboard/products');
      } catch {
        // Error handled in store
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error || 'Produit non trouvé'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{product.nom}</h2>
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
              </div>
              <p className="text-muted-foreground">
                <code className="bg-muted px-2 py-0.5 rounded text-sm">{product.sku}</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wine className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Catégorie</dt>
                    <dd className="mt-1">{product.categorie?.nom || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Domaine</dt>
                    <dd className="mt-1">{product.domaine?.nom || '-'}</dd>
                  </div>
                  {product.domaine?.region && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Région</dt>
                      <dd className="mt-1">{product.domaine.region}</dd>
                    </div>
                  )}
                  {product.domaine?.appellation && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Appellation</dt>
                      <dd className="mt-1">{product.domaine.appellation}</dd>
                    </div>
                  )}
                </dl>
                {product.description && (
                  <div className="mt-4 pt-4 border-t">
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Description</dt>
                    <dd className="text-sm">{product.description}</dd>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wine Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grape className="h-5 w-5" />
                  Caractéristiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Millésime</dt>
                      <dd className="mt-1">{product.millesime || '-'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wine className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Degré d'alcool</dt>
                      <dd className="mt-1">{product.degreAlcool ? `${product.degreAlcool}%` : '-'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Thermometer className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Température de service</dt>
                      <dd className="mt-1">{product.temperatureService || '-'}</dd>
                    </div>
                  </div>
                </dl>
                {product.notesDegustation && (
                  <div className="mt-4 pt-4 border-t">
                    <dt className="text-sm font-medium text-muted-foreground mb-1">
                      Notes de dégustation
                    </dt>
                    <dd className="text-sm">{product.notesDegustation}</dd>
                  </div>
                )}
                {product.conditionsConservation && (
                  <div className="mt-4 pt-4 border-t">
                    <dt className="text-sm font-medium text-muted-foreground mb-1">
                      Conditions de conservation
                    </dt>
                    <dd className="text-sm">{product.conditionsConservation}</dd>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conditionnements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Conditionnements
                </CardTitle>
                <CardDescription>Prix par unité de conditionnement</CardDescription>
              </CardHeader>
              <CardContent>
                {product.conditionnements && product.conditionnements.length > 0 ? (
                  <div className="space-y-3">
                    {product.conditionnements.map((cond) => {
                      const isExpanded = expandedConds.has(cond.id);
                      return (
                        <div
                          key={cond.id}
                          className="rounded-lg bg-muted/50 overflow-hidden"
                        >
                          <div className="flex items-center justify-between p-3">
                            <div>
                              <p className="font-medium">{cond.uniteConditionnement.nom}</p>
                              <p className="text-sm text-muted-foreground">
                                {cond.uniteConditionnement.nomCourt}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {cond.prixUnitaire.toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR',
                                })}
                              </p>
                              <span
                                className={cn(
                                  'text-xs',
                                  cond.disponible ? 'text-green-600' : 'text-red-600'
                                )}
                              >
                                {cond.disponible ? 'Disponible' : 'Indisponible'}
                              </span>
                            </div>
                          </div>
                          {/* Accordion trigger for barcode */}
                          <button
                            onClick={() => toggleCondExpanded(cond.id)}
                            className="w-full flex items-center justify-between px-3 py-2 border-t border-muted bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
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
                              isExpanded ? 'max-h-40' : 'max-h-0'
                            )}
                          >
                            <div className="px-3 py-3 bg-white border-t border-muted">
                              {cond.codeBarre ? (
                                <div className="space-y-2 flex flex-col items-start">
                                  <code className="font-mono text-md tracking-wider">
                                    {cond.codeBarre}
                                  </code>
                                  <div className="p-2 bg-white rounded border inline-block">
                                    <img
                                      src={`https://barcodeapi.org/api/128/${cond.codeBarre}?dpi=300&height=15`}
                                      alt={`Code-barre ${cond.codeBarre}`}
                                      className="w-[200px] h-auto"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-sm">
                                  Aucun code-barre configuré
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucun conditionnement configuré</p>
                )}
              </CardContent>
            </Card>

            {/* Fournisseurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Fournisseurs
                </CardTitle>
                <CardDescription>Fournisseurs et prix d'achat</CardDescription>
              </CardHeader>
              <CardContent>
                {product.fournisseurs && product.fournisseurs.length > 0 ? (
                  <div className="space-y-3">
                    {product.fournisseurs.map((fourn) => (
                      <div
                        key={fourn.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{fourn.fournisseur.nom}</p>
                          {fourn.delaiApproJours && (
                            <p className="text-sm text-muted-foreground">
                              Délai: {fourn.delaiApproJours} jours
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {fourn.prixFournisseur.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucun fournisseur configuré</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identifiants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Barcode className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-muted-foreground">Code-barre</dt>
                    <dd className="mt-1 font-mono text-sm">{product.codeBarre || '-'}</dd>
                    {product.codeBarre && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-auto p-0 hover:bg-transparent"
                          onClick={() => setShowBarcode(!showBarcode)}
                        >
                          <span className="text-sm text-primary flex items-center gap-1">
                            {showBarcode ? 'Masquer le code-barre' : 'Afficher le code-barre'}
                            <ChevronDown
                              className={cn(
                                'h-3 w-3 transition-transform duration-200',
                                showBarcode && 'rotate-180'
                              )}
                            />
                          </span>
                        </Button>
                        {showBarcode && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <img
                              src={`https://barcodeapi.org/api/128/${product.codeBarre}?&dpi=400&height=18`}
                              alt={`Code-barre ${product.codeBarre}`}
                              className="max-w-full h-auto"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Paramètres stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Seuil minimal</dt>
                  <dd className="mt-1 text-lg font-medium">
                    {product.seuilStockMinimal ?? 'Non défini'}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw
                    className={cn(
                      'h-4 w-4',
                      product.reapproAuto ? 'text-green-600' : 'text-muted-foreground'
                    )}
                  />
                  <span className="text-sm">
                    Réappro auto:{' '}
                    <span className={product.reapproAuto ? 'text-green-600' : 'text-muted-foreground'}>
                      {product.reapproAuto ? 'Activé' : 'Désactivé'}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            {product.imageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={product.imageUrl}
                    alt={product.nom}
                    className="w-full rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métadonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {product.creeLe && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé le</span>
                    <span>
                      {new Date(product.creeLe).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {product.modifieLe && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modifié le</span>
                    <span>
                      {new Date(product.modifieLe).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
