import { describe, it, expect, beforeEach } from 'vitest'
import { productService, fakeProductsData } from './product.service'

describe('ProductService', () => {
  beforeEach(() => {
    // Reset data before each test
    productService.resetData()
  })

  describe('getAll', () => {
    it('should return all products', async () => {
      const products = await productService.getAll()
      expect(products.length).toBe(fakeProductsData.length)
    })
  })

  describe('getById', () => {
    it('should return a product by id', async () => {
      const product = await productService.getById(1)
      expect(product).not.toBeNull()
      expect(product?.id).toBe(1)
      expect(product?.sku).toBe('VIN-BDX-001')
    })

    it('should return null for non-existent id', async () => {
      const product = await productService.getById(999)
      expect(product).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new product', async () => {
      const newProductData = {
        sku: 'VIN-NEW-001',
        nom: 'New Wine',
        description: 'A new test wine',
        categorie_id: 1,
        domaine_id: 1,
        millesime: 2023,
        degre_alcool: 13.0,
        prix_reference_unite_base: 50.0,
        code_barre: '1234567890123',
        image_url: null,
        notes_degustation: 'Test notes',
        temperature_service: '16-18°C',
        conditions_conservation: 'Cave',
        seuil_stock_minimal: 5,
        reappro_auto: true,
        actif: true,
      }

      const product = await productService.create(newProductData)
      expect(product.sku).toBe('VIN-NEW-001')
      expect(product.nom).toBe('New Wine')
      expect(product.id).toBeDefined()
      expect(product.createdAt).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update an existing product', async () => {
      const updatedProduct = await productService.update(1, {
        nom: 'Updated Château Margaux',
        prix_reference_unite_base: 500.0,
      })

      expect(updatedProduct).not.toBeNull()
      expect(updatedProduct?.nom).toBe('Updated Château Margaux')
      expect(updatedProduct?.prix_reference_unite_base).toBe(500.0)
    })

    it('should return null for non-existent product', async () => {
      const result = await productService.update(999, { nom: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete an existing product', async () => {
      const result = await productService.delete(1)
      expect(result).toBe(true)

      const product = await productService.getById(1)
      expect(product).toBeNull()
    })

    it('should return false for non-existent product', async () => {
      const result = await productService.delete(999)
      expect(result).toBe(false)
    })
  })

  describe('getActiveProducts', () => {
    it('should return only active products', async () => {
      const activeProducts = await productService.getActiveProducts()
      expect(activeProducts.every((p) => p.actif)).toBe(true)
    })
  })

  describe('getByCategory', () => {
    it('should return products by category', async () => {
      const categoryProducts = await productService.getByCategory(1)
      expect(categoryProducts.every((p) => p.categorie_id === 1)).toBe(true)
    })
  })

  describe('getByMillesime', () => {
    it('should return products by millesime', async () => {
      const products2018 = await productService.getByMillesime(2018)
      expect(products2018.every((p) => p.millesime === 2018)).toBe(true)
    })
  })

  describe('searchBySku', () => {
    it('should find product by partial SKU', async () => {
      const product = await productService.searchBySku('BDX-001')
      expect(product).not.toBeNull()
      expect(product?.sku).toBe('VIN-BDX-001')
    })

    it('should return null for non-matching SKU', async () => {
      const product = await productService.searchBySku('NONEXISTENT')
      expect(product).toBeNull()
    })
  })
})
