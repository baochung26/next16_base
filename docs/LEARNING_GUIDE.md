# Hướng dẫn Học React & Next.js qua Project

Tài liệu này giúp bạn hiểu các khái niệm quan trọng của React và Next.js thông qua code thực tế trong project.

## 📋 Mục lục

- [React Rendering Model](#react-rendering-model)
- [Routing & Layout](#routing--layout)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Hooks & Lifecycle](#hooks--lifecycle)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

## 🎨 React Rendering Model

### Server Component vs Client Component

#### Server Component (Mặc định)

**Đặc điểm:**
- Chạy **chỉ trên server** (Node.js)
- Không có JavaScript bundle gửi về browser
- Có thể truy cập database, file system, API keys
- Không thể dùng hooks (`useState`, `useEffect`, etc.)
- Không thể dùng event handlers (`onClick`, `onChange`, etc.)

**Ví dụ trong project:**

```typescript
// src/app/dashboard/page.tsx
// Đây là Server Component (không có "use client")
import { requireServerAdmin } from "@/lib/api/server-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function DashboardPage() {
  // ✅ Có thể await async functions
  const user = await requireServerAdmin();
  
  // ✅ Có thể fetch data trực tiếp
  // ✅ Có thể truy cập database
  
  return (
    <DashboardLayout>
      <div>Welcome {user.name}</div>
    </DashboardLayout>
  );
}
```

**Khi nào dùng Server Component:**
- Fetch data từ database/API
- Truy cập backend resources (API keys, tokens)
- Giảm JavaScript bundle size
- SEO-important content

#### Client Component

**Đặc điểm:**
- Chạy **trên cả server và browser** (hydration)
- Có JavaScript bundle gửi về browser
- Có thể dùng hooks và event handlers
- Có thể tương tác với user

**Ví dụ trong project:**

```typescript
// src/app/auth/login/page.tsx
"use client"; // ← Phải có directive này

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // ✅ Có thể dùng hooks
  const [email, setEmail] = useState("");
  const router = useRouter();
  
  // ✅ Có thể dùng event handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    // ...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
}
```

**Khi nào dùng Client Component:**
- Cần interactivity (onClick, onChange)
- Cần hooks (useState, useEffect)
- Cần browser APIs (localStorage, window)
- Forms và user interactions

### Khi nào chạy trên Server, khi nào trên Browser?

#### Server-Side Rendering (SSR)

```
Request → Server → Render HTML → Send to Browser → Hydrate
```

**Ví dụ:**
```typescript
// Server Component
export default async function Page() {
  // ✅ Chạy trên SERVER
  const data = await fetch("https://api.example.com/data");
  return <div>{data.title}</div>;
}
```

#### Client-Side Rendering (CSR)

```
Request → Server → Send HTML + JS → Browser → Execute JS → Render
```

**Ví dụ:**
```typescript
// Client Component
"use client";
export default function Page() {
  // ✅ Chạy trên BROWSER (sau hydration)
  useEffect(() => {
    fetch("https://api.example.com/data").then(...);
  }, []);
  return <div>...</div>;
}
```

#### Static Site Generation (SSG)

```
Build Time → Generate HTML → Serve Static Files
```

**Ví dụ:**
```typescript
// Server Component với generateStaticParams
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

### Hydration là gì?

**Hydration** là quá trình React "khởi động" trên browser sau khi nhận HTML từ server.

```
1. Server render → HTML (không có interactivity)
2. Browser nhận HTML → Hiển thị ngay (fast initial load)
3. React JS bundle load → "Hydrate" HTML → Thêm interactivity
```

**Ví dụ trong project:**

```typescript
// src/components/theme-toggle.tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // ✅ Chạy sau khi hydration
    setMounted(true);
  }, []);
  
  // Tránh hydration mismatch
  if (!mounted) return null;
  
  return <button>Toggle Theme</button>;
}
```

**Tại sao cần `mounted` check?**
- Server render: `mounted = false` → return `null`
- Browser hydration: `mounted = false` → return `null` (match!)
- Sau hydration: `mounted = true` → render button

## 🗺️ Routing & Layout

### App Router hoạt động thế nào?

Next.js 13+ sử dụng **App Router** dựa trên file system:

```
src/app/
├── page.tsx          → / (home page)
├── layout.tsx        → Root layout (wrap tất cả pages)
├── about/
│   └── page.tsx      → /about
├── auth/
│   ├── login/
│   │   └── page.tsx  → /auth/login
│   └── register/
│       └── page.tsx  → /auth/register
└── dashboard/
    ├── layout.tsx    → Layout cho /dashboard/*
    ├── page.tsx      → /dashboard
    └── users/
        └── page.tsx  → /dashboard/users
```

### layout.tsx

**Layout** wrap tất cả pages trong route segment và nested routes.

**Ví dụ trong project:**

```typescript
// src/app/layout.tsx (Root Layout)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children} {/* ← Tất cả pages được render ở đây */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Layout hierarchy:**
```
Root Layout (app/layout.tsx)
  └── Dashboard Layout (app/dashboard/layout.tsx)
      └── Page (app/dashboard/users/page.tsx)
```

