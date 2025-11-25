export interface BaseEntity {
  id: string | number
  createdAt?: string
  updatedAt?: string
}

export abstract class BaseModel<T extends BaseEntity> {
  id: string | number
  createdAt?: Date
  updatedAt?: Date

  constructor(data: T) {
    this.id = data.id
    this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined
  }

  abstract toJSON(): T
}
