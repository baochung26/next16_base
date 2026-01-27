# Server Component vs Client Component: Khi nào fetch data?

Tài liệu giải thích tại sao project hiện tại chủ yếu dùng **Client Components** để fetch data, và khi nào nên chuyển sang **Server Components**.

---

## 📊 Tình trạng hiện tại trong project

### ✅ Thực tế: **KHÔNG CÓ** Server Component nào call API

**Kiểm tra:**
- ❌ `dashboard/page.tsx` - Server Component, nhưng chỉ render **static data** (hardcode stats, activities)
- ❌ `page.tsx` (home) - Server Component, chỉ render **static content**
- ❌ `about/page.tsx`, `features/page.tsx` - Server Components, chỉ render **static content**
- ✅ `dashboard/users/page.tsx` - **Client Component** (`"use client"`), fetch users từ API
- ✅ `profile/page.tsx` - **Client Component**, fetch user data từ API
- ✅ `auth/login/page.tsx` - **Client Component**, call login API

**Kết luận:** Tất cả API calls đều từ **Client Components** (`useEffect` + `useState` + service calls).

---

## 🤔 Tại sao project hiện tại làm vậy?

### 1. **Tính chất của ứng dụng**

Project này là **admin dashboard / SPA-like app**:
- **Không cần SEO** cho dashboard (protected, cần login)
- **Cần interactivity cao**: search, filter, pagination, real-time updates
- **User-specific data**: mỗi user thấy data khác nhau
- **Dynamic content**: data thay đổi theo user actions

→ **Client-side fetching phù hợp hơn** cho use case này.

### 2. **Kiến trúc hiện tại**

- **Fake API** (`NEXT_PUBLIC_USE_FAKE_API=true`): API routes trong Next.js, không phải external API
- **Token-based auth**: token trong localStorage + cookie
- **Client Components** đã có sẵn logic: `useAuth`, `userService`, error handling, loading states

→ **Dễ maintain** khi tất cả logic fetch ở một nơi (Client Components).

### 3. **Middleware đã xử lý auth**

```tsx
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}
```

→ **Route protection** đã được xử lý ở middleware, không cần Server Component check auth.

---

## ✅ Khi nào nên dùng Server Component để fetch?

### 1. **SEO-important pages**

```tsx
// ❌ Hiện tại: Client Component
"use client";
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState(null);
  useEffect(() => {
    fetchPost(params.slug).then(setPost);
  }, []);
  return <article>{post?.content}</article>;
}

// ✅ Nên: Server Component
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug); // Fetch trên server
  return <article>{post.content}</article>; // HTML có sẵn content → SEO tốt
}
```

**Lợi ích:**
- HTML có sẵn content khi Google crawl → SEO tốt
- Fast initial load (không cần đợi JS chạy)
- Giảm JavaScript bundle size

### 2. **Initial page data (không cần interactivity)**

```tsx
// ✅ Server Component
export default async function DashboardPage() {
  // Fetch trên server, render sẵn HTML
  const stats = await getDashboardStats();
  const recentUsers = await getRecentUsers(10);
  
  return (
    <DashboardLayout>
      <StatsCards stats={stats} />
      <RecentUsersTable users={recentUsers} />
    </DashboardLayout>
  );
}
```

**Lợi ích:**
- User thấy content ngay (không đợi loading spinner)
- Giảm số API calls từ client
- Có thể cache ở server (ISR, revalidate)

### 3. **Sensitive data / API keys**

```tsx
// ✅ Server Component - API key không expose ra client
export default async function WeatherPage() {
  const weather = await fetch("https://api.weather.com/data", {
    headers: {
      "X-API-Key": process.env.WEATHER_API_KEY, // ✅ Chỉ có trên server
    },
  });
  return <WeatherDisplay data={weather} />;
}
```

**Lợi ích:**
- API keys không bao giờ gửi đến client
- Bảo mật tốt hơn

### 4. **Database queries trực tiếp**

```tsx
// ✅ Server Component - Query DB trực tiếp
import { db } from "@/lib/db";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: { isPublished: true },
    take: 20,
  });
  
  return <ProductList products={products} />;
}
```

**Lợi ích:**
- Không cần API route trung gian
- Nhanh hơn (direct DB connection)
- Type-safe với Prisma/Drizzle

---

## ❌ Khi nào KHÔNG nên dùng Server Component?

### 1. **Cần interactivity (search, filter, pagination)**

```tsx
// ❌ Server Component - KHÔNG phù hợp
export default async function UsersPage() {
  const users = await getAllUsers(); // Fetch tất cả?
  // Làm sao handle search/filter từ user input?
  return <UsersTable users={users} />; // Không có search box
}

// ✅ Client Component - Phù hợp
"use client";
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers({ search }).then(setUsers);
  }, [search]);
  
  return (
    <>
      <SearchInput value={search} onChange={setSearch} />
      <UsersTable users={users} />
    </>
  );
}
```

### 2. **Real-time updates**

```tsx
// ❌ Server Component - Không thể real-time
export default async function ChatPage() {
  const messages = await getMessages();
  return <Chat messages={messages} />; // Không update real-time
}

// ✅ Client Component - Có thể WebSocket/polling
"use client";
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket("ws://...");
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };
  }, []);
  
  return <Chat messages={messages} />;
}
```

### 3. **User-specific, dynamic data**