**Đặc điểm:**
- Layout không re-render khi navigate
- State được preserve trong layout
- Có thể có multiple layouts (nested)

### page.tsx

**Page** là UI unique cho route.

```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}
```

**Quy tắc:**
- Mỗi route phải có `page.tsx`
- `page.tsx` là Server Component mặc định
- Có thể là Client Component nếu cần (`"use client"`)

### loading.tsx

**Loading UI** hiển thị khi page đang load.

```typescript
// src/app/loading.tsx
import { Loading } from "@/components/loading";

export default function GlobalLoading() {
  return <Loading size="lg" text="Đang tải..." />;
}
```

**Hoạt động:**
- Tự động hiển thị khi page đang fetch data
- Suspense boundary tự động
- Có thể có loading riêng cho từng route

**Ví dụ:**
```
app/
├── loading.tsx        → Loading cho tất cả routes
└── dashboard/
    └── loading.tsx    → Loading riêng cho dashboard
```

### error.tsx

**Error UI** hiển thị khi có lỗi.

```typescript
// src/app/error.tsx
"use client"; // Error boundaries phải là Client Component

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Đặc điểm:**
- Phải là Client Component
- Nhận `error` và `reset` props
- Chỉ catch errors trong page/layout, không catch trong layout children

### Route Groups

**Route Groups** (`(folder)`) không tạo route segment.

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx   → /login (không có /auth)
│   └── register/
│       └── page.tsx   → /register
└── (marketing)/
    ├── about/
    └── features/
```

**Use case:**
- Tổ chức routes
- Shared layouts cho nhóm routes
- Không ảnh hưởng URL structure

### Middleware

**Middleware** chạy trước request được xử lý.

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  
  // Protect routes
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  
  return NextResponse.next();
}
```

**Use cases:**
- Authentication/Authorization
- Redirects
- Headers manipulation
- A/B testing

## 📊 Data Flow

### Fetch Data ở đâu?

#### 1. Server Component (Recommended)

```typescript
// ✅ Tốt nhất: Fetch trong Server Component
export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  const json = await data.json();
  
  return <div>{json.title}</div>;
}
```

**Lợi ích:**
- SEO friendly
- Fast initial load
- Không expose API keys
- Giảm JavaScript bundle

#### 2. Client Component với useEffect

```typescript
// ⚠️ Chỉ dùng khi cần interactivity
"use client";
export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch("/api/data").then(res => res.json()).then(setData);
  }, []);
  
  return <div>{data?.title}</div>;
}
```

**Khi nào dùng:**
- Real-time data
- User-triggered fetching
- Client-only data

#### 3. Route Handlers (API Routes)

```typescript
// src/app/api/users/route.ts
export async function GET() {
  const users = await getUsersFromDB();
  return NextResponse.json({ users });
}
```

**Use case:**
- Proxy API calls
- Hide API keys
- Transform data

### Khi nào nên Fetch Server, khi nào Client?

#### Fetch Server khi:
- ✅ Initial page load
- ✅ SEO-important content
- ✅ Sensitive data (API keys)
- ✅ Database queries
- ✅ Static/slow-changing data

**Ví dụ:**
```typescript
// Server Component
export default async function DashboardPage() {
  const user = await requireServerAuth(); // ✅ Server-side
  const stats = await getDashboardStats(); // ✅ Server-side
  
  return <Dashboard user={user} stats={stats} />;
}
```

#### Fetch Client khi:
- ✅ User interactions (search, filter)
- ✅ Real-time updates
- ✅ Personalization
- ✅ Form submissions

**Ví dụ:**
```typescript
// Client Component
"use client";
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  
  const handleSearch = async () => {
    // ✅ Client-side fetch (user-triggered)
    const res = await fetch(`/api/search?q=${query}`);
    const data = await res.json();
    setResults(data);
  };
  
  return <SearchForm onSearch={handleSearch} />;
}
```

### Cache, Revalidate, SSR, ISR

#### Caching trong Next.js

**Request Memoization:**
```typescript
// Tự động cache trong cùng request
async function getData() {
  const res = await fetch("https://api.example.com/data");
  return res.json();
}

