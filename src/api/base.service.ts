import ApiClient, { type ApiConfig, type ApiResponse } from './client'
import type { BaseEntity, BaseModel } from '@/models/base.model'
import { type ModelConstructor, createModel, createModels } from '@/models/factory'

export abstract class BaseApiService<T extends BaseEntity, M extends BaseModel<T>> {
  protected client: ApiClient
  protected ModelClass: ModelConstructor<T, M>
  protected basePath: string

  constructor(config: ApiConfig, ModelClass: ModelConstructor<T, M>, basePath: string) {
    this.client = new ApiClient(config)
    this.ModelClass = ModelClass
    this.basePath = basePath
  }

  async getAll(): Promise<M[]> {
    const response: ApiResponse<T[]> = await this.client.get<T[]>(this.basePath)
    return createModels(this.ModelClass, response.data)
  }

  async getById(id: string | number): Promise<M> {
    const response: ApiResponse<T> = await this.client.get<T>(`${this.basePath}/${id}`)
    return createModel(this.ModelClass, response.data)
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<M> {
    const response: ApiResponse<T> = await this.client.post<T>(this.basePath, data)
    return createModel(this.ModelClass, response.data)
  }

  async update(
    id: string | number,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<M> {
    const response: ApiResponse<T> = await this.client.put<T>(`${this.basePath}/${id}`, data)
    return createModel(this.ModelClass, response.data)
  }

  async patch(
    id: string | number,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<M> {
    const response: ApiResponse<T> = await this.client.patch<T>(`${this.basePath}/${id}`, data)
    return createModel(this.ModelClass, response.data)
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(`${this.basePath}/${id}`)
  }
}
