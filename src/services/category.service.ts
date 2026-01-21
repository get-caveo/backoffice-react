/**
 * Category Service
 *
 * Handles category-related API operations.
 */

import { apiClient } from '@/lib/api-client';
import type { Categorie } from '@/types/product';

/**
 * Get all categories
 */
export async function getCategories(token: string): Promise<Categorie[]> {
  return apiClient.get<Categorie[]>('/api/categories', { token });
}

/**
 * Get a single category by ID
 */
export async function getCategory(token: string, id: number): Promise<Categorie> {
  return apiClient.get<Categorie>(`/api/categories/${id}`, { token });
}
