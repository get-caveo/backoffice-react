# Caveo Backoffice - AI Implementation Guide

This document provides instructions for AI assistants implementing new features in the Caveo backoffice React application.

## Project Overview

Caveo is a wine inventory management system. The backoffice is a React application that connects to a Java Spring Boot backend API.

- **Frontend**: React + TypeScript + Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **API**: REST API with JWT authentication

## Project Structure

```
backoffice-react/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components (button, card, input, etc.)
│   │   ├── SideNav.tsx      # Main navigation sidebar
│   │   ├── ProtectedRoute.tsx
│   │   └── CaveoLogo.tsx
│   │
│   ├── pages/               # Page components (screens)
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   │
│   ├── store/               # Zustand stores (state management)
│   │   ├── auth.store.ts
│   │   ├── product.store.ts
│   │   └── stock.store.ts
│   │
│   ├── services/            # API service functions
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── stock.service.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   └── stock.ts
│   │
│   ├── lib/                 # Utilities and helpers
│   │   ├── api-client.ts    # Centralized API client
│   │   ├── security.ts      # JWT token handling
│   │   └── utils.ts         # General utilities (cn, etc.)
│   │
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Types | `{entity}.ts` | `product.ts`, `stock.ts` |
| Service | `{entity}.service.ts` | `product.service.ts` |
| Store | `{entity}.store.ts` | `product.store.ts` |
| Page | `{Entity}Page.tsx` | `ProductsPage.tsx` |
| Component | `{ComponentName}.tsx` | `ProductCard.tsx` |

## Implementation Guide for New Entities

### 1. Create Types (`src/types/{entity}.ts`)

Define TypeScript interfaces based on the API response shapes from `README-api.md`.

```typescript
// src/types/fournisseur.ts

export interface Fournisseur {
  id: number;
  nom: string;
  personneContact?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  conditionsPaiement?: string;
  certificationBio: boolean;
  certificationAoc: boolean;
  certificationsAutres?: string;
}

export interface CreateFournisseurInput {
  nom: string;
  personneContact?: string;
  // ... other fields
}

export interface UpdateFournisseurInput extends Partial<CreateFournisseurInput> {}

export interface FournisseurFilters {
  bio?: boolean;
  aoc?: boolean;
}
```

### 2. Create Service (`src/services/{entity}.service.ts`)

Implement API functions using the centralized `apiClient`.

```typescript
// src/services/fournisseur.service.ts

import { apiClient } from '@/lib/api-client';
import type { Fournisseur, CreateFournisseurInput, FournisseurFilters } from '@/types/fournisseur';

function buildQueryString(filters?: FournisseurFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.bio !== undefined) params.append('bio', String(filters.bio));
  if (filters.aoc !== undefined) params.append('aoc', String(filters.aoc));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function getFournisseurs(
  token: string,
  filters?: FournisseurFilters
): Promise<Fournisseur[]> {
  const query = buildQueryString(filters);
  return apiClient.get<Fournisseur[]>(`/api/fournisseurs${query}`, { token });
}

export async function getFournisseur(token: string, id: number): Promise<Fournisseur> {
  return apiClient.get<Fournisseur>(`/api/fournisseurs/${id}`, { token });
}

export async function createFournisseur(
  token: string,
  data: CreateFournisseurInput
): Promise<Fournisseur> {
  return apiClient.post<Fournisseur>('/api/fournisseurs', { token, body: data });
}

export async function updateFournisseur(
  token: string,
  id: number,
  data: UpdateFournisseurInput
): Promise<Fournisseur> {
  return apiClient.put<Fournisseur>(`/api/fournisseurs/${id}`, { token, body: data });
}

export async function deleteFournisseur(token: string, id: number): Promise<void> {
  return apiClient.delete(`/api/fournisseurs/${id}`, { token });
}
```

### 3. Create Store (`src/store/{entity}.store.ts`)

Create a Zustand store with state and actions.

```typescript
// src/store/fournisseur.store.ts

import { create } from 'zustand';
import type { Fournisseur, CreateFournisseurInput, FournisseurFilters } from '@/types/fournisseur';
import * as fournisseurService from '@/services/fournisseur.service';
import { useAuthStore } from './auth.store';

