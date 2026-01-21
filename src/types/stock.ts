/**
 * Stock-related types based on the backend API
 */

export interface StockActuel {
  id: number;
  quantite: number;
  quantiteReservee: number;
  quantiteDisponible: number;
  quantiteUniteBase: number;
  dernierInventaire?: string;
  modifieLe?: string | null;
  produit: {
    id: number;
    sku: string;
    nom: string;
    seuilStockMinimal?: number;
    reapproAuto?: boolean;
  };
  uniteConditionnement: {
    id: number;
    nom: string;
    nomCourt?: string;
  };
}

export interface StockAlerte extends StockActuel {
  produit: {
    id: number;
    sku: string;
    nom: string;
    seuilStockMinimal: number;
    reapproAuto: boolean;
  };
}

export type TypeMouvement = 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'INVENTAIRE';
export type TypeReference = 'COMMANDE_FOURNISSEUR' | 'COMMANDE_CLIENT' | 'INVENTAIRE' | 'MANUEL';

export interface MouvementStock {
  id: number;
  typeMouvement: TypeMouvement;
  quantite: number;
  quantiteUniteBase: number;
  typeReference: TypeReference;
  referenceId?: number;
  prixUnitaire?: number;
  raison?: string;
  numeroLot?: string;
  datePeremption?: string | null;
  creeLe: string;
  produit: {
    id: number;
    sku: string;
    nom: string;
  };
  uniteConditionnement: {
    id: number;
    nom: string;
  };
  utilisateur: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
  };
}

export interface CreateMouvementInput {
  produit: { id: number };
  uniteConditionnement: { id: number };
  typeMouvement: TypeMouvement;
  quantite: number;
  typeReference: TypeReference;
  referenceId?: number;
  prixUnitaire?: number;
  raison?: string;
  numeroLot?: string;
  datePeremption?: string;
}
