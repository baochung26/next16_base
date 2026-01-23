# Hướng dẫn sử dụng API trong Project

## Tổng quan

Project sử dụng cấu trúc API client tập trung với Axios, hỗ trợ cả fake API (local Next.js routes) và real API (NestJS backend). Tất cả API calls được quản lý thông qua các service classes.

## Cấu trúc

```
src/
├── lib/
│   └── api/
│       ├── client.ts          # Axios instance với interceptors
│       ├── base.service.ts    # Base service class
│       ├── token.ts           # Token management utilities
│       ├── error-handler.ts   # Error handling utilities
│       └── server-auth.ts     # Server-side auth utilities
├── services/
│   ├── auth.service.ts        # Authentication services
│   ├── user.service.ts        # User services
│   └── index.ts               # Barrel export
└── types/
    └── api.ts                 # API type definitions
```

## Cấu hình

### Environment Variables

Trong file `.env`:

```env
# Sử dụng fake API (local Next.js routes)
NEXT_PUBLIC_USE_FAKE_API=true

# Hoặc sử dụng real backend
NEXT_PUBLIC_USE_FAKE_API=false
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### API Client

API client tự động:
- Thêm `Authorization: Bearer {token}` header vào mọi request
- Xử lý lỗi và redirect khi 401
- Hỗ trợ cả fake API và real API

## Sử dụng Services

### Import Services

```typescript
// Import từ barrel export (recommended)
import { authService, userService } from '@/services';

// Hoặc import trực tiếp
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
```

### Authentication Service

#### Login

```typescript
import { authService } from '@/services';

