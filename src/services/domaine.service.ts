/**
 * Domaine Service
 *
 * Handles domaine-related API operations.
 */

import { apiClient } from '@/lib/api-client';
import type { Domaine } from '@/types/product';

export interface DomaineFilters {
  region?: string;
  appellation?: string;
}

function buildQueryString(filters?: DomaineFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();
  if (filters.region) params.append('region', filters.region);
  if (filters.appellation) params.append('appellation', filters.appellation);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get all domaines with optional filters
 */
export async function getDomaines(
  token: string,
  filters?: DomaineFilters
): Promise<Domaine[]> {
  const query = buildQueryString(filters);
  return apiClient.get<Domaine[]>(`/api/domaines${query}`, { token });
}

/**
 * Get a single domaine by ID
 */
export async function getDomaine(token: string, id: number): Promise<Domaine> {
  return apiClient.get<Domaine>(`/api/domaines/${id}`, { token });
}
