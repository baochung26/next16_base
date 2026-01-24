// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
    id: string;
    email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  access_token: string;
}

export interface RegisterRequest {
  username?: string;
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    name?: string;
  };
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// User types - matches backend format
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional fields
  username?: string;
  image?: string;
  emailVerified?: Date;
  provider?: "credentials" | "google";
}

// Common API response - matches backend format
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
