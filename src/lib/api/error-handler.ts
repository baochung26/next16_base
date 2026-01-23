import { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || "Có lỗi xảy ra";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Có lỗi xảy ra";
}

/**
 * Extract validation errors from API error
 */
export function getValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.errors || null;
  }

  return null;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response;
  }
  return false;
}

/**
 * Check if error is a specific status code
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === status;
  }
  return false;
}
