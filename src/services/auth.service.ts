import apiClient, { ApiResponse } from "@/lib/api/client";
import { BaseService } from "@/lib/api/base.service";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenResponse,
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
   * Login with email and password
   *
   * @param credentials - Login credentials (email and password)
   * @returns Login response with user data and access token
   * @throws {ApiError} If login fails
   *
   * @example
   * ```ts
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * // response contains user data (id, email, firstName, lastName, role, etc.)
   * // response.access_token is automatically stored
   * ```
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const responseData = response.data;
      let data: LoginResponse;

      // Parse response: { success, statusCode, message, data: LoginResponse } hoặc trực tiếp LoginResponse
      if (
        responseData &&
        typeof responseData === "object" &&
        "success" in responseData &&
        "data" in responseData
      ) {
        const apiResponse = responseData as ApiResponse<LoginResponse>;
        if (apiResponse.data) {
          data = apiResponse.data;
        } else {
          throw new Error(apiResponse.message || "No data in response");
        }
      } else {
        data = responseData as LoginResponse;
      }

      // Store tokens if provided
      if (data.access_token) {
        const { setAccessToken, setRefreshToken } = await import(
          "@/lib/api/token"
        );
        setAccessToken(data.access_token);

        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
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
      apiClient.post<ApiResponse<RegisterResponse>>(API_ENDPOINTS.AUTH.REGISTER, data)
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
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
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
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
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
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Refresh access token
   *
   * @param refreshToken - Refresh token (format: "user-id:token-id")
   * @returns New access token and refresh token (token rotation)
   * @throws {ApiError} If refresh fails
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Backend trả về trực tiếp RefreshTokenResponse (không có wrapper)
      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );
      
      // Backend trả về trực tiếp object
      const data = response.data as RefreshTokenResponse;
      
      // Lưu tokens mới (token rotation)
      if (data.access_token) {
        const { setAccessToken, setRefreshToken } = await import("@/lib/api/token");
        setAccessToken(data.access_token);
        
        // Lưu refresh token mới (token cũ đã bị revoke)
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
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
      apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token,
      })
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
