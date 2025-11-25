import { Product, type ProductData } from '@/models/product.model'
import { createModel, createModels } from '@/models/factory'

// Fake data for products (wines)
const fakeProductsData: ProductData[] = [
  {
    id: 1,
    sku: 'VIN-BDX-001',
    nom: 'Château Margaux',
    description: 'Grand vin de Bordeaux, Premier Grand Cru Classé',
    categorie_id: 1,
    domaine_id: 1,
    millesime: 2018,
    degre_alcool: 13.5,
    prix_reference_unite_base: 450.0,
    code_barre: '3760001234567',
    image_url: 'https://example.com/images/margaux-2018.jpg',
    notes_degustation: 'Robe rubis profond, arômes de cassis et de violette, tanins soyeux',
    temperature_service: '16-18°C',
    conditions_conservation: "Cave à 12°C, à l'abri de la lumière",
    seuil_stock_minimal: 3,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 2,
    sku: 'VIN-BRG-002',
    nom: 'Romanée-Conti',
    description: 'Grand Cru de Bourgogne, Domaine de la Romanée-Conti',
    categorie_id: 1,
    domaine_id: 2,
    millesime: 2019,
    degre_alcool: 13.0,
    prix_reference_unite_base: 15000.0,
    code_barre: '3760001234568',
    image_url: 'https://example.com/images/romanee-conti-2019.jpg',
    notes_degustation: 'Bouquet complexe de fruits rouges, épices et sous-bois, texture veloutée',
    temperature_service: '15-17°C',
    conditions_conservation: 'Cave à 12°C, humidité 70%',
    seuil_stock_minimal: 2,
    reappro_auto: false,
    actif: true,
    createdAt: '2024-01-16T11:00:00.000Z',
    updatedAt: '2024-01-16T11:00:00.000Z',
  },
  {
    id: 3,
    sku: 'VIN-CHP-003',
    nom: 'Dom Pérignon',
    description: 'Champagne Brut Vintage',
    categorie_id: 2,
    domaine_id: 3,
    millesime: 2012,
    degre_alcool: 12.5,
    prix_reference_unite_base: 180.0,
    code_barre: '3760001234569',
    image_url: 'https://example.com/images/dom-perignon-2012.jpg',
    notes_degustation: 'Bulles fines, notes de brioche, agrumes et amandes grillées',
    temperature_service: '8-10°C',
    conditions_conservation: 'Cave à 10-12°C, position couchée',
    seuil_stock_minimal: 6,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-17T09:15:00.000Z',
    updatedAt: '2024-01-17T09:15:00.000Z',
  },
  {
    id: 4,
    sku: 'VIN-RHN-004',
    nom: 'Châteauneuf-du-Pape',
    description: 'Cuvée spéciale du Domaine de Beaurenard',
    categorie_id: 1,
    domaine_id: 4,
    millesime: 2020,
    degre_alcool: 14.5,
    prix_reference_unite_base: 45.0,
    code_barre: '3760001234570',
    image_url: 'https://example.com/images/chateauneuf-2020.jpg',
    notes_degustation: 'Fruits noirs mûrs, garrigue, épices douces, finale persistante',
    temperature_service: '16-18°C',
    conditions_conservation: 'Cave à 12-14°C',
    seuil_stock_minimal: 10,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-18T14:20:00.000Z',
    updatedAt: '2024-01-18T14:20:00.000Z',
  },
  {
    id: 5,
    sku: 'VIN-ALS-005',
    nom: 'Gewurztraminer Vendanges Tardives',
    description: "Vin blanc moelleux d'Alsace",
    categorie_id: 3,
    domaine_id: 5,
    millesime: 2021,
    degre_alcool: 13.0,
    prix_reference_unite_base: 35.0,
    code_barre: '3760001234571',
    image_url: 'https://example.com/images/gewurz-vt-2021.jpg',
    notes_degustation: 'Litchi, rose, miel, mangue, onctueux et équilibré',
    temperature_service: '10-12°C',
    conditions_conservation: "Cave à 10-12°C, à l'abri de la lumière",
    seuil_stock_minimal: 8,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-19T08:45:00.000Z',
    updatedAt: '2024-01-19T08:45:00.000Z',
  },
  {
    id: 6,
    sku: 'VIN-LOR-006',
    nom: 'Sancerre Blanc',
    description: 'Sauvignon Blanc de la Loire',
    categorie_id: 3,
    domaine_id: 6,
    millesime: 2022,
    degre_alcool: 12.5,
    prix_reference_unite_base: 22.0,
    code_barre: '3760001234572',
    image_url: 'https://example.com/images/sancerre-2022.jpg',
    notes_degustation: 'Agrumes, pierre à fusil, buis, fraîcheur minérale',
    temperature_service: '8-10°C',
    conditions_conservation: 'Cave à 10-12°C',
    seuil_stock_minimal: 12,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
  },
  {
    id: 7,
    sku: 'VIN-BDX-007',
    nom: 'Château Pétrus',
    description: "Pomerol, vin d'exception",
    categorie_id: 1,
    domaine_id: 7,
    millesime: 2015,
    degre_alcool: 14.0,
    prix_reference_unite_base: 3500.0,
    code_barre: '3760001234573',
    image_url: 'https://example.com/images/petrus-2015.jpg',
    notes_degustation: 'Truffe, fruits noirs confits, texture veloutée exceptionnelle',
    temperature_service: '17-18°C',
    conditions_conservation: 'Cave à 12°C, humidité contrôlée',
    seuil_stock_minimal: 2,
    reappro_auto: false,
    actif: true,
    createdAt: '2024-01-21T11:30:00.000Z',
    updatedAt: '2024-01-21T11:30:00.000Z',
  },
  {
    id: 8,
    sku: 'VIN-RSE-008',
    nom: 'Côtes de Provence Rosé',
    description: 'Rosé frais et fruité de Provence',
    categorie_id: 4,
    domaine_id: 8,
    millesime: 2023,
    degre_alcool: 12.0,
    prix_reference_unite_base: 15.0,
    code_barre: '3760001234574',
    image_url: 'https://example.com/images/provence-rose-2023.jpg',
    notes_degustation: 'Pamplemousse, fraise, notes florales, finale saline',
    temperature_service: '8-10°C',
    conditions_conservation: 'Frais, à consommer jeune',
    seuil_stock_minimal: 20,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-22T09:00:00.000Z',
    updatedAt: '2024-01-22T09:00:00.000Z',
  },
  {
    id: 9,
    sku: 'VIN-INA-009',
    nom: 'Whisky Macallan 18',
    description: "Single Malt Scotch Whisky, 18 ans d'âge",
    categorie_id: 5,
    domaine_id: null,
    millesime: null,
    degre_alcool: 43.0,
    prix_reference_unite_base: 250.0,
    code_barre: '3760001234575',
    image_url: 'https://example.com/images/macallan-18.jpg',
    notes_degustation: 'Fruits secs, vanille, chêne, notes de sherry, finale longue',
    temperature_service: 'Température ambiante',
    conditions_conservation: "Debout, à l'abri de la lumière",
    seuil_stock_minimal: 5,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-23T13:45:00.000Z',
    updatedAt: '2024-01-23T13:45:00.000Z',
  },
  {
    id: 10,
    sku: 'VIN-DIS-010',
    nom: 'Cognac Hennessy XO',
    description: 'Cognac Extra Old, assemblage de plus de 100 eaux-de-vie',
    categorie_id: 6,
    domaine_id: null,
    millesime: null,
    degre_alcool: 40.0,
    prix_reference_unite_base: 180.0,
    code_barre: '3760001234576',
    image_url: 'https://example.com/images/hennessy-xo.jpg',
    notes_degustation: 'Épices, fruits confits, cacao, cuir, finale complexe',
    temperature_service: 'Température ambiante ou légèrement frais',
    conditions_conservation: 'Debout, température stable',
    seuil_stock_minimal: 5,
    reappro_auto: true,
    actif: false,
    createdAt: '2024-01-24T16:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
  },
]

