import apiClient, { ApiResponse } from "@/lib/api/client";
import { BaseService } from "@/lib/api/base.service";
import { API_ENDPOINTS } from "@/lib/constants";
import type { User, CreateUserRequest } from "@/types/api";

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
   * GET /users/profile - response: { success, statusCode, message, data }
   *
   * @returns Current user data
   * @throws {ApiError} If user is not authenticated or request fails
   */
  async getCurrentUser(): Promise<User> {
    return this.safeCall(() =>
      apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.PROFILE)
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
      apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id))
    );
  }

  /**
   * Update own profile - PATCH /users/profile
   * Chỉ cho phép: firstName, lastName, password. Không gửi email, role, isActive.
   *
   * @param data - { firstName?, lastName?, password? } (all optional)
   * @returns Updated user data
   * @throws {ApiError} If update fails (400 validation, 401 unauthorized)
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    password?: string;
  }): Promise<User> {
    return this.safeCall(() =>
      apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data)
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
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
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
        API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
    );
  }

  /**
   * Create user (admin only)
   *
   * @param data - User data: email, password, firstName, lastName, role
   * @returns Created user data
   * @throws {ApiError} If user is not admin or request fails (e.g. email exists)
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<User>>(API_ENDPOINTS.ADMIN.USERS.CREATE, data)
    );
  }

  /**
   * Get all users (admin only)
   *
   * @returns Array of all users
   * @throws {ApiError} If user is not admin or request fails
   */
  async getAllUsers(): Promise<User[]> {
    return this.safeCall(() =>
      apiClient.get<ApiResponse<User[]>>(API_ENDPOINTS.ADMIN.USERS.LIST)
    );
  }

  /**
   * Delete user (admin only)
   *
   * @param id - User ID (UUID)
   * @returns Success message
   * @throws {ApiError} If user is not admin or request fails
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.ADMIN.USERS.BY_ID(id)
      );
      
      // Handle response - delete API returns { success, statusCode, message }
      const responseData = response.data as ApiResponse<{ message: string }>;
      
      // If response has data field, return it
      if (responseData?.data) {
        return responseData.data;
      }
      
      // If response has message directly, return it wrapped
      if (responseData?.message) {
        return { message: responseData.message };
      }
      
      // Default success message
      return { message: "User deleted successfully" };
    } catch (error) {
      this.handleError(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }

  /**
   * Activate user (admin only)
   *
   * @param id - User ID (UUID)
   * @returns Updated user data with isActive: true
   * @throws {ApiError} If user is not admin or request fails
   */
  async activateUser(id: string): Promise<{ id: string; isActive: boolean }> {
    return this.safeCall(() =>
      apiClient.patch<ApiResponse<{ id: string; isActive: boolean }>>(
        API_ENDPOINTS.ADMIN.USERS.ACTIVATE(id)
      )
    );
  }

  /**
   * Deactivate user (admin only)
   *
   * @param id - User ID (UUID)
   * @returns Updated user data with isActive: false
   * @throws {ApiError} If user is not admin or request fails
   */
  async deactivateUser(id: string): Promise<{ id: string; isActive: boolean }> {
    return this.safeCall(() =>
      apiClient.patch<ApiResponse<{ id: string; isActive: boolean }>>(
        API_ENDPOINTS.ADMIN.USERS.DEACTIVATE(id)
      )
    );
  }

  /**
   * Update user (admin only)
   *
   * @param id - User ID (UUID)
   * @param data - Partial user data (all fields optional)
   * @returns Updated user data
   * @throws {ApiError} If user is not admin or request fails
   */
  async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    }
  ): Promise<User> {
    return this.safeCall(() =>
      apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.ADMIN.USERS.UPDATE(id), data)
    );
  }

  /**
   * Search users with filters, pagination, and sorting (admin only)
   *
   * @param params - Search parameters
   * @returns Users array and pagination meta
   * @throws {ApiError} If user is not admin or request fails
   */
  async searchUsers(params: {
    search?: string;
    role?: "user" | "admin";
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "email" | "firstName" | "lastName" | "role" | "isActive";
    sortOrder?: "ASC" | "DESC";
  }): Promise<{
    users: User[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.role) queryParams.append("role", params.role);
      if (params.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = `${API_ENDPOINTS.ADMIN.USERS.SEARCH}${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get<ApiResponse<User[]> & {
        meta?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(url);
      
      // Handle response with meta
      const responseData = response.data;

      // Extract users and meta
      const users = responseData?.data || [];
      const meta = responseData?.meta || {
        page: params.page || 1,
        limit: params.limit || 10,
        total: users.length,
        totalPages: 1,
      };

      return { users, meta };
    } catch (error) {
      this.handleError(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }
}

// Export singleton instance
export const userService = new UserService();
