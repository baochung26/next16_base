# Giải thích chi tiết: Auth Context (`auth-context.tsx`)

Tài liệu này giải thích từng phần trong file `src/contexts/auth-context.tsx` để giúp bạn hiểu rõ cách quản lý trạng thái đăng nhập (authentication) trong ứng dụng React/Next.js.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. ["use client" – Chỉ thị Client Component](#2-use-client--chỉ-thị-client-component)
3. [Import – Các thư viện và module](#3-import--các-thư-viện-và-module)
4. [Interface AuthContextType](#4-interface-authcontexttype)
5. [createContext – Tạo Context](#5-createcontext--tạo-context)
6. [AuthProvider – Component cung cấp Context](#6-authprovider--component-cung-cấp-context)
   - [6.1. State Management](#61-state-management)
   - [6.2. Hàm refetch - Logic đơn giản và hiệu quả](#62-hàm-refetch---logic-đơn-giản-và-hiệu-quả)
   - [6.3. Cơ chế Cache](#63-cơ-chế-cache)
   - [6.4. Xử lý lỗi chi tiết](#64-xử-lý-lỗi-chi-tiết)
   - [6.5. Refresh Token - Tại sao không có trong auth-context?](#65-refresh-token---tại-sao-không-có-trong-auth-context)
   - [6.6. useEffect và useCallback](#66-useeffect-và-usecallback)
   - [6.7. Context Value và Provider](#67-context-value-và-provider)
7. [useAuth – Custom Hook sử dụng Context](#7-useauth--custom-hook-sử-dụng-context)
8. [Luồng hoạt động tổng thể](#8-luồng-hoạt-động-tổng-thể)
9. [Các kịch bản sử dụng thực tế](#9-các-kịch-bản-sử-dụng-thực-tế)
10. [Các khái niệm React cần nắm](#10-các-khái-niệm-react-cần-nắm)
11. [Tối ưu hóa và Best Practices](#11-tối-ưu-hóa-và-best-practices)

---

## 1. Tổng quan

**Auth Context** là một cơ chế trong React dùng để **chia sẻ trạng thái đăng nhập** (user đã đăng nhập hay chưa, thông tin user, đang tải hay không...) cho **nhiều component** trong cây component mà không cần truyền props từng cấp (prop drilling).

```
┌─────────────────────────────────────────────────────────┐
│  AuthProvider (bọc toàn bộ app)                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  user, loading, isAuthenticated, refetch, setUser   │  │
│  │  + Cache mechanism (localStorage)                   │  │
│  └───────────────────────────────────────────────────┘  │
│     │              │              │                      │
│     ▼              ▼              ▼                      │
│  Header       Profile        Dashboard  ← Các component  │
│  (useAuth)    (useAuth)       (useAuth)   đều dùng chung  │
└─────────────────────────────────────────────────────────┘
```

### Đặc điểm nổi bật của implementation này:

1. **Cache thông minh**: Sử dụng `localStorage` để cache thông tin user, cung cấp instant UI update
2. **Error handling chi tiết**: Xử lý riêng mã lỗi 401 (unauthorized) sau khi refresh token đã thất bại
3. **Đồng bộ cache**: Tự động đồng bộ cache khi có dữ liệu mới từ API
4. **Tách biệt trách nhiệm**: Refresh token được xử lý ở axios interceptor, không phải trong context

---

## 2. "use client" – Chỉ thị Client Component

```tsx
"use client";
```

### Giải thích

- Trong **Next.js 13+** (App Router), mặc định mọi component là **Server Component** – chạy trên server, không dùng `useState`, `useEffect`, hay truy cập `window`/`localStorage`.
- **Auth Context** cần:
  - `useState` – lưu `user`, `loading`
  - `useEffect` – gọi API khi mount
  - `useCallback` – tối ưu hàm `refetch`
  - `getAccessToken()`, `getUserInfo()` – đọc từ `localStorage` (chỉ có trên browser)
- `"use client"` báo cho Next.js: **file này chạy trên client (trình duyệt)**. Khi đó bạn có thể dùng hooks và API của trình duyệt.

### Khi nào cần "use client"

| Cần dùng | Ví dụ |
|----------|-------|
| `useState`, `useEffect`, `useContext`, `useCallback` | Form, modal, auth context |
| Sự kiện: `onClick`, `onChange` | Nút bấm, input |
| `window`, `localStorage`, `document` | Token, theme, resize |
| Thư viện chỉ chạy trên client | Một số chart, editor |

---

## 3. Import – Các thư viện và module

```tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { userService } from "@/services";
import { getAccessToken, getUserInfo, setUserInfo } from "@/lib/api/token";
import type { User } from "@/types/api";
```

### Từ React

| Import | Công dụng |
|--------|-----------|
| `createContext` | Tạo một "kho" dữ liệu (context) để chia sẻ giữa các component. |
| `useContext` | Hook để **đọc** dữ liệu từ context trong component con. |
| `useState` | Hook lưu state (user, loading) và có hàm cập nhật (setUser, setLoading). |
| `useEffect` | Chạy side-effect (gọi API, đăng ký listener) khi component mount hoặc khi dependency thay đổi. |
| `useCallback` | Tối ưu hàm `refetch` để tránh re-render không cần thiết, chỉ tạo lại hàm khi dependency thay đổi. |
| `ReactNode` | Kiểu TypeScript: mọi thứ React có thể render (component, string, số, null, mảng...). Dùng cho `children`. |

### Từ project

| Import | Vai trò |
|--------|---------|
| `userService` | Service gọi API user, có method `getCurrentUser()` để lấy thông tin user hiện tại từ endpoint `/users/me`. |
| `getAccessToken` | Hàm đọc access token từ `localStorage`. Có token = có khả năng đã đăng nhập. |
| `getUserInfo` | Hàm đọc thông tin user đã cache trong `localStorage`. Dùng để cung cấp instant UI update. |
| `setUserInfo` | Hàm lưu thông tin user vào `localStorage` để cache. Được gọi sau khi lấy user từ API thành công. |
| `User` | Kiểu dữ liệu mô tả user: `id`, `email`, `firstName`, `lastName`, `role`, `isActive`, `createdAt`, `updatedAt`, v.v. |

---

## 4. Interface AuthContextType

```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  setUser: (user: User | null) => void;
}
```

### Ý nghĩa từng thuộc tính

| Thuộc tính | Kiểu | Ý nghĩa |
|------------|------|---------|
| `user` | `User \| null` | Thông tin user đăng nhập. `null` = chưa đăng nhập hoặc chưa load xong / lỗi. |
| `loading` | `boolean` | Đang gọi API lấy user (`true`) hay đã xong (`false`). Dùng để hiển thị spinner/skeleton. |
| `isAuthenticated` | `boolean` | Có đăng nhập hay không. Trong code: `!!user` (truthy khi `user` khác `null`). |
| `refetch` | `() => Promise<void>` | Hàm **gọi lại** API lấy user (sau khi login, sau khi cập nhật profile...). |
| `setUser` | `(user: User \| null) => void` | Cập nhật trực tiếp `user` trong context (ví dụ sau khi login/update mà không cần gọi lại API). |

### Tại sao cần TypeScript ở đây?

- Đảm bảo mọi nơi dùng `useAuth()` đều biết chính xác: có những gì, kiểu gì.
- Tránh gõ nhầm `isAuthenticated` thành `isAuth`, hoặc gọi `refetch` với tham số trong khi nó không nhận gì.
- IDE sẽ autocomplete và báo lỗi nếu dùng sai.

---

## 5. createContext – Tạo Context

```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

### Giải thích

- `createContext(giá_trị_mặc_định)` tạo một **Context object**.
- **Generic** `<AuthContextType | undefined>`:
  - **Trong** `AuthProvider`: giá trị thực là `AuthContextType` (user, loading, refetch, setUser…).
  - **Ngoài** `AuthProvider` (chưa bọc): chưa có value nên dùng `undefined` làm giá trị mặc định.
- `undefined` giúp trong `useAuth` ta **kiểm tra** "nếu `context === undefined` thì đang dùng ngoài AuthProvider" → `throw Error`.

### Hình dung

```
createContext(undefined)
        │
        ▼
   AuthContext
   (chỉ là "ống dẫn", chưa có dữ liệu thật)
        │
        │  Khi có <AuthContext.Provider value={...}>
        │  thì các component con mới đọc được value
        ▼
   useAuth() → đọc value từ Provider
```

---

## 6. AuthProvider – Component cung cấp Context

### 6.1. State Management

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
```

#### Giải thích từng state:

| State | Giá trị khởi tạo | Ý nghĩa |
|-------|------------------|----------|
| `user` | `null` | Ban đầu chưa biết user, coi như chưa đăng nhập. Sẽ được cập nhật sau khi `refetch()` chạy. |
| `loading` | `true` | Ban đầu coi như "đang tải" cho đến khi `refetch()` chạy xong. Dùng để hiển thị loading spinner. |

**Đơn giản và rõ ràng**: Chỉ 2 state cần thiết, không có logic phức tạp về endpoint tracking.

---

### 6.2. Hàm refetch - Logic đơn giản và hiệu quả

Hàm `refetch` được đơn giản hóa, tập trung vào việc lấy và cập nhật user data:

```tsx
const refetch = useCallback(async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // First, try to get user from localStorage (cached from login)
    // This provides instant UI update while API call is in progress
    const cachedUser = getUserInfo();
    if (cachedUser) {
      // Map cached user to User type for immediate UI update
      const userData: User = {
        id: cachedUser.id,
        email: cachedUser.email,
        firstName: cachedUser.firstName || "",
        lastName: cachedUser.lastName || "",
        role: cachedUser.role || "user",
        isActive: cachedUser.isActive !== undefined ? cachedUser.isActive : true,
        createdAt: cachedUser.createdAt || new Date().toISOString(),
        updatedAt: cachedUser.updatedAt || new Date().toISOString(),
      };
      setUser(userData);
      // Don't set loading to false yet - we'll update from API
    }

    // Always try to get fresh data from API
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setUserInfo(userData); // Sync cache để refresh/đóng mở tab vẫn đúng
    } catch (apiError: unknown) {
      const error = apiError as { statusCode?: number };
      
      // If it's a 401, refresh token đã được xử lý trong axios interceptor
      // Nếu vẫn nhận 401 ở đây nghĩa là refresh token cũng hết hạn hoặc không có
      // → Clear tokens và logout
      if (error?.statusCode === 401) {
        try {
          const { clearTokens } = await import("@/lib/api/token");
          clearTokens();
        } catch (e) {
          console.error("Error clearing tokens:", e);
        }
        setUser(null);
        setLoading(false);
        return;
      }
      
      // For other errors, log but keep cached user if available
      console.error("Error fetching user from API:", apiError);
      // Nếu có cached user, giữ lại để UI vẫn hoạt động
      // Nếu không có cache, set user = null
      if (!cachedUser) {
        setUser(null);
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    // Nếu có cached user, giữ lại
    const cachedUser = getUserInfo();
    if (!cachedUser) {
      setUser(null);
    }
  } finally {
    setLoading(false);
  }
}, []);
```

#### Luồng xử lý chi tiết:

**Bước 1: Kiểm tra token**
```tsx
const token = getAccessToken();
if (!token) {
  setUser(null);
  setLoading(false);
  return;
}
```
- Nếu không có token → không thể đăng nhập → set `user = null` và dừng lại

**Bước 2: Load từ cache để instant UI update**
```tsx
const cachedUser = getUserInfo();
if (cachedUser) {
  // Map và set user từ cache ngay lập tức
  setUser(userData);
  // Không set loading = false vì sẽ cập nhật từ API sau
}
```

**Lý do load cache trước:**
- Cung cấp instant UI update (user thấy thông tin ngay lập tức)
- Trong khi API call đang chạy, UI đã có dữ liệu để hiển thị
- Nếu API call thất bại, vẫn có cache để fallback

**Bước 3: Gọi API để lấy dữ liệu mới nhất**
```tsx
try {
  const userData = await userService.getCurrentUser();
  setUser(userData);
  setUserInfo(userData); // Đồng bộ cache
} catch (apiError: unknown) {
  // Xử lý lỗi...
}
```

**Lưu ý quan trọng về Refresh Token:**
- Khi API call trả về 401, **axios interceptor** (trong `src/lib/api/client.ts`) sẽ tự động:
  1. Gọi refresh token API
  2. Lưu access token mới
  3. Retry request ban đầu
  4. Nếu refresh thành công → request ban đầu sẽ thành công và không có lỗi ở đây
- Nếu vẫn nhận 401 ở đây nghĩa là:
  - Refresh token cũng đã hết hạn, HOẶC
  - Không có refresh token
  - → Cần clear tokens và logout

**Bước 4: Xử lý lỗi**
- **401**: Clear tokens và set `user = null` (refresh token đã thất bại)
- **Các lỗi khác**: Giữ lại cached user nếu có, chỉ set `null` nếu không có cache

---

### 6.3. Cơ chế Cache

#### Cache Strategy:

```
┌─────────────────────────────────────────────────────────┐
│  Login Response                                         │
│  └─► setUserInfo(userData) → localStorage              │
│                                                         │
│  AuthProvider mount                                     │
│  └─► refetch()                                          │
│      ├─► getUserInfo() → cachedUser                    │
│      ├─► setUser(cachedUser) → Instant UI update       │
│      └─► Gọi API → Cập nhật user từ server            │
│          ├─► Thành công → setUser(userData), sync cache│
│          └─► Lỗi → Giữ cache nếu có                   │
└─────────────────────────────────────────────────────────┘
```

#### Lợi ích của cache:

1. **Instant UI Update**: User thấy thông tin ngay lập tức khi app load
2. **Fallback khi API fail**: Nếu API call thất bại, vẫn có cache để hiển thị
3. **Đồng bộ giữa các tabs**: Khi refresh hoặc mở tab mới, cache đảm bảo consistency
4. **Giảm số lượng API calls**: Không cần gọi API mỗi lần mount nếu đã có cache

---

### 6.4. Xử lý lỗi chi tiết

```tsx
catch (apiError: unknown) {
  const error = apiError as { statusCode?: number };
  
  // If it's a 401, refresh token đã được xử lý trong axios interceptor
  // Nếu vẫn nhận 401 ở đây nghĩa là refresh token cũng hết hạn hoặc không có
  // → Clear tokens và logout
  if (error?.statusCode === 401) {
    try {
      const { clearTokens } = await import("@/lib/api/token");
      clearTokens();
    } catch (e) {
      console.error("Error clearing tokens:", e);
    }
    setUser(null);
    setLoading(false);
    return;
  }
  
  // For other errors, log but keep cached user if available
  console.error("Error fetching user from API:", apiError);
  if (!cachedUser) {
    setUser(null);
  }
}
```

#### Các kịch bản xử lý lỗi:

**1. Lỗi 401 (Unauthorized)**
- **Điều quan trọng**: Lỗi 401 ở đây nghĩa là refresh token đã được thử nhưng thất bại
- Axios interceptor đã tự động thử refresh token trước đó
- Nếu vẫn 401 → refresh token cũng hết hạn hoặc không có
- **Hành động**: Clear tokens, set `user = null`, user cần đăng nhập lại

**2. Các lỗi khác (network, 500, etc.)**
- Log lỗi để debug
- **Giữ lại cached user** nếu có để UI vẫn hoạt động
- Chỉ set `user = null` nếu không có cache

#### Tại sao dùng dynamic import cho `clearTokens`?

```tsx
const { clearTokens } = await import("@/lib/api/token");
```

- Tránh circular dependency nếu `token.ts` import từ `auth-context.tsx`
- Code splitting: chỉ load `clearTokens` khi thực sự cần (khi có lỗi 401)
- Tuy nhiên trong trường hợp này có thể không cần thiết vì không có circular dependency

---

### 6.5. Refresh Token - Tại sao không có trong auth-context?

#### Câu hỏi thường gặp:

> **Tại sao không thấy logic refresh token trong `auth-context.tsx`?**

#### Câu trả lời:

**Refresh token được xử lý tự động ở axios interceptor**, không phải trong auth context. Đây là một thiết kế tốt vì:

1. **Separation of Concerns**: 
   - Auth context chỉ quản lý **state** của user (user data, loading state)
   - Axios interceptor quản lý **HTTP requests** và token refresh

2. **Tự động và transparent**:
   - Khi bất kỳ API call nào trả về 401, interceptor tự động:
     - Gọi refresh token API
     - Lưu token mới
     - Retry request ban đầu
   - User và component không cần biết gì về refresh token

3. **Tránh duplicate logic**:
   - Nếu đặt refresh token trong context, mỗi component cần tự xử lý
   - Với interceptor, tất cả API calls tự động được xử lý

#### Luồng hoạt động của Refresh Token:

```
┌─────────────────────────────────────────────────────────┐
│  1. Component gọi API (ví dụ: userService.getCurrentUser)│
│     └─► Axios request với access token                  │
│                                                         │
│  2. Server trả về 401 (access token hết hạn)          │
│     └─► Axios response interceptor bắt lỗi             │
│                                                         │
│  3. Interceptor tự động:                                │
│     ├─► Kiểm tra có refresh token không?                │
│     ├─► Gọi /auth/refresh với refresh token            │
│     ├─► Nhận access token mới                          │
│     ├─► Lưu tokens mới vào localStorage                │
│     └─► Retry request ban đầu với token mới            │
│                                                         │
│  4. Request thành công → Component nhận data           │
│     └─► Component không biết token đã được refresh      │
│                                                         │
│  5. Nếu refresh token cũng hết hạn:                    │
│     └─► Clear tokens → Redirect về /auth/login         │
│         └─► Auth context nhận 401 → setUser(null)      │
└─────────────────────────────────────────────────────────┘
```

#### Code của Axios Interceptor (tham khảo):

File: `src/lib/api/client.ts`

```typescript
// Response interceptor - Handle errors và auto-refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshTokenValue = getRefreshToken();

      if (!refreshTokenValue) {
        // Không có refresh token → logout
        clearTokens();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        // Gọi refresh token API
        const refreshResponse = await authService.refreshToken(refreshTokenValue);
        const newAccessToken = refreshResponse.access_token;

        // Lưu tokens mới
        setAccessToken(newAccessToken);
        setAccessTokenCookie(newAccessToken);

        // Update header và retry request ban đầu
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest); // Retry với token mới
      } catch (refreshError) {
        // Refresh token cũng hết hạn → logout
        clearTokens();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### Tại sao Auth Context vẫn cần xử lý 401?

Mặc dù refresh token được xử lý ở interceptor, auth context vẫn cần xử lý 401 vì:

1. **Trường hợp refresh token không có hoặc đã hết hạn**:
   - Interceptor sẽ clear tokens và redirect
   - Nhưng context cũng cần set `user = null` để UI cập nhật

2. **Trường hợp có lỗi khác**:
   - Network error, timeout, etc.
   - Context cần xử lý để không crash app

3. **Defensive programming**:
   - Đảm bảo state luôn consistent với thực tế

#### Kết luận:

✅ **Refresh token được xử lý ở axios interceptor** - tự động, transparent  
✅ **Auth context chỉ quản lý user state** - đơn giản, rõ ràng  
✅ **Separation of concerns** - mỗi phần làm đúng việc của mình  

---

### 6.6. useEffect và useCallback

```tsx
useEffect(() => {
  refetch();
}, [refetch]);
```

#### Giải thích:

- **useEffect(callback, dependencies)**:
  - `callback`: chạy sau khi component đã render (và đã "mount" lên DOM)
  - `[refetch]`: dependency là `refetch` → mỗi khi `refetch` thay đổi, effect sẽ chạy lại

#### Tại sao dependency là `refetch`?

- `refetch` được wrap trong `useCallback` với dependency `[]` (empty array)
- Nghĩa là `refetch` chỉ được tạo **một lần** khi component mount
- `useEffect` sẽ chỉ chạy **một lần** khi component mount
- Điều này đảm bảo `refetch()` chỉ được gọi một lần khi app load

#### useCallback:

```tsx
const refetch = useCallback(async () => {
  // ... logic
}, []);
```

**Lợi ích:**
- Tránh tạo lại hàm `refetch` mỗi lần component re-render
- Vì dependency là `[]`, hàm chỉ được tạo một lần
- Tối ưu performance, đặc biệt khi có nhiều component con dùng `refetch`

**Lưu ý:** Nếu không dùng `useCallback`, mỗi lần `AuthProvider` re-render sẽ tạo hàm `refetch` mới → `useEffect` sẽ chạy lại → có thể gây infinite loop hoặc gọi API không cần thiết

---

### 6.7. Context Value và Provider

```tsx
const value: AuthContextType = {
  user,
  loading,
  isAuthenticated: !!user,
  refetch,
  setUser,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

#### Giải thích:

- **value** là toàn bộ dữ liệu và hàm mà context "phát" ra:
  - `user`: thông tin user hiện tại (hoặc `null`)
  - `loading`: trạng thái đang tải
  - `isAuthenticated: !!user`: chuyển `user` sang boolean (`!!null` → `false`, `!!{...}` → `true`)
  - `refetch`: hàm để gọi lại API lấy user
  - `setUser`: hàm để cập nhật user trực tiếp (không qua API)

- **AuthContext.Provider**:
  - Nhận `value` và **đưa vào** context
  - Mọi component **con** (trong `children`) khi gọi `useContext(AuthContext)` sẽ nhận đúng `value` này
  - Khi `value` thay đổi (ví dụ `setUser` làm `user` đổi), các component dùng `useAuth()` sẽ **re-render** với giá trị mới

#### Tại sao `isAuthenticated: !!user`?

- `!!` là double negation, chuyển bất kỳ giá trị nào sang boolean
- `!!null` → `false`
- `!!{}` → `true`
- Dễ đọc và rõ ràng hơn `user !== null`

---

## 7. useAuth – Custom Hook sử dụng Context

```tsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### Giải thích

- **useContext(AuthContext)**: lấy `value` mà `AuthContext.Provider` đang cung cấp. Nếu **không có** Provider nào bọc phía trên, `createContext(undefined)` khiến `context` là `undefined`.
- **if (!context)**: nếu `undefined` → đang gọi `useAuth()` bên ngoài `AuthProvider` → `throw new Error` để nhắc nhở đặt `<AuthProvider>` bọc app (hoặc layout).
- **return context**: trả về đúng kiểu `AuthContextType` (user, loading, isAuthenticated, refetch, setUser).

### Tại sao làm thành custom hook?

- Gom logic "đọc context + kiểm tra lỗi" vào một chỗ
- Mỗi component chỉ cần: `const { user, loading, isAuthenticated } = useAuth();` thay vì `useContext(AuthContext)` và tự if/throw
- Dễ đổi implementation sau này (ví dụ đổi sang Redux hoặc store khác) mà không phải sửa từng chỗ dùng
- Type-safe: TypeScript biết chính xác kiểu trả về

---

## 8. Luồng hoạt động tổng thể

```
1. App load
   └─► AuthProvider mount
         └─► useState: user=null, loading=true
         └─► useCallback: tạo hàm refetch (một lần)
         └─► useEffect chạy → refetch()

2. refetch() - Lần đầu
   ├─► getAccessToken()
   │     ├─► Không có token → setUser(null), setLoading(false), return
   │     └─► Có token → tiếp tục
   │
   ├─► getUserInfo() → cachedUser
   │     └─► Có cache → setUser(cachedUser) → Instant UI update
   │
   └─► Gọi API: userService.getCurrentUser()
         ├─► Thành công → setUser(userData), setUserInfo(userData) sync cache
         └─► Lỗi:
               ├─► 401 → Axios interceptor tự động refresh token
               │     ├─► Refresh thành công → Retry request → Thành công
               │     └─► Refresh thất bại → clearTokens(), setUser(null), redirect login
               └─► Khác → Log error, giữ cache nếu có
         └─► finally: setLoading(false)

3. value = { user, loading, isAuthenticated: !!user, refetch, setUser }
   └─► AuthContext.Provider value={value}

4. Ở bất kỳ component con nào:
   └─► const { user, loading, isAuthenticated, refetch, setUser } = useAuth();
   └─► Dùng để: hiển thị tên user, ẩn nút Login khi đã đăng nhập, redirect, v.v.

5. Khi access token hết hạn trong session:
   └─► API call trả về 401
   └─► Axios interceptor tự động refresh token
   └─► Retry request → Thành công
   └─► User không bị logout, không nhận thấy gì
```

---

## 9. Các kịch bản sử dụng thực tế

### Ví dụ 1: Hiển thị tên user và nút Login/Logout

```tsx
"use client";

import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Đang tải...</div>;
  if (!isAuthenticated) return <a href="/login">Đăng nhập</a>;

  return (
    <div>
      Xin chào, {user?.firstName} {user?.lastName} ({user?.email})!
      <a href="/logout">Đăng xuất</a>
    </div>
  );
}
```

### Ví dụ 2: Gọi `refetch` sau khi cập nhật profile

```tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/services";

export function ProfileForm() {
  const { refetch } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = async (formData: ProfileData) => {
    setSaving(true);
    try {
      await userService.updateProfile(formData);
      await refetch(); // Đồng bộ lại user trong context từ API
      toast.success("Cập nhật thành công!");
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (/* form JSX */);
}
```

### Ví dụ 3: Dùng `setUser` ngay sau khi login

```tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import { setAccessToken, setUserInfo } from "@/lib/api/token";

export function LoginForm() {
  const { setUser } = useAuth();

  const onLoginSuccess = async (response: LoginResponse) => {
    // Lưu token
    setAccessToken(response.access_token);
    setUserInfo(response); // Cache user info
    
    // Cập nhật context ngay lập tức (không cần gọi API)
    setUser({
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      isActive: response.isActive,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    });
    
    router.push("/dashboard");
  };

  return (/* form JSX */);
}
```

**Lưu ý:** Trong trường hợp này, có thể không cần `setUser` vì `refetch()` sẽ tự động chạy khi `AuthProvider` mount. Tuy nhiên, `setUser` giúp cập nhật UI ngay lập tức mà không cần đợi API call.

### Ví dụ 4: Protected Route

```tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <div>Đang tải...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

---

## 10. Các khái niệm React cần nắm

Để đọc `auth-context.tsx` thoải mái, nên nắm:

| Khái niệm | Vai trò trong auth-context |
|-----------|----------------------------|
| **useState** | Lưu `user`, `loading`, mỗi lần set → re-render. |
| **useEffect** | Chạy `refetch()` khi `AuthProvider` mount. |
| **useCallback** | Tối ưu hàm `refetch`, chỉ tạo một lần khi component mount. |
| **createContext** | Tạo "kênh" để chia sẻ `AuthContextType` xuống cây component. |
| **Context.Provider** | Gắn `value` vào context; component con mới đọc được. |
| **useContext** | Đọc `value` từ Provider tương ứng. |
| **Custom hook** | `useAuth()` bọc `useContext` + kiểm tra lỗi, API gọn cho component. |
| **"use client"** | Báo Next.js: file này chạy trên client, dùng được hooks và `localStorage`. |
| **TypeScript Generics** | `<AuthContextType | undefined>` để type-safe context. |
| **Optional chaining** | `error?.statusCode` để tránh lỗi khi `error` là `null`/`undefined`. |

---

## 11. Tối ưu hóa và Best Practices

### Điểm mạnh của implementation này:

1. **Cache Strategy**: Sử dụng `localStorage` để cache user info, cung cấp instant UI update
2. **Separation of Concerns**: Refresh token được xử lý ở axios interceptor, context chỉ quản lý state
3. **Error Handling**: Xử lý riêng từng loại lỗi (401 sau refresh thất bại, các lỗi khác)
4. **Performance**: Dùng `useCallback` để tối ưu re-render
5. **Type Safety**: TypeScript đảm bảo type safety
6. **Simple & Clean**: Code đơn giản, dễ hiểu, không có logic phức tạp không cần thiết

### Có thể cải thiện:

1. **Optimistic Updates**: Khi update profile, có thể update UI ngay lập tức trước khi API call thành công
2. **Event Listeners**: Có thể thêm event listener để sync auth state giữa các tabs (dùng `storage` event)
3. **Loading States**: Có thể tách `loading` thành `initialLoading` và `refetching` để UX tốt hơn
4. **Retry Logic**: Có thể thêm retry logic khi API call thất bại do network error

### Best Practices đã áp dụng:

✅ **Separation of Concerns**: Logic auth tách riêng vào context, refresh token ở interceptor  
✅ **Error Boundaries**: Xử lý lỗi một cách graceful, không crash app  
✅ **Type Safety**: Dùng TypeScript để đảm bảo type safety  
✅ **Performance**: Dùng `useCallback` để tối ưu  
✅ **Developer Experience**: Log warnings và errors rõ ràng để debug dễ dàng  
✅ **Simple & Maintainable**: Code đơn giản, dễ đọc, dễ maintain  

---

## Tóm tắt nhanh

| Phần | Chức năng chính |
|------|------------------|
| `"use client"` | Chạy trên client, dùng được hooks và `localStorage`. |
| `AuthContextType` | Định nghĩa shape: user, loading, isAuthenticated, refetch, setUser. |
| `createContext(undefined)` | Tạo context, giá trị mặc định `undefined` để phát hiện dùng ngoài Provider. |
| `AuthProvider` | Quản lý `user`, `loading`; `useEffect` gọi `refetch()` khi mount; `Provider` truyền `value` xuống. |
| `refetch` | Logic đơn giản: kiểm tra token → load cache → gọi API → xử lý lỗi. |
| `useCallback` | Tối ưu `refetch`, chỉ tạo một lần khi component mount. |
| Cache mechanism | Dùng `localStorage` để cache user info, đồng bộ khi có dữ liệu mới từ API. |
| Refresh Token | Được xử lý tự động ở axios interceptor, không phải trong context. |
| `useAuth` | `useContext(AuthContext)` + throw nếu thiếu Provider; trả về `AuthContextType`. |

---

## Kết luận

File `auth-context.tsx` là một implementation đơn giản và hiệu quả của authentication context với các tính năng:

- ✅ Cache mechanism để instant UI update
- ✅ Error handling chi tiết cho từng loại lỗi
- ✅ Performance optimization với `useCallback`
- ✅ Type safety với TypeScript
- ✅ Separation of concerns: refresh token ở interceptor, context chỉ quản lý state

**Điểm quan trọng**: Refresh token được xử lý tự động ở axios interceptor (`src/lib/api/client.ts`), không phải trong auth context. Đây là một thiết kế tốt vì:
- Tự động và transparent cho tất cả API calls
- Tránh duplicate logic
- Separation of concerns rõ ràng

Khi đã nắm các phần trên, bạn có thể mở rộng (thêm `logout`, `login` vào context, hoặc kết nối với route protection) dựa trên cùng một mô hình.
