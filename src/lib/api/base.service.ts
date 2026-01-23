import apiClient, { ApiResponse, ApiError } from "./client";
import { AxiosError } from "axios";

/**
 * Base service class with common error handling
 * All services should extend this or use similar pattern
 */
export class BaseService {
  /**
   * Handle API response and extract data
   */
  protected handleResponse<T>(response: { data: ApiResponse<T> }): T {
    if (!response.data.data) {
      throw new Error(response.data.message || "No data returned");
    }
    return response.data.data;
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
