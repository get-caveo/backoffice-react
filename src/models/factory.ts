import type { BaseEntity, BaseModel } from './base.model'

export type ModelConstructor<T extends BaseEntity, M extends BaseModel<T>> = new (data: T) => M

export class ModelFactory {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static modelRegistry: Map<string, ModelConstructor<any, any>> = new Map()

  static register<T extends BaseEntity, M extends BaseModel<T>>(
    key: string,
    constructor: ModelConstructor<T, M>
  ): void {
    this.modelRegistry.set(key, constructor)
  }

  static create<T extends BaseEntity, M extends BaseModel<T>>(key: string, data: T): M {
    const Constructor = this.modelRegistry.get(key)
    if (!Constructor) {
      throw new Error(`Model "${key}" is not registered in the factory`)
    }
    return new Constructor(data) as M
  }

  static createMany<T extends BaseEntity, M extends BaseModel<T>>(
    key: string,
    dataArray: T[]
  ): M[] {
    return dataArray.map((data) => this.create<T, M>(key, data))
  }
}

export function createModel<T extends BaseEntity, M extends BaseModel<T>>(
  Constructor: ModelConstructor<T, M>,
  data: T
): M {
  return new Constructor(data)
}

export function createModels<T extends BaseEntity, M extends BaseModel<T>>(
  Constructor: ModelConstructor<T, M>,
  dataArray: T[]
): M[] {
  return dataArray.map((data) => new Constructor(data))
}
