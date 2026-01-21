/**
 * Product-related types based on the backend API
 */

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  ordreTri?: number;
  actif: boolean;
  creeLe?: string;
}

export interface Domaine {
  id: number;
  nom: string;
  region?: string;
  appellation?: string;
  surfaceVignobleHa?: number;
  typeSol?: string;
  cepages?: string;
  vigneron?: string;
  description?: string;
  siteWeb?: string;
  latitude?: number;
  longitude?: number;
  actif: boolean;
  creeLe?: string;
}

export interface UniteConditionnement {
  id: number;
  nom: string;
  nomCourt: string;
  quantiteUniteBase: number;
  description?: string;
  dimensionsCm?: string;
  poidsKg?: number;
  volumeMl?: number;
  estVendable: boolean;
  estUniteBase: boolean;
  ordreTri?: number;
  actif: boolean;
  creeLe?: string;
}

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

export interface ProduitConditionnement {
  id: number;
  prixUnitaire: number;
  disponible: boolean;
  codeBarre?: string;
  creeLe?: string;
  uniteConditionnement: UniteConditionnement;
  produit?: Produit;
}

export interface ProduitFournisseur {
  id: number;
  prixFournisseur: number;
  delaiApproJours?: number;
  creeLe?: string;
  fournisseur: Fournisseur;
  produit?: { id: number; sku: string; nom: string };
}

export interface Produit {
  id: number;
  sku: string;
  nom: string;
  description?: string;
  millesime?: number;
  degreAlcool?: number;
  codeBarre?: string;
  imageUrl?: string;
  notesDegustation?: string;
  temperatureService?: string;
  conditionsConservation?: string;
  seuilStockMinimal?: number;
  reapproAuto: boolean;
  actif: boolean;
  creeLe?: string;
  modifieLe?: string | null;
  categorie?: Categorie;
  domaine?: Domaine;
  conditionnements?: ProduitConditionnement[];
  fournisseurs?: ProduitFournisseur[];
}

export interface ProduitFilters {
  categorieId?: number;
  domaineId?: number;
  millesime?: number;
  search?: string;
}

export interface CreateProduitInput {
  sku: string;
  nom: string;
  description?: string;
  millesime?: number;
  degreAlcool?: number;
  codeBarre?: string;
  imageUrl?: string;
  notesDegustation?: string;
  temperatureService?: string;
  conditionsConservation?: string;
  seuilStockMinimal?: number;
  reapproAuto?: boolean;
  categorie?: { id: number };
  domaine?: { id: number };
}

export interface UpdateProduitInput extends Partial<CreateProduitInput> {
  actif?: boolean;
}

export interface CreateConditionnementInput {
  uniteConditionnement: { id: number };
  prixUnitaire: number;
  disponible?: boolean;
}

export interface UpdateConditionnementInput {
  prixUnitaire: number;
  disponible?: boolean;
}

export interface CreateFournisseurProduitInput {
  fournisseur: { id: number };
  prixFournisseur: number;
  delaiApproJours?: number;
}

export interface UpdateFournisseurProduitInput {
  prixFournisseur: number;
  delaiApproJours?: number;
}
