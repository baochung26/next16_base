/**
 * Application Constants
 * Centralized constants for the application
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  USERS: {
    PROFILE: "/users/profile", // GET current user profile
    BY_ID: (id: string) => `/users/${id}`, // GET user by ID
    UPDATE_PROFILE: "/users/profile", // PATCH update profile
    CHANGE_PASSWORD: "/users/change-password",
    UPLOAD_AVATAR: "/users/avatar",
  },
  ADMIN: {
    USERS: {
      LIST: "/admin/users",
      BY_ID: (id: string) => `/admin/users/${id}`,
      UPDATE: (id: string) => `/admin/users/${id}`, // PATCH
      ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
      DEACTIVATE: (id: string) => `/admin/users/${id}/deactivate`,
      SEARCH: "/admin/users/search",
    },
  },
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  FEATURES: "/features",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
    USERS: "/dashboard/users",
    PRODUCTS: "/dashboard/products",
    ORDERS: "/dashboard/orders",
    REPORTS: "/dashboard/reports",
    DOCUMENTS: "/dashboard/documents",
    SETTINGS: "/dashboard/settings",
  },
  PROFILE: "/profile",
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: "NextApp",
  DESCRIPTION: "Next.js application with authentication",
  VERSION: "1.0.0",
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },
  SESSION: {
    TOKEN_KEY: "accessToken",
    REFRESH_TOKEN_KEY: "refreshToken",
    USER_INFO_KEY: "userInfo",
    /** Cookie max-age (seconds). 86400 = 24h. Used for accessToken cookie. */
    COOKIE_MAX_AGE: 86400,
  },
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  NAME: {
    MAX_LENGTH: 100,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: "Lỗi kết nối. Vui lòng kiểm tra lại kết nối mạng.",
  UNAUTHORIZED: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.",
  FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này.",
  NOT_FOUND: "Không tìm thấy tài nguyên.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ.",
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Đăng nhập thành công",
  REGISTER: "Đăng ký thành công",
  LOGOUT: "Đăng xuất thành công",
  UPDATE_PROFILE: "Cập nhật thông tin thành công",
  CHANGE_PASSWORD: "Đổi mật khẩu thành công",
  DELETE_USER: "Xóa người dùng thành công",
  UPLOAD_AVATAR: "Tải ảnh đại diện thành công",
} as const;

// Admin Configuration
export const ADMIN_CONFIG = {
  EMAILS: ["admin@example.com"],
  USERNAMES: ["admin"],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  DISPLAY_WITH_TIME: "DD/MM/YYYY HH:mm",
  API: "YYYY-MM-DD",
  DATETIME: "YYYY-MM-DDTHH:mm:ss",
} as const;
