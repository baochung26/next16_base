import apiClient, { ApiResponse } from "@/lib/api/client";
import { BaseService } from "@/lib/api/base.service";
import type { User } from "@/types/api";

/**
 * User Service - Handles all user related API calls
 * 
 * @example
 * ```ts
 * import { userService } from '@/services';
 * 
 * // Get current user
 * const user = await userService.getCurrentUser();
 * ```
 */
class UserService extends BaseService {
  /**
   * Get current user profile
   * 
   * @returns Current user data
   * @throws {ApiError} If user is not authenticated or request fails
   */
  async getCurrentUser(): Promise<User> {
    return this.safeCall(() =>
      apiClient.get<ApiResponse<User>>("/users/me")
    );
  }

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns User data
   * @throws {ApiError} If user not found or request fails
   */
  async getUserById(id: string): Promise<User> {
    return this.safeCall(() =>
      apiClient.get<ApiResponse<User>>(`/users/${id}`)
    );
  }

  /**
   * Update user profile
   * 
   * @param data - Partial user data to update
   * @returns Updated user data
   * @throws {ApiError} If update fails
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return this.safeCall(() =>
      apiClient.patch<ApiResponse<User>>("/users/me", data)
    );
  }

  /**
   * Change password
   * 
   * @param data - Current and new password
   * @returns Success message
   * @throws {ApiError} If password change fails
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<{ message: string }>>(
        "/users/change-password",
        data
      )
    );
  }

  /**
   * Upload avatar image
   * 
   * @param file - Image file to upload
   * @returns Image URL
   * @throws {ApiError} If upload fails
   */
  async uploadAvatar(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    return this.safeCall(() =>
      apiClient.post<ApiResponse<{ imageUrl: string }>>(
        "/users/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
    );
  }
}

// Export singleton instance
export const userService = new UserService();
