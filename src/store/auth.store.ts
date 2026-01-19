/**
 * Authentication Store using Zustand
 * 
 * Manages authentication state and provides methods for login, register, logout, etc.
 */

import { create } from 'zustand';
import type { User } from '@/types/auth';
import * as authService from '@/services/auth.service';
import {
  storeTokensSecurely,
  retrieveTokensSecurely,
  clearTokens,
  isTokenExpired,
  generateDeviceFingerprint,
} from '@/lib/security';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login({ email, password });
      
      // Store tokens securely
      storeTokensSecurely(response.accessToken, response.refreshToken);
      
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.register({ email, password, name });
      
      // Store tokens securely
      storeTokensSecurely(response.accessToken, response.refreshToken);
      
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
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
      // Clear tokens and reset state
      clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await authService.refreshAccessToken(refreshToken);
      
      // Update tokens
      storeTokensSecurely(response.accessToken, refreshToken);
      
      set({
        accessToken: response.accessToken,
      });
    } catch (error) {
      // If refresh fails, log out the user
      get().logout();
      throw error;
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Generate and store device fingerprint
      const fingerprint = await generateDeviceFingerprint();
      sessionStorage.setItem('device_fingerprint', fingerprint);
      
      // Retrieve tokens from secure storage
      const tokens = retrieveTokensSecurely();
      
      if (!tokens) {
        set({ isLoading: false });
        return;
      }
      
      // Check if access token is expired
      if (isTokenExpired(tokens.accessToken)) {
        // Try to refresh the token
        try {
          const response = await authService.refreshAccessToken(tokens.refreshToken);
          tokens.accessToken = response.accessToken;
          storeTokensSecurely(tokens.accessToken, tokens.refreshToken);
        } catch (error) {
          // If refresh fails, clear tokens
          clearTokens();
          set({ isLoading: false });
          return;
        }
      }
      
      // Get current user
      const user = await authService.getCurrentUser(tokens.accessToken);
      
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Initialization error:', error);
      clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
