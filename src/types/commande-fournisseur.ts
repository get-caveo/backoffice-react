/**
 * Commande Fournisseur types based on the backend API
 */

import type { Fournisseur, Produit, UniteConditionnement } from './product';

// Statuts commande fournisseur
export type StatutCommandeFournisseur =
  | 'BROUILLON'
  | 'ENVOYEE'
  | 'CONFIRMEE'
  | 'PARTIELLEMENT_RECUE'
  | 'RECUE'
  | 'ANNULEE';

// Commande Fournisseur
export interface CommandeFournisseur {
  id: number;
  numero: string;
  statut: StatutCommandeFournisseur;
  dateCommande?: string;
  dateLivraisonPrevue?: string;
  dateReception?: string;
  montantTotal: number;
  notes?: string;
  creeLe: string;
  modifieLe?: string | null;
  fournisseur: {
    id: number;
    nom: string;
    email?: string;
    telephone?: string;
  };
  utilisateur: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
  };
  lignes?: LigneCommandeFournisseur[];
}

// Ligne de commande fournisseur
export interface LigneCommandeFournisseur {
  id: number;
  quantite: number;
  quantiteRecue: number;
  prixUnitaire: number;
  prixTotal: number;
  numeroLot?: string;
  datePeremption?: string;
  produit: {
    id: number;
    sku: string;
    nom: string;
  };
  uniteConditionnement: {
    id: number;
    nom: string;
    nomCourt?: string;
  };
}

// DTOs pour les requêtes
export interface CreateCommandeFournisseurInput {
  fournisseurId: number;
  notes?: string;
}

export interface UpdateCommandeFournisseurInput {
  dateLivraisonPrevue?: string;
  notes?: string;
}

export interface CreateLigneCommandeInput {
  produitId: number;
  uniteConditionnementId: number;
  quantite: number;
  prixUnitaire: number;
}

export interface ReceptionLigneInput {
  ligneId: number;
  quantiteRecue: number;
  numeroLot?: string;
  datePeremption?: string;
}

export interface ReceptionCommandeInput {
  lignes: ReceptionLigneInput[];
}

// Filtres
export interface CommandeFournisseurFilters {
  statut?: StatutCommandeFournisseur;
  fournisseurId?: number;
}

// Résumé pour affichage liste
export interface CommandeFournisseurResume {
  id: number;
  numero: string;
  statut: StatutCommandeFournisseur;
  fournisseurNom: string;
  montantTotal: number;
  nombreLignes: number;
  dateCommande?: string;
  dateLivraisonPrevue?: string;
}
