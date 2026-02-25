/**
 * Commande Client Service
 *
 * Handles client order API operations for backoffice use.
 */

import { apiClient } from '@/lib/api-client';

// ============================================================================
// Types
// ============================================================================

export type StatutCommandeClient =
  | 'EN_ATTENTE'
  | 'CONFIRMEE'
  | 'EN_PREPARATION'
  | 'EXPEDIEE'
  | 'LIVREE'
  | 'ANNULEE';

export interface LigneCommandeClient {
  id: number;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  produit: {
    id: number;
    nom: string;
    sku?: string;
    imageUrl?: string;
  };
  uniteConditionnement: {
    id: number;
    nom: string;
    nomCourt?: string;
  };
}

export interface CommandeClient {
  id: number;
  numero: string;
  statutCommande: StatutCommandeClient;
  dateCommande?: string;
  dateExpedition?: string;
  dateLivraison?: string;
  sousTotal: number;
  fraisLivraison: number;
  montantTaxes: number;
  montantTotal: number;
  notes?: string;
  creeLe?: string;
  modifieLe?: string | null;
  client: {
    id: number;
    email?: string;
    prenom?: string;
    nom?: string;
    telephone?: string;
  };
  adresseLivraison?: {
    id: number;
    rue: string;
    ville: string;
    codePostal: string;
    pays?: string;
  } | null;
  adresseFacturation?: {
    id: number;
    rue: string;
    ville: string;
    codePostal: string;
    pays?: string;
  } | null;
  lignes?: LigneCommandeClient[];
}

// ============================================================================
// API Calls
// ============================================================================

/** Toutes les commandes clients (EMPLOYE/ADMIN) */
export async function getAllCommandesClient(
  token: string,
  statut?: StatutCommandeClient
): Promise<CommandeClient[]> {
  const query = statut ? `?statut=${statut}` : '';
  return apiClient.get<CommandeClient[]>(`/api/commandes-client${query}`, { token });
}

/** Commande par ID avec détails */
export async function getCommandeClient(
  token: string,
  id: number
): Promise<CommandeClient> {
  return apiClient.get<CommandeClient>(`/api/commandes-client/${id}`, { token });
}

/** Confirmer une commande EN_ATTENTE → CONFIRMEE */
export async function confirmerCommande(
  token: string,
  id: number
): Promise<CommandeClient> {
  return apiClient.post<CommandeClient>(`/api/commandes-client/${id}/confirmer`, { token });
}

/** Préparer une commande CONFIRMEE → EN_PREPARATION */
export async function preparerCommande(
  token: string,
  id: number
): Promise<CommandeClient> {
  return apiClient.post<CommandeClient>(`/api/commandes-client/${id}/preparer`, { token });
}

/** Expédier une commande EN_PREPARATION → EXPEDIEE */
export async function expedierCommande(
  token: string,
  id: number
): Promise<CommandeClient> {
  return apiClient.post<CommandeClient>(`/api/commandes-client/${id}/expedier`, { token });
}

/** Livrer une commande EXPEDIEE → LIVREE */
export async function livrerCommande(
  token: string,
  id: number
): Promise<CommandeClient> {
  return apiClient.post<CommandeClient>(`/api/commandes-client/${id}/livrer`, { token });
}

/** Annuler une commande */
export async function annulerCommande(
  token: string,
  id: number
): Promise<CommandeClient> {
  return apiClient.post<CommandeClient>(`/api/commandes-client/${id}/annuler`, { token });
}
