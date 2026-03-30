# API Client Documentation

## Cấu trúc

```
src/
├── lib/
│   └── api/
│       ├── client.ts          # Axios instance với interceptors
│       ├── token.ts           # Token management utilities
│       └── error-handler.ts   # Error handling utilities
├── services/
│   ├── auth.service.ts        # Authentication API calls
│   ├── user.service.ts        # User API calls
│   └── index.ts              # Barrel export
└── types/
    └── api.ts                # TypeScript types cho API
```

## Cấu hình

### Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Lưu ý:** Client sẽ gọi trực tiếp backend API (NestJS), không qua Next.js API routes.

### API Client

API client được cấu hình với:

- Base URL từ `NEXT_PUBLIC_API_URL` (gọi trực tiếp backend)
- Timeout: 30 giây
- Auto-attach JWT token từ localStorage
- Error handling tự động
- Redirect to login khi 401

## Sử dụng

### 1. Import service

```typescript
import { authService, userService } from "@/services";
```

### 2. Sử dụng trong component

```typescript
"use client";

import { useState } from "react";
import { authService } from "@/services";
import { getErrorMessage } from "@/lib/api/error-handler";

export default function LoginForm() {
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await authService.login({
        identifier: "user@example.com",
        password: "password123",
      });
      // Token đã được lưu tự động
      console.log("Logged in:", response.user);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### 3. Sử dụng trong Server Component

```typescript
import { userService } from "@/services";

export default async function ProfilePage() {
  try {
    const user = await userService.getCurrentUser();
    return <div>{user.email}</div>;
  } catch (error) {
    return <div>Error loading user</div>;
  }
}
```

## API Endpoints (NestJS Backend)

### Auth Endpoints

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/forgot-password` - Quên mật khẩu
- `POST /auth/reset-password` - Đặt lại mật khẩu
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh` - Refresh token
- `POST /auth/verify-email` - Xác thực email

### User Endpoints

- `GET /users/me` - Lấy thông tin user hiện tại
- `GET /users/:id` - Lấy thông tin user theo ID
- `PATCH /users/me` - Cập nhật profile
- `POST /users/change-password` - Đổi mật khẩu
- `POST /users/avatar` - Upload avatar

## Response Format

Backend NestJS nên trả về format:

```typescript
{
  data: T,           // Data payload
  message?: string,  // Success message
  statusCode?: number
}
```

Error format:

```typescript
{
  message: string,
  statusCode: number,
  errors?: Record<string, string[]>  // Validation errors
}
```

## Token Management

Tokens được lưu trong localStorage:

```typescript
import { getAccessToken, setAccessToken, clearTokens } from "@/lib/api/token";

// Get token
const token = getAccessToken();

// Set token (thường được gọi tự động sau login)
setAccessToken("your-jwt-token");

// Clear tokens (logout)
clearTokens();
```

## Error Handling

```typescript
import {
  getErrorMessage,
  getValidationErrors,
  isNetworkError,
} from "@/lib/api/error-handler";

try {
  await authService.login(credentials);
} catch (error) {
  // Get error message
  const message = getErrorMessage(error);

  // Get validation errors
  const validationErrors = getValidationErrors(error);

  // Check if network error
  if (isNetworkError(error)) {
    console.log("Network error");
  }
}
```

## Customization

### Thay đổi base URL

Sửa trong `src/lib/api/client.ts`:

```typescript
const getBaseURL = () => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return backendUrl;
};
```

Hoặc thay đổi trong `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://your-backend-url/api/v1
```

### Thêm custom headers

Sửa trong `src/lib/api/client.ts`:

```typescript
headers: {
  "Content-Type": "application/json",
  "X-Custom-Header": "value",
},
```

### Custom interceptor

Thêm vào `src/lib/api/client.ts`:

```typescript
apiClient.interceptors.request.use((config) => {
  // Your custom logic
  return config;
});
```
