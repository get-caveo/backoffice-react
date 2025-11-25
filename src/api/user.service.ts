import { BaseApiService } from './base.service'
import { User, type UserData } from '@/models/user.model'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export class UserService extends BaseApiService<UserData, User> {
  private static instance: UserService | null = null

  private constructor() {
    super({ baseURL: API_BASE_URL }, User, '/users')
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  async getActiveUsers(): Promise<User[]> {
    const users = await this.getAll()
    return users.filter((user) => user.isActive)
  }

  async getAdmins(): Promise<User[]> {
    const users = await this.getAll()
    return users.filter((user) => user.isAdmin)
  }
}

export const userService = UserService.getInstance()