```tsx
// ❌ Server Component - Khó handle user actions
export default async function ProfilePage() {
  const user = await getServerUser(); // OK
  // Nhưng làm sao handle "Edit profile" form submit?
  // Phải dùng Server Actions hoặc API route → phức tạp hơn
}

// ✅ Client Component - Dễ handle
"use client";
export default function ProfilePage() {
  const { user } = useAuth();
  const handleSubmit = async (data) => {
    await userService.updateProfile(data);
    // Update UI ngay lập tức
  };
  return <ProfileForm user={user} onSubmit={handleSubmit} />;
}
```

---

## 🔄 Hybrid Approach: Server + Client

**Best practice:** Kết hợp cả hai:

### Ví dụ: Dashboard với initial data từ server, interactivity từ client

```tsx
// 1. Server Component - Fetch initial data
// src/app/dashboard/page.tsx
import { requireServerAdmin } from "@/lib/api/server-auth";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // ✅ Fetch trên server
  const user = await requireServerAdmin();
  const initialStats = await getDashboardStats();
  const initialUsers = await getRecentUsers(10);
  
  // ✅ Pass data xuống Client Component
  return (
    <DashboardClient
      initialStats={initialStats}
      initialUsers={initialUsers}
    />
  );
}
```

```tsx
// 2. Client Component - Handle interactivity
// src/app/dashboard/dashboard-client.tsx
"use client";

import { useState } from "react";
import { userService } from "@/services";

interface DashboardClientProps {
  initialStats: Stats;
  initialUsers: User[];
}

export function DashboardClient({ initialStats, initialUsers }: DashboardClientProps) {
  // ✅ Dùng initial data từ server
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState(initialUsers);
  
  // ✅ Client-side refresh khi user click "Refresh"
  const handleRefresh = async () => {
    const newStats = await userService.getStats();
    setStats(newStats);
  };
  
  return (
    <div>
      <StatsCards stats={stats} />
      <Button onClick={handleRefresh}>Refresh</Button>
      <UsersTable users={users} />
    </div>
  );
}
```

**Lợi ích:**
- ✅ Fast initial load (data có sẵn trong HTML)
- ✅ SEO-friendly (nếu cần)
- ✅ Vẫn có interactivity (refresh, filter, search)

---

## 📝 Ví dụ cụ thể cho project hiện tại

### Case 1: Dashboard Page (hiện tại)

**Hiện tại:**
```tsx
// Server Component, nhưng chỉ render static data
export default function DashboardPage() {
  const stats = [/* hardcode */];
  return <DashboardLayout><StatsCards stats={stats} /></DashboardLayout>;
}
```

**Có thể cải thiện:**
```tsx
// Server Component - Fetch real data
export default async function DashboardPage() {
  const user = await requireServerAdmin();
  const stats = await getDashboardStats(); // ✅ Fetch từ API/DB
  const recentActivities = await getRecentActivities(10);
  
  return (
    <DashboardLayout>
      <StatsCards stats={stats} />
      <RecentActivities activities={recentActivities} />
    </DashboardLayout>
  );
}
```

**Khi nào làm:**
- Khi có backend API thật (NestJS)
- Khi cần SEO cho dashboard (ít khi)
- Khi muốn fast initial load

### Case 2: Users Page (hiện tại)

**Hiện tại:**
```tsx
// Client Component - Fetch từ client
"use client";
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    userService.getAllUsers().then(setUsers);
  }, []);
  // ... search, filter, pagination
}
```

**Có nên đổi sang Server Component?**
- ❌ **KHÔNG** - vì cần search, filter, pagination (interactivity)
- ✅ **Giữ Client Component** - phù hợp với use case

**Có thể hybrid:**
```tsx
// Server Component - Initial data
export default async function UsersPage() {
  const initialUsers = await getAllUsers({ limit: 10 });
  return <UsersClient initialUsers={initialUsers} />;
}

// Client Component - Interactivity
"use client";
export function UsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  // ... search, filter logic
}
```

---

## 🎯 Kết luận & Khuyến nghị

### ✅ Project hiện tại đúng khi:

1. **Dashboard/Admin app** - không cần SEO
2. **High interactivity** - search, filter, pagination
3. **User-specific data** - mỗi user thấy khác nhau
4. **Real-time updates** - cần WebSocket/polling

→ **Client Components** là lựa chọn phù hợp.

### 🔄 Nên cân nhắc Server Components khi:

1. **Có public pages** cần SEO (blog, product pages)
2. **Initial data** không cần interactivity ngay
3. **Sensitive API keys** cần bảo mật
4. **Database queries** trực tiếp (Prisma/Drizzle)

→ **Hybrid approach**: Server Component fetch initial data, Client Component handle interactivity.

### 📊 So sánh nhanh

| Tiêu chí | Server Component | Client Component |
|----------|------------------|------------------|
| **SEO** | ✅ Tốt (HTML có sẵn) | ❌ Kém (cần JS) |
| **Initial load** | ✅ Nhanh | ⚠️ Chậm hơn (đợi fetch) |
| **Interactivity** | ❌ Khó | ✅ Dễ |
| **Real-time** | ❌ Không thể | ✅ Có thể |
| **API keys** | ✅ An toàn | ❌ Expose |
| **Bundle size** | ✅ Nhỏ hơn | ⚠️ Lớn hơn |

---

## 📚 Tài liệu liên quan

- [LEARNING_GUIDE.md](./LEARNING_GUIDE.md) - Data flow, Server vs Client
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Kiến trúc project
- [WALKTHROUGH.md](./WALKTHROUGH.md) - Luồng hoạt động thực tế
