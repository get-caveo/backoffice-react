/**
 * Inventaire-related types based on the backend API
 */

// Statuts inventaire
export type StatutInventaire = 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

// Inventaire
export interface Inventaire {
  id: number;
  reference: string;
  nom: string;
  description?: string;
  statut: StatutInventaire;
  dateDebut?: string;
  dateFin?: string;
  notes?: string;
  creeLe: string;
  modifieLe?: string | null;
  utilisateur: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
  };
  lignes?: LigneInventaire[];
}

// Ligne d'inventaire
export interface LigneInventaire {
  id: number;
  quantiteAttendue: number;
  quantiteComptee?: number;
  difference: number;
  ecartValeur?: number;
  notes?: string;
  compteLe?: string;
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
export interface CreateInventaireInput {
  nom: string;
  description?: string;
  notes?: string;
}

export interface UpdateInventaireInput {
  nom?: string;
  description?: string;
  notes?: string;
}

export interface UpdateLigneInventaireInput {
  quantiteComptee: number;
  notes?: string;
}

// Filtres
export interface InventaireFilters {
  statut?: StatutInventaire;
}
