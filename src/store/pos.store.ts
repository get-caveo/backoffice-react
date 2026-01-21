/**
 * POS Store using Zustand
 *
 * Manages POS state including current sale, cart, and payment operations.
 */

import * as categoryService from "@/services/category.service";
import * as posService from "@/services/pos.service";
import * as productService from "@/services/product.service";
import type {
  LigneVentePOSDto,
  PaiementVentePOSDto,
  RemiseDto,
  StatsJourPOS,
  TicketVentePOS,
  VentePOS,
} from "@/types/pos";
import type {
  Categorie,
  Produit,
  ProduitConditionnement,
} from "@/types/product";
import { create } from "zustand";
import { useAuthStore } from "./auth.store";

interface POSState {
  // Vente en cours
  venteEnCours: VentePOS | null;

  // Produits et catégories
  produits: Produit[];
  categories: Categorie[];
  categorieActiveId: number | null;

  // État de chargement
  isLoading: boolean;
  isProcessingPayment: boolean;
  error: string | null;
  successMessage: string | null;

  // Stats
  statsJour: StatsJourPOS | null;

  // Ticket
  ticketCourant: TicketVentePOS | null;

  // Actions - Initialisation
  initPOS: () => Promise<void>;
  chargerProduits: () => Promise<void>;
  chargerCategories: () => Promise<void>;

  // Actions - Vente
  creerNouvelleVente: () => Promise<void>;
  chargerVenteExistante: (venteId: number) => Promise<void>;
  annulerVente: () => Promise<void>;

  // Actions - Lignes
  ajouterAuPanier: (dto: LigneVentePOSDto) => Promise<void>;
  modifierQuantite: (ligneId: number, quantite: number) => Promise<void>;
  supprimerDuPanier: (ligneId: number) => Promise<void>;

  // Actions - Remise
  appliquerRemise: (dto: RemiseDto) => Promise<void>;
  supprimerRemise: () => Promise<void>;

  // Actions - Paiement
  enregistrerPaiement: (dto: PaiementVentePOSDto) => Promise<void>;
  finaliserVente: () => Promise<void>;

  // Actions - Ticket
  genererTicket: () => Promise<void>;

  // Actions - Code-barres
  rechercherParCodeBarre: (
    codeBarre: string,
  ) => Promise<ProduitConditionnement | null>;

  // Actions - Stats
  chargerStatsJour: () => Promise<void>;

  // Actions - UI
  setCategorieActive: (categorieId: number | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
  clearTicket: () => void;
  resetPOS: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("Non authentifié");
  }
  return token;
}

