import { useEffect, useState } from 'react';
import { usePOSStore } from '@/store/pos.store';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  POSProductGrid,
  POSCart,
  POSConditionnementModal,
  POSRemiseModal,
  POSPaymentModal,
  POSTicketModal,
  POSBarcodeListener,
} from '@/components/pos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Produit, ProduitConditionnement } from '@/types/product';
import type { RemiseDto, PaiementVentePOSDto } from '@/types/pos';
import {
  ScanBarcode,
  TrendingUp,
  ShoppingBag,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';

export function POSPage() {
  const {
    venteEnCours,
    statsJour,
    ticketCourant,
    isLoading,
    error,
    successMessage,
    initPOS,
    ajouterAuPanier,
    appliquerRemise,
    enregistrerPaiement,
    finaliserVente,
    annulerVente,
    rechercherParCodeBarre,
    creerNouvelleVente,
    clearError,
    clearSuccess,
    clearTicket,
  } = usePOSStore();

  // États locaux pour les modales
  const [produitSelectionne, setProduitSelectionne] = useState<Produit | null>(null);
  const [showRemiseModal, setShowRemiseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAnnulerConfirm, setShowAnnulerConfirm] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Initialisation
  useEffect(() => {
    initPOS();
  }, [initPOS]);

  // Gestion du produit sélectionné
  const handleProductClick = (produit: Produit) => {
    if (produit.conditionnements && produit.conditionnements.length === 1) {
      // Si un seul conditionnement, ajouter directement
      const cond = produit.conditionnements[0];
      ajouterAuPanier({
        produitId: produit.id,
        uniteConditionnementId: cond.uniteConditionnement.id,
        quantite: 1,
      });
    } else {
      // Sinon, ouvrir la modale de sélection
      setProduitSelectionne(produit);
    }
  };

  const handleConditionnementSelect = (
    conditionnement: ProduitConditionnement,
    quantite: number
  ) => {
    if (produitSelectionne) {
      ajouterAuPanier({
        produitId: produitSelectionne.id,
        uniteConditionnementId: conditionnement.uniteConditionnement.id,
        quantite,
      });
      setProduitSelectionne(null);
    }
  };

  // Gestion du code-barres
  const handleBarcodeScan = async (barcode: string) => {
    const conditionnement = await rechercherParCodeBarre(barcode);
    if (conditionnement && conditionnement.produit) {
      ajouterAuPanier({
        produitId: conditionnement.produit.id,
        uniteConditionnementId: conditionnement.uniteConditionnement.id,
        quantite: 1,
      });
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      handleBarcodeScan(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  // Gestion de la remise
  const handleRemise = (dto: RemiseDto) => {
    appliquerRemise(dto);
    setShowRemiseModal(false);
  };

  // Gestion du paiement
  const handlePay = async (dto: PaiementVentePOSDto) => {
    await enregistrerPaiement(dto);
  };

  const handleFinaliser = async () => {
    await finaliserVente();
    setShowPaymentModal(false);
  };

  // Gestion de l'annulation
  const handleAnnuler = async () => {
    await annulerVente();
    setShowAnnulerConfirm(false);
  };

  // Nouvelle vente après ticket
  const handleNewSale = () => {
    clearTicket();
    creerNouvelleVente();
  };

  return (
    <DashboardLayout>
      {/* Listener de code-barres */}
      <POSBarcodeListener onBarcodeScan={handleBarcodeScan} enabled={!showPaymentModal} />

      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-md animate-in slide-in-from-top">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="icon" onClick={clearError} className="text-destructive-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-md animate-in slide-in-from-top">
          <Check className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{successMessage}</span>
          <Button variant="ghost" size="icon" onClick={clearSuccess} className="text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
        {/* Header avec stats et scanner */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Caisse</h1>
            {statsJour && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{statsJour.nombreVentes} ventes</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{statsJour.totalVentes.toFixed(2)} € aujourd'hui</span>
                </div>
              </div>
            )}
          </div>

          {/* Champ scanner manuel */}
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
            <div className="relative">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scanner ou saisir code-barres..."
                className="pl-10 w-64"
              />
            </div>
            <Button type="submit" variant="secondary" disabled={!barcodeInput.trim()}>
              OK
            </Button>
          </form>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Grille de produits (2/3) */}
          <div className="lg:col-span-2 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Produits</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <POSProductGrid onProductClick={handleProductClick} />
              </CardContent>
            </Card>
          </div>

          {/* Panier (1/3) */}
          <div className="min-h-0">
            <POSCart
              onPayClick={() => setShowPaymentModal(true)}
              onRemiseClick={() => setShowRemiseModal(true)}
              onAnnulerClick={() => setShowAnnulerConfirm(true)}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      {produitSelectionne && (
        <POSConditionnementModal
          produit={produitSelectionne}
          onSelect={handleConditionnementSelect}
          onClose={() => setProduitSelectionne(null)}
        />
      )}

      {showRemiseModal && venteEnCours && (
        <POSRemiseModal
          sousTotal={venteEnCours.montantSousTotal}
          onApply={handleRemise}
          onClose={() => setShowRemiseModal(false)}
        />
      )}

      {showPaymentModal && venteEnCours && (
        <POSPaymentModal
          montantDu={venteEnCours.montantTotal}
          montantDejaPaye={venteEnCours.montantPaye}
          onPay={handlePay}
          onFinaliser={handleFinaliser}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {ticketCourant && (
        <POSTicketModal
          ticket={ticketCourant}
          onClose={clearTicket}
          onNewSale={handleNewSale}
        />
      )}

      {/* Modal de confirmation d'annulation */}
      {showAnnulerConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Annuler la vente ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Cette action supprimera tous les articles du panier. Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAnnulerConfirm(false)}
                  className="flex-1"
                >
                  Non, garder
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleAnnuler}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Oui, annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