try {
  const response = await authService.login({
    identifier: 'user@example.com', // hoặc username
    password: 'password123'
  });
  
  // Token đã được tự động lưu vào localStorage
  // response.user chứa thông tin user
  // response.accessToken và refreshToken đã được lưu
  
  console.log('User:', response.user);
  console.log('Logged in successfully');
} catch (error) {
  // Error đã được format sẵn
  console.error('Login failed:', error.message);
}
```

#### Register

```typescript
try {
  const response = await authService.register({
    email: 'user@example.com',
    password: 'password123',
    username: 'username', // optional
    name: 'User Name'     // optional
  });
  
  console.log('User registered:', response.user);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### Forgot Password

```typescript
try {
  const response = await authService.forgotPassword({
    email: 'user@example.com'
  });
  
  console.log('Reset link sent:', response.message);
} catch (error) {
  console.error('Failed:', error.message);
}
```

#### Reset Password

```typescript
try {
  const response = await authService.resetPassword({
    token: 'reset-token-from-email',
    password: 'newPassword123'
  });
  
  console.log('Password reset:', response.message);
} catch (error) {
  console.error('Reset failed:', error.message);
}
```

#### Logout

```typescript
try {
  await authService.logout();
  // Clear tokens manually
  import { clearTokens } from '@/lib/api/token';
  clearTokens();
} catch (error) {
  console.error('Logout failed:', error.message);
}
```

#### Refresh Token

```typescript
import { getRefreshToken } from '@/lib/api/token';

try {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await authService.refreshToken(refreshToken);
  // New access token đã được tự động lưu
} catch (error) {
  console.error('Token refresh failed:', error.message);
}
```

### User Service

#### Get Current User

```typescript
import { userService } from '@/services';

try {
  const user = await userService.getCurrentUser();
  console.log('Current user:', user);
} catch (error) {
  // Nếu 401, sẽ tự động redirect về /auth/login
  console.error('Failed to get user:', error.message);
}
```

#### Get User by ID

```typescript
try {
  const user = await userService.getUserById('user-id-here');
  console.log('User:', user);
} catch (error) {
  console.error('Failed:', error.message);
}
```

#### Update Profile

```typescript
try {
  const updatedUser = await userService.updateProfile({
    name: 'New Name',
    username: 'newusername'
  });
  
  console.log('Profile updated:', updatedUser);
} catch (error) {
  console.error('Update failed:', error.message);
}
```

#### Change Password

```typescript
try {
  const response = await userService.changePassword({
    currentPassword: 'oldPassword123',
    newPassword: 'newPassword123'
  });
  
  console.log('Password changed:', response.message);
} catch (error) {
  console.error('Change password failed:', error.message);
}
```

#### Upload Avatar

```typescript
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = fileInput?.files?.[0];

if (file) {
  try {
    const response = await userService.uploadAvatar(file);
    console.log('Avatar uploaded:', response.imageUrl);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}
```

## Error Handling

### Sử dụng Error Handler Utilities

```typescript
import { 
  getErrorMessage, 
  getValidationErrors, 
  isNetworkError,
  isErrorStatus 
} from '@/lib/api/error-handler';

try {
  await authService.login({ ... });
} catch (error) {
  // Get error message
  const message = getErrorMessage(error);
  console.error(message);
  
  // Get validation errors (if any)
  const validationErrors = getValidationErrors(error);
  if (validationErrors) {
    console.error('Validation errors:', validationErrors);
  }
  
  // Check error type
  if (isNetworkError(error)) {
    console.error('Network error - check connection');
  }
  
  if (isErrorStatus(error, 401)) {
    console.error('Unauthorized');
  }
}
```

### Error Format

Tất cả errors được format thành `ApiError`:

```typescript
interface ApiError {
  message: string;                    // Error message
  statusCode: number;                 // HTTP status code
  errors?: Record<string, string[]>;  // Validation errors (if any)
}
```

## Token Management

### Lưu và đọc Token

```typescript
import { 
  getAccessToken, 
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  hasToken 
} from '@/lib/api/token';

// Check if user has token
if (hasToken()) {
  console.log('User is authenticated');
}

// Get tokens
const accessToken = getAccessToken();
const refreshToken = getRefreshToken();

// Set tokens (thường được tự động khi login)
setAccessToken('token-here');
setRefreshToken('refresh-token-here');

// Clear tokens (khi logout)
clearTokens();
```

### Lưu User Info (Fake API only)

```typescript
import { setUserInfo, getUserInfo } from '@/lib/api/token';

// Lưu user info (chỉ cho fake API)
setUserInfo({ id: '123', email: 'user@example.com' });

// Đọc user info
const userInfo = getUserInfo();
```

## Server-Side Usage

### Get User trong Server Components

```typescript
import { getServerUser, requireServerAuth, requireServerAdmin } from '@/lib/api/server-auth';

// Get user (returns null if not authenticated)
const user = await getServerUser();
if (!user) {
  redirect('/auth/login');
}

// Require authentication (throws if not authenticated)
const user = await requireServerAuth();

// Require admin (throws if not admin)
const admin = await requireServerAdmin();
```

### Example: Protected Page

```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { requireServerAdmin } from '@/lib/api/server-auth';

export default async function DashboardPage() {
  let user;
  try {
    user = await requireServerAdmin();
  } catch (error) {
    redirect('/auth/login');
  }
  
  return <div>Dashboard for {user.name}</div>;
}
```

## Tạo Service Mới

### Sử dụng Base Service

```typescript
// services/product.service.ts
import { BaseService } from '@/lib/api/base.service';
import apiClient, { ApiResponse } from '@/lib/api/client';
import type { Product } from '@/types/api';

class ProductService extends BaseService {
  async getProducts(): Promise<Product[]> {
    return this.safeCall(() =>
      apiClient.get<ApiResponse<Product[]>>('/products')
    );
  }
  
  async getProductById(id: string): Promise<Product> {
    return this.safeCall(() =>
      apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    );
  }
  
  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.safeCall(() =>
      apiClient.post<ApiResponse<Product>>('/products', data)
    );
  }
}

export const productService = new ProductService();
```

### Export trong index.ts

```typescript
// services/index.ts
export { authService } from './auth.service';
export { userService } from './user.service';
export { productService } from './product.service';
```

## Best Practices

### 1. Luôn sử dụng try-catch

```typescript
try {
  const user = await userService.getCurrentUser();
} catch (error) {
  // Handle error
}
```

### 2. Sử dụng error handler utilities

```typescript
import { getErrorMessage } from '@/lib/api/error-handler';

try {
  // ...
} catch (error) {
  const message = getErrorMessage(error);
  // Show to user
}
```

### 3. Import từ barrel export

```typescript
// ✅ Good
import { authService, userService } from '@/services';

// ❌ Avoid
import { authService } from '@/services/auth.service';
```

### 4. Type safety

```typescript
// ✅ Good - TypeScript sẽ check types
const response = await authService.login({
  identifier: 'user@example.com',
  password: 'password123'
});

// ❌ Bad - Missing required fields
const response = await authService.login({
  identifier: 'user@example.com'
  // Missing password
});
```

### 5. Handle loading states

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>('');

const handleLogin = async () => {
  setLoading(true);
  setError('');
  
  try {
    await authService.login({ ... });
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};
```

## Response Format

Tất cả API responses theo format NestJS:

```typescript
{
  data: T,              // Response data
  message: string,      // Success/Error message
  statusCode: number    // HTTP status code
}
```

## Migration từ Fake API sang Real Backend

Xem chi tiết trong [API_MIGRATION.md](./API_MIGRATION.md)

## Troubleshooting

### Lỗi 401 Unauthorized

- Kiểm tra token có được lưu trong localStorage không
- Kiểm tra token có được gửi trong header không
- Kiểm tra token có hợp lệ không

### Lỗi Network Error

- Kiểm tra `NEXT_PUBLIC_API_URL` có đúng không
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS settings

### Token không được gửi

- Kiểm tra `src/lib/api/client.ts` interceptor
- Kiểm tra `getAccessToken()` có trả về token không
- Kiểm tra localStorage có token không
