import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore } from '@/store/product.store';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Wine, Loader2 } from 'lucide-react';
import type { Categorie, Domaine, CreateProduitInput, UpdateProduitInput } from '@/types/product';
import * as categoryService from '@/services/category.service';
import * as domaineService from '@/services/domaine.service';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';

  const { token } = useAuthStore();
  const {
    selectedProduct,
    isLoading: storeLoading,
    error: storeError,
    fetchProduct,
    createProduct,
    updateProduct,
    clearSelectedProduct,
    clearError,
  } = useProductStore();

  // Form state
  const [formData, setFormData] = useState<CreateProduitInput>({
    sku: '',
    nom: '',
    description: '',
    millesime: undefined,
    degreAlcool: undefined,
    codeBarre: '',
    imageUrl: '',
    notesDegustation: '',
    temperatureService: '',
    conditionsConservation: '',
    seuilStockMinimal: undefined,
    reapproAuto: true,
    categorie: undefined,
    domaine: undefined,
  });
  const [actif, setActif] = useState(true);

  // Reference data
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load reference data (categories and domaines)
  useEffect(() => {
    const loadReferenceData = async () => {
      if (!token) return;

      setLoadingRefs(true);
      try {
        const [cats, doms] = await Promise.all([
          categoryService.getCategories(token),
          domaineService.getDomaines(token),
        ]);
        setCategories(cats.filter((c) => c.actif));
        setDomaines(doms.filter((d) => d.actif));
      } catch (error) {
        console.error('Failed to load reference data:', error);
      } finally {
        setLoadingRefs(false);
      }
    };

    loadReferenceData();
  }, [token]);

  // Load product data when editing
  useEffect(() => {
    if (isEditing && id) {
      fetchProduct(parseInt(id, 10));
    } else {
      clearSelectedProduct();
    }

    return () => {
      clearSelectedProduct();
      clearError();
    };
  }, [isEditing, id, fetchProduct, clearSelectedProduct, clearError]);

  // Populate form when product is loaded
  useEffect(() => {
    if (isEditing && selectedProduct) {
      setFormData({
        sku: selectedProduct.sku,
        nom: selectedProduct.nom,
        description: selectedProduct.description || '',
        millesime: selectedProduct.millesime,
        degreAlcool: selectedProduct.degreAlcool,
        codeBarre: selectedProduct.codeBarre || '',
        imageUrl: selectedProduct.imageUrl || '',
        notesDegustation: selectedProduct.notesDegustation || '',
        temperatureService: selectedProduct.temperatureService || '',
        conditionsConservation: selectedProduct.conditionsConservation || '',
        seuilStockMinimal: selectedProduct.seuilStockMinimal,
        reapproAuto: selectedProduct.reapproAuto,
        categorie: selectedProduct.categorie ? { id: selectedProduct.categorie.id } : undefined,
        domaine: selectedProduct.domaine ? { id: selectedProduct.domaine.id } : undefined,
      });
      setActif(selectedProduct.actif);
    }
  }, [isEditing, selectedProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value),
      }));
    } else if (name === 'categorieId') {
      setFormData((prev) => ({
        ...prev,
        categorie: value === '' ? undefined : { id: parseInt(value, 10) },
      }));
    } else if (name === 'domaineId') {
      setFormData((prev) => ({
        ...prev,
        domaine: value === '' ? undefined : { id: parseInt(value, 10) },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.sku.trim()) {
      setFormError('Le SKU est requis');
      return false;
    }
    if (!formData.nom.trim()) {
      setFormError('Le nom est requis');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setFormError(null);

    try {
      if (isEditing && id) {
        const updateData: UpdateProduitInput = {
          ...formData,
          actif,
        };
        await updateProduct(parseInt(id, 10), updateData);
      } else {
        await createProduct(formData);
      }
      navigate('/dashboard/products');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = storeLoading || loadingRefs;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Modifiez les informations du produit'
                : 'Créez un nouveau produit dans votre catalogue'}
            </p>
          </div>
        </div>

        {/* Error Messages */}
        {(formError || storeError) && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {formError || storeError}
          </div>
        )}

        {isLoading && !selectedProduct && isEditing ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wine className="h-5 w-5" />
                  Informations générales
                </CardTitle>
                <CardDescription>
                  Informations de base du produit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="VIN-RG-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codeBarre">Code-barre</Label>
                    <Input
                      id="codeBarre"
                      name="codeBarre"
                      value={formData.codeBarre}
                      onChange={handleInputChange}
                      placeholder="3760001234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Château Margaux 2018"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description du produit..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categorieId">Catégorie</Label>
                    <select
                      id="categorieId"
                      name="categorieId"
                      value={formData.categorie?.id || ''}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domaineId">Domaine</Label>
                    <select
                      id="domaineId"
                      name="domaineId"
                      value={formData.domaine?.id || ''}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Sélectionner un domaine</option>
                      {domaines.map((dom) => (
                        <option key={dom.id} value={dom.id}>
                          {dom.nom} {dom.region && `(${dom.region})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wine Details */}
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques du vin</CardTitle>
                <CardDescription>
                  Détails techniques et de dégustation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="millesime">Millésime</Label>
                    <Input
                      id="millesime"
                      name="millesime"
                      type="number"
                      value={formData.millesime || ''}
                      onChange={handleInputChange}
                      placeholder="2018"
                      min="1900"
                      max="2100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degreAlcool">Degré d'alcool (%)</Label>
                    <Input
                      id="degreAlcool"
                      name="degreAlcool"
                      type="number"
                      step="0.1"
                      value={formData.degreAlcool || ''}
                      onChange={handleInputChange}
                      placeholder="13.5"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperatureService">Température de service</Label>
                    <Input
                      id="temperatureService"
                      name="temperatureService"
                      value={formData.temperatureService}
                      onChange={handleInputChange}
                      placeholder="16-18°C"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notesDegustation">Notes de dégustation</Label>
                  <textarea
                    id="notesDegustation"
                    name="notesDegustation"
                    value={formData.notesDegustation}
                    onChange={handleInputChange}
                    placeholder="Robe rubis profond, arômes de fruits noirs..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditionsConservation">Conditions de conservation</Label>
                  <Input
                    id="conditionsConservation"
                    name="conditionsConservation"
                    value={formData.conditionsConservation}
                    onChange={handleInputChange}
                    placeholder="Cave à 12-14°C"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stock Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de stock</CardTitle>
                <CardDescription>
                  Configuration des alertes et du réapprovisionnement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seuilStockMinimal">Seuil stock minimal</Label>
                    <Input
                      id="seuilStockMinimal"
                      name="seuilStockMinimal"
                      type="number"
                      value={formData.seuilStockMinimal || ''}
                      onChange={handleInputChange}
                      placeholder="5"
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Alerte quand le stock descend sous ce seuil
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="reapproAuto"
                          checked={formData.reapproAuto}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              reapproAuto: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">Réapprovisionnement automatique</span>
                      </label>
                      {isEditing && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={actif}
                            onChange={(e) => setActif(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm">Produit actif</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/products')}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Mettre à jour' : 'Créer le produit'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
