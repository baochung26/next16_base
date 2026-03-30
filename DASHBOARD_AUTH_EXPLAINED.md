# Giải thích: Xử lý quyền truy cập Dashboard (Admin Only)

## Tổng quan

Dashboard chỉ cho phép user có quyền **admin** truy cập. Việc kiểm tra quyền được thực hiện ở **client-side** thông qua component `DashboardLayout`.

---

## 1. Nơi xử lý quyền truy cập

### 📁 File chính: `src/components/layout/dashboard-layout.tsx`

Đây là component wrapper bao quanh tất cả các trang dashboard. Nó có nhiệm vụ:
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra user có phải admin không
- Redirect nếu không đủ điều kiện

### 🔍 Các điểm kiểm tra trong `DashboardLayout`:

#### **A. useEffect - Kiểm tra khi component mount hoặc user thay đổi:**

```typescript
useEffect(() => {
  if (!loading) {
    if (!user) {
      // Chưa đăng nhập → redirect về trang login
      router.push("/auth/login");
    } else {
      // Đã đăng nhập → kiểm tra có phải admin không
      const userIsAdmin = isAdminUser(user);
      
      if (!userIsAdmin) {
        // Không phải admin → redirect về trang chủ
        router.push("/");
      }
    }
  }
}, [user, loading, router]);
```

**Giải thích:**
- `loading`: Đang tải thông tin user từ API/localStorage
- `user`: Thông tin user từ `AuthContext`
- Nếu `!user` → chưa đăng nhập → redirect `/auth/login`
- Nếu có `user` nhưng `!isAdminUser(user)` → không phải admin → redirect `/`

#### **B. Early return - Ngăn render nếu không phải admin:**

```typescript
if (loading) {
  return <div>Đang tải...</div>; // Hiển thị loading
}

if (!user || !isAdminUser(user)) {
  return null; // Không render gì, useEffect sẽ redirect
}
```

**Giải thích:**
- Nếu đang loading → hiển thị spinner
- Nếu không có user hoặc không phải admin → return `null` (không render)
- useEffect sẽ tự động redirect, nên không cần render UI

---

## 2. Hàm kiểm tra quyền Admin

### 📁 File: `src/lib/utils/auth.ts`

#### **A. Hàm `isAdmin()` - Kiểm tra cơ bản:**

```typescript
export function isAdmin(
  email?: string | null,
  username?: string | null,
  role?: string | null
): boolean {
  // Ưu tiên kiểm tra role (cách mới)
  if (role) {
    return role.toLowerCase() === "admin";
  }

  // Fallback: kiểm tra email/username (backward compatibility)
  if (!email && !username) return false;

  return (
    (email && ADMIN_CONFIG.EMAILS.includes(email.toLowerCase())) ||
    (username && ADMIN_CONFIG.USERNAMES.includes(username.toLowerCase()))
  );
}
```

**Logic:**
1. **Ưu tiên kiểm tra `role`**: Nếu `role === "admin"` → return `true`
2. **Fallback**: Nếu không có role, kiểm tra email/username trong `ADMIN_CONFIG`

#### **B. Hàm `isAdminUser()` - Kiểm tra từ User object:**

```typescript
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  
  return isAdmin(user.email, user.username, user.role);
}
```

**Giải thích:**
- Nhận vào object `User` (có `id`, `email`, `firstName`, `lastName`, `role`, ...)
- Gọi `isAdmin()` với các thông tin từ user
- Return `true` nếu user là admin

---

## 3. Luồng hoạt động khi truy cập Dashboard

```
1. User truy cập /dashboard
   ↓
2. DashboardPage render → wrap trong <DashboardLayout>
   ↓
3. DashboardLayout mount:
   - useAuth() → lấy user từ AuthContext
   - loading = true → hiển thị "Đang tải..."
   ↓
4. AuthContext refetch() hoàn thành:
   - Nếu có token → lấy user từ localStorage hoặc API
   - loading = false
   ↓
5. useEffect trong DashboardLayout chạy:
   ├─ Nếu !user → router.push("/auth/login")
   ├─ Nếu user nhưng !isAdminUser(user) → router.push("/")
   └─ Nếu user và isAdminUser(user) → tiếp tục render
   ↓
6. Render dashboard UI (sidebar, header, content)
```

