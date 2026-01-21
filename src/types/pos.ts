/**
 * POS (Point of Sale) related types
 */

import type { Produit, ProduitConditionnement, UniteConditionnement } from './product';

// Enums
export type StatutVentePOS = 'BROUILLON' | 'PAYEE' | 'ANNULEE';
export type ModePaiement = 'ESPECES' | 'CARTE' | 'CHEQUE' | 'AVOIR';
export type TypeRemise = 'POURCENTAGE' | 'MONTANT';

// Utilisateur simplifié
export interface UtilisateurSimple {
  id: number;
  email: string;
  nom: string;
  prenom: string;
}

// Ligne de vente POS
export interface LigneVentePOS {
  id: number;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  remiseLigne: number;
  produit: Produit;
  uniteConditionnement: UniteConditionnement;
}

// Paiement vente POS
export interface PaiementVentePOS {
  id: number;
  modePaiement: ModePaiement;
  montant: number;
  reference?: string;
  montantRendu?: number;
  creeLe: string;
}

// Vente POS complète
export interface VentePOS {
  id: number;
  numero: string;
  statut: StatutVentePOS;
  dateVente?: string;
  montantSousTotal: number;
  montantRemise: number;
  typeRemise?: TypeRemise;
  valeurRemise?: number;
  montantTotal: number;
  montantPaye: number;
  notes?: string;
  creeLe: string;
  modifieLe?: string;
  utilisateur: UtilisateurSimple;
  lignes: LigneVentePOS[];
  paiements: PaiementVentePOS[];
}

// DTOs pour les requêtes
export interface LigneVentePOSDto {
  produitId: number;
  uniteConditionnementId: number;
  quantite: number;
  prixUnitaire?: number;
}

export interface PaiementVentePOSDto {
  modePaiement: ModePaiement;
  montant: number;
  reference?: string;
  montantRecu?: number;
}

export interface RemiseDto {
  typeRemise: TypeRemise;
  valeur: number;
}

// Ticket de caisse
export interface LigneTicket {
  produitNom: string;
  conditionnement: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
}

export interface PaiementTicket {
  modePaiement: ModePaiement;
  montant: number;
  reference?: string;
}

export interface TicketVentePOS {
  numero: string;
  dateVente: string;
  vendeur: string;
  lignes: LigneTicket[];
  sousTotal: number;
  typeRemise?: TypeRemise;
  valeurRemise?: number;
  montantRemise: number;
  total: number;
  paiements: PaiementTicket[];
  montantPaye: number;
  montantRendu: number;
}

// Statistiques du jour
export interface StatsJourPOS {
  nombreVentes: number;
  totalVentes: number;
  moyenneParVente: number;
  totauxParModePaiement: Record<string, number>;
}

// Types pour l'interface POS
export interface POSProductWithStock extends Produit {
  conditionnements: (ProduitConditionnement & {
    stockDisponible: number;
  })[];
}

// Panier local (avant synchronisation avec le backend)
export interface CartItem {
  produit: Produit;
  conditionnement: ProduitConditionnement;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
}

export interface Cart {
  items: CartItem[];
  sousTotal: number;
  remise?: {
    type: TypeRemise;
    valeur: number;
    montant: number;
  };
  total: number;
}
