import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

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

// Determine base URL - use local API if NEXT_PUBLIC_USE_FAKE_API is true
const getBaseURL = () => {
  // If using fake API (local Next.js API routes)
  if (process.env.NEXT_PUBLIC_USE_FAKE_API === "true" || !process.env.NEXT_PUBLIC_API_URL) {
    return typeof window !== "undefined" 
      ? "/api" // Client-side: use relative path
      : "http://localhost:3000/api"; // Server-side: use full URL
  }
  // Use real backend API
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      // Use JWT token from localStorage
      const { getAccessToken } = await import("./token");
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

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          break;
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
