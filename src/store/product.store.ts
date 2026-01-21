/**
 * Product Store using Zustand
 *
 * Manages product state and provides methods for CRUD operations.
 * Connects to the Java backend API.
 */

import { create } from 'zustand';
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
import * as productService from '@/services/product.service';
import { useAuthStore } from './auth.store';

interface ProductState {
  products: Produit[];
  selectedProduct: Produit | null;
  isLoading: boolean;
  error: string | null;
  filters: ProduitFilters;

  // Actions - Products
  fetchProducts: (filters?: ProduitFilters) => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  fetchProductBySku: (sku: string) => Promise<void>;
  fetchProductByBarcode: (codeBarre: string) => Promise<Produit | null>;
  createProduct: (data: CreateProduitInput) => Promise<Produit>;
  updateProduct: (id: number, data: UpdateProduitInput) => Promise<Produit>;
  deleteProduct: (id: number) => Promise<void>;

  // Actions - Conditionnements
  fetchProductConditionnements: (productId: number) => Promise<void>;
  addConditionnement: (
    productId: number,
    data: CreateConditionnementInput
  ) => Promise<ProduitConditionnement>;
  updateConditionnement: (
    productId: number,
    conditionnementId: number,
    data: UpdateConditionnementInput
  ) => Promise<ProduitConditionnement>;
  deleteConditionnement: (productId: number, conditionnementId: number) => Promise<void>;

  // Actions - Fournisseurs
  fetchProductFournisseurs: (productId: number) => Promise<void>;
  addFournisseur: (
    productId: number,
    data: CreateFournisseurProduitInput
  ) => Promise<ProduitFournisseur>;
  updateFournisseur: (
    productId: number,
    fournisseurId: number,
    data: UpdateFournisseurProduitInput
  ) => Promise<ProduitFournisseur>;
  deleteFournisseur: (productId: number, fournisseurId: number) => Promise<void>;

  // Utils
  setFilters: (filters: ProduitFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearSelectedProduct: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error('Non authentifié');
  }
  return token;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {},

  // ============================================================================
  // Products
  // ============================================================================

  fetchProducts: async (filters?: ProduitFilters) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const appliedFilters = filters ?? get().filters;
      const products = await productService.getProducts(token, appliedFilters);

