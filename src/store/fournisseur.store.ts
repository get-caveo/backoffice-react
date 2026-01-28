/**
 * Fournisseur Store using Zustand
 *
 * Manages supplier state and provides methods for CRUD operations.
 */

import { create } from 'zustand';
import type {
  Fournisseur,
  FournisseurFilters,
  CreateFournisseurInput,
  UpdateFournisseurInput,
  FournisseurProduit,
} from '@/types/fournisseur';
import * as fournisseurService from '@/services/fournisseur.service';
import { useAuthStore } from './auth.store';

interface FournisseurState {
  fournisseurs: Fournisseur[];
  selectedFournisseur: Fournisseur | null;
  fournisseurProduits: FournisseurProduit[];
  isLoading: boolean;
  error: string | null;
  filters: FournisseurFilters;

  // Actions
  fetchFournisseurs: (filters?: FournisseurFilters) => Promise<void>;
  fetchFournisseur: (id: number) => Promise<void>;
  fetchFournisseurProduits: (id: number) => Promise<void>;
  createFournisseur: (data: CreateFournisseurInput) => Promise<Fournisseur>;
  updateFournisseur: (id: number, data: UpdateFournisseurInput) => Promise<Fournisseur>;
  deleteFournisseur: (id: number) => Promise<void>;

  // Utils
  setFilters: (filters: FournisseurFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearSelectedFournisseur: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error('Non authentifié');
  }
  return token;
}

export const useFournisseurStore = create<FournisseurState>((set, get) => ({
  fournisseurs: [],
  selectedFournisseur: null,
  fournisseurProduits: [],
  isLoading: false,
  error: null,
  filters: {},

  fetchFournisseurs: async (filters?: FournisseurFilters) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const appliedFilters = filters ?? get().filters;
      const fournisseurs = await fournisseurService.getFournisseurs(token, appliedFilters);

      set({ fournisseurs, isLoading: false, filters: appliedFilters });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors du chargement des fournisseurs',
      });
    }
  },

  fetchFournisseur: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const fournisseur = await fournisseurService.getFournisseur(token, id);

      set({ selectedFournisseur: fournisseur, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors du chargement du fournisseur',
      });
    }
  },

  fetchFournisseurProduits: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const produits = await fournisseurService.getFournisseurProduits(token, id);

      set({ fournisseurProduits: produits, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors du chargement des produits du fournisseur',
      });
    }
  },

  createFournisseur: async (data: CreateFournisseurInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const fournisseur = await fournisseurService.createFournisseur(token, data);

      set((state) => ({
        fournisseurs: [...state.fournisseurs, fournisseur],
        selectedFournisseur: fournisseur,
        isLoading: false,
      }));

      return fournisseur;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la création du fournisseur',
      });
      throw error;
    }
  },

  updateFournisseur: async (id: number, data: UpdateFournisseurInput) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      const fournisseur = await fournisseurService.updateFournisseur(token, id, data);

      set((state) => ({
        fournisseurs: state.fournisseurs.map((f) => (f.id === id ? fournisseur : f)),
        selectedFournisseur:
          state.selectedFournisseur?.id === id ? fournisseur : state.selectedFournisseur,
        isLoading: false,
      }));

      return fournisseur;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la mise à jour du fournisseur',
      });
      throw error;
    }
  },

  deleteFournisseur: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = getToken();
      await fournisseurService.deleteFournisseur(token, id);

      set((state) => ({
        fournisseurs: state.fournisseurs.filter((f) => f.id !== id),
        selectedFournisseur: state.selectedFournisseur?.id === id ? null : state.selectedFournisseur,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la suppression du fournisseur',
      });
      throw error;
    }
  },

  setFilters: (filters: FournisseurFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelectedFournisseur: () => {
    set({ selectedFournisseur: null, fournisseurProduits: [] });
  },
}));
