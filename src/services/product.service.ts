/**
 * Product Service
 *
 * Handles product-related API operations.
 */

import { apiClient } from '@/lib/api-client';
import type {
  Produit,
  ProduitFilters,
  CreateProduitInput,
  UpdateProduitInput,
  ProduitConditionnement,
  CreateConditionnementInput,
  UpdateConditionnementInput,
  ProduitFournisseur,
  CreateFournisseurProduitInput,
  UpdateFournisseurProduitInput,
} from '@/types/product';

/**
 * Build query string from filters
 */
function buildQueryString(filters?: ProduitFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();
  if (filters.categorieId) params.append('categorieId', String(filters.categorieId));
  if (filters.domaineId) params.append('domaineId', String(filters.domaineId));
  if (filters.millesime) params.append('millesime', String(filters.millesime));
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// Products
// ============================================================================

/**
 * Get all products with optional filters
 */
export async function getProducts(
  token: string,
  filters?: ProduitFilters
): Promise<Produit[]> {
  const query = buildQueryString(filters);
  return apiClient.get<Produit[]>(`/api/produits${query}`, { token });
}

/**
 * Get a single product by ID
 */
export async function getProduct(token: string, id: number): Promise<Produit> {
  return apiClient.get<Produit>(`/api/produits/${id}`, { token });
}

/**
 * Get a product by SKU
 */
export async function getProductBySku(token: string, sku: string): Promise<Produit> {
  return apiClient.get<Produit>(`/api/produits/sku/${sku}`, { token });
}

/**
 * Get a product by barcode (for scanner)
 */
export async function getProductByBarcode(token: string, codeBarre: string): Promise<Produit> {
  return apiClient.get<Produit>(`/api/produits/code-barre/${codeBarre}`, { token });
}

/**
 * Create a new product
 */
export async function createProduct(
  token: string,
  data: CreateProduitInput
): Promise<Produit> {
  return apiClient.post<Produit>('/api/produits', { token, body: data });
}

/**
 * Update an existing product
 */
export async function updateProduct(
  token: string,
  id: number,
  data: UpdateProduitInput
): Promise<Produit> {
  return apiClient.put<Produit>(`/api/produits/${id}`, { token, body: data });
}

/**
 * Delete a product (soft delete)
 */
export async function deleteProduct(token: string, id: number): Promise<void> {
  return apiClient.delete(`/api/produits/${id}`, { token });
}

// ============================================================================
// Product Conditionnements (Packaging Units)
// ============================================================================

/**
 * Get conditionnements for a product
 */
export async function getProductConditionnements(
  token: string,
  productId: number
): Promise<ProduitConditionnement[]> {
  return apiClient.get<ProduitConditionnement[]>(
    `/api/produits/${productId}/conditionnements`,
    { token }
  );
}

/**
 * Add a conditionnement to a product
 */
export async function addProductConditionnement(
  token: string,
  productId: number,
  data: CreateConditionnementInput
): Promise<ProduitConditionnement> {
  return apiClient.post<ProduitConditionnement>(
    `/api/produits/${productId}/conditionnements`,
    { token, body: data }
  );
}

/**
 * Update a product conditionnement
 */
export async function updateProductConditionnement(
  token: string,
  productId: number,
  conditionnementId: number,
  data: UpdateConditionnementInput
): Promise<ProduitConditionnement> {
  return apiClient.put<ProduitConditionnement>(
    `/api/produits/${productId}/conditionnements/${conditionnementId}`,
    { token, body: data }
  );
}

/**
 * Delete a product conditionnement
 */
export async function deleteProductConditionnement(
  token: string,
  productId: number,
  conditionnementId: number
): Promise<void> {
  return apiClient.delete(
    `/api/produits/${productId}/conditionnements/${conditionnementId}`,
    { token }
  );
}

// ============================================================================
// Product Fournisseurs (Suppliers)
// ============================================================================

/**
 * Get fournisseurs for a product
 */
export async function getProductFournisseurs(
  token: string,
  productId: number
): Promise<ProduitFournisseur[]> {
  return apiClient.get<ProduitFournisseur[]>(
    `/api/produits/${productId}/fournisseurs`,
    { token }
  );
}

/**
 * Add a fournisseur to a product
 */
export async function addProductFournisseur(
  token: string,
  productId: number,
  data: CreateFournisseurProduitInput
): Promise<ProduitFournisseur> {
  return apiClient.post<ProduitFournisseur>(
    `/api/produits/${productId}/fournisseurs`,
    { token, body: data }
  );
}

/**
 * Update a product fournisseur
 */
export async function updateProductFournisseur(
  token: string,
  productId: number,
  fournisseurId: number,
  data: UpdateFournisseurProduitInput
): Promise<ProduitFournisseur> {
  return apiClient.put<ProduitFournisseur>(
    `/api/produits/${productId}/fournisseurs/${fournisseurId}`,
    { token, body: data }
  );
}

/**
 * Delete a product fournisseur
 */
export async function deleteProductFournisseur(
  token: string,
  productId: number,
  fournisseurId: number
): Promise<void> {
  return apiClient.delete(
    `/api/produits/${productId}/fournisseurs/${fournisseurId}`,
    { token }
  );
}
