/**
 * Authentication Store using Zustand
 *
 * Manages authentication state and provides methods for login, logout, etc.
 * Connects to the Java backend API (single JWT token model).
 */

import { create } from 'zustand';
import type { User } from '@/types/auth';
import * as authService from '@/services/auth.service';
import {
  storeTokenSecurely,
  retrieveTokenSecurely,
  clearToken,
  isTokenExpired,
  decodeJWT,
} from '@/lib/security';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password });

      // Store token securely
      storeTokenSecurely(response.token);

      set({
        user: {
          id: response.id,
          email: response.email,
          prenom: response.prenom,
          nom: response.nom,
          role: response.role,
          actif: true,
        },
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Échec de la connexion',
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and reset state
      clearToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initialize: async () => {
    set({ isLoading: true });

    try {
      // Retrieve token from secure storage
      const token = retrieveTokenSecurely();

      if (!token) {
        console.log('No token found during initialization');
        set({ isLoading: false });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, clear and return
        console.log('Token expired during initialization');
        clearToken();
        set({ isLoading: false });
        return;
      }

      // Decode token to get user ID
      const decoded = decodeJWT(token);
      console.log('Decoded token during initialization:', decoded);
      if (!decoded || !decoded.id) {
        console.log('Invalid token during initialization');
        clearToken();
        set({ isLoading: false });
        return;
      }

      // Get current user profile
      const user = await authService.getCurrentUser(token, decoded.id as number);

      // Validate user has appropriate role for backoffice
      if (user.role !== 'EMPLOYE' && user.role !== 'ADMIN') {
        clearToken();
        set({
          isLoading: false,
          error: 'Accès refusé - Rôle EMPLOYE ou ADMIN requis',
        });
        return;
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Initialization error:', error);
      clearToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
