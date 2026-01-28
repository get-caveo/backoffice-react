/**
 * Fournisseur Service
 *
 * Handles supplier-related API operations.
 */

import { apiClient } from '@/lib/api-client';
import type {
  Fournisseur,
  FournisseurFilters,
  CreateFournisseurInput,
  UpdateFournisseurInput,
  FournisseurProduit,
} from '@/types/fournisseur';

/**
 * Get all fournisseurs
 */
export async function getFournisseurs(
  token: string,
  filters?: FournisseurFilters
): Promise<Fournisseur[]> {
  const params = new URLSearchParams();
  if (filters?.bio !== undefined) params.append('bio', String(filters.bio));
  if (filters?.aoc !== undefined) params.append('aoc', String(filters.aoc));
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get<Fournisseur[]>(`/api/fournisseurs${query}`, { token });
}

/**
 * Get a single fournisseur by ID
 */
export async function getFournisseur(token: string, id: number): Promise<Fournisseur> {
  return apiClient.get<Fournisseur>(`/api/fournisseurs/${id}`, { token });
}

/**
 * Create a new fournisseur
 */
export async function createFournisseur(
  token: string,
  data: CreateFournisseurInput
): Promise<Fournisseur> {
  return apiClient.post<Fournisseur>('/api/fournisseurs', { body: data, token });
}

/**
 * Update a fournisseur
 */
export async function updateFournisseur(
  token: string,
  id: number,
  data: UpdateFournisseurInput
): Promise<Fournisseur> {
  return apiClient.put<Fournisseur>(`/api/fournisseurs/${id}`, { body: data, token });
}

/**
 * Delete a fournisseur (hard delete)
 */
export async function deleteFournisseur(token: string, id: number): Promise<void> {
  return apiClient.delete(`/api/fournisseurs/${id}`, { token });
}

/**
 * Get products supplied by a fournisseur
 */
export async function getFournisseurProduits(
  token: string,
  fournisseurId: number
): Promise<FournisseurProduit[]> {
  return apiClient.get<FournisseurProduit[]>(`/api/fournisseurs/${fournisseurId}/produits`, {
    token,
  });
}
