/**
 * Authentication Service
 * 
 * This is a mock service for demonstration purposes.
 * In production, replace these functions with actual API calls to your backend.
 */

import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { 
  generateCSRFToken, 
  setCSRFToken, 
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength
} from '@/lib/security';

// API_BASE_URL for future backend integration
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Mock user database (for demo purposes only)
// NOTE: In production, NEVER store plaintext passwords. Always use proper hashing (bcrypt, argon2).
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'demo@caveo.com',
    name: 'Demo User',
    password: 'Demo@1234', // This is a DEMO only - use hashed passwords in production
  },
];

// Generate a mock JWT token
function generateMockJWT(user: User, expiresIn: number = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId: user.id,
    email: user.email,
    iat: now,
    exp: now + expiresIn,
    jti: crypto.randomUUID(),
  };
  
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(`mock_signature_${user.id}_${now}`);
  
  return `${base64Header}.${base64Payload}.${signature}`;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Sanitize inputs
  const email = sanitizeInput(credentials.email.toLowerCase().trim());
  const password = credentials.password;
  
  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would be an API call:
  // const response = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  
  // Mock authentication logic
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Generate CSRF token
  const csrfToken = generateCSRFToken();
  setCSRFToken(csrfToken);
  
  // Generate tokens
  const accessToken = generateMockJWT(user, 3600); // 1 hour
  const refreshToken = generateMockJWT(user, 604800); // 7 days
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  };
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  // Sanitize inputs
  const email = sanitizeInput(credentials.email.toLowerCase().trim());
  const password = credentials.password;
  const name = credentials.name ? sanitizeInput(credentials.name.trim()) : undefined;
  
  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join('. '));
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would be an API call:
  // const response = await fetch(`${API_BASE_URL}/auth/register`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password, name }),
  // });
  
  // Mock registration logic
  const existingUser = mockUsers.find(u => u.email === email);
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  const newUser: User & { password: string } = {
    id: crypto.randomUUID(),
    email,
    name,
    password, // In production, hash the password
  };
  
  mockUsers.push(newUser);
  
  // Generate CSRF token
  const csrfToken = generateCSRFToken();
  setCSRFToken(csrfToken);
  
  // Generate tokens
  const accessToken = generateMockJWT(newUser, 3600); // 1 hour
  const refreshToken = generateMockJWT(newUser, 604800); // 7 days
  
  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In production, this would be an API call:
  // const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ refreshToken }),
  // });
  
  // Mock token refresh
  try {
    const base64Url = refreshToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    const user = mockUsers.find(u => u.id === payload.userId);
    if (!user) {
      throw new Error('Invalid refresh token');
    }
    
    const newAccessToken = generateMockJWT(user, 3600);
    
    return { accessToken: newAccessToken };
  } catch {
    throw new Error('Invalid refresh token');
  }
}

export async function logout(): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In production, this would be an API call to invalidate the token:
  // await fetch(`${API_BASE_URL}/auth/logout`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'X-CSRF-Token': getCSRFToken(),
  //   },
  // });
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In production, this would be an API call:
  // const response = await fetch(`${API_BASE_URL}/auth/me`, {
  //   method: 'GET',
  //   headers: { 'Authorization': `Bearer ${accessToken}` },
  // });
  
  // Mock user retrieval
  try {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    const user = mockUsers.find(u => u.id === payload.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch {
    throw new Error('Invalid token');
  }
}