// Trong cùng component tree, chỉ fetch 1 lần
export default async function Page() {
  const data1 = await getData(); // Fetch
  const data2 = await getData(); // Cache (reuse)
}
```

**Data Cache:**
```typescript
// Cache với revalidation
fetch("https://api.example.com/data", {
  next: { revalidate: 3600 } // Revalidate mỗi 1 giờ
});
```

#### SSR (Server-Side Rendering)

Render HTML trên server cho mỗi request.

```typescript
// Mặc định trong Server Components
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store" // Force SSR
  });
  return <div>{data.title}</div>;
}
```

#### ISR (Incremental Static Regeneration)

Generate static pages, revalidate định kỳ.

```typescript
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 } // Revalidate mỗi 1 giờ
  });
  return <div>{data.title}</div>;
}
```

**Flow:**
```
1. Build time → Generate static page
2. Request → Serve static page (fast!)
3. Background → Revalidate (nếu cần)
4. Next request → Serve updated page
```

## 🗂️ State Management

### Local State (useState)

**Dùng cho:** Component-specific state

```typescript
// src/app/dashboard/users/page.tsx
"use client";

export default function UsersPage() {
  // ✅ Local state cho component này
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsDialogOpen(true)}>Open</button>
      {isDialogOpen && <Dialog />}
    </div>
  );
}
```

### Context API (Global State)

**Dùng cho:** Shared state across components

```typescript
// src/contexts/auth-context.tsx
"use client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage
function Component() {
  const { user } = useAuth(); // ✅ Access global state
  return <div>{user?.name}</div>;
}
```

**Ví dụ trong project:**
- `AuthContext` - User authentication state
- `ThemeProvider` - Theme state (dark/light)

### Server State vs Client State

#### Server State
- Data từ API/database
- Shared across users
- Cần refetch khi stale

**Ví dụ:**
```typescript
// Server Component
export default async function Page() {
  const users = await getUsers(); // ✅ Server state
  return <UserList users={users} />;
}
```

#### Client State
- UI state (modals, forms)
- User preferences
- Temporary data

**Ví dụ:**
```typescript
// Client Component
"use client";
export default function Component() {
  const [isOpen, setIsOpen] = useState(false); // ✅ Client state
  return <Modal open={isOpen} />;
}
```

## 🪝 Hooks & Lifecycle

### useState

**Quản lý state trong component.**

```typescript
const [count, setCount] = useState(0);

// Update state
setCount(count + 1);
// Hoặc với function
setCount(prev => prev + 1);
```

**Lưu ý:**
- State updates là async
- Re-render khi state thay đổi
- State được preserve giữa re-renders

### useEffect

**Side effects sau render.**

`useEffect` cho phép bạn thực hiện **side effects** (tác dụng phụ) sau khi component đã render xong. Side effects là những thao tác không liên quan đến việc render UI, như:
- Fetch data từ API
- Subscribe/unsubscribe events
- Set timers/intervals
- Update document title
- Logging, analytics

#### 1. Cú pháp cơ bản

```typescript
useEffect(() => {
  // Code chạy sau mỗi render
  console.log("Component rendered");
});
```

**⚠️ Lưu ý:** Không có dependency array → chạy **sau mỗi lần render** (có thể gây infinite loop nếu setState trong đây).

#### 2. Chạy 1 lần sau mount (Empty dependency array)

```typescript
useEffect(() => {
  // Chạy 1 lần duy nhất sau khi component mount (lần đầu render)
  fetchData();
}, []); // ← Empty array = không phụ thuộc vào gì cả
```

**Khi nào dùng:**
- Fetch initial data khi component mount
- Setup subscriptions, timers
- One-time initialization

**Ví dụ trong project:**
```typescript
// src/contexts/auth-context.tsx
useEffect(() => {
  // Fetch user khi component mount lần đầu
  refetch();
}, [refetch]); // refetch được wrap trong useCallback nên stable
```

#### 3. Chạy khi dependencies thay đổi

```typescript
useEffect(() => {
  // Chạy khi `userId` thay đổi
  fetchUser(userId);
}, [userId]); // ← Chỉ chạy lại khi userId thay đổi
```

**Cách hoạt động:**
1. Lần đầu render: chạy effect với `userId` hiện tại
2. Khi `userId` thay đổi: cleanup function chạy (nếu có) → effect mới chạy với `userId` mới
3. Khi `userId` không đổi: bỏ qua effect

**Ví dụ trong project:**
```typescript
// src/app/auth/login/page.tsx
useEffect(() => {
  // Chạy khi searchParams thay đổi
  if (searchParams.get("registered") === "true") {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  }
}, [searchParams]); // ← Chạy lại khi searchParams thay đổi
```

#### 4. Cleanup function

Cleanup function chạy **trước khi**:
- Component unmount (bị xóa khỏi DOM)
- Effect chạy lại (khi dependencies thay đổi)

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);
  
  // Cleanup: chạy trước khi effect chạy lại hoặc component unmount
  return () => {
    clearInterval(timer); // ✅ Quan trọng: tránh memory leak
  };
}, []);
```

