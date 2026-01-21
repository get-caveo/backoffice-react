/**
 * POS Service
 *
 * Handles Point of Sale API operations.
 */

import { apiClient } from '@/lib/api-client';
import type {
  VentePOS,
  LigneVentePOS,
  PaiementVentePOS,
  LigneVentePOSDto,
  PaiementVentePOSDto,
  RemiseDto,
  TicketVentePOS,
  StatsJourPOS,
} from '@/types/pos';
import type { ProduitConditionnement } from '@/types/product';

// ============================================================================
// Gestion des ventes
// ============================================================================

/**
 * Créer une nouvelle vente POS
 */
export async function creerVente(token: string): Promise<VentePOS> {
  return apiClient.post<VentePOS>('/api/pos/ventes', { token });
}

/**
 * Récupérer une vente par ID avec tous les détails
 */
export async function getVente(token: string, id: number): Promise<VentePOS> {
  return apiClient.get<VentePOS>(`/api/pos/ventes/${id}`, { token });
}

/**
 * Récupérer les ventes du jour (payées)
 */
export async function getVentesJour(token: string): Promise<VentePOS[]> {
  return apiClient.get<VentePOS[]>('/api/pos/ventes/jour', { token });
}

/**
 * Récupérer les ventes en brouillon de l'utilisateur
 */
export async function getVentesBrouillon(token: string): Promise<VentePOS[]> {
  return apiClient.get<VentePOS[]>('/api/pos/ventes/brouillon', { token });
}

/**
 * Annuler une vente
 */
export async function annulerVente(token: string, id: number): Promise<void> {
  return apiClient.delete(`/api/pos/ventes/${id}`, { token });
}

// ============================================================================
// Gestion des lignes
// ============================================================================

/**
 * Ajouter une ligne à une vente
 */
export async function ajouterLigne(
  token: string,
  venteId: number,
  dto: LigneVentePOSDto
): Promise<LigneVentePOS> {
  return apiClient.post<LigneVentePOS>(`/api/pos/ventes/${venteId}/lignes`, {
    token,
    body: dto,
  });
}

/**
 * Modifier la quantité d'une ligne
 */
export async function modifierQuantiteLigne(
  token: string,
  venteId: number,
  ligneId: number,
  quantite: number
): Promise<LigneVentePOS> {
  return apiClient.put<LigneVentePOS>(
    `/api/pos/ventes/${venteId}/lignes/${ligneId}?quantite=${quantite}`,
    { token }
  );
}

/**
 * Supprimer une ligne
 */
export async function supprimerLigne(
  token: string,
  venteId: number,
  ligneId: number
): Promise<void> {
  return apiClient.delete(`/api/pos/ventes/${venteId}/lignes/${ligneId}`, { token });
}

// ============================================================================
// Gestion des remises
// ============================================================================

/**
 * Appliquer une remise à une vente
 */
export async function appliquerRemise(
  token: string,
  venteId: number,
  dto: RemiseDto
): Promise<VentePOS> {
  return apiClient.post<VentePOS>(`/api/pos/ventes/${venteId}/remise`, {
    token,
    body: dto,
  });
}

/**
 * Supprimer la remise d'une vente
 */
export async function supprimerRemise(
  token: string,
  venteId: number
): Promise<VentePOS> {
  return apiClient.delete<VentePOS>(`/api/pos/ventes/${venteId}/remise`, { token });
}

// ============================================================================
// Gestion des paiements
// ============================================================================

/**
 * Enregistrer un paiement
 */
export async function enregistrerPaiement(
  token: string,
  venteId: number,
  dto: PaiementVentePOSDto
): Promise<PaiementVentePOS> {
  return apiClient.post<PaiementVentePOS>(`/api/pos/ventes/${venteId}/paiements`, {
    token,
    body: dto,
  });
}

/**
 * Finaliser une vente (valide le paiement et met à jour le stock)
 */
export async function finaliserVente(
  token: string,
  venteId: number
): Promise<VentePOS> {
  return apiClient.post<VentePOS>(`/api/pos/ventes/${venteId}/finaliser`, { token });
}

// ============================================================================
// Ticket de caisse
// ============================================================================

/**
 * Récupérer le ticket de caisse
 */
export async function getTicket(
  token: string,
  venteId: number
): Promise<TicketVentePOS> {
  return apiClient.get<TicketVentePOS>(`/api/pos/ventes/${venteId}/ticket`, { token });
}

// ============================================================================
// Statistiques
// ============================================================================

/**
 * Récupérer les statistiques du jour
 */
export async function getStatsJour(token: string): Promise<StatsJourPOS> {
  return apiClient.get<StatsJourPOS>('/api/pos/stats/jour', { token });
}

// ============================================================================
// Recherche code-barres
// ============================================================================

/**
 * Rechercher un produit par code-barres
 */
export async function rechercherParCodeBarre(
  token: string,
  codeBarre: string
): Promise<ProduitConditionnement> {
  return apiClient.get<ProduitConditionnement>(
    `/api/pos/recherche/code-barre/${encodeURIComponent(codeBarre)}`,
    { token }
  );
}
