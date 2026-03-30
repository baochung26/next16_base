import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { authService } from "@/services";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setAccessTokenCookie,
  clearTokens,
} from "./token";

// API Response types
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

// Determine base URL - call backend API directly
const getBaseURL = () => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return backendUrl;
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag để tránh infinite loop khi refresh token cũng fail
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors và auto-refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try to refresh token
    // 401 từ request đăng nhập (sai mật khẩu) → không refresh, không redirect, chỉ reject
    const isLoginRequest =
      originalRequest.url?.includes("/auth/login") ?? false;
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      // Nếu đang refresh, đợi refresh xong
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();

      // Nếu không có refresh token → logout
      if (!refreshTokenValue) {
        processQueue(error, null);
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        // Gọi refresh token API
        const refreshResponse = await authService.refreshToken(refreshTokenValue);
        const newAccessToken = refreshResponse.access_token;

        if (newAccessToken) {
          // Lưu tokens mới (refresh token đã được lưu trong authService.refreshToken)
          setAccessToken(newAccessToken);
          setAccessTokenCookie(newAccessToken);

          // Update header cho request ban đầu
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Process queue và retry request
          processQueue(null, newAccessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError) {
        // Refresh token cũng hết hạn → logout
        processQueue(refreshError, null);
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 403:
          // Forbidden
          console.error("Access forbidden");
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Server error
          console.error("Server error");
          break;
      }

      // Return formatted error
      return Promise.reject({
        message: data?.message || error.message || "An error occurred",
        statusCode: status,
        errors: data?.errors,
      } as ApiError);
    }

    // Network error or other
    return Promise.reject({
      message: error.message || "Network error occurred",
      statusCode: 0,
    } as ApiError);
  }
);

export default apiClient;
