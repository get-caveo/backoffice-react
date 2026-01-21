/**
 * Stock Service
 *
 * Handles stock-related API operations.
 */

import { apiClient } from '@/lib/api-client';
import type {
  StockActuel,
  StockAlerte,
  MouvementStock,
  CreateMouvementInput,
} from '@/types/stock';
import type { ProduitConditionnement } from '@/types/product';

// ============================================================================
// Stock
// ============================================================================

/**
 * Get all stock
 */
export async function getStock(token: string): Promise<StockActuel[]> {
  return apiClient.get<StockActuel[]>('/api/stock', { token });
}

/**
 * Get stock alerts (products below minimum threshold)
 */
export async function getStockAlertes(
  token: string,
  reapproAutoOnly?: boolean
): Promise<StockAlerte[]> {
  const query = reapproAutoOnly ? '?reapproAutoOnly=true' : '';
  return apiClient.get<StockAlerte[]>(`/api/stock/alertes${query}`, { token });
}

/**
 * Get stock alerts count (for badge)
 */
export async function getStockAlertesCount(token: string): Promise<number> {
  return apiClient.get<number>('/api/stock/alertes/count', { token });
}

/**
 * Get stock for a specific product
 */
export async function getProductStock(
  token: string,
  productId: number
): Promise<StockActuel[]> {
  return apiClient.get<StockActuel[]>(`/api/produits/${productId}/stock`, { token });
}

// ============================================================================
// Stock Movements
// ============================================================================

/**
 * Create a stock movement
 */
export async function createMouvement(
  token: string,
  data: CreateMouvementInput
): Promise<MouvementStock> {
  return apiClient.post<MouvementStock>('/api/stock/mouvements', { token, body: data });
}

/**
 * Get recent movements (for dashboard)
 */
export async function getRecentMouvements(
  token: string,
  limit: number = 20
): Promise<MouvementStock[]> {
  return apiClient.get<MouvementStock[]>(`/api/stock/mouvements/recents?limit=${limit}`, {
    token,
  });
}

/**
 * Get movements for a specific product
 */
export async function getProductMouvements(
  token: string,
  productId: number
): Promise<MouvementStock[]> {
  return apiClient.get<MouvementStock[]>(`/api/stock/mouvements/produit/${productId}`, {
    token,
  });
}

// ============================================================================
// Stock Reservation
// ============================================================================

/**
 * Reserve stock
 */
export async function reserveStock(
  token: string,
  produitId: number,
  uniteConditionnementId: number,
  quantite: number
): Promise<void> {
  return apiClient.post(
    `/api/stock/reserver?produitId=${produitId}&uniteConditionnementId=${uniteConditionnementId}&quantite=${quantite}`,
    { token }
  );
}

/**
 * Release reserved stock
 */
export async function releaseStock(
  token: string,
  produitId: number,
  uniteConditionnementId: number,
  quantite: number
): Promise<void> {
  return apiClient.post(
    `/api/stock/liberer?produitId=${produitId}&uniteConditionnementId=${uniteConditionnementId}&quantite=${quantite}`,
    { token }
  );
}

// ============================================================================
// Barcode Scanner
// ============================================================================

/**
 * Get conditionnement by barcode (for scanner)
 */
export async function getConditionnementByBarcode(
  token: string,
  codeBarre: string
): Promise<ProduitConditionnement> {
  return apiClient.get<ProduitConditionnement>(`/api/stock/code-barre/${codeBarre}`, { token });
}