**Ví dụ thực tế trong project:**
```typescript
// src/app/dashboard/users/page.tsx
useEffect(() => {
  // Debounce search query
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
  }, 500);

  // ✅ Cleanup: xóa timer nếu searchQuery thay đổi trước khi 500ms
  // Tránh: setDebouncedSearch được gọi với giá trị cũ
  return () => clearTimeout(timer);
}, [searchQuery]);
```

**Tại sao cần cleanup?**
- **Memory leaks**: Timers, subscriptions không được clear → tiếp tục chạy sau khi component unmount
- **Stale closures**: Effect có thể dùng giá trị cũ nếu không cleanup đúng cách
- **Race conditions**: API call cũ có thể overwrite kết quả mới

#### 5. Multiple effects

Bạn có thể có nhiều `useEffect` trong một component:

```typescript
function Component() {
  // Effect 1: Fetch data khi mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Effect 2: Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Effect 3: Fetch khi filters thay đổi
  useEffect(() => {
    fetchUsers({ search: debouncedSearch, role: roleFilter });
  }, [debouncedSearch, roleFilter]);
}
```

**Best practice:** Tách effects theo mục đích (fetch, debounce, subscriptions) thay vì gộp tất cả vào một effect.

#### 6. Common mistakes và cách tránh

**❌ Mistake 1: Missing dependencies**

```typescript
// ❌ Bad: Thiếu dependencies
useEffect(() => {
  fetchUser(userId); // Dùng userId nhưng không khai báo trong deps
}, []); // ← ESLint sẽ warning

// ✅ Good: Đầy đủ dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

**❌ Mistake 2: Infinite loop**

```typescript
// ❌ Bad: Infinite loop
useEffect(() => {
  setCount(count + 1); // setState → re-render → effect chạy lại → setState → ...
}, [count]); // ← count thay đổi → effect chạy lại → count thay đổi → ...

// ✅ Good: Dùng functional update
useEffect(() => {
  setCount(prev => prev + 1); // Không phụ thuộc vào count
}, []); // Chỉ chạy 1 lần
```

**❌ Mistake 3: Không cleanup**

```typescript
// ❌ Bad: Memory leak
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);
  // Không cleanup → timer tiếp tục chạy sau unmount
}, []);

// ✅ Good: Cleanup
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);
  return () => clearInterval(timer); // ✅ Cleanup
}, []);
```

**❌ Mistake 4: Async function không đúng cách**

```typescript
// ❌ Bad: async function trực tiếp
useEffect(async () => {
  const data = await fetchData(); // ❌ useEffect không thể return Promise
  setData(data);
}, []);

// ✅ Good: async function bên trong
useEffect(() => {
  const fetchData = async () => {
    const data = await fetchData();
    setData(data);
  };
  fetchData();
}, []);
```

#### 7. So sánh với lifecycle methods (Class Components)

| Class Component | useEffect |
|----------------|-----------|
| `componentDidMount` | `useEffect(() => {...}, [])` |
| `componentDidUpdate` | `useEffect(() => {...}, [deps])` |
| `componentWillUnmount` | `useEffect(() => { return () => {...} }, [])` |

**Ví dụ:**
```typescript
// Class Component (cũ)
class Component extends React.Component {
  componentDidMount() {
    fetchData();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      fetchUser(this.props.userId);
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.timer);
  }
}