      set({ products, isLoading: false, filters: appliedFilters });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des produits',
      });
    }
  },

  fetchProduct: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const product = await productService.getProduct(token, id);

      set({ selectedProduct: product, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du produit',
      });
    }
  },

  fetchProductBySku: async (sku: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const product = await productService.getProductBySku(token, sku);

      set({ selectedProduct: product, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du produit',
      });
    }
  },

  fetchProductByBarcode: async (codeBarre: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const product = await productService.getProductByBarcode(token, codeBarre);

      set({ selectedProduct: product, isLoading: false });
      return product;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Produit non trouvé',
      });
      return null;
    }
  },

  createProduct: async (data: CreateProduitInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const product = await productService.createProduct(token, data);

      // Add to products list
      set((state) => ({
        products: [...state.products, product],
        selectedProduct: product,
        isLoading: false,
      }));

      return product;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création du produit',
      });
      throw error;
    }
  },

  updateProduct: async (id: number, data: UpdateProduitInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const product = await productService.updateProduct(token, id, data);

      // Update in products list
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
        selectedProduct: state.selectedProduct?.id === id ? product : state.selectedProduct,
        isLoading: false,
      }));

      return product;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du produit',
      });
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      await productService.deleteProduct(token, id);

      // Remove from products list (or mark as inactive)
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du produit',
      });
      throw error;
    }
  },

  // ============================================================================
  // Conditionnements
  // ============================================================================

  fetchProductConditionnements: async (productId: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const conditionnements = await productService.getProductConditionnements(token, productId);

      // Update selected product with conditionnements
      set((state) => ({
        selectedProduct: state.selectedProduct?.id === productId
          ? { ...state.selectedProduct, conditionnements }
          : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors du chargement des conditionnements',
      });
    }
  },

  addConditionnement: async (productId: number, data: CreateConditionnementInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const conditionnement = await productService.addProductConditionnement(
        token,
        productId,
        data
      );

      // Update selected product
      set((state) => {
        if (state.selectedProduct?.id === productId) {
          const conditionnements = [...(state.selectedProduct.conditionnements ?? []), conditionnement];
          return {
            selectedProduct: { ...state.selectedProduct, conditionnements },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });

      return conditionnement;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du conditionnement',
      });
      throw error;
    }
  },

  updateConditionnement: async (
    productId: number,
    conditionnementId: number,
    data: UpdateConditionnementInput
  ) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const conditionnement = await productService.updateProductConditionnement(
        token,
        productId,
        conditionnementId,
        data
      );

      // Update selected product
      set((state) => {
        if (state.selectedProduct?.id === productId) {
          const conditionnements = state.selectedProduct.conditionnements?.map((c) =>
            c.id === conditionnementId ? conditionnement : c
          );
          return {
            selectedProduct: { ...state.selectedProduct, conditionnements },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });

      return conditionnement;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la mise à jour du conditionnement',
      });
      throw error;
    }
  },

  deleteConditionnement: async (productId: number, conditionnementId: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      await productService.deleteProductConditionnement(token, productId, conditionnementId);

      // Update selected product
      set((state) => {
        if (state.selectedProduct?.id === productId) {
          const conditionnements = state.selectedProduct.conditionnements?.filter(
            (c) => c.id !== conditionnementId
          );
          return {
            selectedProduct: { ...state.selectedProduct, conditionnements },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la suppression du conditionnement',
      });
      throw error;
    }
  },

  // ============================================================================
  // Fournisseurs
  // ============================================================================

  fetchProductFournisseurs: async (productId: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const fournisseurs = await productService.getProductFournisseurs(token, productId);

      // Update selected product with fournisseurs
      set((state) => ({
        selectedProduct: state.selectedProduct?.id === productId
          ? { ...state.selectedProduct, fournisseurs }
          : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors du chargement des fournisseurs',
      });
    }
  },

  addFournisseur: async (productId: number, data: CreateFournisseurProduitInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const fournisseur = await productService.addProductFournisseur(token, productId, data);

      // Update selected product
      set((state) => {
        if (state.selectedProduct?.id === productId) {
          const fournisseurs = [...(state.selectedProduct.fournisseurs ?? []), fournisseur];
          return {
            selectedProduct: { ...state.selectedProduct, fournisseurs },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });

      return fournisseur;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du fournisseur',
      });
      throw error;
    }
  },

  updateFournisseur: async (
    productId: number,
    fournisseurId: number,
    data: UpdateFournisseurProduitInput
  ) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const fournisseur = await productService.updateProductFournisseur(
        token,
        productId,
        fournisseurId,
        data
      );

      // Update selected product
      set((state) => {
        if (state.selectedProduct?.id === productId) {
          const fournisseurs = state.selectedProduct.fournisseurs?.map((f) =>
            f.id === fournisseurId ? fournisseur : f
          );
          return {
            selectedProduct: { ...state.selectedProduct, fournisseurs },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });

      return fournisseur;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la mise à jour du fournisseur',
      });
      throw error;
    }
  },

  deleteFournisseur: async (productId: number, fournisseurId: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      await productService.deleteProductFournisseur(token, productId, fournisseurId);

      // Update selected product
      set((state) => {
        if (state.selectedProduct?.id === productId) {
          const fournisseurs = state.selectedProduct.fournisseurs?.filter(
            (f) => f.id !== fournisseurId
          );
          return {
            selectedProduct: { ...state.selectedProduct, fournisseurs },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la suppression du fournisseur',
      });
      throw error;
    }
  },

  // ============================================================================
  // Utils
  // ============================================================================

  setFilters: (filters: ProduitFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelectedProduct: () => {
    set({ selectedProduct: null });
  },
}));