interface FournisseurState {
  fournisseurs: Fournisseur[];
  selectedFournisseur: Fournisseur | null;
  isLoading: boolean;
  error: string | null;
  filters: FournisseurFilters;

  // Actions
  fetchFournisseurs: (filters?: FournisseurFilters) => Promise<void>;
  fetchFournisseur: (id: number) => Promise<void>;
  createFournisseur: (data: CreateFournisseurInput) => Promise<Fournisseur>;
  updateFournisseur: (id: number, data: UpdateFournisseurInput) => Promise<Fournisseur>;
  deleteFournisseur: (id: number) => Promise<void>;

  // Utils
  setFilters: (filters: FournisseurFilters) => void;
  clearError: () => void;
  clearSelectedFournisseur: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Non authentifié');
  return token;
}

export const useFournisseurStore = create<FournisseurState>((set, get) => ({
  fournisseurs: [],
  selectedFournisseur: null,
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
        error: error instanceof Error ? error.message : 'Erreur lors du chargement',
      });
    }
  },

  // ... implement other actions following the same pattern
}));
```

### 4. Create Pages (`src/pages/{Entity}Page.tsx`)

Create page components for list and detail views.

```typescript
// src/pages/FournisseursPage.tsx

import { useEffect } from 'react';
import { useFournisseurStore } from '@/store/fournisseur.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// ... other imports

export function FournisseursPage() {
  const { fournisseurs, isLoading, error, fetchFournisseurs } = useFournisseurStore();

  useEffect(() => {
    fetchFournisseurs();
  }, [fetchFournisseurs]);

  // ... render component
}
```

### 5. Add Routes (`src/App.tsx`)

Register new pages in the router.

```typescript
// In App.tsx, add to Routes:
<Route
  path="/dashboard/suppliers"
  element={
    <ProtectedRoute>
      <FournisseursPage />
    </ProtectedRoute>
  }
/>
```

### 6. Update Navigation (`src/components/SideNav.tsx`)

Ensure the sidebar has the correct link (usually already present).

## API Client Usage

The `apiClient` in `src/lib/api-client.ts` provides:

```typescript
apiClient.get<T>(endpoint, { token });
apiClient.post<T>(endpoint, { token, body });
apiClient.put<T>(endpoint, { token, body });
apiClient.delete<T>(endpoint, { token });
```

- All endpoints should start with `/api/`
- Token is required for all backoffice routes
- Returns typed responses
- Throws `ApiError` on failure with `message` and `status`

## UI Components Available

From shadcn/ui (`src/components/ui/`):
- `Button` - Various variants: default, outline, ghost, destructive
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Input`, `Label`
- `Toast`, `Toaster` (via useToast hook)

Icons from `lucide-react` - import as needed.

## Styling Guidelines

- Use Tailwind CSS classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow existing color scheme:
  - `text-primary`, `bg-primary`
  - `text-muted-foreground`
  - `text-destructive` for errors/alerts
  - `bg-muted/30` for subtle backgrounds

## Language

- UI text should be in **French**
- Code (variables, comments) in **English**

## Existing Entities Reference

| Entity | Types | Service | Store | Pages |
|--------|-------|---------|-------|-------|
| Auth | `auth.ts` | `auth.service.ts` | `auth.store.ts` | `LoginPage.tsx`, `RegisterPage.tsx` |
| Product | `product.ts` | `product.service.ts` | `product.store.ts` | - |
| Stock | `stock.ts` | `stock.service.ts` | `stock.store.ts` | - |

## Backend API Reference

See `README-api.md` for complete API documentation including:
- All endpoints and their parameters
- Request/response shapes
- Authentication requirements
- Error codes

## Entities to Implement

Based on the API, the following entities need implementation:

1. **Catégories** (`/api/categories`) - Wine categories
2. **Domaines** (`/api/domaines`) - Wine domains/estates
3. **Unités de Conditionnement** (`/api/unites-conditionnement`) - Packaging units
4. **Fournisseurs** (`/api/fournisseurs`) - Suppliers
5. **Inventaires** (`/api/inventaires`) - Inventory counts
6. **Commandes Fournisseur** (`/api/commandes-fournisseur`) - Supplier orders

Each follows the same pattern: types → service → store → pages.
