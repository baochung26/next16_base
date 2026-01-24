# Walkthrough: Luồng hoạt động thực tế trong Project

Tài liệu này mô tả chi tiết luồng hoạt động từ khi user vào trang đến khi login và truy cập các trang đã đăng nhập, bao gồm file nào xử lý, data lưu ở đâu, và cách hoạt động.

## 📋 Mục lục

- [Scenario: User Login Flow](#scenario-user-login-flow)
- [Bước 1: User vào trang chủ](#bước-1-user-vào-trang-chủ)
- [Bước 2: User click "Đăng nhập"](#bước-2-user-click-đăng-nhập)
- [Bước 3: User submit form login](#bước-3-user-submit-form-login)
- [Bước 4: Xử lý login và lưu token](#bước-4-xử-lý-login-và-lưu-token)
- [Bước 5: Redirect về trang chủ](#bước-5-redirect-về-trang-chủ)
- [Bước 6: Header hiển thị user info](#bước-6-header-hiển-thị-user-info)
- [Bước 7: User truy cập Dashboard](#bước-7-user-truy-cập-dashboard)
- [Bước 8: Middleware kiểm tra authentication](#bước-8-middleware-kiểm-tra-authentication)
- [Bước 9: Server Component fetch user data](#bước-9-server-component-fetch-user-data)
- [Bước 10: Render Dashboard](#bước-10-render-dashboard)
- [Tổng kết Data Flow](#tổng-kết-data-flow)

---

## Scenario: User Login Flow

**User journey:**
1. Vào trang chủ → Thấy nút "Đăng nhập"
2. Click "Đăng nhập" → Điều hướng đến `/auth/login`
3. Nhập email/password → Submit form
4. Login thành công → Lưu token → Redirect về trang chủ
5. Trang chủ → Header hiển thị user dropdown
6. Click "Dashboard" → Truy cập `/dashboard`
7. Dashboard hiển thị với user data

---

## Bước 1: User vào trang chủ

### Request Flow

```
Browser → GET / → Next.js Server
```

### File xử lý

**`src/app/page.tsx`** (Server Component)

```typescript
// Server Component - Render trên server
export default function HomePage() {
  return (
    <MainLayout>
      {/* Home page content */}
    </MainLayout>
  );
}
```

### Layout Hierarchy

**`src/app/layout.tsx`** (Root Layout)

```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthSessionProvider>
            <AuthProvider> {/* ← Client Component */}
              <ErrorBoundaryProvider>
                {children} {/* ← Home page render ở đây */}
                <Toaster />
              </ErrorBoundaryProvider>
            </AuthProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### AuthProvider khởi tạo

**File:** `src/contexts/auth-context.tsx`

```typescript
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Chạy khi component mount (lần đầu load trang)
    refetch();
  }, []);

  const refetch = async () => {
    try {
      const token = getAccessToken(); // ✅ Đọc từ localStorage
      if (!token) {
        setUser(null);
        setLoading(false);
        return; // ← User chưa login, return null
      }

      // ✅ Có token → Fetch user từ API
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
}
```

**Data flow:**
1. `AuthProvider` mount → `useEffect` chạy
2. `getAccessToken()` → Đọc từ `localStorage.getItem("accessToken")`
3. Nếu không có token → `user = null`, `loading = false`
4. Nếu có token → Gọi `userService.getCurrentUser()` → Set user state

### Header Component

**File:** `src/components/layout/header.tsx`

```typescript
export function Header() {
  const { user, loading } = useAuth(); // ✅ Lấy từ AuthContext

  // ✅ Nếu chưa login → Hiển thị buttons "Đăng nhập" và "Đăng ký"
  if (!user) {
    return (
      <div>
        <Button asChild>
          <Link href="/auth/login">Đăng nhập</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  // ✅ Nếu đã login → Hiển thị user dropdown
  return <UserDropdown user={user} />;
}
```

**State hiện tại:**
- `user = null` (chưa login)
- `loading = false` (đã check xong)
- Header hiển thị: "Đăng nhập" và "Đăng ký" buttons

---

## Bước 2: User click "Đăng nhập"

### User Action

```
Click button "Đăng nhập" → Navigate to /auth/login
```

### Navigation Flow

**File:** `src/components/layout/header.tsx`

```typescript
<Link href="/auth/login">Đăng nhập</Link>
```

**Next.js App Router:**
- Route: `src/app/auth/login/page.tsx`
- Next.js tự động match route và render page

### Middleware Check

**File:** `src/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value; // ✅ Đọc từ cookies

  // Check if route is auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // ✅ Nếu đã có token và đang vào auth route → Redirect về home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // ✅ Không có token → Cho phép vào login page
  return NextResponse.next();
}
```

**Kết quả:**
- User chưa có token → Cho phép vào `/auth/login`
- Middleware chạy trên **server** (Edge Runtime)

### Render Login Page

**File:** `src/app/auth/login/page.tsx` (Client Component)

```typescript
"use client"; // ✅ Client Component (cần interactivity)

export default function LoginPage() {
  const { refetch } = useAuth(); // ✅ Lấy refetch từ AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({...});

  const onSubmit = async (values) => {
    setIsLoading(true);
    // ... xử lý login (xem bước 3)
  };

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Input name="identifier" />
        <Input name="password" type="password" />
        <Button type="submit">Đăng nhập</Button>
      </form>
    </Card>
  );
}
```

**State:**
- Component render trên browser
- Form sẵn sàng nhận input từ user

---

## Bước 3: User submit form login

### User Action

```
User nhập: email = "admin@example.com", password = "password123"
Click "Đăng nhập" → Form submit
```

### Form Submission

**File:** `src/app/auth/login/page.tsx`

```typescript
const onSubmit = async (values: z.infer<typeof loginSchema>) => {
  setIsLoading(true);
  setError("");

  try {
    // ✅ 1. Import authService
    const { authService } = await import("@/services");
    
    // ✅ 2. Gọi login API
    const response = await authService.login({
      identifier: values.identifier, // "admin@example.com"
      password: values.password,      // "password123"
    });
    
    // ✅ 3. Xử lý response (xem bước 4)
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setIsLoading(false);
  }
};
```

### AuthService.login()

**File:** `src/services/auth.service.ts`

```typescript
async login(credentials: LoginRequest): Promise<LoginResponse> {
  // ✅ 1. Gọi API endpoint
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login", // ← Next.js API route
    credentials
  );
  
  // ✅ 2. Parse response
  const data = this.handleResponse(response);
  
  // ✅ 3. Lưu token nếu có
  if (data.accessToken) {
    const { setAccessToken, setRefreshToken } = await import("@/lib/api/token");
    setAccessToken(data.accessToken); // ← Lưu vào localStorage
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
  }
  
  return data;
}
```

### API Client Request

**File:** `src/lib/api/client.ts`

```typescript
// Axios instance
const apiClient = axios.create({
  baseURL: "/api", // ← Next.js API routes
  timeout: 30000,
});

// ✅ Request interceptor
apiClient.interceptors.request.use((config) => {
  // Thêm token vào header nếu có (cho các request sau)
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Request được gửi:**
```
POST /api/auth/login
Headers: { "Content-Type": "application/json" }
Body: {
  "identifier": "admin@example.com",
  "password": "password123"
}
```

---

## Bước 4: Xử lý login và lưu token

### API Route Handler

**File:** `src/app/api/auth/login/route.ts` (Server-side)

```typescript
export async function POST(request: NextRequest) {
  // ✅ 1. Parse request body
  const body = await request.json();
  const validatedData = loginSchema.parse(body);

  // ✅ 2. Tìm user trong database
  const user = getUserByEmailOrUsername(validatedData.identifier);
  // File: src/lib/db/index.ts
  // Đọc từ: src/lib/db/users.json

  // ✅ 3. Verify password
  const isValid = await verifyPassword(
    validatedData.password,
    user.password
  );
  // File: src/lib/db/index.ts
  // Sử dụng: bcryptjs.compare()

  // ✅ 4. Generate tokens (fake JWT)
  const accessToken = `fake-jwt-token-${user.id}|${randomUUID()}`;
  const refreshToken = `fake-refresh-token-${randomUUID()}`;

  // ✅ 5. Return response
  return NextResponse.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      accessToken,
      refreshToken,
    },
    message: "Đăng nhập thành công",
    statusCode: 200,
  });
}
```

**Database lookup:**
- **File:** `src/lib/db/index.ts`
- **Data file:** `src/lib/db/users.json`
- **Function:** `getUserByEmailOrUsername()`

**Response:**
```json
{
  "data": {
    "user": {
      "id": "user-id-123",
      "email": "admin@example.com",
      "username": "admin",
      "name": "Admin User"
    },
    "accessToken": "fake-jwt-token-user-id-123|uuid-here",
    "refreshToken": "fake-refresh-token-uuid-here"
  },
  "message": "Đăng nhập thành công",
  "statusCode": 200
}
```

### Lưu trữ Token

**File:** `src/app/auth/login/page.tsx`

```typescript
// Sau khi nhận response từ authService.login()
if (response.accessToken) {
  // ✅ 1. Lưu vào localStorage (client-side)
  const { setAccessToken, setRefreshToken, setUserInfo } =
    await import("@/lib/api/token");
  
  setAccessToken(response.accessToken);
  // File: src/lib/api/token.ts
  // Implementation: localStorage.setItem("accessToken", token)
  
  if (response.refreshToken) {
    setRefreshToken(response.refreshToken);
    // localStorage.setItem("refreshToken", token)
  }
  
  // ✅ 2. Lưu user info tạm thời (cho fake API)
  if (response.user) {
    setUserInfo(response.user);
    // localStorage.setItem("userInfo", JSON.stringify(user))
  }

  // ✅ 3. Lưu vào cookies (server-side access)
  document.cookie = `accessToken=${response.accessToken}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `refreshToken=${response.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
  
  /**
   * 📌 GIẢI THÍCH CHI TIẾT VỀ COOKIES:
   * 
   * 1. Cookies được lưu ở đâu?
   *    - Cookies được lưu TRÊN TRÌNH DUYỆT (Browser)
   *    - Không phải lưu trên Next.js server
   *    - Browser tự động gửi cookies trong mọi request đến domain đó
   * 
   * 2. Tại sao cần cookies ngoài localStorage?
   *    - localStorage: Chỉ có thể đọc từ CLIENT (browser JavaScript)
   *    - cookies: Có thể đọc từ CẢ CLIENT và SERVER (Next.js middleware, API routes)
   * 
   * 3. Cookies dùng làm gì trong project này?
   *    a) Middleware authentication (src/middleware.ts):
   *       - Middleware chạy trên SERVER (Edge Runtime)
   *       - Không thể đọc localStorage (chỉ có trên browser)
   *       - Đọc cookies để check authentication
   *       - Redirect user nếu không có token
   * 
   *    b) Server Components (src/app/dashboard/page.tsx):
   *       - Server Components chạy trên SERVER
   *       - Cần token để fetch user data
   *       - Đọc cookies để lấy token
   *       - Gọi API với token để lấy user info
   * 
   *    c) API Routes (src/app/api/users/me/route.ts):
   *       - API routes chạy trên SERVER
   *       - Có thể đọc cookies từ request
   *       - Validate token và return user data
   * 
   * 4. Các tham số trong cookie:
   *    - `accessToken=${token}`: Tên và giá trị cookie
   *    - `path=/`: Cookie có hiệu lực cho tất cả routes
   *    - `max-age=86400`: Cookie hết hạn sau 86400 giây (24 giờ)
   *    - `SameSite=Lax`: Bảo mật - chỉ gửi cookie trong same-site requests
   * 
   * 5. So sánh localStorage vs cookies:
   * 
   *    localStorage:
   *    ✅ Chỉ client-side có thể đọc
   *    ✅ Không tự động gửi trong requests
   *    ✅ Lưu trữ lớn hơn (5-10MB)
   *    ✅ Không gửi đến server (bảo mật hơn cho sensitive data)
   *    ❌ Server không thể đọc
   * 
   *    cookies:
   *    ✅ Client và Server đều có thể đọc
   *    ✅ Tự động gửi trong mọi request
   *    ✅ Server có thể set/read (qua Set-Cookie header)
   *    ❌ Lưu trữ nhỏ hơn (4KB)
   *    ❌ Tự động gửi đến server (cần cẩn thận với sensitive data)
   * 
   * 6. Flow thực tế:
   * 
   *    Client-side (Browser):
   *    - User login → Lưu token vào localStorage VÀ cookies
   *    - localStorage: Dùng cho client-side API calls (axios interceptor)
   *    - cookies: Dùng để server có thể đọc
   * 
   *    Server-side (Next.js):
   *    - Middleware: Đọc cookies → Check token → Allow/Deny request
   *    - Server Component: Đọc cookies → Get token → Fetch user data
   *    - API Route: Đọc cookies → Validate token → Return data
   * 
   * 7. Ví dụ thực tế:
   * 
   *    Khi user truy cập /dashboard:
   *    1. Browser gửi request → Kèm theo cookies tự động
   *    2. Middleware (server) đọc cookies.get("accessToken")
   *    3. Nếu có token → Cho phép request tiếp tục
   *    4. Dashboard page (server) đọc cookies → Get token
   *    5. Gọi API /api/users/me với token → Get user data
   *    6. Render dashboard với user data
   * 
   *    Nếu chỉ dùng localStorage:
   *    - Middleware không thể đọc → Không thể protect routes
   *    - Server Components không thể fetch user data
   *    - Phải fetch user data từ client-side → Slower, không SEO-friendly
   */
}
```

**Storage locations:**

1. **localStorage (Browser):**
   - `accessToken` → `localStorage.getItem("accessToken")`
   - `refreshToken` → `localStorage.getItem("refreshToken")`
   - `userInfo` → `localStorage.getItem("userInfo")`
   - **File:** `src/lib/api/token.ts`

2. **Cookies (Browser + Server):**
   - `accessToken` → `document.cookie` (có thể đọc từ server)
   - `refreshToken` → `document.cookie`
   - **Đọc từ server:** `request.cookies.get("accessToken")`

### Cập nhật AuthContext

**File:** `src/app/auth/login/page.tsx`

```typescript
// ✅ Refetch user data để cập nhật AuthContext
await refetch();
// File: src/contexts/auth-context.tsx
// Function: refetch() → Gọi userService.getCurrentUser()
```

**Flow:**
1. `refetch()` được gọi
2. `getAccessToken()` → Đọc token từ localStorage (vừa lưu)
3. `userService.getCurrentUser()` → Gọi `/api/users/me`
4. API trả về user data
5. `setUser(userData)` → Cập nhật AuthContext state
6. Tất cả components dùng `useAuth()` sẽ nhận user mới

---

## Bước 5: Redirect về trang chủ

### Navigation

**File:** `src/app/auth/login/page.tsx`

```typescript
// ✅ Redirect về trang chủ
router.push("/");
router.refresh(); // ← Refresh server components
```

**📌 GIẢI THÍCH CHI TIẾT VỀ router.refresh():**

**1. router.refresh() làm gì?**
   - `router.refresh()` là Next.js App Router API
   - Nó **refresh/re-fetch** tất cả Server Components trong current route
   - Không làm full page reload (giữ client state)
   - Chỉ re-fetch data từ server và re-render Server Components

**2. Tại sao cần router.refresh() sau khi login?**

   **Vấn đề:**
   ```
   User login → Token được lưu vào cookies
   ↓
   router.push("/") → Navigate về trang chủ
   ↓
   ❌ Server Components vẫn dùng data cũ (từ cache)
   ❌ Middleware đã check token, nhưng Server Components chưa biết
   ❌ Có thể hiển thị "chưa login" mặc dù đã login
   ```

   **Giải pháp:**
   ```
   router.push("/") → Navigate
   ↓
   router.refresh() → Re-fetch Server Components
   ↓
   ✅ Server Components fetch lại data với token mới
   ✅ Hiển thị đúng trạng thái đã login
   ```

**3. Flow chi tiết:**

   **Không có router.refresh():**
   ```
   Login thành công
   ↓
   router.push("/")
   ↓
   Browser navigate → URL = "/"
   ↓
   Next.js serve cached HTML (từ lần trước)
   ↓
   ❌ Server Components không re-fetch
   ❌ Vẫn hiển thị data cũ (user = null)
   ❌ Header vẫn show "Đăng nhập" button
   ```

   **Có router.refresh():**
   ```
   Login thành công
   ↓
   router.push("/")
   ↓
   router.refresh() → Trigger re-fetch
   ↓
   Next.js re-fetch Server Components
   ↓
   Server Components chạy lại với cookies mới
   ↓
   ✅ Fetch user data với token mới
   ✅ Re-render với data mới
   ✅ Header hiển thị user dropdown
   ```

**4. Sự khác biệt:**

   | Method | Làm gì | Client State | Server Components |
   |--------|--------|--------------|-------------------|
   | `router.push()` | Navigate | ✅ Giữ nguyên | ❌ Dùng cache |
   | `router.refresh()` | Re-fetch | ✅ Giữ nguyên | ✅ Re-fetch |
   | `window.location.reload()` | Full reload | ❌ Mất hết | ✅ Re-fetch |

**5. Ví dụ thực tế trong project:**

   **Scenario: User login và redirect về home**

   ```typescript
   // src/app/auth/login/page.tsx
   const response = await authService.login(credentials);
   
   // Lưu token vào cookies
   document.cookie = `accessToken=${response.accessToken}; ...`;
   
   // Navigate về trang chủ
   router.push("/");
   
   // ✅ QUAN TRỌNG: Refresh Server Components
   router.refresh();
   ```

   **Trước router.refresh():**
   ```typescript
   // src/app/page.tsx (Server Component)
   export default async function HomePage() {
     // ❌ Vẫn dùng cached data (từ trước khi login)
     // ❌ Không biết user đã login
     return <MainLayout>...</MainLayout>;
   }
   ```

   **Sau router.refresh():**
   ```typescript
   // src/app/page.tsx (Server Component)
   export default async function HomePage() {
     // ✅ Re-fetch với cookies mới
     // ✅ Server Components chạy lại
     // ✅ Có thể đọc token từ cookies
     return <MainLayout>...</MainLayout>;
   }
   ```

**6. Khi nào cần router.refresh()?**

   ✅ **Cần dùng khi:**
   - User login/logout (thay đổi authentication state)
   - Update data mà Server Components cần
   - Thay đổi cookies/headers mà server cần đọc
   - Cần force re-fetch Server Components

   ❌ **Không cần khi:**
   - Chỉ navigate giữa các pages
   - Client-side state changes
   - Chỉ update Client Components

**7. Ví dụ khác trong project:**

   **Logout:**
   ```typescript
   // src/components/layout/header.tsx
   const handleSignOut = async () => {
     clearTokens(); // Clear localStorage
     document.cookie = "accessToken=; ..."; // Clear cookies
     setUser(null); // Clear AuthContext
     
     router.push("/");
     router.refresh(); // ✅ Re-fetch Server Components với cookies mới (empty)
   };
   ```

   **Sau logout:**
   - Server Components re-fetch
   - Middleware check → Không có token → Allow access
   - Server Components render với state "chưa login"

**8. Technical details:**

   **router.refresh() hoạt động như thế nào:**
   ```
   1. Client gọi router.refresh()
   ↓
   2. Next.js gửi request đến server với current route
   ↓
   3. Server re-execute Server Components
   ↓
   4. Server Components có thể đọc cookies/headers mới
   ↓
   5. Server render HTML mới
   ↓
   6. Client nhận HTML và update UI (không reload page)
   ```

   **Lưu ý:**
   - `router.refresh()` chỉ refresh Server Components
   - Client Components state được giữ nguyên
   - Không làm mất form inputs, scroll position, etc.

**Flow:**
1. `router.push("/")` → Navigate đến trang chủ
2. `router.refresh()` → Refresh server components (fetch data mới nếu cần)
3. Browser navigate → URL thay đổi thành `/`

### Re-render Home Page

**File:** `src/app/page.tsx`

```typescript
// Server Component re-render
export default function HomePage() {
  return (
    <MainLayout>
      {/* Home page content */}
    </MainLayout>
  );
}
```

**Layout re-render:**
- `AuthProvider` đã có user data (từ bước 4)
- `Header` component sẽ nhận user mới từ `useAuth()`

---

## Bước 6: Header hiển thị user info

### Header Component Re-render

**File:** `src/components/layout/header.tsx`

```typescript
export function Header() {
  const { user, loading, setUser } = useAuth(); // ✅ user đã được set từ AuthContext

  // ✅ Bây giờ user !== null
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>
            <Avatar>{userInitials}</Avatar>
            <span>{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href="/profile">Hồ sơ</Link>
          </DropdownMenuItem>
          {userIsAdmin && (
            <DropdownMenuItem>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleSignOut}>
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
```

**State:**
- `user = { id, email, name, ... }` (từ AuthContext)
- `loading = false`
- Header hiển thị: User dropdown với avatar và name

**Data source:**
- AuthContext state (đã được cập nhật ở bước 4)
- User data từ `/api/users/me` response

---

## Bước 7: User truy cập Dashboard

### User Action

```
Click "Dashboard" trong dropdown → Navigate to /dashboard
```

### Navigation

**File:** `src/components/layout/header.tsx`

```typescript
<Link href="/dashboard">Dashboard</Link>
```

**Route:** `src/app/dashboard/page.tsx`

---

## Bước 8: Middleware kiểm tra authentication

### Middleware Execution

**File:** `src/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; // "/dashboard"
  
  // ✅ 1. Đọc token từ cookies
  // 📌 QUAN TRỌNG: Middleware chạy trên SERVER (Edge Runtime)
  //    - Không thể đọc localStorage (chỉ có trên browser)
  //    - Phải đọc từ cookies để check authentication
  //    - Browser tự động gửi cookies trong request headers
  const token = request.cookies.get("accessToken")?.value;
  // Token đã được set ở bước 4: "fake-jwt-token-user-id-123|uuid"
  
  // 📌 Cách browser gửi cookies:
  //    Request Headers:
  //    Cookie: accessToken=fake-jwt-token-123|uuid; refreshToken=fake-refresh-token-uuid
  //    Next.js tự động parse thành request.cookies object

  // ✅ 2. Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // "/dashboard" matches ROUTES.DASHBOARD.ROOT → isProtectedRoute = true

  // ✅ 3. Check authentication
  if (isProtectedRoute && !token) {
    // ← Không có token → Redirect to login
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ 4. Có token → Cho phép tiếp tục
  return NextResponse.next();
}
```

**Kết quả:**
- Token có trong cookies → `NextResponse.next()`
- Request tiếp tục đến dashboard page

**Lưu ý:**
- Middleware chạy trên **Edge Runtime** (server-side)
- Chỉ check token existence, không validate token format
- Token validation sẽ được làm ở Server Component

**📌 Tại sao middleware cần cookies?**
```
Browser Request
    ↓
[Middleware chạy trên SERVER]
    ↓
Cần check authentication
    ↓
❌ Không thể đọc localStorage (chỉ có trên browser)
✅ Phải đọc cookies (browser tự động gửi trong request)
    ↓
request.cookies.get("accessToken")
```

---

## Bước 9: Server Component fetch user data

### Dashboard Page

**File:** `src/app/dashboard/page.tsx` (Server Component)

```typescript
export default async function DashboardPage() {
  // ✅ 1. Check authentication và get user
  let user;
  try {
    user = await requireServerAdmin();
    // File: src/lib/api/server-auth.ts
  } catch (error) {
    redirect("/auth/login"); // ← Nếu không authenticated
  }

  // ✅ 2. Render dashboard với user data
  return (
    <DashboardLayout>
      <div>Welcome {user.name}!</div>
    </DashboardLayout>
  );
}
```

### requireServerAdmin()

**File:** `src/lib/api/server-auth.ts`

```typescript
export async function requireServerAdmin() {
  // ✅ 1. Get token từ cookies
  const token = await getServerToken();
  // Implementation: cookies().get("accessToken")?.value

  if (!token) {
    throw new Error("Unauthorized");
  }

  // ✅ 2. Get user từ token
  const user = await getServerUser();
  // Implementation: Gọi /api/users/me với token

  // ✅ 3. Check admin role
  if (!isAdmin(user.email, user.username)) {
    throw new Error("Forbidden");
  }

  return user;
}
```

### getServerUser()

**File:** `src/lib/api/server-auth.ts`

```typescript
export async function getServerUser(): Promise<User> {
  // ✅ 1. Get token từ cookies
  // 📌 QUAN TRỌNG: Function này chạy trên SERVER
  //    - Server Components không thể dùng localStorage
  //    - Phải đọc token từ cookies
  //    - cookies() là Next.js API để đọc cookies trên server
  const token = await getServerToken();
  // Implementation:
  // import { cookies } from "next/headers";
  // const token = cookies().get("accessToken")?.value;

  // ✅ 2. Call API to get user
  // 📌 Server-side fetch với token từ cookies
  const response = await fetch(`${baseURL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`, // Token từ cookies
    },
  });

  // ✅ 3. Parse response
  const data = await response.json();
  return data.data; // User object
}
```

**📌 Tại sao Server Component cần cookies?**
```
Server Component (chạy trên SERVER)
    ↓
Cần fetch user data
    ↓
Cần token để authenticate
    ↓
❌ Không thể dùng localStorage (chỉ có trên browser)
✅ Phải đọc từ cookies (Next.js cookies() API)
    ↓
const token = cookies().get("accessToken")?.value
    ↓
Gọi API với token → Get user data
```

### API Route: /api/users/me

**File:** `src/app/api/users/me/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // ✅ 1. Get token từ Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // ✅ 2. Extract user ID từ token (fake JWT)
  // Format: "fake-jwt-token-{userId}|{random}"
  let userId: string | null = null;
  if (token.startsWith("fake-jwt-token-")) {
    const parts = token.replace("fake-jwt-token-", "").split("|");
    userId = parts[0]; // "user-id-123"
  }

  // ✅ 3. Get user từ database
  const user = getUserById(userId);
  // File: src/lib/db/index.ts
  // Data: src/lib/db/users.json

  // ✅ 4. Return user data
  const { password, ...userWithoutPassword } = user;
  return NextResponse.json({
    data: userWithoutPassword,
    message: "Success",
    statusCode: 200,
  });
}
```

**Data flow:**
1. Server Component gọi `requireServerAdmin()`
2. `requireServerAdmin()` gọi `getServerUser()`
3. `getServerUser()` fetch `/api/users/me` với token
4. API route extract user ID từ token
5. Query database để lấy user data
6. Return user object về Server Component

**Database:**
- **File:** `src/lib/db/index.ts`
- **Data file:** `src/lib/db/users.json`
- **Function:** `getUserById(userId)`

---

## Bước 10: Render Dashboard

### Dashboard Layout

**File:** `src/components/layout/dashboard-layout.tsx` (Client Component)

```typescript
"use client";

export function DashboardLayout({ children }) {
  const { user, loading } = useAuth(); // ✅ Lấy từ AuthContext

  return (
    <div>
      <Sidebar />
      <TopBar user={user} />
      <main>{children}</main>
    </div>
  );
}
```

### Dashboard Content

**File:** `src/app/dashboard/page.tsx`

```typescript
export default async function DashboardPage() {
  const user = await requireServerAdmin(); // ✅ User đã được fetch ở bước 9

  return (
    <DashboardLayout>
      <div>
        <h2>Chào mừng trở lại, {user.name}!</h2>
        {/* Dashboard content */}
      </div>
    </DashboardLayout>
  );
}
```

**Render flow:**
1. Server Component render với user data
2. HTML được gửi về browser
3. Client Components (DashboardLayout) hydrate
4. Dashboard hiển thị với user info

---

## Tổng kết Data Flow

### Storage Locations

#### 1. localStorage (Client-side only)

**File:** `src/lib/api/token.ts`

```typescript
// Lưu trữ
localStorage.setItem("accessToken", token);
localStorage.setItem("refreshToken", token);
localStorage.setItem("userInfo", JSON.stringify(user));

// Đọc
localStorage.getItem("accessToken");
```

**Khi nào dùng:**
- Client Components cần token
- API client tự động thêm vào headers
- AuthContext check authentication

**Files sử dụng:**
- `src/lib/api/token.ts` - Token utilities
- `src/lib/api/client.ts` - API client interceptor
- `src/contexts/auth-context.tsx` - AuthProvider

**📌 localStorage hoạt động như thế nào:**
```
Browser (Client-side)
    ↓
localStorage.setItem("accessToken", token)
    ↓
Lưu vào browser storage (chỉ browser có thể đọc)
    ↓
API Client (axios) đọc từ localStorage
    ↓
Tự động thêm vào request header:
Authorization: Bearer {token}
```

**Ví dụ trong code:**
```typescript
// src/lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // ← Đọc từ localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 2. Cookies (Client + Server)

**Lưu trữ (Client-side):**
```typescript
// Lưu từ browser (client-side)
document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
```

**Đọc từ Server:**
```typescript
// Middleware
request.cookies.get("accessToken")?.value;

// Server Components / API Routes
import { cookies } from "next/headers";
cookies().get("accessToken")?.value;
```

**Khi nào dùng:**
- Middleware check authentication (server-side)
- Server Components fetch user data (server-side)
- Server-side API calls

**Files sử dụng:**
- `src/middleware.ts` - Route protection
- `src/lib/api/server-auth.ts` - Server-side auth
- `src/app/dashboard/page.tsx` - Server Component

**📌 Cookies hoạt động như thế nào:**

**1. Lưu trữ (Client-side):**
```
Browser (Client-side)
    ↓
document.cookie = "accessToken=token-value; path=/; max-age=86400"
    ↓
Browser lưu cookie vào storage
    ↓
Browser tự động gửi cookie trong mọi request đến domain đó
```

**2. Browser tự động gửi cookies:**
```
User navigate to /dashboard
    ↓
Browser tạo request
    ↓
Browser tự động thêm cookies vào request headers:
    Cookie: accessToken=token-value; refreshToken=refresh-value
    ↓
Request gửi đến Next.js server
```

**3. Server đọc cookies:**
```
Next.js Server nhận request
    ↓
Request có header: Cookie: accessToken=token-value
    ↓
Middleware / Server Component đọc:
    request.cookies.get("accessToken") → "token-value"
    ↓
Sử dụng token để authenticate
```

**📌 So sánh localStorage vs Cookies:**

| Tính năng | localStorage | Cookies |
|-----------|--------------|---------|
| **Lưu ở đâu** | Browser storage | Browser storage |
| **Client đọc được** | ✅ Có | ✅ Có |
| **Server đọc được** | ❌ Không | ✅ Có (tự động gửi) |
| **Tự động gửi** | ❌ Không | ✅ Có (trong mọi request) |
| **Kích thước** | ~5-10MB | ~4KB |
| **Bảo mật** | ✅ Tốt hơn (không gửi tự động) | ⚠️ Cần cẩn thận (tự động gửi) |
| **Use case** | Client-side state | Server-side auth |

**📌 Tại sao project này dùng CẢ HAI?**

```
localStorage:
  ✅ API Client (axios) đọc token → Thêm vào Authorization header
  ✅ AuthContext check authentication (client-side)
  ✅ Không tự động gửi → Bảo mật hơn cho client-side calls

Cookies:
  ✅ Middleware check authentication (server-side)
  ✅ Server Components fetch user data (server-side)
  ✅ Tự động gửi → Tiện cho server-side validation
```

**Ví dụ thực tế:**

**Scenario 1: Client-side API call**
```typescript
// Client Component
const response = await userService.getCurrentUser();
// → axios đọc token từ localStorage
// → Thêm vào header: Authorization: Bearer {token}
// → Gọi /api/users/me
```

**Scenario 2: Server-side route protection**
```typescript
// Middleware
const token = request.cookies.get("accessToken")?.value;
// → Browser tự động gửi cookie trong request
// → Middleware đọc và check
// → Allow/Deny request
```

**Scenario 3: Server Component fetch data**
```typescript
// Server Component
const user = await requireServerAdmin();
// → Đọc token từ cookies (server-side)
// → Gọi API với token
// → Return user data
```

#### 3. Database (File-based)

**File:** `src/lib/db/users.json`

```json
[
  {
    "id": "user-id-123",
    "email": "admin@example.com",
    "password": "$2a$10$...", // bcrypt hash
    "name": "Admin User"
  }
]
```

**Khi nào dùng:**
- Verify login credentials
- Get user data từ user ID
- Update user information

**Files sử dụng:**
- `src/lib/db/index.ts` - Database functions
- `src/app/api/auth/login/route.ts` - Login API
- `src/app/api/users/me/route.ts` - Get user API

### State Management

#### AuthContext (Global Client State)

**File:** `src/contexts/auth-context.tsx`

```typescript
// State
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);

// Update
setUser(userData); // Từ login hoặc refetch
```

**Khi nào update:**
- Login thành công → `refetch()` → `setUser()`
- Logout → `setUser(null)`
- Profile update → `refetch()` → `setUser()`

**Components sử dụng:**
- `Header` - Hiển thị user info
- `DashboardLayout` - User dropdown
- `ProfilePage` - User data

### Request Flow Summary

```
1. User vào trang chủ
   → AuthProvider mount → Check localStorage → user = null
   → Header render → Hiển thị "Đăng nhập" button

2. User click "Đăng nhập"
   → Navigate to /auth/login
   → Middleware check → Cho phép vào (không có token)

3. User submit form
   → authService.login() → POST /api/auth/login
   → API verify credentials → Generate tokens
   → Lưu tokens vào localStorage + cookies
   → refetch() → GET /api/users/me → setUser()

4. Redirect về trang chủ
   → Header re-render → user !== null
   → Hiển thị user dropdown

5. User click "Dashboard"
   → Navigate to /dashboard
   → Middleware check → Có token → Cho phép
   → DashboardPage (Server Component)
   → requireServerAdmin() → getServerUser()
   → GET /api/users/me (server-side)
   → Extract user ID từ token → Query database
   → Return user → Render dashboard
```

### Key Files Reference

| Chức năng | File | Loại |
|-----------|------|------|
| Root Layout | `src/app/layout.tsx` | Server Component |
| Auth Context | `src/contexts/auth-context.tsx` | Client Component |
| Header | `src/components/layout/header.tsx` | Client Component |
| Login Page | `src/app/auth/login/page.tsx` | Client Component |
| Login API | `src/app/api/auth/login/route.ts` | API Route |
| Get User API | `src/app/api/users/me/route.ts` | API Route |
| Middleware | `src/middleware.ts` | Middleware |
| Token Utils | `src/lib/api/token.ts` | Utilities |
| Server Auth | `src/lib/api/server-auth.ts` | Server Utilities |
| Database | `src/lib/db/index.ts` | Database Functions |
| Dashboard Page | `src/app/dashboard/page.tsx` | Server Component |

### Tips để học

1. **Trace một request:**
   - Bắt đầu từ user action
   - Follow code từ component → service → API → database
   - Xem data flow và state updates

2. **Đặt breakpoints:**
   - Browser DevTools cho Client Components
   - Console.log cho Server Components
   - Network tab để xem API calls

3. **Hiểu Server vs Client:**
   - Server Components: Chạy trên server, không có JavaScript
   - Client Components: Chạy trên browser, có interactivity

4. **State management:**
   - Local state: `useState` trong component
   - Global state: `Context API` (AuthContext)
   - Server state: Fetch trong Server Components

## 🎯 Bài tập thực hành

1. **Trace logout flow:**
   - Tìm `handleSignOut` trong Header
   - Xem cách clear tokens
   - Verify AuthContext update

2. **Thêm console.log:**
   - Thêm logs vào mỗi bước
   - Xem execution order
   - Hiểu async flow

3. **Modify flow:**
   - Thêm redirect sau login
   - Thêm remember me feature
   - Thêm token refresh logic
