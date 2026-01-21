import type { TicketVentePOS } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Printer, Wine } from 'lucide-react';

interface POSTicketModalProps {
  ticket: TicketVentePOS;
  onClose: () => void;
  onNewSale: () => void;
}

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  CARTE: 'Carte bancaire',
  ESPECES: 'Espèces',
  CHEQUE: 'Chèque',
  AVOIR: 'Avoir client',
};

export function POSTicketModal({ ticket, onClose, onNewSale }: POSTicketModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardContent className="p-0">
          {/* Contenu du ticket (imprimable) */}
          <div className="p-6 print:p-4" id="ticket-content">
            {/* En-tête */}
            <div className="text-center border-b pb-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wine className="h-8 w-8 text-primary print:text-black" />
                <span className="text-2xl font-bold">CAVEO</span>
              </div>
              <p className="text-sm text-muted-foreground">Cave à vins</p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(ticket.dateVente)}
              </p>
              <p className="text-xs font-mono mt-1">N° {ticket.numero}</p>
            </div>

            {/* Vendeur */}
            <p className="text-xs text-muted-foreground mb-4">
              Vendeur: {ticket.vendeur}
            </p>

            {/* Lignes */}
            <div className="space-y-2 border-b pb-4 mb-4">
              {ticket.lignes.map((ligne, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{ligne.produitNom}</p>
                    <p className="text-xs text-muted-foreground">
                      {ligne.conditionnement} x{ligne.quantite} @ {ligne.prixUnitaire.toFixed(2)} €
                    </p>
                  </div>
                  <span className="ml-2 font-medium">{ligne.prixTotal.toFixed(2)} €</span>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{ticket.sousTotal.toFixed(2)} €</span>
              </div>

              {ticket.montantRemise > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Remise
                    {ticket.typeRemise === 'POURCENTAGE' && ` (${ticket.valeurRemise}%)`}
                  </span>
                  <span>-{ticket.montantRemise.toFixed(2)} €</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>TOTAL</span>
                <span>{ticket.total.toFixed(2)} €</span>
              </div>
            </div>

            {/* Paiements */}
            <div className="mt-4 pt-4 border-t space-y-1 text-sm">
              <p className="font-medium mb-2">Paiement(s)</p>
              {ticket.paiements.map((paiement, index) => (
                <div key={index} className="flex justify-between">
                  <span>{MODE_PAIEMENT_LABELS[paiement.modePaiement] || paiement.modePaiement}</span>
                  <span>{paiement.montant.toFixed(2)} €</span>
                </div>
              ))}

              {ticket.montantRendu > 0 && (
                <div className="flex justify-between text-green-600 pt-2">
                  <span>Rendu monnaie</span>
                  <span>{ticket.montantRendu.toFixed(2)} €</span>
                </div>
              )}
            </div>

            {/* Pied de ticket */}
            <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
              <p>Merci de votre visite !</p>
              <p className="mt-1">À bientôt chez CAVEO</p>
            </div>
          </div>

          {/* Boutons (non imprimés) */}
          <div className="p-4 border-t bg-muted/30 print:hidden">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button onClick={onNewSale} className="flex-1">
                Nouvelle vente
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style d'impression */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket-content, #ticket-content * {
            visibility: visible;
          }
          #ticket-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
        }
      `}</style>
    </div>
  );
}
