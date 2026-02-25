/**
 * Fournisseur-related types based on the backend API
 */

export interface Fournisseur {
  id: number;
  nom: string;
  personneContact?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  conditionsPaiement?: string;
  certificationBio: boolean;
  certificationAoc: boolean;
  certificationsAutres?: string;
}

export interface FournisseurFilters {
  bio?: boolean;
  aoc?: boolean;
}

export interface CreateFournisseurInput {
  nom: string;
  personneContact?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  conditionsPaiement?: string;
  certificationBio?: boolean;
  certificationAoc?: boolean;
  certificationsAutres?: string;
}

export type UpdateFournisseurInput = Partial<CreateFournisseurInput>;

export interface FournisseurProduit {
  id: number;
  prixFournisseur: number;
  delaiApproJours?: number;
  creeLe?: string;
  produit: {
    id: number;
    sku: string;
    nom: string;
  };
  fournisseur: {
    id: number;
    nom: string;
  };
}
