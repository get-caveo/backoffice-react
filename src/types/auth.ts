export type UserRole = 'CLIENT' | 'EMPLOYE' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  telephone?: string;
  role: UserRole;
  actif: boolean;
  creeLe?: string;
  modifieLe?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: UserRole;
}

export interface TokenPayload {
  sub: string; // email
  role: UserRole;
  userId: number;
  exp: number;
  iat: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}
