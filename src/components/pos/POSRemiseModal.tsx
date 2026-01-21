import { useState } from 'react';
import type { TypeRemise, RemiseDto } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Percent, Euro } from 'lucide-react';
import { cn } from '@/lib/utils';

interface POSRemiseModalProps {
  sousTotal: number;
  onApply: (dto: RemiseDto) => void;
  onClose: () => void;
}

export function POSRemiseModal({ sousTotal, onApply, onClose }: POSRemiseModalProps) {
  const [type, setType] = useState<TypeRemise>('POURCENTAGE');
  const [valeur, setValeur] = useState<string>('');

  const valeurNum = parseFloat(valeur) || 0;
  const montantRemise =
    type === 'POURCENTAGE'
      ? (sousTotal * valeurNum) / 100
      : Math.min(valeurNum, sousTotal);

  const handleApply = () => {
    if (valeurNum > 0) {
      onApply({ typeRemise: type, valeur: valeurNum });
    }
  };

  const presets =
    type === 'POURCENTAGE'
      ? [5, 10, 15, 20]
      : [5, 10, 20, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Appliquer une remise
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Type de remise */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setType('POURCENTAGE');
                setValeur('');
              }}
              className={cn(
                'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                type === 'POURCENTAGE'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
              )}
            >
              <Percent className="h-6 w-6" />
              <span className="font-medium">Pourcentage</span>
            </button>
            <button
              onClick={() => {
                setType('MONTANT');
                setValeur('');
              }}
              className={cn(
                'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                type === 'MONTANT'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
              )}
            >
              <Euro className="h-6 w-6" />
              <span className="font-medium">Montant fixe</span>
            </button>
          </div>

          {/* Valeur */}
          <div>
            <p className="text-sm font-medium mb-2">
              {type === 'POURCENTAGE' ? 'Pourcentage' : 'Montant'}
            </p>
            <div className="relative">
              <Input
                type="number"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
                placeholder="0"
                className="text-2xl h-14 pr-12"
                min={0}
                max={type === 'POURCENTAGE' ? 100 : sousTotal}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {type === 'POURCENTAGE' ? '%' : '€'}
              </span>
            </div>
          </div>

          {/* Présets rapides */}
          <div className="flex gap-2">
            {presets.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                onClick={() => setValeur(String(preset))}
                className="flex-1"
              >
                {preset}
                {type === 'POURCENTAGE' ? '%' : '€'}
              </Button>
            ))}
          </div>

          {/* Aperçu */}
          {valeurNum > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Sous-total</span>
                <span>{sousTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Remise</span>
                <span>-{montantRemise.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Nouveau total</span>
                <span>{(sousTotal - montantRemise).toFixed(2)} €</span>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="h-12">
              Annuler
            </Button>
            <Button
              onClick={handleApply}
              disabled={valeurNum <= 0}
              className="h-12"
            >
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
