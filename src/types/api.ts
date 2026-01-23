// Auth types
export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    name?: string;
    image?: string;
  };
  accessToken?: string;
  refreshToken?: string;
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

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  provider: "credentials" | "google";
  createdAt: string;
  updatedAt: string;
}

// Common API response
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
