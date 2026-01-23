# State Management Guide

Hướng dẫn quản lý state trong project.

## 📋 Mục lục

- [Overview](#overview)
- [Current Approach](#current-approach)
- [State Types](#state-types)
- [Best Practices](#best-practices)
- [Future Improvements](#future-improvements)

## 🎯 Overview

Project hiện tại sử dụng **React built-in state management** với các patterns:

- **Local State**: `useState` cho component state
- **Server State**: Server Components + API calls
- **Auth State**: Token management + custom hooks
- **Global State**: Context API (Theme)

## 📊 Current Approach

### 1. Local Component State

Sử dụng `useState` cho UI state trong components:

```typescript
"use client";

import { useState } from "react";

export default function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string[]>([]);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Content</div>}
    </div>
  );
}
```

**Khi nào dùng:**

- Form inputs
- Dialog/modal open/close
- Loading states
- UI toggles
- Component-specific data

### 2. Server State

Sử dụng Server Components + API calls:

```typescript
// Server Component
import { requireServerAuth } from "@/lib/api/server-auth";

export default async function Page() {
  const user = await requireServerAuth();
  // Fetch data on server
  const data = await fetchData();

  return <div>{data}</div>;
}
```

**Khi nào dùng:**

- Initial page data
- SEO-important content
- Server-side data fetching

### 3. Client-Side Data Fetching

Sử dụng `useEffect` + `useState` cho client-side fetching:

```typescript
"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services";

export default function Component() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

**Khi nào dùng:**

- Client-side only data
- Interactive data fetching
- Real-time updates

### 4. Authentication State

Sử dụng custom hooks + token management:

```typescript
// src/lib/api/session.ts
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user from API
  }, []);

  return { user, loading };
}

// Usage
const { user, loading } = useCurrentUser();
```

**Token Management:**

- `localStorage`: Client-side token storage
- `cookies`: Server-side token storage
- Utilities: `getAccessToken()`, `setAccessToken()`, `clearTokens()`

### 5. Global State (Context)

Sử dụng Context API cho global state:

```typescript
// Theme Provider (existing)
import { ThemeProvider } from "next-themes";

<ThemeProvider>
  {children}
</ThemeProvider>
```

## 🏷️ State Types

### UI State

State liên quan đến UI interactions:

```typescript
// Dialog open/close
const [isOpen, setIsOpen] = useState(false);

// Form inputs
const [email, setEmail] = useState("");

// Loading states
const [loading, setLoading] = useState(false);

// Error messages
const [error, setError] = useState("");
```

### Server State

State từ API/backend:

```typescript
// User data
const [user, setUser] = useState<User | null>(null);

// List data
const [users, setUsers] = useState<User[]>([]);

// Pagination
const [currentPage, setCurrentPage] = useState(1);
```

### Derived State

State được tính toán từ state khác:

```typescript
// Computed from other state
const isAuthenticated = !!user;
const totalPages = Math.ceil(total / pageSize);
```

## ✅ Best Practices

### 1. Keep State Local

**Prefer local state** khi có thể:

```typescript
// ✅ Good: Local state
function Component() {
  const [isOpen, setIsOpen] = useState(false);
  return <Dialog open={isOpen} onOpenChange={setIsOpen} />;
}

// ❌ Bad: Unnecessary global state
// Don't lift state up if only one component needs it
```

### 2. Lift State Up

**Lift state** khi multiple components need it:

```typescript
// ✅ Good: Shared state
function Parent() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <>
      <Header user={user} />
      <Profile user={user} />
    </>
  );
}
```

### 3. Use Custom Hooks

**Extract logic** into custom hooks:

```typescript
// ✅ Good: Custom hook
function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch logic
  }, []);

  return { user, loading, refetch };
}

// Usage
const { user, loading } = useUser();
```

### 4. Handle Loading & Error States

**Always handle** loading and error:

```typescript
// ✅ Good
const [data, setData] = useState<Data | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### 5. Use Constants for State Values

**Use constants** for state values:

```typescript
// ✅ Good
const ACTIVE_TAB = "profile" as const;
const [activeTab, setActiveTab] = useState<"profile" | "password">(ACTIVE_TAB);

// ❌ Bad
const [activeTab, setActiveTab] = useState("profile");
```

### 6. Clean Up Effects

**Clean up** effects to prevent memory leaks:

```typescript
// ✅ Good
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then(setData);

  return () => {
    controller.abort();
  };
}, []);
```

## 🚀 Future Improvements

### 1. Auth Context (Recommended)

Tạo `AuthContext` để share user state:

```typescript
// src/contexts/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { userService } from "@/services";
import type { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    try {
      const data = await userService.getCurrentUser();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Usage:**

```typescript
// In layout
<AuthProvider>
  {children}
</AuthProvider>

// In components
const { user, loading } = useAuth();
```

### 2. React Query / SWR (When Project Grows)

Khi project lớn hơn, thêm React Query cho server state:

```typescript
// Install
npm install @tanstack/react-query

// Setup
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>

// Usage
import { useQuery } from "@tanstack/react-query";

function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: () => userService.getCurrentUser(),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <div>{data?.name}</div>;
}
```

**Benefits:**

- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

### 3. Zustand (If Needed)

Nếu cần global client state phức tạp:

```typescript
// Install
npm install zustand

// Store
import { create } from "zustand";

interface Store {
  count: number;
  increment: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Usage
const { count, increment } = useStore();
```

## 📋 State Management Decision Tree

```
Do you need state?
│
├─ Is it UI-only? (form, dialog, toggle)
│  └─> Use useState (local state)
│
├─ Is it shared between components?
│  ├─ Is it auth/user data?
│  │  └─> Use AuthContext (recommended)
│  │
│  ├─ Is it server data? (API calls)
│  │  └─> Use React Query (when project grows)
│  │
│  └─ Is it complex global state?
│     └─> Use Zustand (if needed)
│
└─ Can it be fetched on server?
   └─> Use Server Component + API call
```

## 🎯 Recommendations

### Current Project (Small-Medium)

✅ **Keep current approach:**

- `useState` cho UI state
- `useEffect` + `useState` cho client-side fetching
- Custom hooks cho reusable logic
- Server Components cho initial data

### When Project Grows

1. **Add AuthContext** - Share user state across app
2. **Add React Query** - Better server state management
3. **Keep useState** - For UI state (forms, dialogs, etc.)

### Don't Over-Engineer

❌ **Don't add** Redux/Zustand nếu:

- Chỉ có vài components
- State không phức tạp
- Current approach works fine

✅ **Add** khi:

- State management trở nên phức tạp
- Cần global state nhiều
- Performance issues

## 📚 Related Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Usage Guide](./API_USAGE.md)

## 🔗 External Resources

- [React State Management](https://react.dev/learn/managing-state)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
