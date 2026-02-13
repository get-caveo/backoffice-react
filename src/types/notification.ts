export type TypeNotification =
  | 'STOCK_FAIBLE'
  | 'REAPPRO_BESOIN'
  | 'INVENTAIRE_REQUIS'
  | 'COMMANDE_RECUE'
  | 'COMMANDE_EXPEDIEE'
  | 'PAIEMENT_ECHOUE';

export interface Notification {
  id: number;
  type: TypeNotification;
  titre: string;
  message: string;
  typeReference?: string;
  referenceId?: number;
  utilisateur?: {
    id: number;
    prenom: string;
    nom: string;
  };
  lu: boolean;
  expireLe?: string;
  creeLe: string;
}
