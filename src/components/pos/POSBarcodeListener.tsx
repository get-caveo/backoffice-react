import { useEffect, useRef, useCallback } from 'react';

interface POSBarcodeListenerProps {
  onBarcodeScan: (barcode: string) => void;
  enabled?: boolean;
}

/**
 * Composant invisible qui écoute les scans de code-barres.
 * Les scanners USB émulent un clavier et tapent rapidement le code suivi d'Enter.
 * On détecte si les caractères arrivent très vite (< 50ms entre chaque).
 */
export function POSBarcodeListener({ onBarcodeScan, enabled = true }: POSBarcodeListenerProps) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  const THRESHOLD_MS = 50; // Temps max entre deux caractères pour être considéré comme un scan
  const MIN_LENGTH = 3; // Longueur minimale d'un code-barres

  const processBuffer = useCallback(() => {
    const barcode = bufferRef.current.trim();
    if (barcode.length >= MIN_LENGTH) {
      onBarcodeScan(barcode);
    }
    bufferRef.current = '';
  }, [onBarcodeScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si focus sur un input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // Si trop de temps s'est écoulé, réinitialiser le buffer
      if (timeSinceLastKey > THRESHOLD_MS && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = now;

      // Enter = fin du scan
      if (event.key === 'Enter') {
        event.preventDefault();
        processBuffer();
        return;
      }

      // Ajouter uniquement les caractères imprimables
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        bufferRef.current += event.key;

        // Clear timeout existant
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }

        // Si pas d'Enter reçu après 100ms, traiter le buffer
        timeoutRef.current = window.setTimeout(() => {
          if (bufferRef.current.length >= MIN_LENGTH) {
            processBuffer();
          } else {
            bufferRef.current = '';
          }
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, processBuffer]);

  // Ce composant ne rend rien
  return null;
}