// Functional Component với useEffect (mới)
function Component({ userId }) {
  useEffect(() => {
    fetchData();
  }, []); // componentDidMount

  useEffect(() => {
    fetchUser(userId);
  }, [userId]); // componentDidUpdate khi userId thay đổi

  useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer); // componentWillUnmount
  }, []);
}
```

#### 8. Ví dụ thực tế từ project

**Ví dụ 1: Debounce search (users/page.tsx)**
```typescript
// src/app/dashboard/users/page.tsx
const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  // Đợi 500ms sau khi user ngừng gõ
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
    setCurrentPage(1); // Reset về trang 1
  }, 500);

  // Cleanup: Nếu user gõ tiếp trước 500ms, hủy timer cũ
  return () => clearTimeout(timer);
}, [searchQuery]);

// Effect khác: Fetch users khi debouncedSearch thay đổi
useEffect(() => {
  fetchUsers({ search: debouncedSearch });
}, [debouncedSearch]);
```

**Ví dụ 2: Fetch data khi mount (auth-context.tsx)**
```typescript
// src/contexts/auth-context.tsx
useEffect(() => {
  // Fetch user khi AuthProvider mount (app khởi động)
  refetch();
}, [refetch]); // refetch được wrap trong useCallback nên stable
```

**Ví dụ 3: Watch URL params (login/page.tsx)**
```typescript
// src/app/auth/login/page.tsx
const searchParams = useSearchParams();

useEffect(() => {
  // Hiển thị success message nếu có ?registered=true trong URL
  if (searchParams.get("registered") === "true") {
    setSuccess(true);
    // Tự động ẩn sau 5 giây
    const timer = setTimeout(() => setSuccess(false), 5000);
    return () => clearTimeout(timer); // Cleanup
  }
}, [searchParams]);
```

#### 9. Tóm tắt

| Pattern | Cú pháp | Khi nào chạy |
|---------|---------|--------------|
| **Mỗi render** | `useEffect(() => {...})` | Sau mỗi render (⚠️ dễ infinite loop) |
| **Mount only** | `useEffect(() => {...}, [])` | 1 lần sau mount |
| **When deps change** | `useEffect(() => {...}, [dep1, dep2])` | Khi dependencies thay đổi |
| **With cleanup** | `useEffect(() => { return () => {...} }, [])` | Cleanup trước khi chạy lại/unmount |

**Best practices:**
- ✅ Luôn khai báo đầy đủ dependencies (hoặc disable ESLint rule nếu thực sự cần)
- ✅ Cleanup timers, subscriptions, event listeners
- ✅ Tách effects theo mục đích (không gộp quá nhiều logic)
- ✅ Dùng `useCallback` cho functions trong dependencies
- ✅ Tránh setState trực tiếp trong effect (dùng functional update nếu cần)

### useRouter

**Navigation trong App Router.**

```typescript
import { useRouter } from "next/navigation";

function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/dashboard"); // Navigate
    router.refresh(); // Refresh server components
    router.back(); // Go back
  };
}
```

### Custom Hooks

**Tái sử dụng logic.**

```typescript
// src/hooks/use-toast.ts
export function useToast() {
  const [toasts, setToasts] = useState([]);
  
  const toast = (props) => {
    setToasts([...toasts, props]);
  };
  
  return { toast };
}

// Usage
function Component() {
  const { toast } = useToast();
  toast({ title: "Success!" });
}
```

## ⚡ Performance Optimization

### Code Splitting

**Tự động với Next.js:**
- Mỗi route là một bundle riêng
- Dynamic imports cho lazy loading

#### 1. Route-based Code Splitting (Tự động)

Next.js tự động tách code theo route:

```
app/
├── page.tsx          → bundle-1.js (homepage)
├── about/
│   └── page.tsx      → bundle-2.js (about page)
└── dashboard/
    └── page.tsx      → bundle-3.js (dashboard page)
```

**Lợi ích:**
- User chỉ tải code cần thiết cho route hiện tại
- Initial bundle nhỏ hơn → load nhanh hơn
- Các route khác load khi user navigate

**Ví dụ:**
- User vào `/` → chỉ tải `bundle-1.js` (homepage)
- User navigate đến `/about` → tải `bundle-2.js` (about page)
- Không tải code của `/dashboard` nếu chưa vào

#### 2. Dynamic Imports (Lazy Loading)

**Khi nào dùng:**
- Component lớn, không cần ngay (modals, charts, heavy libraries)
- Component chỉ hiện khi user tương tác (dropdown, tooltip)
- Third-party libraries nặng (chart libraries, rich text editors)

**Cú pháp:**
```typescript
import dynamic from "next/dynamic";

// Basic dynamic import
const HeavyComponent = dynamic(() => import("./HeavyComponent"));

// Với loading state
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Loading />, // Hiển thị khi đang load
});

