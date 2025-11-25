import { describe, it, expect, beforeEach } from 'vitest'
import { ModelFactory, createModel, createModels } from './factory'
import { User, type UserData } from './user.model'

describe('Model Factory', () => {
  const mockUserData: UserData = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    isActive: true,
  }

  describe('createModel', () => {
    it('should create a single model instance', () => {
      const user = createModel(User, mockUserData)

      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe('1')
      expect(user.email).toBe('john@example.com')
    })
  })

  describe('createModels', () => {
    it('should create multiple model instances', () => {
      const usersData: UserData[] = [
        mockUserData,
        { ...mockUserData, id: '2', email: 'jane@example.com', firstName: 'Jane' },
      ]

      const users = createModels(User, usersData)

      expect(users).toHaveLength(2)
      expect(users[0]).toBeInstanceOf(User)
      expect(users[1]).toBeInstanceOf(User)
      expect(users[0].email).toBe('john@example.com')
      expect(users[1].email).toBe('jane@example.com')
    })

    it('should return empty array for empty input', () => {
      const users = createModels(User, [])
      expect(users).toHaveLength(0)
    })
  })

  describe('ModelFactory registry', () => {
    beforeEach(() => {
      ModelFactory.register('user', User)
    })

    it('should create model from registry', () => {
      const user = ModelFactory.create<UserData, User>('user', mockUserData)

      expect(user).toBeInstanceOf(User)
      expect(user.email).toBe('john@example.com')
    })

    it('should create multiple models from registry', () => {
      const usersData: UserData[] = [
        mockUserData,
        { ...mockUserData, id: '2', email: 'jane@example.com' },
      ]

      const users = ModelFactory.createMany<UserData, User>('user', usersData)

      expect(users).toHaveLength(2)
      expect(users[0]).toBeInstanceOf(User)
      expect(users[1]).toBeInstanceOf(User)
    })

    it('should throw error for unregistered model', () => {
      expect(() => ModelFactory.create('unknown', mockUserData)).toThrow(
        'Model "unknown" is not registered in the factory'
      )
    })
  })
})