export const usePOSStore = create<POSState>((set, get) => ({
  venteEnCours: null,
  produits: [],
  categories: [],
  categorieActiveId: null,
  isLoading: false,
  isProcessingPayment: false,
  error: null,
  successMessage: null,
  statsJour: null,
  ticketCourant: null,

  // ============================================================================
  // Initialisation
  // ============================================================================

  initPOS: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().chargerCategories(),
        get().chargerProduits(),
        get().chargerStatsJour(),
      ]);

      // Vérifier s'il y a une vente brouillon existante
      const token = getToken();
      const ventesBrouillon = await posService.getVentesBrouillon(token);
      if (ventesBrouillon.length > 0) {
        // Reprendre la dernière vente brouillon
        const vente = await posService.getVente(token, ventesBrouillon[0].id);
        set({ venteEnCours: vente });
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'initialisation du POS",
      });
    }
  },

  chargerProduits: async () => {
    try {
      const token = getToken();
      const produits = await productService.getProducts(token, {});
      // Filtrer uniquement les produits actifs avec au moins un conditionnement
      const produitsActifs = produits.filter(
        (p) => p.actif && p.conditionnements && p.conditionnements.length > 0,
      );
      set({ produits: produitsActifs });
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    }
  },

  chargerCategories: async () => {
    try {
      const token = getToken();
      const categories = await categoryService.getCategories(token);
      const categoriesActives = categories.filter((c) => c.actif);
      set({
        categories: categoriesActives,
        categorieActiveId:
          categoriesActives.length > 0 ? categoriesActives[0].id : null,
      });
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    }
  },

  // ============================================================================
  // Gestion des ventes
  // ============================================================================

  creerNouvelleVente: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const vente = await posService.creerVente(token);
      set({ venteEnCours: vente, isLoading: false, ticketCourant: null });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création de la vente",
      });
    }
  },

  chargerVenteExistante: async (venteId: number) => {
    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const vente = await posService.getVente(token, venteId);
      set({ venteEnCours: vente, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement de la vente",
      });
    }
  },

  annulerVente: async () => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      await posService.annulerVente(token, venteEnCours.id);
      set({
        venteEnCours: null,
        isLoading: false,
        successMessage: "Vente annulée",
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation",
      });
    }
  },

  // ============================================================================
  // Gestion des lignes
  // ============================================================================

  ajouterAuPanier: async (dto: LigneVentePOSDto) => {
    let { venteEnCours } = get();

    // Créer une vente si aucune n'existe
    if (!venteEnCours) {
      await get().creerNouvelleVente();
      venteEnCours = get().venteEnCours;
    }

    if (!venteEnCours) {
      set({ error: "Impossible de créer une vente" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      await posService.ajouterLigne(token, venteEnCours.id, dto);
      // Recharger la vente pour avoir les totaux à jour
      const venteUpdated = await posService.getVente(token, venteEnCours.id);
      set({ venteEnCours: venteUpdated, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'ajout au panier",
      });
    }
  },

  modifierQuantite: async (ligneId: number, quantite: number) => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      await posService.modifierQuantiteLigne(
        token,
        venteEnCours.id,
        ligneId,
        quantite,
      );
      const venteUpdated = await posService.getVente(token, venteEnCours.id);
      set({ venteEnCours: venteUpdated, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la modification",
      });
    }
  },

  supprimerDuPanier: async (ligneId: number) => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      await posService.supprimerLigne(token, venteEnCours.id, ligneId);
      const venteUpdated = await posService.getVente(token, venteEnCours.id);
      set({ venteEnCours: venteUpdated, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression",
      });
    }
  },

  // ============================================================================
  // Gestion des remises
  // ============================================================================

  appliquerRemise: async (dto: RemiseDto) => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const venteUpdated = await posService.appliquerRemise(
        token,
        venteEnCours.id,
        dto,
      );
      set({ venteEnCours: venteUpdated, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'application de la remise",
      });
    }
  },

  supprimerRemise: async () => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isLoading: true, error: null });
    try {
      const token = getToken();
      const venteUpdated = await posService.supprimerRemise(
        token,
        venteEnCours.id,
      );
      set({ venteEnCours: venteUpdated, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression de la remise",
      });
    }
  },

  // ============================================================================
  // Gestion des paiements
  // ============================================================================

  enregistrerPaiement: async (dto: PaiementVentePOSDto) => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isProcessingPayment: true, error: null });
    try {
      const token = getToken();
      await posService.enregistrerPaiement(token, venteEnCours.id, dto);
      const venteUpdated = await posService.getVente(token, venteEnCours.id);
      set({ venteEnCours: venteUpdated, isProcessingPayment: false });
    } catch (error) {
      set({
        isProcessingPayment: false,
        error:
          error instanceof Error ? error.message : "Erreur lors du paiement",
      });
    }
  },

  finaliserVente: async () => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    set({ isProcessingPayment: true, error: null });
    try {
      const token = getToken();
      const venteFinal = await posService.finaliserVente(
        token,
        venteEnCours.id,
      );

      // Générer le ticket
      const ticket = await posService.getTicket(token, venteFinal.id);

      // Recharger les stats
      await get().chargerStatsJour();

      set({
        venteEnCours: null,
        ticketCourant: ticket,
        isProcessingPayment: false,
        successMessage: "Vente finalisée avec succès",
      });
    } catch (error) {
      set({
        isProcessingPayment: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la finalisation",
      });
    }
  },

  // ============================================================================
  // Ticket
  // ============================================================================

  genererTicket: async () => {
    const { venteEnCours } = get();
    if (!venteEnCours) return;

    try {
      const token = getToken();
      const ticket = await posService.getTicket(token, venteEnCours.id);
      set({ ticketCourant: ticket });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la génération du ticket",
      });
    }
  },

  // ============================================================================
  // Code-barres
  // ============================================================================

  rechercherParCodeBarre: async (codeBarre: string) => {
    try {
      const token = getToken();
      const conditionnement = await posService.rechercherParCodeBarre(
        token,
        codeBarre,
      );
      return conditionnement;
    } catch (error) {
      console.error(error);
      set({
        error: "Produit non trouvé pour ce code-barres",
      });
      return null;
    }
  },

  // ============================================================================
  // Stats
  // ============================================================================

  chargerStatsJour: async () => {
    try {
      const token = getToken();
      const stats = await posService.getStatsJour(token);
      set({ statsJour: stats });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  },

  // ============================================================================
  // UI
  // ============================================================================

  setCategorieActive: (categorieId: number | null) => {
    set({ categorieActiveId: categorieId });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSuccess: () => {
    set({ successMessage: null });
  },

  clearTicket: () => {
    set({ ticketCourant: null });
  },

  resetPOS: () => {
    set({
      venteEnCours: null,
      ticketCourant: null,
      error: null,
      successMessage: null,
    });
  },
}));
