import { describe, it, expect } from 'vitest'
import { Product, type ProductData } from './product.model'

describe('Product Model', () => {
  const mockProductData: ProductData = {
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
    notes_degustation: 'Robe rubis profond, arômes de cassis',
    temperature_service: '16-18°C',
    conditions_conservation: 'Cave à 12°C',
    seuil_stock_minimal: 3,
    reappro_auto: true,
    actif: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  }

  it('should create a product from data', () => {
    const product = new Product(mockProductData)

    expect(product.id).toBe(1)
    expect(product.sku).toBe('VIN-BDX-001')
    expect(product.nom).toBe('Château Margaux')
    expect(product.categorie_id).toBe(1)
    expect(product.prix_reference_unite_base).toBe(450.0)
    expect(product.actif).toBe(true)
  })

  it('should compute displayName with millesime', () => {
    const product = new Product(mockProductData)
    expect(product.displayName).toBe('Château Margaux 2018')
  })

  it('should compute displayName without millesime', () => {
    const productWithoutMillesime = new Product({
      ...mockProductData,
      millesime: null,
    })
    expect(productWithoutMillesime.displayName).toBe('Château Margaux')
  })

  it('should compute hasLowStockThreshold correctly', () => {
    const lowThresholdProduct = new Product({ ...mockProductData, seuil_stock_minimal: 3 })
    expect(lowThresholdProduct.hasLowStockThreshold).toBe(true)

    const normalThresholdProduct = new Product({ ...mockProductData, seuil_stock_minimal: 10 })
    expect(normalThresholdProduct.hasLowStockThreshold).toBe(false)
  })

  it('should format price correctly in EUR', () => {
    const product = new Product(mockProductData)
    expect(product.formattedPrice).toContain('450')
    expect(product.formattedPrice).toContain('€')
  })

  it('should format alcohol degree correctly', () => {
    const product = new Product(mockProductData)
    expect(product.formattedAlcoholDegree).toBe('13.5%')
  })

  it('should return null for formattedAlcoholDegree when degre_alcool is null', () => {
    const productWithoutAlcohol = new Product({
      ...mockProductData,
      degre_alcool: null,
    })
    expect(productWithoutAlcohol.formattedAlcoholDegree).toBeNull()
  })

  it('should convert to JSON correctly', () => {
    const product = new Product(mockProductData)
    const json = product.toJSON()

    expect(json.id).toBe(1)
    expect(json.sku).toBe('VIN-BDX-001')
    expect(json.nom).toBe('Château Margaux')
    expect(json.prix_reference_unite_base).toBe(450.0)
  })

  it('should parse dates correctly', () => {
    const product = new Product(mockProductData)

    expect(product.createdAt).toBeInstanceOf(Date)
    expect(product.updatedAt).toBeInstanceOf(Date)
    expect(product.createdAt?.toISOString()).toBe('2024-01-15T10:30:00.000Z')
  })

  it('should handle null values for optional fields', () => {
    const productWithNulls: ProductData = {
      ...mockProductData,
      description: null,
      domaine_id: null,
      millesime: null,
      degre_alcool: null,
      code_barre: null,
      image_url: null,
      notes_degustation: null,
      temperature_service: null,
      conditions_conservation: null,
    }
    const product = new Product(productWithNulls)

    expect(product.description).toBeNull()
    expect(product.domaine_id).toBeNull()
    expect(product.millesime).toBeNull()
    expect(product.degre_alcool).toBeNull()
  })
})
