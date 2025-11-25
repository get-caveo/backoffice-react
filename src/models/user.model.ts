import { BaseModel, type BaseEntity } from './base.model'

export interface UserData extends BaseEntity {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'guest'
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export class User extends BaseModel<UserData> {
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'guest'
  isActive: boolean

  constructor(data: UserData) {
    super(data)
    this.email = data.email
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.role = data.role
    this.isActive = data.isActive
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get isAdmin(): boolean {
    return this.role === 'admin'
  }

  toJSON(): UserData {
    return {
      id: this.id as string,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    }
  }
}
