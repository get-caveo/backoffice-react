/**
 * Centralized API Client
 *
 * Handles all HTTP requests to the backend API with:
 * - Base URL configuration
 * - Authentication headers
 * - Error handling
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * API error response shape from backend
 */
interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

/**
 * Request options for the API client
 */
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

/**
 * Handle API response and throw appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: `Erreur HTTP ${response.status}`,
        status: response.status,
      };
    }
    throw new ApiError(errorData.message, errorData.status, errorData.errors);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Build headers for API requests
 */
function buildHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Main API client for making HTTP requests
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: buildHeaders(token),
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, body, ...fetchOptions } = options;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, body, ...fetchOptions } = options;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: buildHeaders(token),
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },
};