// In-memory store for fake data operations
let productsStore: ProductData[] = [...fakeProductsData]
let nextId = productsStore.length + 1

export class ProductService {
  private static instance: ProductService | null = null

  private constructor() {}

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService()
    }
    return ProductService.instance
  }

  async getAll(): Promise<Product[]> {
    // Simulate API delay
    await this.simulateDelay()
    return createModels(Product, productsStore)
  }

  async getById(id: number): Promise<Product | null> {
    await this.simulateDelay()
    const productData = productsStore.find((p) => p.id === id)
    if (!productData) {
      return null
    }
    return createModel(Product, productData)
  }

  async create(data: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await this.simulateDelay()
    const now = new Date().toISOString()
    const newProduct: ProductData = {
      ...data,
      id: nextId++,
      createdAt: now,
      updatedAt: now,
    }
    productsStore.push(newProduct)
    return createModel(Product, newProduct)
  }

  async update(
    id: number,
    data: Partial<Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product | null> {
    await this.simulateDelay()
    const index = productsStore.findIndex((p) => p.id === id)
    if (index === -1) {
      return null
    }
    const updatedProduct: ProductData = {
      ...productsStore[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    productsStore[index] = updatedProduct
    return createModel(Product, updatedProduct)
  }

  async delete(id: number): Promise<boolean> {
    await this.simulateDelay()
    const index = productsStore.findIndex((p) => p.id === id)
    if (index === -1) {
      return false
    }
    productsStore.splice(index, 1)
    return true
  }

  async getActiveProducts(): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter((product) => product.actif)
  }

  async getByCategory(categoryId: number): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter((product) => product.categorie_id === categoryId)
  }

  async getByMillesime(year: number): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter((product) => product.millesime === year)
  }

  async getLowStockThresholdProducts(): Promise<Product[]> {
    const products = await this.getAll()
    return products.filter((product) => product.hasLowStockThreshold)
  }

  async searchBySku(sku: string): Promise<Product | null> {
    await this.simulateDelay()
    const productData = productsStore.find((p) => p.sku.toLowerCase().includes(sku.toLowerCase()))
    if (!productData) {
      return null
    }
    return createModel(Product, productData)
  }

  // Reset to original fake data (useful for testing)
  resetData(): void {
    productsStore = [...fakeProductsData]
    nextId = productsStore.length + 1
  }

  private simulateDelay(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const productService = ProductService.getInstance()

// Export fake data for direct access if needed
export { fakeProductsData }