// Disable SSR (nếu component chỉ chạy trên client)
const Chart = dynamic(() => import("./Chart"), {
  ssr: false, // Không render trên server
  loading: () => <div>Loading chart...</div>,
});
```

**Ví dụ thực tế:**
```typescript
// ❌ Bad: Import tất cả ngay
import { Chart } from "heavy-chart-library"; // 500KB

function Dashboard() {
  return <Chart data={data} />; // Tải 500KB ngay cả khi không cần
}

// ✅ Good: Dynamic import
const Chart = dynamic(() => import("heavy-chart-library").then(mod => mod.Chart), {
  ssr: false, // Chart chỉ render trên client
  loading: () => <div>Loading chart...</div>,
});

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowChart(true)}>Show Chart</Button>
      {showChart && <Chart data={data} />} {/* Chỉ load khi user click */}
    </>
  );
}
```

**Lưu ý:**
- `ssr: false` → component không render trên server (chỉ client)
- Dùng khi component cần browser APIs (`window`, `document`, etc.)
- Hoặc khi component quá nặng, không cần SEO

### Memoization

Memoization = **Cache kết quả** để tránh tính lại không cần thiết.

#### 1. useMemo - Cache Expensive Calculations

**Khi nào dùng:**
- Tính toán phức tạp (filter, sort, map với logic phức tạp)
- Tạo objects/arrays mới mỗi render (có thể gây re-render children)

**Cú pháp:**
```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]); // Chỉ tính lại khi a hoặc b thay đổi
```

**Ví dụ thực tế từ project:**
```typescript
// ❌ Bad: Tính lại mỗi render
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ❌ Tính lại mỗi render, ngay cả khi users/searchQuery không đổi
  const filteredUsers = users.filter(u => 
    u.email.includes(searchQuery) || 
    u.firstName.includes(searchQuery)
  );
  
  // ❌ Tính lại mỗi render
  const activeUsersCount = users.filter(u => u.isActive).length;
  
  return <UsersTable users={filteredUsers} />;
}

// ✅ Good: Memoize
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ Chỉ tính lại khi users hoặc searchQuery thay đổi
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.email.toLowerCase().includes(query) || 
      u.firstName.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);
  
  // ✅ Chỉ tính lại khi users thay đổi
  const activeUsersCount = useMemo(
    () => users.filter(u => u.isActive).length,
    [users]
  );
  
  return <UsersTable users={filteredUsers} />;
}
```

**Khi KHÔNG nên dùng useMemo:**
```typescript
// ❌ Bad: Tính toán đơn giản, không cần memoize
const sum = useMemo(() => a + b, [a, b]); // ❌ Overhead lớn hơn lợi ích

// ✅ Good: Tính trực tiếp
const sum = a + b; // ✅ Đơn giản, nhanh hơn

// ❌ Bad: Dependencies thay đổi mỗi render
const result = useMemo(() => {
  return processData(data);
}, [data, new Date()]); // ❌ new Date() tạo giá trị mới mỗi render → luôn tính lại

// ✅ Good: Stable dependencies
const result = useMemo(() => {
  return processData(data);
}, [data]); // ✅ Chỉ tính lại khi data thay đổi
```

#### 2. useCallback - Cache Functions

**Khi nào dùng:**
- Function được pass xuống child component (tránh re-render child)
- Function trong dependency array của useEffect/useMemo
- Event handlers được dùng nhiều lần

**Cú pháp:**
```typescript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Function reference không đổi trừ khi a hoặc b thay đổi
```

**Ví dụ thực tế từ project:**
```typescript
// src/contexts/auth-context.tsx
const refetch = useCallback(async (forceRefresh = false) => {
  // ... fetch logic
}, [endpointAvailable]); // ✅ Function reference stable, chỉ đổi khi endpointAvailable đổi

// Sử dụng trong useEffect
useEffect(() => {
  refetch(); // ✅ Không gây infinite loop vì refetch stable
}, [refetch]);
```

**Ví dụ: Tránh re-render child component**
```typescript
// ❌ Bad: Tạo function mới mỗi render → ChildComponent re-render
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  
  const handleClick = () => {
    console.log("Clicked");
  }; // ❌ Function mới mỗi render
  
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <ChildComponent onClick={handleClick} /> {/* Re-render mỗi khi name thay đổi */}
    </>
  );
}

// ✅ Good: useCallback → Function reference stable
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  
  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []); // ✅ Function reference không đổi
  
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <ChildComponent onClick={handleClick} /> {/* Không re-render khi name đổi */}
    </>
  );
}

