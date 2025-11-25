import { BaseModel, type BaseEntity } from './base.model'

export interface ProductData extends BaseEntity {
  id: number
  sku: string
  nom: string
  description: string | null
  categorie_id: number
  domaine_id: number | null
  millesime: number | null
  degre_alcool: number | null
  prix_reference_unite_base: number
  code_barre: string | null
  image_url: string | null
  notes_degustation: string | null
  temperature_service: string | null
  conditions_conservation: string | null
  seuil_stock_minimal: number
  reappro_auto: boolean
  actif: boolean
  createdAt?: string
  updatedAt?: string
}

export class Product extends BaseModel<ProductData> {
  sku: string
  nom: string
  description: string | null
  categorie_id: number
  domaine_id: number | null
  millesime: number | null
  degre_alcool: number | null
  prix_reference_unite_base: number
  code_barre: string | null
  image_url: string | null
  notes_degustation: string | null
  temperature_service: string | null
  conditions_conservation: string | null
  seuil_stock_minimal: number
  reappro_auto: boolean
  actif: boolean

  constructor(data: ProductData) {
    super(data)
    this.sku = data.sku
    this.nom = data.nom
    this.description = data.description
    this.categorie_id = data.categorie_id
    this.domaine_id = data.domaine_id
    this.millesime = data.millesime
    this.degre_alcool = data.degre_alcool
    this.prix_reference_unite_base = data.prix_reference_unite_base
    this.code_barre = data.code_barre
    this.image_url = data.image_url
    this.notes_degustation = data.notes_degustation
    this.temperature_service = data.temperature_service
    this.conditions_conservation = data.conditions_conservation
    this.seuil_stock_minimal = data.seuil_stock_minimal
    this.reappro_auto = data.reappro_auto
    this.actif = data.actif
  }

  get displayName(): string {
    return this.millesime ? `${this.nom} ${this.millesime}` : this.nom
  }

  get hasLowStockThreshold(): boolean {
    return this.seuil_stock_minimal <= 5
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(this.prix_reference_unite_base)
  }

  get formattedAlcoholDegree(): string | null {
    return this.degre_alcool ? `${this.degre_alcool}%` : null
  }

  toJSON(): ProductData {
    return {
      id: this.id as number,
      sku: this.sku,
      nom: this.nom,
      description: this.description,
      categorie_id: this.categorie_id,
      domaine_id: this.domaine_id,
      millesime: this.millesime,
      degre_alcool: this.degre_alcool,
      prix_reference_unite_base: this.prix_reference_unite_base,
      code_barre: this.code_barre,
      image_url: this.image_url,
      notes_degustation: this.notes_degustation,
      temperature_service: this.temperature_service,
      conditions_conservation: this.conditions_conservation,
      seuil_stock_minimal: this.seuil_stock_minimal,
      reappro_auto: this.reappro_auto,
      actif: this.actif,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    }
  }
}
