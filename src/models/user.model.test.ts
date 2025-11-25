import { describe, it, expect } from 'vitest'
import { User, type UserData } from './user.model'

describe('User Model', () => {
  const mockUserData: UserData = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  }

  it('should create a user from data', () => {
    const user = new User(mockUserData)

    expect(user.id).toBe('1')
    expect(user.email).toBe('john@example.com')
    expect(user.firstName).toBe('John')
    expect(user.lastName).toBe('Doe')
    expect(user.role).toBe('admin')
    expect(user.isActive).toBe(true)
  })

  it('should compute fullName correctly', () => {
    const user = new User(mockUserData)
    expect(user.fullName).toBe('John Doe')
  })

  it('should compute isAdmin correctly for admin users', () => {
    const user = new User(mockUserData)
    expect(user.isAdmin).toBe(true)
  })

  it('should compute isAdmin correctly for non-admin users', () => {
    const regularUser = new User({ ...mockUserData, role: 'user' })
    expect(regularUser.isAdmin).toBe(false)
  })

  it('should convert to JSON correctly', () => {
    const user = new User(mockUserData)
    const json = user.toJSON()

    expect(json.id).toBe('1')
    expect(json.email).toBe('john@example.com')
    expect(json.firstName).toBe('John')
    expect(json.lastName).toBe('Doe')
    expect(json.role).toBe('admin')
    expect(json.isActive).toBe(true)
  })

  it('should parse dates correctly', () => {
    const user = new User(mockUserData)

    expect(user.createdAt).toBeInstanceOf(Date)
    expect(user.updatedAt).toBeInstanceOf(Date)
    expect(user.createdAt?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    expect(user.updatedAt?.toISOString()).toBe('2024-01-02T00:00:00.000Z')
  })

  it('should handle missing dates', () => {
    const dataWithoutDates: UserData = {
      id: mockUserData.id,
      email: mockUserData.email,
      firstName: mockUserData.firstName,
      lastName: mockUserData.lastName,
      role: mockUserData.role,
      isActive: mockUserData.isActive,
    }
    const user = new User(dataWithoutDates)

    expect(user.createdAt).toBeUndefined()
    expect(user.updatedAt).toBeUndefined()
  })
})