// Child component với React.memo
const ChildComponent = React.memo(({ onClick }) => {
  console.log("Child rendered"); // Chỉ log khi onClick thay đổi
  return <button onClick={onClick}>Click me</button>;
});
```

**Khi KHÔNG nên dùng useCallback:**
```typescript
// ❌ Bad: Function đơn giản, không pass xuống child
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]); // ❌ Overhead không cần thiết

// ✅ Good: Function trực tiếp
const handleClick = () => {
  setCount(count + 1);
};
```

#### 3. React.memo - Prevent Re-renders

**Khi nào dùng:**
- Component render tốn kém (nhiều DOM nodes, tính toán phức tạp)
- Component nhận props không thay đổi thường xuyên
- Component trong list lớn (table rows, list items)

**Cú pháp:**
```typescript
const MemoizedComponent = React.memo(function Component({ data, onClick }) {
  return <div>{data}</div>;
}, (prevProps, nextProps) => {
  // Optional: custom comparison
  return prevProps.data.id === nextProps.data.id; // Chỉ re-render nếu id thay đổi
});
```

**Ví dụ thực tế:**
```typescript
// ❌ Bad: Re-render mỗi khi parent re-render
function UserTableRow({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <Button onClick={() => onEdit(user)}>Edit</Button>
        <Button onClick={() => onDelete(user)}>Delete</Button>
      </td>
    </tr>
  );
}

// ✅ Good: Chỉ re-render khi props thay đổi
const UserTableRow = React.memo(function UserTableRow({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <Button onClick={() => onEdit(user)}>Edit</Button>
        <Button onClick={() => onDelete(user)}>Delete</Button>
      </td>
    </tr>
  );
});

