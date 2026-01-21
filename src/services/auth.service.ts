/**
 * Authentication Service
 *
 * Handles authentication operations using the shared API client.
 */

import { apiClient, ApiError } from "@/lib/api-client";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

// Re-export ApiError for convenience
export { ApiError };

/**
 * Login with email and password
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>("/api/auth/login", {
    body: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  // Validate user has appropriate role for backoffice access
  if (data.role !== "EMPLOYE" && data.role !== "ADMIN") {
    throw new ApiError(
      "Accès refusé - Rôle EMPLOYE ou ADMIN requis pour accéder au backoffice",
      403,
    );
  }

  return data;
}

/**
 * Logout - clears local state (backend uses stateless JWT)
 */
export async function logout(): Promise<void> {
  // Backend uses stateless JWT, no server-side logout needed
  // Just clear local tokens (handled by the store)
}

/**
 * Get current user profile
 */
export async function getCurrentUser(
  token: string,
  userId: number,
): Promise<User> {
  return apiClient.get<User>(`/utilisateur/${userId}`, { token });
}

/**
 * Update user profile
 */
export async function updateUser(
  token: string,
  userId: number,
  data: Partial<Pick<User, "email" | "nom" | "prenom" | "telephone">>,
): Promise<User> {
  return apiClient.put<User>(`/utilisateur/${userId}`, { token, body: data });
}
