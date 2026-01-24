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
7. [useAuth – Custom Hook sử dụng Context](#7-useauth--custom-hook-sử-dụng-context)
8. [Luồng hoạt động tổng thể](#8-luồng-hoạt-động-tổng-thể)
9. [Cách sử dụng trong component](#9-cách-sử-dụng-trong-component)
10. [Các khái niệm React cần nắm](#10-các-khái-niệm-react-cần-nắm)

---

## 1. Tổng quan

**Auth Context** là một cơ chế trong React dùng để **chia sẻ trạng thái đăng nhập** (user đã đăng nhập hay chưa, thông tin user, đang tải hay không...) cho **nhiều component** trong cây component mà không cần truyền props từng cấp (prop drilling).

```
┌─────────────────────────────────────────────────────────┐
│  AuthProvider (bọc toàn bộ app)                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  user, loading, isAuthenticated, refetch, setUser   │  │
│  └───────────────────────────────────────────────────┘  │
│     │              │              │                      │
│     ▼              ▼              ▼                      │
│  Header       Profile        Dashboard  ← Các component  │
│  (useAuth)    (useAuth)       (useAuth)   đều dùng chung  │
└─────────────────────────────────────────────────────────┘
```

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
  - `getAccessToken()` – đọc từ `localStorage` (chỉ có trên browser)
- `"use client"` báo cho Next.js: **file này chạy trên client (trình duyệt)**. Khi đó bạn có thể dùng hooks và API của trình duyệt.

### Khi nào cần "use client"

| Cần dùng | Ví dụ |
|----------|-------|
| `useState`, `useEffect`, `useContext` | Form, modal, auth context |
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
  ReactNode,
} from "react";
import { userService } from "@/services";
import { getAccessToken } from "@/lib/api/token";
import type { User } from "@/types/api";
```

### Từ React

| Import | Công dụng |
|--------|-----------|
| `createContext` | Tạo một “kho” dữ liệu (context) để chia sẻ giữa các component. |
| `useContext` | Hook để **đọc** dữ liệu từ context trong component con. |
| `useState` | Hook lưu state (user, loading) và có hàm cập nhật (setUser, setLoading). |
| `useEffect` | Chạy side-effect (gọi API, đăng ký listener) khi component mount hoặc khi dependency thay đổi. |
| `ReactNode` | Kiểu TypeScript: mọi thứ React có thể render (component, string, số, null, mảng...). Dùng cho `children`. |

### Từ project

| Import | Vai trò |
|--------|---------|
| `userService` | Service gọi API user, có method `getCurrentUser()` để lấy thông tin user hiện tại. |
| `getAccessToken` | Hàm đọc access token từ `localStorage`. Có token = có khả năng đã đăng nhập. |
| `User` | Kiểu dữ liệu mô tả user: `id`, `email`, `username`, `name`, `image`, v.v. |

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
- `undefined` giúp trong `useAuth` ta **kiểm tra** “nếu `context === undefined` thì đang dùng ngoài AuthProvider” → `throw Error`.

### Hình dung

```
createContext(undefined)
        │
        ▼
   AuthContext
   (chỉ là “ống dẫn”, chưa có dữ liệu thật)
        │
        │  Khi có <AuthContext.Provider value={...}>
        │  thì các component con mới đọc được value
        ▼
   useAuth() → đọc value từ Provider
```

---

## 6. AuthProvider – Component cung cấp Context

### 6.1. Định nghĩa và props

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
```

- `AuthProvider` nhận **một prop**: `children` – toàn bộ cây component bên trong (thường là `<App />` hoặc `{children}` của `layout`).
- `ReactNode`: có thể là component, `null`, fragment `<>...</>`, v.v.

---

### 6.2. State: `user` và `loading`

```tsx
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
```

| State | Giá trị khởi tạo | Ý nghĩa |
|-------|------------------|----------|
| `user` | `null` | Ban đầu chưa biết user, coi như chưa đăng nhập. |
| `loading` | `true` | Ban đầu coi như “đang tải” cho đến khi `refetch()` chạy xong. |

- `setUser` vừa dùng trong `refetch`, vừa **đưa ra ngoài** qua context (`setUser` trong `AuthContextType`) để component khác có thể cập nhật (ví dụ form login gọi `setUser(data.user)` sau khi đăng nhập thành công).

---

### 6.3. Hàm `refetch`

```tsx
const refetch = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const userData = await userService.getCurrentUser();
    setUser(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    setUser(null);
  } finally {
    setLoading(false);
  }
};
```

#### Từng bước

1. **Lấy token**
   - `getAccessToken()` đọc từ `localStorage` (trong `token.ts`). Trên server `window` không tồn tại nên trả `null`.
   - Không có token → coi như chưa đăng nhập: `setUser(null)`, `setLoading(false)` và `return`.

2. **Gọi API lấy user**
   - `userService.getCurrentUser()` gọi `/users/me` (qua `apiClient`). Header `Authorization` thường do `apiClient` tự gắn từ token.
   - Kết quả gán vào state: `setUser(userData)`.

3. **Khi lỗi**
   - `catch`: log lỗi, `setUser(null)` (coi như không còn phiên đăng nhập hợp lệ).

4. **Luôn tắt loading**
   - `finally`: dù thành công hay lỗi cũng `setLoading(false)` để UI không kẹt ở trạng thái loading.

#### Tại sao cần `refetch`?

- Khi app load lần đầu: kiểm tra token và lấy user.
- Sau khi **login/register**: có thể gọi `refetch()` thay vì tự set `user` (nếu bạn chọn cách luôn đồng bộ từ server).
- Sau khi **cập nhật profile**: gọi `refetch()` để context luôn khớp với server.

---

### 6.4. useEffect – Gọi `refetch` khi mount

```tsx
useEffect(() => {
  refetch();
}, []);
```

- **useEffect(callback, dependencies)**:
  - `callback`: chạy sau khi component đã render (và đã “mount” lên DOM).
  - `[]`: mảng dependency rỗng → chỉ chạy **một lần** khi `AuthProvider` mount (thường là lúc vào app hoặc vào layout có bọc `AuthProvider`).
- Ở đây: mỗi khi user mở app (hoặc vào trang có `AuthProvider`), sẽ chạy `refetch()` một lần để:
  - Nếu có token → gọi `/users/me` và set `user`.
  - Nếu không có token hoặc lỗi → `user = null`, `loading = false`.

---

### 6.5. Object `value` và `AuthContext.Provider`

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

- **value** là toàn bộ dữ liệu và hàm mà context “phát” ra:
  - `user`, `loading`, `refetch`, `setUser` – như đã mô tả ở `AuthContextType`.
  - `isAuthenticated: !!user`: chuyển `user` sang boolean (`!!null` → `false`, `!!{...}` → `true`).
- **AuthContext.Provider**:
  - Nhận `value` và **đưa vào** context.
  - Mọi component **con** (trong `children`) khi gọi `useContext(AuthContext)` sẽ nhận đúng `value` này.
  - Khi `value` thay đổi (ví dụ `setUser` làm `user` đổi), các component dùng `useAuth()` sẽ **re-render** với giá trị mới.

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

- Gom logic “đọc context + kiểm tra lỗi” vào một chỗ.
- Mỗi component chỉ cần: `const { user, loading, isAuthenticated } = useAuth();` thay vì `useContext(AuthContext)` và tự if/throw.
- Dễ đổi implementation sau này (ví dụ đổi sang Redux hoặc store khác) mà không phải sửa từng chỗ dùng.

---

## 8. Luồng hoạt động tổng thể

```
1. App load
   └─► AuthProvider mount
         └─► useState: user=null, loading=true
         └─► useEffect chạy 1 lần → refetch()

2. refetch()
   ├─► getAccessToken()
   │     ├─► Có token → userService.getCurrentUser() → setUser(userData)
   │     └─► Không token → setUser(null)
   └─► finally: setLoading(false)

3. value = { user, loading, isAuthenticated: !!user, refetch, setUser }
   └─► AuthContext.Provider value={value}

4. Ở bất kỳ component con nào:
   └─► const { user, loading, isAuthenticated, refetch, setUser } = useAuth();
   └─► Dùng để: hiển thị tên user, ẩn nút Login khi đã đăng nhập, redirect, v.v.
```

---

## 9. Cách sử dụng trong component

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
      Xin chào, {user?.name || user?.email}!
      <a href="/logout">Đăng xuất</a>
    </div>
  );
}
```

### Ví dụ 2: Gọi `refetch` sau khi cập nhật profile

```tsx
const { refetch } = useAuth();

const handleSave = async () => {
  await userService.updateProfile(formData);
  await refetch(); // Đồng bộ lại user trong context
};
```

### Ví dụ 3: Dùng `setUser` ngay sau khi login (tùy cách bạn implement)

```tsx
const { setUser } = useAuth();

const onLoginSuccess = (response) => {
  setAccessToken(response.accessToken);
  setUser(response.user); // Cập nhật ngay, không cần gọi refetch
};
```

---

## 10. Các khái niệm React cần nắm

Để đọc `auth-context.tsx` thoải mái, nên nắm:

| Khái niệm | Vai trò trong auth-context |
|-----------|----------------------------|
| **useState** | Lưu `user` và `loading`, mỗi lần set → re-render. |
| **useEffect** | Chạy `refetch()` một lần khi `AuthProvider` mount. |
| **createContext** | Tạo “kênh” để chia sẻ `AuthContextType` xuống cây component. |
| **Context.Provider** | Gắn `value` vào context; component con mới đọc được. |
| **useContext** | Đọc `value` từ Provider tương ứng. |
| **Custom hook** | `useAuth()` bọc `useContext` + kiểm tra lỗi, API gọn cho component. |
| **"use client"** | Báo Next.js: file này chạy trên client, dùng được hooks và `localStorage`. |

---

## Tóm tắt nhanh

| Phần | Chức năng chính |
|------|------------------|
| `"use client"` | Chạy trên client, dùng được hooks và `localStorage`. |
| `AuthContextType` | Định nghĩa shape: user, loading, isAuthenticated, refetch, setUser. |
| `createContext(undefined)` | Tạo context, giá trị mặc định `undefined` để phát hiện dùng ngoài Provider. |
| `AuthProvider` | Quản lý `user`, `loading`; `useEffect` gọi `refetch()` khi mount; `Provider` truyền `value` xuống. |
| `refetch` | Đọc token → có token thì gọi `getCurrentUser` → setUser/setLoading; dùng khi init và khi cần đồng bộ lại. |
| `useAuth` | `useContext(AuthContext)` + throw nếu thiếu Provider; trả về `AuthContextType`. |

Khi đã nắm các phần trên, bạn có thể mở rộng (thêm `logout`, `login` vào context, hoặc kết nối với route protection) dựa trên cùng một mô hình.
