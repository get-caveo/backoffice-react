import { useEffect, useState } from 'react';
import { useFournisseurStore } from '@/store/fournisseur.store';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Truck,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Leaf,
  Award,
} from 'lucide-react';
import type { Fournisseur, CreateFournisseurInput } from '@/types/fournisseur';

export function SuppliersPage() {
  const {
    fournisseurs,
    isLoading,
    error,
    filters,
    fetchFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    setFilters,
    clearFilters,
    clearError,
  } = useFournisseurStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);

  useEffect(() => {
    fetchFournisseurs();
  }, [fetchFournisseurs]);

  const handleFilterBio = (bio: boolean | undefined) => {
    const newFilters = { ...filters, bio };
    setFilters(newFilters);
    fetchFournisseurs(newFilters);
  };

  const handleFilterAoc = (aoc: boolean | undefined) => {
    const newFilters = { ...filters, aoc };
    setFilters(newFilters);
    fetchFournisseurs(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    fetchFournisseurs({});
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFournisseur(id);
      setShowDeleteConfirm(null);
    } catch {
      // Error is handled in store
    }
  };

  const handleEdit = (fournisseur: Fournisseur) => {
    setEditingFournisseur(fournisseur);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingFournisseur(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingFournisseur(null);
    clearError();
  };

  const handleFormSubmit = async (data: CreateFournisseurInput) => {
    if (editingFournisseur) {
      await updateFournisseur(editingFournisseur.id, data);
    } else {
      await createFournisseur(data);
    }
    handleFormClose();
  };

  const hasActiveFilters = filters.bio !== undefined || filters.aoc !== undefined;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fournisseurs</h2>
            <p className="text-muted-foreground">
              Gérez vos fournisseurs de vins
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau fournisseur
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtres:</span>
                <Button
                  size="sm"
                  variant={filters.bio === true ? 'default' : 'outline'}
                  onClick={() => handleFilterBio(filters.bio === true ? undefined : true)}
                >
                  <Leaf className="h-4 w-4 mr-1" />
                  BIO
                </Button>
                <Button
                  size="sm"
                  variant={filters.aoc === true ? 'default' : 'outline'}
                  onClick={() => handleFilterAoc(filters.aoc === true ? undefined : true)}
                >
                  <Award className="h-4 w-4 mr-1" />
                  AOC
                </Button>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
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

        {/* Form Modal/Card */}
        {showForm && (
          <FournisseurForm
            fournisseur={editingFournisseur}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            isLoading={isLoading}
          />
        )}

        {/* Fournisseurs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Liste des fournisseurs
              <span className="text-muted-foreground font-normal text-sm">
                ({fournisseurs.length} fournisseur{fournisseurs.length > 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && fournisseurs.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : fournisseurs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Truck className="h-8 w-8 mb-2" />
                <p>Aucun fournisseur trouvé</p>
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Téléphone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Certifications</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fournisseurs.map((fournisseur) => (
                      <FournisseurRow
                        key={fournisseur.id}
                        fournisseur={fournisseur}
                        onEdit={() => handleEdit(fournisseur)}
                        onDelete={() => setShowDeleteConfirm(fournisseur.id)}
                        showDeleteConfirm={showDeleteConfirm === fournisseur.id}
                        onConfirmDelete={() => handleDelete(fournisseur.id)}
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

interface FournisseurRowProps {
  fournisseur: Fournisseur;
  onEdit: () => void;
  onDelete: () => void;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function FournisseurRow({
  fournisseur,
  onEdit,
  onDelete,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: FournisseurRowProps) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-3 px-4">
        <div className="font-medium">{fournisseur.nom}</div>
        {fournisseur.adresse && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-xs">{fournisseur.adresse}</span>
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-muted-foreground">
        {fournisseur.personneContact || '-'}
      </td>
      <td className="py-3 px-4">
        {fournisseur.email ? (
          <a
            href={`mailto:${fournisseur.email}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            {fournisseur.email}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-4">
        {fournisseur.telephone ? (
          <a
            href={`tel:${fournisseur.telephone}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Phone className="h-3 w-3" />
            {fournisseur.telephone}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {fournisseur.certificationBio && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <Leaf className="h-3 w-3 mr-1" />
              BIO
            </span>
          )}
          {fournisseur.certificationAoc && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              <Award className="h-3 w-3 mr-1" />
              AOC
            </span>
          )}
          {fournisseur.certificationsAutres && (
            <span className="text-xs text-muted-foreground">
              {fournisseur.certificationsAutres}
            </span>
          )}
          {!fournisseur.certificationBio && !fournisseur.certificationAoc && !fournisseur.certificationsAutres && (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
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

interface FournisseurFormProps {
  fournisseur: Fournisseur | null;
  onSubmit: (data: CreateFournisseurInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function FournisseurForm({ fournisseur, onSubmit, onCancel, isLoading }: FournisseurFormProps) {
  const [formData, setFormData] = useState<CreateFournisseurInput>({
    nom: fournisseur?.nom || '',
    personneContact: fournisseur?.personneContact || '',
    email: fournisseur?.email || '',
    telephone: fournisseur?.telephone || '',
    adresse: fournisseur?.adresse || '',
    conditionsPaiement: fournisseur?.conditionsPaiement || '',
    certificationBio: fournisseur?.certificationBio || false,
    certificationAoc: fournisseur?.certificationAoc || false,
    certificationsAutres: fournisseur?.certificationsAutres || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nom.trim()) {
      setFormError('Le nom est requis');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Email invalide');
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
      await onSubmit(formData);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {fournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        </CardTitle>
        <CardDescription>
          {fournisseur
            ? 'Modifiez les informations du fournisseur'
            : 'Ajoutez un nouveau fournisseur'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Caves de Bordeaux"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personneContact">Personne de contact</Label>
              <Input
                id="personneContact"
                name="personneContact"
                value={formData.personneContact}
                onChange={handleInputChange}
                placeholder="Jean Dupont"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@exemple.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="0556123456"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              placeholder="123 Quai des Chartrons, 33000 Bordeaux"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditionsPaiement">Conditions de paiement</Label>
            <Input
              id="conditionsPaiement"
              name="conditionsPaiement"
              value={formData.conditionsPaiement}
              onChange={handleInputChange}
              placeholder="30 jours fin de mois"
            />
          </div>

          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="certificationBio"
                  checked={formData.certificationBio}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm flex items-center gap-1">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Certification BIO
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="certificationAoc"
                  checked={formData.certificationAoc}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-600" />
                  Certification AOC
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificationsAutres">Autres certifications</Label>
            <Input
              id="certificationsAutres"
              name="certificationsAutres"
              value={formData.certificationsAutres}
              onChange={handleInputChange}
              placeholder="HVE3, Demeter, Biodynamie..."
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving || isLoading}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {fournisseur ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
