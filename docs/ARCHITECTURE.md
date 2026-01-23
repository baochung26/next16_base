# Architecture Overview

Tổng quan kiến trúc và design patterns của project.

## 📋 Mục lục

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture Patterns](#architecture-patterns)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [API Architecture](#api-architecture)
- [State Management](#state-management)
- [Error Handling](#error-handling)

## 🎯 Overview

Project sử dụng **Next.js 16 App Router** với kiến trúc **layered architecture**:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Pages, Components, Layouts)     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│      (Services, Hooks, Utils)       │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│          Data Access Layer          │
│    (API Client, Token Management)   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         External Services           │
│    (Fake API / NestJS Backend)     │
└─────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Core

- **Next.js 16.1.4**: React framework với App Router
- **React 19.2.3**: UI library
- **TypeScript 5**: Type safety

### UI & Styling

- **Tailwind CSS v4**: Utility-first CSS
- **shadcn/ui**: Component library
- **Radix UI**: Accessible primitives
- **Lucide React**: Icons
- **next-themes**: Dark mode

### Data & API

- **Axios**: HTTP client
- **Zod**: Schema validation
- **React Hook Form**: Form management

### Authentication

- **JWT Tokens**: Token-based authentication
- **Cookie-based**: Server-side token storage
- **LocalStorage**: Client-side token storage

## 🏗️ Architecture Patterns

### 1. Service Layer Pattern

Tất cả API calls được abstract qua service classes:

```typescript
// Service class
class AuthService extends BaseService {
  async login(credentials: LoginRequest) {
    return this.safeCall(() =>
      apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    );
  }
}

// Usage in component
const response = await authService.login({ email, password });
```

**Benefits**:

- Separation of concerns
- Reusable API logic
- Centralized error handling
- Easy to test

### 2. Base Service Pattern

Tất cả services extend từ `BaseService`:

```typescript
class BaseService {
  protected handleResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
    // Standardized response handling
  }

  protected handleError(error: unknown) {
    // Centralized error handling
  }

  protected async safeCall<T>(fn: () => Promise<AxiosResponse>) {
    // Try-catch wrapper
  }
}
```

**Benefits**:

- DRY (Don't Repeat Yourself)
- Consistent error handling
- Easy to add cross-cutting concerns (logging, analytics)

### 3. Constants Pattern

Tất cả magic strings/numbers được tập trung:

```typescript
// src/lib/constants.ts
export const ROUTES = {
  AUTH: { LOGIN: "/auth/login" },
  DASHBOARD: { ROOT: "/dashboard" },
};

// Usage
<Link href={ROUTES.AUTH.LOGIN}>Login</Link>
```

**Benefits**:

- Single source of truth
- Type safety
- Easy refactoring
- No typos

### 4. Component Composition

Components được compose từ smaller components:

```typescript
// Layout composition
<MainLayout>
  <Header />
  <main>{children}</main>
  <Footer />
</MainLayout>

// UI composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## 🔄 Data Flow

### Client-Side Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Service Method Call
    ↓
API Client (Axios)
    ↓
Request Interceptor (Add token)
    ↓
Backend API
    ↓
Response Interceptor (Handle errors)
    ↓
Service (Parse response)
    ↓
Component (Update state)
    ↓
UI Update
```

### Server-Side Data Flow

```
Request
    ↓
Middleware (Route protection)
    ↓
Server Component / API Route
    ↓
Server Auth Utility (Read token from cookies)
    ↓
Service / Database
    ↓
Response
```

## 🔐 Authentication Flow

### Login Flow

```
1. User submits login form
   ↓
2. authService.login() called
   ↓
3. API request to /api/auth/login
   ↓
4. Backend validates credentials
   ↓
5. Returns JWT tokens + user info
   ↓
6. Tokens saved to:
   - localStorage (client-side)
   - Cookies (server-side)
   ↓
7. Redirect to dashboard/home
```

### Protected Route Flow

```
1. User navigates to /dashboard
   ↓
2. Middleware checks for token in cookies
   ↓
3. If no token → redirect to /auth/login
   ↓
4. If token exists → continue
   ↓
5. Server component calls requireServerAuth()
   ↓
6. Token validated
   ↓
7. User data fetched
   ↓
8. Page rendered
```

### API Request Flow

```
1. Component calls service method
   ↓
2. Service calls apiClient
   ↓
3. Request interceptor adds Authorization header
   ↓
4. Request sent to backend
   ↓
5. Response interceptor checks status
   ↓
6. If 401 → Clear tokens → Redirect to login
   ↓
7. If error → Throw error with message
   ↓
8. If success → Return parsed data
```

## 🌐 API Architecture

### API Client Structure

```typescript
// Base URL determination
const getBaseURL = () => {
  if (NEXT_PUBLIC_USE_FAKE_API === "true") {
    return "/api"; // Local Next.js routes
  }
  return NEXT_PUBLIC_API_URL; // NestJS backend
};

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);
```

### Service Structure

```typescript
class AuthService extends BaseService {
  /**
   * Login user
   * @param credentials - Login credentials
   * @returns User data and tokens
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.safeCall(async () => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return this.handleResponse(response);
    });
  }
}
```

### Response Format

Tất cả API responses follow format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
```

## 📊 State Management

### Current Approach

Project hiện tại sử dụng **React built-in state**:

- **Local State**: `useState` cho component state
- **Server State**: Server Components + API calls
- **Global State**: Context API (Theme, Session)

### Token Management

```typescript
// Client-side (localStorage)
setAccessToken(token);
getAccessToken();

// Server-side (cookies)
// Tokens automatically set in cookies via API routes
```

### Future Considerations

Khi project lớn hơn, có thể thêm:

- **TanStack Query (React Query)**: Cho server state management
- **Zustand / Jotai**: Cho global client state (nếu cần)
- **SWR**: Alternative to React Query

## ⚠️ Error Handling

### Error Hierarchy

```
Error
├── NetworkError (No internet)
├── ApiError
│   ├── ValidationError (400)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   └── ServerError (500)
└── UnknownError
```

### Error Handling Strategy

1. **Service Level**: `BaseService.handleError()`
2. **Component Level**: Try-catch với user-friendly messages
3. **Global Level**: Error boundaries + error pages
4. **API Level**: Response interceptors

### Error Display

- **Toast notifications**: Cho user actions (success/error)
- **Error pages**: Cho critical errors (500, 404)
- **Inline errors**: Cho form validation

## 🎨 UI Architecture

### Component Hierarchy

```
Layout Components
├── MainLayout
│   ├── Header
│   ├── Main Content
│   └── Footer
├── AuthLayout
│   └── Auth Content
└── DashboardLayout
    ├── Sidebar
    ├── Top Bar
    └── Content
```

### Design System

- **shadcn/ui**: Base components
- **Tailwind CSS**: Styling
- **CSS Variables**: Theming
- **Dark Mode**: next-themes

## 🔮 Future Architecture Considerations

### Feature-Based Structure

Khi project lớn, có thể chuyển sang:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── users/
│       └── ...
```

### Micro-frontends

Có thể tách thành:

- Auth module
- Dashboard module
- Public pages module

### Server Components Optimization

Tận dụng tối đa Server Components:

- Data fetching ở server
- SEO optimization
- Performance benefits

## 📚 Related Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [API Usage Guide](./API_USAGE.md)
- [UI Layout Guide](./UI_LAYOUT.md)
