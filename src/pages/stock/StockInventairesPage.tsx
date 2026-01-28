import { useEffect, useState } from 'react';
import { StockLayout } from '@/components/StockLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Plus, RefreshCw, Play, CheckCircle, XCircle, X, Loader2, Eye, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Inventaire, StatutInventaire, LigneInventaire } from '@/types/inventaire';
import * as inventaireService from '@/services/inventaire.service';
import { useAuthStore } from '@/store/auth.store';

export function StockInventairesPage() {
  const [inventaires, setInventaires] = useState<Inventaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  // État pour les actions en cours
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // État pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // État pour le modal de détails/comptage
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [inventaireDetail, setInventaireDetail] = useState<Inventaire | null>(null);
  const [lignes, setLignes] = useState<LigneInventaire[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [comptageValues, setComptageValues] = useState<Record<number, number | null>>({});
  const [savingLigne, setSavingLigne] = useState<number | null>(null);
  const [showOnlyEcarts, setShowOnlyEcarts] = useState(false);

  const fetchInventaires = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await inventaireService.getInventaires(token);
      setInventaires(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventaires();
  }, [token]);

  const getStatutBadge = (statut: StatutInventaire) => {
    const config = {
      BROUILLON: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
      EN_COURS: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
      TERMINE: { label: 'Terminé', className: 'bg-green-100 text-green-700' },
      ANNULE: { label: 'Annulé', className: 'bg-red-100 text-red-700' },
    };
    const { label, className } = config[statut] || config.BROUILLON;
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', className)}>
        {label}
      </span>
    );
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setNewNom(`Inventaire ${new Date().toLocaleDateString('fr-FR')}`);
    setNewDescription('');
  };

  const handleCreateInventaire = async () => {
    if (!token || !newNom.trim()) return;
    setIsCreating(true);
    try {
      const newInventaire = await inventaireService.createInventaire(token, {
        nom: newNom.trim(),
        description: newDescription.trim() || undefined,
      });
      setInventaires([newInventaire, ...inventaires]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDemarrer = async (inventaireId: number) => {
    if (!token) return;
    setActionInProgress(inventaireId);
    try {
      const updated = await inventaireService.demarrerInventaire(token, inventaireId);
      setInventaires(inventaires.map((i) => (i.id === inventaireId ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du démarrage');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleTerminer = async (inventaireId: number) => {
    if (!token) return;
    if (!window.confirm('Êtes-vous sûr de vouloir terminer cet inventaire ? Les écarts seront appliqués au stock.')) {
      return;
    }
    setActionInProgress(inventaireId);
    try {
      const updated = await inventaireService.terminerInventaire(token, inventaireId);
      setInventaires(inventaires.map((i) => (i.id === inventaireId ? updated : i)));
      if (inventaireDetail?.id === inventaireId) {
        setInventaireDetail(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la finalisation');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAnnuler = async (inventaireId: number) => {
    if (!token) return;
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cet inventaire ?')) {
      return;
    }
    setActionInProgress(inventaireId);
    try {
      const updated = await inventaireService.annulerInventaire(token, inventaireId);
      setInventaires(inventaires.map((i) => (i.id === inventaireId ? updated : i)));
      if (inventaireDetail?.id === inventaireId) {
        setShowDetailModal(false);
        setInventaireDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenDetailModal = async (inventaireId: number) => {
    if (!token) return;
    setShowDetailModal(true);
    setIsLoadingDetail(true);
    setShowOnlyEcarts(false);
    try {
      const inventaire = await inventaireService.getInventaire(token, inventaireId);
      setInventaireDetail(inventaire);
      const lignesData = await inventaireService.getLignesInventaire(token, inventaireId);
      setLignes(lignesData);
      // Initialiser les valeurs de comptage
      const values: Record<number, number | null> = {};
      lignesData.forEach((l) => {
        values[l.id] = l.quantiteComptee ?? null;
      });
      setComptageValues(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveComptage = async (ligneId: number) => {
    if (!token || !inventaireDetail) return;
    const quantiteComptee = comptageValues[ligneId];
    if (quantiteComptee === null || quantiteComptee === undefined) return;

    setSavingLigne(ligneId);
    try {
      const updatedLigne = await inventaireService.updateLigneInventaire(
        token,
        inventaireDetail.id,
        ligneId,
        { quantiteComptee }
      );
      setLignes(lignes.map((l) => (l.id === ligneId ? updatedLigne : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSavingLigne(null);
    }
  };

  const filteredLignes = showOnlyEcarts
    ? lignes.filter((l) => l.difference !== 0)
    : lignes;

  const totalEcarts = lignes.filter((l) => l.difference !== 0).length;

  return (
    <StockLayout
      title="Inventaires"
      description="Gérez vos inventaires périodiques"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Liste des inventaires
            </CardTitle>
            <CardDescription>
              {inventaires.length} inventaire{inventaires.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchInventaires}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel inventaire
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : inventaires.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2" />
              <p>Aucun inventaire</p>
              <p className="text-sm">Créez votre premier inventaire</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Référence</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date création</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventaires.map((inventaire) => (
                    <tr
                      key={inventaire.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleOpenDetailModal(inventaire.id)}
                    >
                      <td className="py-3 px-4">
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">
                          {inventaire.reference}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium">{inventaire.nom}</td>
                      <td className="py-3 px-4">{getStatutBadge(inventaire.statut)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(inventaire.creeLe).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(inventaire.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inventaire.statut === 'BROUILLON' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemarrer(inventaire.id)}
                              disabled={actionInProgress === inventaire.id}
                            >
                              {actionInProgress === inventaire.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4 mr-1" />
                              )}
                              Démarrer
                            </Button>
                          )}
                          {inventaire.statut === 'EN_COURS' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTerminer(inventaire.id)}
                              disabled={actionInProgress === inventaire.id}
                            >
                              {actionInProgress === inventaire.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Terminer
                            </Button>
                          )}
                          {(inventaire.statut === 'BROUILLON' || inventaire.statut === 'EN_COURS') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleAnnuler(inventaire.id)}
                              disabled={actionInProgress === inventaire.id}
                            >
                              {actionInProgress === inventaire.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Nouvel inventaire
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  placeholder="Nom de l'inventaire"
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description..."
                  disabled={isCreating}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateInventaire}
                  disabled={!newNom.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de détails/comptage */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {inventaireDetail?.statut === 'EN_COURS' ? 'Comptage' : 'Détails'} inventaire
                {inventaireDetail && (
                  <code className="ml-2 text-sm bg-muted px-2 py-0.5 rounded font-normal">
                    {inventaireDetail.reference}
                  </code>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDetailModal(false);
                  setInventaireDetail(null);
                  setLignes([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : inventaireDetail ? (
                <>
                  {/* Informations générales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="font-medium">{inventaireDetail.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <div className="mt-1">{getStatutBadge(inventaireDetail.statut)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date début</p>
                      <p className="font-medium">
                        {inventaireDetail.dateDebut
                          ? new Date(inventaireDetail.dateDebut).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date fin</p>
                      <p className="font-medium">
                        {inventaireDetail.dateFin
                          ? new Date(inventaireDetail.dateFin).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {inventaireDetail.description && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{inventaireDetail.description}</p>
                    </div>
                  )}

                  {/* Lignes de l'inventaire */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        Lignes ({lignes.length})
                        {totalEcarts > 0 && (
                          <span className="ml-2 text-yellow-600 text-sm font-normal">
                            {totalEcarts} écart{totalEcarts > 1 ? 's' : ''}
                          </span>
                        )}
                      </h4>
                      {lignes.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowOnlyEcarts(!showOnlyEcarts)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {showOnlyEcarts ? 'Tout afficher' : 'Écarts seulement'}
                        </Button>
                      )}
                    </div>

                    {inventaireDetail.statut === 'BROUILLON' ? (
                      <div className="text-center text-muted-foreground py-8 border rounded-lg">
                        <Play className="h-8 w-8 mx-auto mb-2" />
                        <p>Démarrez l'inventaire pour générer les lignes de comptage</p>
                      </div>
                    ) : filteredLignes.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 text-sm font-medium">Produit</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Conditionnement</th>
                              <th className="text-center py-2 px-3 text-sm font-medium">Qté théorique</th>
                              <th className="text-center py-2 px-3 text-sm font-medium">Qté comptée</th>
                              <th className="text-center py-2 px-3 text-sm font-medium">Écart</th>
                              {inventaireDetail.statut === 'EN_COURS' && (
                                <th className="text-right py-2 px-3 text-sm font-medium w-20"></th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLignes.map((ligne) => (
                              <tr key={ligne.id} className="border-t">
                                <td className="py-2 px-3">
                                  <div className="font-medium">{ligne.produit.nom}</div>
                                  <div className="text-xs text-muted-foreground">{ligne.produit.sku}</div>
                                </td>
                                <td className="py-2 px-3 text-sm">
                                  {ligne.uniteConditionnement.nom}
                                </td>
                                <td className="py-2 px-3 text-center">{ligne.quantiteAttendue}</td>
                                <td className="py-2 px-3">
                                  {inventaireDetail.statut === 'EN_COURS' ? (
                                    <Input
                                      type="number"
                                      min={0}
                                      value={comptageValues[ligne.id] ?? ''}
                                      onChange={(e) =>
                                        setComptageValues({
                                          ...comptageValues,
                                          [ligne.id]: e.target.value === '' ? null : parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="w-20 h-8 text-center mx-auto"
                                      disabled={savingLigne === ligne.id}
                                    />
                                  ) : (
                                    <div className="text-center">
                                      {ligne.quantiteComptee ?? '-'}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={cn(
                                      'font-medium',
                                      ligne.difference > 0
                                        ? 'text-green-600'
                                        : ligne.difference < 0
                                          ? 'text-red-600'
                                          : 'text-muted-foreground'
                                    )}
                                  >
                                    {ligne.difference > 0 ? '+' : ''}{ligne.difference}
                                  </span>
                                </td>
                                {inventaireDetail.statut === 'EN_COURS' && (
                                  <td className="py-2 px-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSaveComptage(ligne.id)}
                                      disabled={
                                        savingLigne === ligne.id ||
                                        comptageValues[ligne.id] === null ||
                                        comptageValues[ligne.id] === ligne.quantiteComptee
                                      }
                                    >
                                      {savingLigne === ligne.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 border rounded-lg">
                        Aucune ligne {showOnlyEcarts ? 'avec écart' : ''}
                      </div>
                    )}
                  </div>

                  {/* Actions dans le modal */}
                  {inventaireDetail.statut === 'EN_COURS' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAnnuler(inventaireDetail.id)}
                        disabled={actionInProgress === inventaireDetail.id}
                      >
                        Annuler l'inventaire
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleTerminer(inventaireDetail.id)}
                        disabled={actionInProgress === inventaireDetail.id}
                      >
                        {actionInProgress === inventaireDetail.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Finalisation...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Terminer et appliquer les écarts
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </StockLayout>
  );
}
