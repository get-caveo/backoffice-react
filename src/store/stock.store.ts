/**
 * Stock Store using Zustand
 *
 * Manages stock state and provides methods for stock operations.
 * Connects to the Java backend API.
 */

import { create } from 'zustand';
import type {
  StockActuel,
  StockAlerte,
  MouvementStock,
  CreateMouvementInput,
} from '@/types/stock';
import type { ProduitConditionnement } from '@/types/product';
import * as stockService from '@/services/stock.service';
import { useAuthStore } from './auth.store';

interface StockState {
  stock: StockActuel[];
  alertes: StockAlerte[];
  alertesCount: number;
  recentMouvements: MouvementStock[];
  isLoading: boolean;
  error: string | null;

  // Actions - Stock
  fetchStock: () => Promise<void>;
  fetchProductStock: (productId: number) => Promise<StockActuel[]>;

  // Actions - Alerts
  fetchAlertes: (reapproAutoOnly?: boolean) => Promise<void>;
  fetchAlertesCount: () => Promise<void>;

  // Actions - Movements
  fetchRecentMouvements: (limit?: number) => Promise<void>;
  fetchProductMouvements: (productId: number) => Promise<MouvementStock[]>;
  createMouvement: (data: CreateMouvementInput) => Promise<MouvementStock>;

  // Actions - Reservation
  reserveStock: (
    produitId: number,
    uniteConditionnementId: number,
    quantite: number
  ) => Promise<void>;
  releaseStock: (
    produitId: number,
    uniteConditionnementId: number,
    quantite: number
  ) => Promise<void>;

  // Actions - Barcode Scanner
  fetchConditionnementByBarcode: (codeBarre: string) => Promise<ProduitConditionnement | null>;

  // Utils
  clearError: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error('Non authentifié');
  }
  return token;
}

export const useStockStore = create<StockState>((set, get) => ({
  stock: [],
  alertes: [],
  alertesCount: 0,
  recentMouvements: [],
  isLoading: false,
  error: null,

  // ============================================================================
  // Stock
  // ============================================================================

  fetchStock: async () => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const stock = await stockService.getStock(token);

      set({ stock, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement du stock',
      });
    }
  },

  fetchProductStock: async (productId: number) => {
    try {
      const token = getToken();
      return await stockService.getProductStock(token, productId);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Erreur lors du chargement du stock produit',
      });
      return [];
    }
  },

  // ============================================================================
  // Alerts
  // ============================================================================

  fetchAlertes: async (reapproAutoOnly?: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const alertes = await stockService.getStockAlertes(token, reapproAutoOnly);

      set({ alertes, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des alertes',
      });
    }
  },

  fetchAlertesCount: async () => {
    try {
      const token = getToken();
      const alertesCount = await stockService.getStockAlertesCount(token);

      set({ alertesCount });
    } catch (error) {
      // Silently fail for count - don't block UI
      console.error('Failed to fetch alertes count:', error);
    }
  },

  // ============================================================================
  // Movements
  // ============================================================================

  fetchRecentMouvements: async (limit: number = 20) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const recentMouvements = await stockService.getRecentMouvements(token, limit);

      set({ recentMouvements, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors du chargement des mouvements',
      });
    }
  },

  fetchProductMouvements: async (productId: number) => {
    try {
      const token = getToken();
      return await stockService.getProductMouvements(token, productId);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors du chargement des mouvements produit',
      });
      return [];
    }
  },

  createMouvement: async (data: CreateMouvementInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const mouvement = await stockService.createMouvement(token, data);

      // Add to recent movements
      set((state) => ({
        recentMouvements: [mouvement, ...state.recentMouvements].slice(0, 20),
        isLoading: false,
      }));

      // Refresh stock and alerts after movement
      get().fetchStock();
      get().fetchAlertesCount();

      return mouvement;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la création du mouvement',
      });
      throw error;
    }
  },

  // ============================================================================
  // Reservation
  // ============================================================================

  reserveStock: async (
    produitId: number,
    uniteConditionnementId: number,
    quantite: number
  ) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      await stockService.reserveStock(token, produitId, uniteConditionnementId, quantite);

      // Refresh stock after reservation
      get().fetchStock();
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la réservation du stock',
      });
      throw error;
    }
  },

  releaseStock: async (
    produitId: number,
    uniteConditionnementId: number,
    quantite: number
  ) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      await stockService.releaseStock(token, produitId, uniteConditionnementId, quantite);

      // Refresh stock after release
      get().fetchStock();
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la libération du stock',
      });
      throw error;
    }
  },

  // ============================================================================
  // Barcode Scanner
  // ============================================================================

  fetchConditionnementByBarcode: async (codeBarre: string) => {
    try {
      const token = getToken();
      return await stockService.getConditionnementByBarcode(token, codeBarre);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Code-barre non trouvé',
      });
      return null;
    }
  },

  // ============================================================================
  // Utils
  // ============================================================================

  clearError: () => {
    set({ error: null });
  },
}));
