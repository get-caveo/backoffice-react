import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StockLayout } from '@/components/StockLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, RefreshCw, Send, Check, Package, XCircle, Zap, X, Loader2, Eye, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommandeFournisseur, StatutCommandeFournisseur, CreateLigneCommandeInput } from '@/types/commande-fournisseur';
import type { Fournisseur, Produit } from '@/types/product';
import * as commandeService from '@/services/commande-fournisseur.service';
import * as fournisseurService from '@/services/fournisseur.service';
import * as productService from '@/services/product.service';
import { useAuthStore } from '@/store/auth.store';

export function StockCommandesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [commandes, setCommandes] = useState<CommandeFournisseur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  // Produit pré-sélectionné depuis l'URL (ex: /dashboard/stock/commandes?produitId=123)
  const initialProduitId = searchParams.get('produitId') ? Number(searchParams.get('produitId')) : null;

  // État pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoadingFournisseurs, setIsLoadingFournisseurs] = useState(false);
  const [selectedFournisseurId, setSelectedFournisseurId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // État pour les actions en cours (par commande)
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // État pour le modal de réception
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [commandeToReceive, setCommandeToReceive] = useState<CommandeFournisseur | null>(null);
  const [isLoadingCommande, setIsLoadingCommande] = useState(false);
  const [receptionQuantities, setReceptionQuantities] = useState<Record<number, number>>({});

  // État pour le modal de détails
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [commandeDetail, setCommandeDetail] = useState<CommandeFournisseur | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // État pour l'ajout de ligne
  const [showAddLigneForm, setShowAddLigneForm] = useState(false);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [isLoadingProduits, setIsLoadingProduits] = useState(false);
  const [selectedProduitId, setSelectedProduitId] = useState<number | null>(null);
  const [selectedConditionnementId, setSelectedConditionnementId] = useState<number | null>(null);
  const [ligneQuantite, setLigneQuantite] = useState<number>(1);
  const [lignePrixUnitaire, setLignePrixUnitaire] = useState<number>(0);
  const [isAddingLigne, setIsAddingLigne] = useState(false);
  const [isDeletingLigne, setIsDeletingLigne] = useState<number | null>(null);

  const fetchCommandes = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await commandeService.getCommandesFournisseur(token);
      setCommandes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, [token]);

  // Si un produitId est passé en paramètre, ouvrir directement le modal de création
  useEffect(() => {
    if (initialProduitId && token && !isLoading) {
      handleOpenCreateModal();
      // Nettoyer le paramètre de l'URL après ouverture
      setSearchParams({});
    }
  }, [initialProduitId, token, isLoading]);

  const getStatutBadge = (statut: StatutCommandeFournisseur) => {
    const config: Record<StatutCommandeFournisseur, { label: string; className: string }> = {
      BROUILLON: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
      ENVOYEE: { label: 'Envoyée', className: 'bg-blue-100 text-blue-700' },
      CONFIRMEE: { label: 'Confirmée', className: 'bg-indigo-100 text-indigo-700' },
      PARTIELLEMENT_RECUE: { label: 'Partielle', className: 'bg-yellow-100 text-yellow-700' },
      RECUE: { label: 'Reçue', className: 'bg-green-100 text-green-700' },
      ANNULEE: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
    };
    const { label, className } = config[statut];
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', className)}>
        {label}
      </span>
    );
  };

  const handleGenerateAuto = async () => {
    if (!token) return;
    try {
      const newCommandes = await commandeService.genererCommandesAuto(token);
      if (newCommandes.length > 0) {
        setCommandes([...newCommandes, ...commandes]);
      } else {
        setError('Aucun produit sous le seuil de réapprovisionnement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    }
  };

  const handleOpenCreateModal = async () => {
    if (!token) return;
    setShowCreateModal(true);
    setSelectedFournisseurId(null);
    setNotes('');
    setIsLoadingFournisseurs(true);
    try {
      const data = await fournisseurService.getFournisseurs(token);
      setFournisseurs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des fournisseurs');
      setShowCreateModal(false);
    } finally {
      setIsLoadingFournisseurs(false);
    }
  };

  const handleCreateCommande = async () => {
    if (!token || !selectedFournisseurId) return;
    setIsCreating(true);
    try {
      const newCommande = await commandeService.createCommandeFournisseur(
        token,
        selectedFournisseurId,
        notes || undefined
      );
      setCommandes([newCommande, ...commandes]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEnvoyer = async (commandeId: number) => {
    if (!token) return;
    setActionInProgress(commandeId);
    try {
      const updated = await commandeService.envoyerCommande(token, commandeId);
      setCommandes(commandes.map((c) => (c.id === commandeId ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmer = async (commandeId: number) => {
    if (!token) return;
    setActionInProgress(commandeId);
    try {
      const updated = await commandeService.confirmerCommande(token, commandeId);
      setCommandes(commandes.map((c) => (c.id === commandeId ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la confirmation');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenReceptionModal = async (commandeId: number) => {
    if (!token) return;
    setShowReceptionModal(true);
    setIsLoadingCommande(true);
    setReceptionQuantities({});
    try {
      const commande = await commandeService.getCommandeFournisseur(token, commandeId);
      setCommandeToReceive(commande);
      // Initialiser les quantités avec le reste à recevoir
      const quantities: Record<number, number> = {};
      commande.lignes?.forEach((ligne) => {
        quantities[ligne.id] = ligne.quantite - ligne.quantiteRecue;
      });
      setReceptionQuantities(quantities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la commande');
      setShowReceptionModal(false);
    } finally {
      setIsLoadingCommande(false);
    }
  };

  const handleReceptionner = async () => {
    if (!token || !commandeToReceive) return;
    setActionInProgress(commandeToReceive.id);
    try {
      const lignes = Object.entries(receptionQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([ligneId, quantiteRecue]) => ({
          ligneId: Number(ligneId),
          quantiteRecue,
        }));

      if (lignes.length === 0) {
        setError('Veuillez saisir au moins une quantité à réceptionner');
        setActionInProgress(null);
        return;
      }

      const updated = await commandeService.receptionnerCommande(token, commandeToReceive.id, { lignes });
      setCommandes(commandes.map((c) => (c.id === commandeToReceive.id ? updated : c)));
      setShowReceptionModal(false);
      setCommandeToReceive(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réception');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenDetailModal = async (commandeId: number) => {
    if (!token) return;
    setShowDetailModal(true);
    setIsLoadingDetail(true);
    setShowAddLigneForm(false);
    try {
      const commande = await commandeService.getCommandeFournisseur(token, commandeId);
      setCommandeDetail(commande);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la commande');
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenAddLigneForm = async () => {
    if (!token) return;
    setShowAddLigneForm(true);
    setSelectedProduitId(null);
    setSelectedConditionnementId(null);
    setLigneQuantite(1);
    setLignePrixUnitaire(0);
    setIsLoadingProduits(true);
    try {
      const data = await productService.getProducts(token);
      setProduits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
      setShowAddLigneForm(false);
    } finally {
      setIsLoadingProduits(false);
    }
  };

  const selectedProduit = produits.find((p) => p.id === selectedProduitId);

  const handleAddLigne = async () => {
    if (!token || !commandeDetail || !selectedProduitId || !selectedConditionnementId) return;
    setIsAddingLigne(true);
    try {
      const data: CreateLigneCommandeInput = {
        produitId: selectedProduitId,
        uniteConditionnementId: selectedConditionnementId,
        quantite: ligneQuantite,
        prixUnitaire: lignePrixUnitaire,
      };
      await commandeService.addLigneCommande(token, commandeDetail.id, data);
      // Recharger la commande pour avoir les lignes à jour
      const updated = await commandeService.getCommandeFournisseur(token, commandeDetail.id);
      setCommandeDetail(updated);
      setCommandes(commandes.map((c) => (c.id === updated.id ? updated : c)));
      setShowAddLigneForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la ligne');
    } finally {
      setIsAddingLigne(false);
    }
  };

  const handleDeleteLigne = async (ligneId: number) => {
    if (!token || !commandeDetail) return;
    setIsDeletingLigne(ligneId);
    try {
      await commandeService.deleteLigneCommande(token, commandeDetail.id, ligneId);
      // Recharger la commande
      const updated = await commandeService.getCommandeFournisseur(token, commandeDetail.id);
      setCommandeDetail(updated);
      setCommandes(commandes.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeletingLigne(null);
    }
  };

  return (
    <StockLayout
      title="Commandes fournisseur"
      description="Gérez vos commandes auprès des fournisseurs"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Liste des commandes
            </CardTitle>
            <CardDescription>
              {commandes.length} commande{commandes.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCommandes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateAuto}>
              <Zap className="h-4 w-4 mr-2" />
              Génération auto
            </Button>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle commande
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
          ) : commandes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-2" />
              <p>Aucune commande</p>
              <p className="text-sm">Créez votre première commande fournisseur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Numéro</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fournisseur</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Montant</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date commande</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Livraison prévue</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commandes.map((commande) => (
                    <tr
                      key={commande.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleOpenDetailModal(commande.id)}
                    >
                      <td className="py-3 px-4">
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">
                          {commande.numero}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium">{commande.fournisseur.nom}</td>
                      <td className="py-3 px-4">{getStatutBadge(commande.statut)}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {commande.montantTotal.toFixed(2)} €
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {commande.dateCommande
                          ? new Date(commande.dateCommande).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {commande.dateLivraisonPrevue
                          ? new Date(commande.dateLivraisonPrevue).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(commande.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {commande.statut === 'BROUILLON' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEnvoyer(commande.id)}
                              disabled={actionInProgress === commande.id}
                            >
                              {actionInProgress === commande.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              Envoyer
                            </Button>
                          )}
                          {commande.statut === 'ENVOYEE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfirmer(commande.id)}
                              disabled={actionInProgress === commande.id}
                            >
                              {actionInProgress === commande.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Confirmer
                            </Button>
                          )}
                          {(commande.statut === 'CONFIRMEE' || commande.statut === 'PARTIELLEMENT_RECUE') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReceptionModal(commande.id)}
                              disabled={actionInProgress === commande.id}
                            >
                              {actionInProgress === commande.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Package className="h-4 w-4 mr-1" />
                              )}
                              Réceptionner
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

      {/* Modal de création de commande */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Nouvelle commande
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
              {isLoadingFournisseurs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur">Fournisseur *</Label>
                    <select
                      id="fournisseur"
                      value={selectedFournisseurId ?? ''}
                      onChange={(e) => setSelectedFournisseurId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={isCreating}
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {fournisseurs.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes pour cette commande..."
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
                      onClick={handleCreateCommande}
                      disabled={!selectedFournisseurId || isCreating}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de réception */}
      {showReceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Réception de commande
                {commandeToReceive && (
                  <code className="ml-2 text-sm bg-muted px-2 py-0.5 rounded font-normal">
                    {commandeToReceive.numero}
                  </code>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowReceptionModal(false);
                  setCommandeToReceive(null);
                }}
                disabled={actionInProgress !== null}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              {isLoadingCommande ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : commandeToReceive?.lignes && commandeToReceive.lignes.length > 0 ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-2 px-3 text-sm font-medium">Produit</th>
                          <th className="text-center py-2 px-3 text-sm font-medium">Commandé</th>
                          <th className="text-center py-2 px-3 text-sm font-medium">Déjà reçu</th>
                          <th className="text-center py-2 px-3 text-sm font-medium">À recevoir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commandeToReceive.lignes.map((ligne) => {
                          const resteARecevoir = ligne.quantite - ligne.quantiteRecue;
                          return (
                            <tr key={ligne.id} className="border-t">
                              <td className="py-2 px-3">
                                <div className="font-medium">{ligne.produit.nom}</div>
                                <div className="text-xs text-muted-foreground">
                                  {ligne.uniteConditionnement.nom} - {ligne.prixUnitaire.toFixed(2)} €
                                </div>
                              </td>
                              <td className="py-2 px-3 text-center">{ligne.quantite}</td>
                              <td className="py-2 px-3 text-center text-muted-foreground">
                                {ligne.quantiteRecue}
                              </td>
                              <td className="py-2 px-3">
                                <Input
                                  type="number"
                                  min={0}
                                  max={resteARecevoir}
                                  value={receptionQuantities[ligne.id] ?? 0}
                                  onChange={(e) =>
                                    setReceptionQuantities({
                                      ...receptionQuantities,
                                      [ligne.id]: Math.min(
                                        Math.max(0, parseInt(e.target.value) || 0),
                                        resteARecevoir
                                      ),
                                    })
                                  }
                                  className="w-20 h-8 text-center mx-auto"
                                  disabled={resteARecevoir === 0 || actionInProgress !== null}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowReceptionModal(false);
                        setCommandeToReceive(null);
                      }}
                      disabled={actionInProgress !== null}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleReceptionner}
                      disabled={actionInProgress !== null}
                    >
                      {actionInProgress !== null ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Réception...
                        </>
                      ) : (
                        'Valider la réception'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Aucune ligne dans cette commande
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Détails de la commande
                {commandeDetail && (
                  <code className="ml-2 text-sm bg-muted px-2 py-0.5 rounded font-normal">
                    {commandeDetail.numero}
                  </code>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDetailModal(false);
                  setCommandeDetail(null);
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
              ) : commandeDetail ? (
                <>
                  {/* Informations générales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fournisseur</p>
                      <p className="font-medium">{commandeDetail.fournisseur.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <div className="mt-1">{getStatutBadge(commandeDetail.statut)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date commande</p>
                      <p className="font-medium">
                        {commandeDetail.dateCommande
                          ? new Date(commandeDetail.dateCommande).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Livraison prévue</p>
                      <p className="font-medium">
                        {commandeDetail.dateLivraisonPrevue
                          ? new Date(commandeDetail.dateLivraisonPrevue).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {commandeDetail.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{commandeDetail.notes}</p>
                    </div>
                  )}

                  {/* Lignes de la commande */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Lignes de commande</h4>
                      {commandeDetail.statut === 'BROUILLON' && !showAddLigneForm && (
                        <Button size="sm" variant="outline" onClick={handleOpenAddLigneForm}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter une ligne
                        </Button>
                      )}
                    </div>

                    {/* Formulaire d'ajout de ligne */}
                    {showAddLigneForm && (
                      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
                        {isLoadingProduits ? (
                          <div className="flex items-center justify-center h-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Produit *</Label>
                                <select
                                  value={selectedProduitId ?? ''}
                                  onChange={(e) => {
                                    setSelectedProduitId(e.target.value ? Number(e.target.value) : null);
                                    setSelectedConditionnementId(null);
                                  }}
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                  disabled={isAddingLigne}
                                >
                                  <option value="">Sélectionner un produit</option>
                                  {produits.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.nom} ({p.sku})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Conditionnement *</Label>
                                <select
                                  value={selectedConditionnementId ?? ''}
                                  onChange={(e) => {
                                    const condId = e.target.value ? Number(e.target.value) : null;
                                    setSelectedConditionnementId(condId);
                                    // Auto-remplir le prix si disponible
                                    if (condId && selectedProduit?.conditionnements) {
                                      const cond = selectedProduit.conditionnements.find((c) => c.uniteConditionnement.id === condId);
                                      if (cond) {
                                        setLignePrixUnitaire(cond.prixUnitaire);
                                      }
                                    }
                                  }}
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                  disabled={!selectedProduitId || isAddingLigne}
                                >
                                  <option value="">Sélectionner</option>
                                  {selectedProduit?.conditionnements?.map((c) => (
                                    <option key={c.uniteConditionnement.id} value={c.uniteConditionnement.id}>
                                      {c.uniteConditionnement.nom} - {c.prixUnitaire.toFixed(2)} €
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Quantité *</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={ligneQuantite}
                                  onChange={(e) => setLigneQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                                  disabled={isAddingLigne}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Prix unitaire (€) *</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={lignePrixUnitaire}
                                  onChange={(e) => setLignePrixUnitaire(parseFloat(e.target.value) || 0)}
                                  disabled={isAddingLigne}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAddLigneForm(false)}
                                disabled={isAddingLigne}
                              >
                                Annuler
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleAddLigne}
                                disabled={!selectedProduitId || !selectedConditionnementId || ligneQuantite < 1 || isAddingLigne}
                              >
                                {isAddingLigne ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Ajout...
                                  </>
                                ) : (
                                  'Ajouter'
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {commandeDetail.lignes && commandeDetail.lignes.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 text-sm font-medium">Produit</th>
                              <th className="text-left py-2 px-3 text-sm font-medium">Conditionnement</th>
                              <th className="text-center py-2 px-3 text-sm font-medium">Qté commandée</th>
                              <th className="text-center py-2 px-3 text-sm font-medium">Qté reçue</th>
                              <th className="text-right py-2 px-3 text-sm font-medium">Prix unit.</th>
                              <th className="text-right py-2 px-3 text-sm font-medium">Total</th>
                              {commandeDetail.statut === 'BROUILLON' && (
                                <th className="text-right py-2 px-3 text-sm font-medium w-12"></th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {commandeDetail.lignes.map((ligne) => (
                              <tr key={ligne.id} className="border-t">
                                <td className="py-2 px-3">
                                  <div className="font-medium">{ligne.produit.nom}</div>
                                  <div className="text-xs text-muted-foreground">{ligne.produit.sku}</div>
                                </td>
                                <td className="py-2 px-3 text-sm">
                                  {ligne.uniteConditionnement.nom}
                                </td>
                                <td className="py-2 px-3 text-center">{ligne.quantite}</td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={cn(
                                      ligne.quantiteRecue === ligne.quantite
                                        ? 'text-green-600'
                                        : ligne.quantiteRecue > 0
                                          ? 'text-yellow-600'
                                          : 'text-muted-foreground'
                                    )}
                                  >
                                    {ligne.quantiteRecue}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">{ligne.prixUnitaire.toFixed(2)} €</td>
                                <td className="py-2 px-3 text-right font-medium">
                                  {ligne.prixTotal.toFixed(2)} €
                                </td>
                                {commandeDetail.statut === 'BROUILLON' && (
                                  <td className="py-2 px-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteLigne(ligne.id)}
                                      disabled={isDeletingLigne === ligne.id}
                                    >
                                      {isDeletingLigne === ligne.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-muted/30">
                            <tr className="border-t">
                              <td colSpan={commandeDetail.statut === 'BROUILLON' ? 6 : 5} className="py-2 px-3 text-right font-medium">
                                Total
                              </td>
                              <td className="py-2 px-3 text-right font-bold">
                                {commandeDetail.montantTotal.toFixed(2)} €
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8 border rounded-lg">
                        Aucune ligne dans cette commande
                      </div>
                    )}
                  </div>

                  {/* Informations complémentaires */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                    {commandeDetail.utilisateur && (
                      <div>
                        <p className="text-muted-foreground">Créé par</p>
                        <p>{commandeDetail.utilisateur.prenom} {commandeDetail.utilisateur.nom}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Créé le</p>
                      <p>{new Date(commandeDetail.creeLe).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </StockLayout>
  );
}
