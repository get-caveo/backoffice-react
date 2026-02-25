import { useState, useEffect } from 'react';
import type { ModePaiement, PaiementVentePOSDto } from '@/types/pos';
import { usePOSStore } from '@/store/pos.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  X,
  Banknote,
  CreditCard,
  FileText,
  Wallet,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSPaymentModalProps {
  montantDu: number;
  montantDejaPaye: number;
  onPay: (dto: PaiementVentePOSDto) => Promise<void>;
  onFinaliser: () => Promise<void>;
  onClose: () => void;
}

const MODES_PAIEMENT: { mode: ModePaiement; label: string; icon: React.ElementType }[] = [
  { mode: 'CARTE', label: 'Carte', icon: CreditCard },
  { mode: 'ESPECES', label: 'Espèces', icon: Banknote },
  { mode: 'CHEQUE', label: 'Chèque', icon: FileText },
  { mode: 'AVOIR', label: 'Avoir', icon: Wallet },
];

export function POSPaymentModal({
  montantDu,
  montantDejaPaye,
  onPay,
  onFinaliser,
  onClose,
}: POSPaymentModalProps) {
  const { isProcessingPayment } = usePOSStore();
  const [selectedMode, setSelectedMode] = useState<ModePaiement>('CARTE');
  const [montant, setMontant] = useState<string>(String(montantDu - montantDejaPaye));
  const [montantRecu, setMontantRecu] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [tpeStatus, setTpeStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const resteAPayer = montantDu - montantDejaPaye;
  const montantNum = parseFloat(montant) || 0;
  const montantRecuNum = parseFloat(montantRecu) || 0;

  // Calcul du rendu de monnaie
  const montantRendu =
    selectedMode === 'ESPECES' && montantRecuNum > resteAPayer
      ? montantRecuNum - resteAPayer
      : 0;

  // Simulation TPE
  const handlePaiementCarte = async () => {
    setTpeStatus('processing');

    // Simuler attente TPE (2-3 secondes)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

    setTpeStatus('success');

    // Attendre un peu puis effectuer le paiement
    await new Promise((resolve) => setTimeout(resolve, 500));

    await onPay({
      modePaiement: 'CARTE',
      montant: Math.min(montantNum, resteAPayer),
      reference: `TPE-${Date.now()}`,
    });

    // Si paiement complet, finaliser
    if (montantNum >= resteAPayer) {
      await onFinaliser();
    }
  };

  const handlePaiement = async () => {
    if (selectedMode === 'CARTE') {
      await handlePaiementCarte();
      return;
    }

    const dto: PaiementVentePOSDto = {
      modePaiement: selectedMode,
      montant: Math.min(montantNum, resteAPayer),
      reference: reference || undefined,
      montantRecu: selectedMode === 'ESPECES' ? montantRecuNum : undefined,
    };

    await onPay(dto);

    // Si paiement complet, finaliser
    if (montantNum >= resteAPayer) {
      await onFinaliser();
    }
  };

  // Reset TPE status when mode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTpeStatus('idle');
  }, [selectedMode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessingPayment}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto">
          {/* Montant à payer */}
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Reste à payer</p>
            <p className="text-4xl font-bold text-primary">{resteAPayer.toFixed(2)} €</p>
          </div>

          {/* Modes de paiement */}
          <div className="grid grid-cols-4 gap-2">
            {MODES_PAIEMENT.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                disabled={isProcessingPayment}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                  selectedMode === mode
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Simulation TPE pour carte */}
          {selectedMode === 'CARTE' && tpeStatus !== 'idle' && (
            <div className="bg-slate-900 text-white rounded-lg p-6 text-center">
              <div className="text-lg font-mono mb-4">
                {tpeStatus === 'processing' ? 'PAIEMENT EN COURS...' : 'PAIEMENT ACCEPTÉ'}
              </div>
              <div className="text-3xl font-bold mb-4">{resteAPayer.toFixed(2)} €</div>
              {tpeStatus === 'processing' ? (
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-400" />
              ) : (
                <Check className="h-12 w-12 mx-auto text-green-400" />
              )}
              {tpeStatus === 'processing' && (
                <p className="text-sm text-slate-400 mt-4">
                  Veuillez présenter votre carte...
                </p>
              )}
            </div>
          )}

          {/* Champs selon le mode */}
          {selectedMode !== 'CARTE' || tpeStatus === 'idle' ? (
            <>
              {selectedMode === 'ESPECES' && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Montant reçu</p>
                    <Input
                      type="number"
                      value={montantRecu}
                      onChange={(e) => setMontantRecu(e.target.value)}
                      placeholder={resteAPayer.toFixed(2)}
                      className="text-xl h-12"
                      disabled={isProcessingPayment}
                    />
                  </div>

                  {/* Présets espèces */}
                  <div className="flex gap-2 flex-wrap">
                    {[5, 10, 20, 50, 100, 200].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setMontantRecu(String(preset))}
                        disabled={isProcessingPayment}
                      >
                        {preset} €
                      </Button>
                    ))}
                  </div>

                  {montantRendu > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-green-600 mb-1">Rendu monnaie</p>
                      <p className="text-2xl font-bold text-green-700">
                        {montantRendu.toFixed(2)} €
                      </p>
                    </div>
                  )}
                </>
              )}

              {selectedMode === 'CHEQUE' && (
                <div>
                  <p className="text-sm font-medium mb-2">Numéro de chèque</p>
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="N° chèque"
                    className="h-12"
                    disabled={isProcessingPayment}
                  />
                </div>
              )}

              {/* Montant partiel (pour paiement fractionné) */}
              <div>
                <p className="text-sm font-medium mb-2">Montant du paiement</p>
                <Input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="text-xl h-12"
                  max={resteAPayer}
                  disabled={isProcessingPayment}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Modifiez pour un paiement partiel (fractionné)
                </p>
              </div>
            </>
          ) : null}

          {/* Boutons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12"
              disabled={isProcessingPayment}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePaiement}
              disabled={
                isProcessingPayment ||
                montantNum <= 0 ||
                (selectedMode === 'CARTE' && tpeStatus !== 'idle')
              }
              className="h-12"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                `Valider ${montantNum.toFixed(2)} €`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
