import { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

/** Chuẩn hóa mọi error về dạng ApiError (message, statusCode, errors?) */
function normalizeToApiError(error: unknown): ApiError | null {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    return {
      message: data?.message || error.message || "Có lỗi xảy ra",
      statusCode: error.response?.status ?? 0,
      errors: data?.errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 0,
    };
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    const apiError = error as ApiError;
    return {
      message: apiError.message,
      statusCode: typeof apiError.statusCode === "number" ? apiError.statusCode : 0,
      errors: apiError.errors,
    };
  }

  return null;
}

/** Map message backend (EN) sang tiếng Việt cho UX thống nhất */
const MESSAGE_MAP: Record<string, string> = {
  "Invalid credentials": "Email hoặc mật khẩu không đúng.",
  Unauthorized: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.",
  Forbidden: "Bạn không có quyền thực hiện thao tác này.",
  "Not Found": "Không tìm thấy tài nguyên.",
  "Bad Request": "Dữ liệu không hợp lệ.",
  "Conflict": "Dữ liệu đã tồn tại hoặc bị trùng.",
  "Internal Server Error": "Lỗi máy chủ. Vui lòng thử lại sau.",
};

const DEFAULT_MESSAGE = "Có lỗi xảy ra. Vui lòng thử lại.";

/**
 * Lấy message hiển thị cho user từ mọi dạng error.
 * Dùng khi submit form: catch (err) => setError(getErrorMessage(err)).
 */
export function getErrorMessage(error: unknown): string {
  const apiError = normalizeToApiError(error);
  if (!apiError) return DEFAULT_MESSAGE;

  const msg = apiError.message?.trim() || "";
  if (!msg) return DEFAULT_MESSAGE;

  return MESSAGE_MAP[msg] ?? msg;
}

/**
 * Lấy validation errors theo field (cho setError từng ô input).
 * Backend trả 400 với body: { message, errors: { email: ["..."], password: ["..."] } }.
 */
export function getValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  const apiError = normalizeToApiError(error);
  if (!apiError?.errors || typeof apiError.errors !== "object") return null;
  return apiError.errors;
}

/**
 * Kiểm tra lỗi mạng (không có response từ server).
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) return !error.response;
  return false;
}

/**
 * Kiểm tra error có status code cụ thể không.
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  if (error instanceof AxiosError) return error.response?.status === status;
  const apiError = normalizeToApiError(error);
  return apiError?.statusCode === status;
}
