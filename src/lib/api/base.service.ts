import apiClient, { ApiResponse, ApiError } from "./client";
import { AxiosError } from "axios";

/**
 * Base service class with common error handling
 * All services should extend this or use similar pattern
 */
export class BaseService {
  /**
   * Handle API response and extract data
   * Handles both wrapped format { success, data, ... } and direct format
   */
  protected handleResponse<T>(response: { data: ApiResponse<T> | T }): T {
    const responseData = response.data;

    // If response is already the data type (direct format from /auth/profile)
    if (responseData && typeof responseData === "object" && "id" in responseData && !("success" in responseData)) {
      return responseData as T;
    }

    // If response is wrapped in ApiResponse format
    const apiResponse = responseData as ApiResponse<T>;
    if (apiResponse && apiResponse.data) {
      return apiResponse.data;
    }

    // Check if response indicates failure
    if (apiResponse && apiResponse.success === false) {
      throw {
        message: apiResponse.message || "Request failed",
        statusCode: apiResponse.statusCode || 500,
      } as ApiError;
    }

    throw new Error(apiResponse?.message || "No data returned");
  }

  /**
   * Handle API error with proper typing
   */
  protected handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      throw {
        message: apiError?.message || error.message || "An error occurred",
        statusCode: error.response?.status || 0,
        errors: apiError?.errors,
      } as ApiError;
    }

    if (error instanceof Error) {
      throw {
        message: error.message,
        statusCode: 0,
      } as ApiError;
    }

    throw {
      message: "Unknown error occurred",
      statusCode: 0,
    } as ApiError;
  }

  /**
   * Safe API call wrapper with error handling
   */
  protected async safeCall<T>(
    apiCall: () => Promise<{ data: ApiResponse<T> }>
  ): Promise<T> {
    try {
      const response = await apiCall();
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }
}
