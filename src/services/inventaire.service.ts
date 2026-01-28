/**
 * Inventaire Service
 *
 * Handles inventory-related API operations.
 */

import { apiClient } from '@/lib/api-client';
import type {
  Inventaire,
  LigneInventaire,
  CreateInventaireInput,
  UpdateInventaireInput,
  UpdateLigneInventaireInput,
  StatutInventaire,
} from '@/types/inventaire';

// ============================================================================
// CRUD Inventaires
// ============================================================================

/**
 * Get all inventaires
 */
export async function getInventaires(
  token: string,
  statut?: StatutInventaire
): Promise<Inventaire[]> {
  const query = statut ? `?statut=${statut}` : '';
  return apiClient.get<Inventaire[]>(`/api/inventaires${query}`, { token });
}

/**
 * Get inventaire by ID with lines
 */
export async function getInventaire(
  token: string,
  id: number
): Promise<Inventaire> {
  return apiClient.get<Inventaire>(`/api/inventaires/${id}`, { token });
}

/**
 * Create a new inventaire
 */
export async function createInventaire(
  token: string,
  data: CreateInventaireInput
): Promise<Inventaire> {
  return apiClient.post<Inventaire>('/api/inventaires', { token, body: data });
}

/**
 * Update an inventaire
 */
export async function updateInventaire(
  token: string,
  id: number,
  data: UpdateInventaireInput
): Promise<Inventaire> {
  return apiClient.put<Inventaire>(`/api/inventaires/${id}`, { token, body: data });
}

/**
 * Delete an inventaire
 */
export async function deleteInventaire(
  token: string,
  id: number
): Promise<void> {
  return apiClient.delete(`/api/inventaires/${id}`, { token });
}

// ============================================================================
// Workflow
// ============================================================================

/**
 * Start inventaire (generates lines from current stock)
 * BROUILLON → EN_COURS
 */
export async function demarrerInventaire(
  token: string,
  id: number
): Promise<Inventaire> {
  return apiClient.post<Inventaire>(`/api/inventaires/${id}/demarrer`, { token });
}

/**
 * Finish inventaire (applies adjustments to stock)
 * EN_COURS → TERMINE
 */
export async function terminerInventaire(
  token: string,
  id: number
): Promise<Inventaire> {
  return apiClient.post<Inventaire>(`/api/inventaires/${id}/terminer`, { token });
}

/**
 * Cancel inventaire
 * * → ANNULE
 */
export async function annulerInventaire(
  token: string,
  id: number
): Promise<Inventaire> {
  return apiClient.post<Inventaire>(`/api/inventaires/${id}/annuler`, { token });
}

// ============================================================================
// Lignes
// ============================================================================

/**
 * Get all lines for an inventaire
 */
export async function getLignesInventaire(
  token: string,
  inventaireId: number
): Promise<LigneInventaire[]> {
  return apiClient.get<LigneInventaire[]>(`/api/inventaires/${inventaireId}/lignes`, { token });
}

/**
 * Get lines with discrepancies
 */
export async function getLignesAvecEcarts(
  token: string,
  inventaireId: number
): Promise<LigneInventaire[]> {
  return apiClient.get<LigneInventaire[]>(`/api/inventaires/${inventaireId}/lignes/ecarts`, { token });
}

/**
 * Update a line (set counted quantity)
 */
export async function updateLigneInventaire(
  token: string,
  inventaireId: number,
  ligneId: number,
  data: UpdateLigneInventaireInput
): Promise<LigneInventaire> {
  return apiClient.put<LigneInventaire>(
    `/api/inventaires/${inventaireId}/lignes/${ligneId}`,
    { token, body: data }
  );
}
