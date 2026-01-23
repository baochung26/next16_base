import apiClient, { ApiResponse } from "@/lib/api/client";
import { BaseService } from "@/lib/api/base.service";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/api";

/**
 * Auth Service - Handles all authentication related API calls
 * 
 * @example
 * ```ts
 * import { authService } from '@/services';
 * 
 * // Login
 * const response = await authService.login({
 *   identifier: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 */
class AuthService extends BaseService {
  /**
   * Login with username/email and password
   * 
   * @param credentials - Login credentials (identifier can be email or username)
   * @returns Login response with user data and tokens
   * @throws {ApiError} If login fails
   * 
   * @example
   * ```ts
   * const response = await authService.login({
   *   identifier: 'user@example.com',
   *   password: 'password123'
   * });
   * // response.user contains user data
   * // response.accessToken and refreshToken are automatically stored
   * ```
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        credentials
      );
      const data = this.handleResponse(response);
      
      // Store tokens if provided
      if (data.accessToken) {
        const { setAccessToken, setRefreshToken } = await import("@/lib/api/token");
        setAccessToken(data.accessToken);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Register new user
   * 
   * @param data - Registration data
   * @returns Register response with user data
   * @throws {ApiError} If registration fails
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<RegisterResponse>>("/auth/register", data)
    );
  }

  /**
   * Request password reset
   * 
   * @param data - Email address
   * @returns Success message
   * @throws {ApiError} If request fails
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<ForgotPasswordResponse>>(
        "/auth/forgot-password",
        data
      )
    );
  }

  /**
   * Reset password with token
   * 
   * @param data - Reset token and new password
   * @returns Success message
   * @throws {ApiError} If reset fails
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<ResetPasswordResponse>>(
        "/auth/reset-password",
        data
      )
    );
  }

  /**
   * Logout (if backend requires explicit logout)
   * 
   * @throws {ApiError} If logout fails
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * 
   * @param refreshToken - Refresh token
   * @returns New access token
   * @throws {ApiError} If refresh fails
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<{ accessToken: string }>>(
        "/auth/refresh",
        { refreshToken }
      )
    );
  }

  /**
   * Verify email with token
   * 
   * @param token - Verification token
   * @returns Success message
   * @throws {ApiError} If verification fails
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<{ message: string }>>(
        "/auth/verify-email",
        { token }
      )
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