// Sử dụng trong list
function UsersTable({ users, onEdit, onDelete }) {
  return (
    <table>
      <tbody>
        {users.map(user => (
          <UserTableRow 
            key={user.id} 
            user={user} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </tbody>
    </table>
  );
}
```

**Lưu ý quan trọng:**
- `React.memo` chỉ so sánh **shallow** (so sánh reference, không so sánh deep)
- Nếu pass object/array mới mỗi render → `React.memo` không có tác dụng

```typescript
// ❌ Bad: Object mới mỗi render → React.memo không có tác dụng
function Parent() {
  return <Child data={{ id: 1, name: "John" }} />; // ❌ Object mới mỗi render
}

// ✅ Good: Stable reference
function Parent() {
  const data = useMemo(() => ({ id: 1, name: "John" }), []);
  return <Child data={data} />; // ✅ Object reference stable
}
```

#### 4. Kết hợp useMemo + useCallback + React.memo

**Ví dụ tối ưu hoàn chỉnh:**
```typescript
// Parent Component
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ Memoize filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => u.email.includes(searchQuery));
  }, [users, searchQuery]);
  
  // ✅ Memoize callbacks
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  }, []);
  
  const handleDelete = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }, []);
  
  return (
    <UsersTable 
      users={filteredUsers}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

// Child Component với React.memo
const UsersTable = React.memo(function UsersTable({ users, onEdit, onDelete }) {
  return (
    <table>
      <tbody>
        {users.map(user => (
          <UserTableRow 
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
});

// Row Component với React.memo
const UserTableRow = React.memo(function UserTableRow({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <Button onClick={() => onEdit(user)}>Edit</Button>
        <Button onClick={() => onDelete(user)}>Delete</Button>
      </td>
    </tr>
  );
});
```

**Kết quả:**
- `UsersPage` re-render → `filteredUsers` chỉ tính lại nếu `users` hoặc `searchQuery` đổi
- `UsersTable` chỉ re-render nếu `users`, `onEdit`, hoặc `onDelete` đổi (nhờ `React.memo`)
- `UserTableRow` chỉ re-render nếu `user`, `onEdit`, hoặc `onDelete` đổi (nhờ `React.memo`)

### Image Optimization

Next.js `Image` component tự động optimize images.

#### 1. Basic Usage

```typescript
import Image from "next/image";

<Image
  src="/photo.jpg"
  width={500}
  height={300}
  alt="Description"
/>
```

**Tự động:**
- **Lazy loading**: Chỉ load khi image vào viewport
- **Responsive**: Tự động tạo nhiều sizes cho different screen sizes
- **Format optimization**: Serve WebP/AVIF khi browser support
- **Blur placeholder**: Hiển thị blur placeholder khi đang load

#### 2. Props quan trọng

**`priority`** - Load ngay (above fold images):
```typescript
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority // ✅ Load ngay, không lazy load (cho images above fold)
/>
```

**`placeholder="blur"`** - Blur placeholder:
```typescript
import heroImage from "@/public/hero.jpg";

<Image
  src={heroImage}
  width={1200}
  height={600}
  alt="Hero"
  placeholder="blur" // ✅ Hiển thị blur placeholder khi đang load
  blurDataURL="data:image/jpeg;base64,..." // Tự động generate nếu dùng import
/>
```

**`sizes`** - Responsive sizes:
```typescript
<Image
  src="/photo.jpg"
  width={1200}
  height={800}
  alt="Photo"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  // ✅ Mobile: 100% width, Tablet: 50% width, Desktop: 33% width
/>
```

**`fill`** - Fill container:
```typescript
<div className="relative w-full h-64">
  <Image
    src="/photo.jpg"
    fill // ✅ Fill container, không cần width/height
    alt="Photo"
    className="object-cover"
  />
</div>
```

#### 3. So sánh với `<img>` tag

```typescript
// ❌ Bad: Regular img tag
<img src="/photo.jpg" alt="Photo" />
// - Không optimize
// - Không lazy load
// - Không responsive
// - Có thể gây layout shift

// ✅ Good: Next.js Image
<Image
  src="/photo.jpg"
  width={500}
  height={300}
  alt="Photo"
/>
// - Tự động optimize
// - Lazy load
// - Responsive
// - Không layout shift
```

#### 4. External Images

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
}

// Component
<Image
  src="https://example.com/photo.jpg"
  width={500}
  height={300}
  alt="Photo"
/>
```

### Tóm tắt: Khi nào dùng gì?

| Tool | Khi nào dùng | Khi nào KHÔNG dùng |
|------|--------------|-------------------|
| **useMemo** | Tính toán phức tạp, tạo objects/arrays | Tính toán đơn giản (a + b) |
| **useCallback** | Functions pass xuống children, trong deps | Functions đơn giản, không pass xuống |
| **React.memo** | Component render tốn kém, props ít đổi | Component nhỏ, props thay đổi thường xuyên |
| **dynamic()** | Component lớn, không cần ngay | Component nhỏ, cần ngay |
| **Image** | Tất cả images | Icons nhỏ (< 1KB), SVG |

**Nguyên tắc chung:**
- ✅ **Measure first**: Dùng React DevTools Profiler để tìm bottlenecks
- ✅ **Optimize sau**: Không optimize sớm, chỉ optimize khi có vấn đề
- ✅ **Đơn giản trước**: Code đơn giản dễ maintain hơn code over-optimized

## ✅ Best Practices

### 1. Server Components First

```typescript
// ✅ Good: Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ⚠️ Only if needed: Client Component
"use client";
export default function Page() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### 2. Colocate Data Fetching

```typescript
// ✅ Good: Fetch where you use
export default async function UserPage({ params }) {
  const user = await getUser(params.id);
  return <UserProfile user={user} />;
}

// ❌ Bad: Prop drilling
export default async function Page() {
  const user = await getUser();
  return <Layout><UserProfile user={user} /></Layout>;
}
```

### 3. Error Handling

```typescript
// ✅ Good: Error boundaries
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Error: {error.message}</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 4. Loading States

```typescript
// ✅ Good: Loading UI
export default function Loading() {
  return <Skeleton />;
}
```

### 5. Type Safety

```typescript
// ✅ Good: TypeScript
interface Props {
  title: string;
  count: number;
}

export default function Component({ title, count }: Props) {
  return <div>{title}: {count}</div>;
}
```

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

## 🎯 Bài tập thực hành

1. **Tạo Server Component mới:**
   - Tạo page fetch data từ API
   - Hiển thị loading state
   - Handle errors

2. **Tạo Client Component tương tác:**
   - Form với validation
   - State management với useState
   - Event handlers

3. **Sử dụng Context:**
   - Tạo context mới
   - Share state giữa components
   - Update state từ child components

4. **Optimize performance:**
   - Sử dụng dynamic imports
   - Memoize expensive calculations
   - Optimize images

## 💡 Tips

1. **Luôn bắt đầu với Server Component** - Chuyển sang Client Component chỉ khi cần
2. **Fetch data gần nơi sử dụng** - Tránh prop drilling
3. **Sử dụng TypeScript** - Type safety giúp tránh bugs
4. **Handle loading & errors** - Better UX
5. **Test trên nhiều devices** - Responsive design
