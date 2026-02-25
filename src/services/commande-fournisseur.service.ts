/**
 * Commande Fournisseur Service
 *
 * Handles supplier order API operations.
 */

import { apiClient } from '@/lib/api-client';
import type {
  CommandeFournisseur,
  LigneCommandeFournisseur,
  UpdateCommandeFournisseurInput,
  CreateLigneCommandeInput,
  ReceptionCommandeInput,
  StatutCommandeFournisseur,
} from '@/types/commande-fournisseur';

// ============================================================================
// CRUD Commandes
// ============================================================================

/**
 * Get all commandes fournisseur
 */
export async function getCommandesFournisseur(
  token: string,
  statut?: StatutCommandeFournisseur
): Promise<CommandeFournisseur[]> {
  const query = statut ? `?statut=${statut}` : '';
  return apiClient.get<CommandeFournisseur[]>(`/api/commandes-fournisseur${query}`, { token });
}

/**
 * Get commandes en attente (waiting for action)
 */
export async function getCommandesEnAttente(
  token: string
): Promise<CommandeFournisseur[]> {
  return apiClient.get<CommandeFournisseur[]>('/api/commandes-fournisseur/en-attente', { token });
}

/**
 * Get commande by ID with lines
 */
export async function getCommandeFournisseur(
  token: string,
  id: number
): Promise<CommandeFournisseur> {
  return apiClient.get<CommandeFournisseur>(`/api/commandes-fournisseur/${id}`, { token });
}

/**
 * Create a new commande fournisseur
 */
export async function createCommandeFournisseur(
  token: string,
  fournisseurId: number,
  notes?: string
): Promise<CommandeFournisseur> {
  const query = notes
    ? `?fournisseurId=${fournisseurId}&notes=${encodeURIComponent(notes)}`
    : `?fournisseurId=${fournisseurId}`;
  return apiClient.post<CommandeFournisseur>(`/api/commandes-fournisseur${query}`, { token });
}

/**
 * Update a commande fournisseur (BROUILLON only)
 */
export async function updateCommandeFournisseur(
  token: string,
  id: number,
  data: UpdateCommandeFournisseurInput
): Promise<CommandeFournisseur> {
  const params = new URLSearchParams();
  if (data.dateLivraisonPrevue) params.append('dateLivraisonPrevue', data.dateLivraisonPrevue);
  if (data.notes) params.append('notes', data.notes);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient.put<CommandeFournisseur>(`/api/commandes-fournisseur/${id}${query}`, { token });
}

/**
 * Delete a commande fournisseur (BROUILLON only)
 */
export async function deleteCommandeFournisseur(
  token: string,
  id: number
): Promise<void> {
  return apiClient.delete(`/api/commandes-fournisseur/${id}`, { token });
}

// ============================================================================
// Lignes
// ============================================================================

/**
 * Add a line to a commande
 */
export async function addLigneCommande(
  token: string,
  commandeId: number,
  data: CreateLigneCommandeInput
): Promise<LigneCommandeFournisseur> {
  return apiClient.post<LigneCommandeFournisseur>(
    `/api/commandes-fournisseur/${commandeId}/lignes`,
    { token, body: data }
  );
}

/**
 * Update a line in a commande (BROUILLON only)
 */
export async function updateLigneCommande(
  token: string,
  commandeId: number,
  ligneId: number,
  data: { quantite: number; prixUnitaire: number }
): Promise<LigneCommandeFournisseur> {
  return apiClient.put<LigneCommandeFournisseur>(
    `/api/commandes-fournisseur/${commandeId}/lignes/${ligneId}`,
    { token, body: data }
  );
}

/**
 * Delete a line from a commande
 */
export async function deleteLigneCommande(
  token: string,
  commandeId: number,
  ligneId: number
): Promise<void> {
  return apiClient.delete(`/api/commandes-fournisseur/${commandeId}/lignes/${ligneId}`, { token });
}

// ============================================================================
// Workflow
// ============================================================================

/**
 * Send commande to supplier
 * BROUILLON → ENVOYEE
 */
export async function envoyerCommande(
  token: string,
  id: number
): Promise<CommandeFournisseur> {
  return apiClient.post<CommandeFournisseur>(`/api/commandes-fournisseur/${id}/envoyer`, { token });
}

/**
 * Confirm commande (supplier confirmed)
 * ENVOYEE → CONFIRMEE
 */
export async function confirmerCommande(
  token: string,
  id: number
): Promise<CommandeFournisseur> {
  return apiClient.post<CommandeFournisseur>(`/api/commandes-fournisseur/${id}/confirmer`, { token });
}

/**
 * Receive products
 * * → PARTIELLEMENT_RECUE / RECUE
 */
export async function receptionnerCommande(
  token: string,
  id: number,
  data: ReceptionCommandeInput
): Promise<CommandeFournisseur> {
  return apiClient.post<CommandeFournisseur>(
    `/api/commandes-fournisseur/${id}/reception`,
    { token, body: data }
  );
}

/**
 * Cancel commande
 * * → ANNULEE
 */
export async function annulerCommande(
  token: string,
  id: number
): Promise<CommandeFournisseur> {
  return apiClient.post<CommandeFournisseur>(`/api/commandes-fournisseur/${id}/annuler`, { token });
}

// ============================================================================
// Auto-generation
// ============================================================================

/**
 * Generate automatic orders for products below threshold
 */
export async function genererCommandesAuto(
  token: string
): Promise<CommandeFournisseur[]> {
  return apiClient.post<CommandeFournisseur[]>('/api/commandes-fournisseur/auto/generer', { token });
}