---

## 4. Các trang Dashboard con

Tất cả các trang con trong `/dashboard/*` đều:
- **Không cần kiểm tra quyền riêng**
- **Dựa vào `DashboardLayout`** để kiểm tra

**Ví dụ:**
- `/dashboard/users` → wrap trong `<DashboardLayout>` → tự động được bảo vệ
- `/dashboard/products` → wrap trong `<DashboardLayout>` → tự động được bảo vệ

**Code mẫu:**
```typescript
// src/app/dashboard/users/page.tsx
export default function UsersPage() {
  // Không cần check quyền ở đây
  // DashboardLayout sẽ xử lý
  
  return (
    <DashboardLayout>
      {/* Content */}
    </DashboardLayout>
  );
}
```

---

## 5. User data từ đâu?

### AuthContext (`src/contexts/auth-context.tsx`)

```typescript
const { user, loading, setUser } = useAuth();
```

**User được lấy từ:**
1. **localStorage** (cache từ lần login trước)
2. **API** `/users/profile` (nếu có token và endpoint available)

**User object có cấu trúc:**
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";  // ← Quan trọng!
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. Tóm tắt các file liên quan

| File | Vai trò |
|------|---------|
| `src/components/layout/dashboard-layout.tsx` | **Component chính** - Kiểm tra và redirect |
| `src/lib/utils/auth.ts` | **Hàm kiểm tra** - `isAdmin()`, `isAdminUser()` |
| `src/contexts/auth-context.tsx` | **Quản lý state** - Cung cấp `user` cho components |
| `src/app/dashboard/page.tsx` | **Trang dashboard** - Wrap trong `DashboardLayout` |

---

## 7. Cách test

### Test với user thường:
1. Login với user có `role: "user"`
2. Truy cập `/dashboard`
3. **Kết quả**: Tự động redirect về `/`

### Test với admin:
1. Login với user có `role: "admin"`
2. Truy cập `/dashboard`
3. **Kết quả**: Hiển thị dashboard bình thường

### Test chưa đăng nhập:
1. Logout hoặc xóa token
2. Truy cập `/dashboard`
3. **Kết quả**: Tự động redirect về `/auth/login`

---

## 8. Lưu ý quan trọng

### ⚠️ Client-side only
- Kiểm tra quyền hiện tại chỉ ở **client-side**
- User có thể bypass bằng cách sửa code trong browser (nhưng API sẽ reject)
- **Nên thêm server-side check** cho production

### 🔒 Bảo mật thực sự ở API
- Các API endpoints admin (ví dụ: `GET /admin/users`) sẽ kiểm tra JWT token và role
- Nếu user không phải admin, API sẽ trả về `403 Forbidden`
- Client-side check chỉ để UX tốt hơn (redirect sớm, không cần đợi API fail)

---

## 9. Cải thiện có thể làm

### Thêm Server-side check:
```typescript
// src/app/dashboard/layout.tsx (Next.js 13+ App Router)
import { requireServerAdmin } from "@/lib/api/server-auth";

export default async function DashboardLayout({ children }) {
  await requireServerAdmin(); // Check ở server-side
  
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
```

### Thêm Middleware:
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check token và role ở đây
  }
}
```

---

## Kết luận

**Xử lý quyền truy cập Dashboard nằm ở:**
1. ✅ **`DashboardLayout` component** - Kiểm tra và redirect
2. ✅ **`isAdminUser()` function** - Logic kiểm tra quyền
3. ✅ **`AuthContext`** - Cung cấp thông tin user

**Cách hoạt động:**
- Client-side check → redirect nếu không phải admin
- API endpoints → reject request nếu không phải admin (bảo mật thực sự)
