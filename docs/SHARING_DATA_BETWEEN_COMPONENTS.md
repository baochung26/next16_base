# Cách Share Data Đơn Giản Giữa Các Component

Hướng dẫn các cách share data giữa các component trong project này, từ đơn giản đến phức tạp.

---

## 📋 Mục lục

1. [Lift State Up (Props)](#1-lift-state-up-props) - Đơn giản nhất
2. [Custom Hooks](#2-custom-hooks) - Tái sử dụng logic
3. [Context API](#3-context-api) - Share global state
4. [URL State (Query Params)](#4-url-state-query-params) - Share qua URL
5. [LocalStorage/SessionStorage](#5-localstoragesessionstorage) - Persist data
6. [Khi nào dùng cách nào?](#6-khi-nào-dùng-cách-nào)

---

## 1. Lift State Up (Props)

**Cách đơn giản nhất** - Đưa state lên component cha và truyền xuống qua props.

### Khi nào dùng:
- ✅ Chỉ vài components cần share data
- ✅ Components gần nhau trong component tree
- ✅ Data không cần persist

### Ví dụ:

```tsx
"use client";

import { useState } from "react";

// Component cha
export default function ParentComponent() {
  const [sharedData, setSharedData] = useState("Hello");

  return (
    <div>
      <ChildA data={sharedData} setData={setSharedData} />
      <ChildB data={sharedData} />
    </div>
  );
}

// Component con A
function ChildA({ data, setData }: { data: string; setData: (value: string) => void }) {
  return (
    <input
      value={data}
      onChange={(e) => setData(e.target.value)}
      placeholder="Type something..."
    />
  );
}

// Component con B
function ChildB({ data }: { data: string }) {
  return <div>Shared data: {data}</div>;
}
```

**Ưu điểm:**
- ✅ Đơn giản, dễ hiểu
- ✅ Không cần setup thêm
- ✅ Type-safe với TypeScript

**Nhược điểm:**
- ❌ Prop drilling nếu components xa nhau
- ❌ Không persist khi refresh page

---

## 2. Custom Hooks

**Tái sử dụng logic** - Tạo custom hook để share logic và state.

### Khi nào dùng:
- ✅ Cần tái sử dụng logic ở nhiều nơi
- ✅ Logic phức tạp (fetching, validation, etc.)
- ✅ Muốn tách logic ra khỏi component

### Ví dụ:

```tsx
// hooks/use-shared-data.ts
"use client";

import { useState, useEffect } from "react";

interface SharedData {
  count: number;
  message: string;
}

export function useSharedData() {
  const [data, setData] = useState<SharedData>({
    count: 0,
    message: "Initial",
  });

  const increment = () => {
    setData((prev) => ({ ...prev, count: prev.count + 1 }));
  };

  const updateMessage = (message: string) => {
    setData((prev) => ({ ...prev, message }));
  };

  return {
    data,
    increment,
    updateMessage,
  };
}

// Component A
"use client";

import { useSharedData } from "@/hooks/use-shared-data";

export function ComponentA() {
  const { data, increment } = useSharedData();

  return (
    <div>
      <p>Count: {data.count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// Component B
"use client";

import { useSharedData } from "@/hooks/use-shared-data";

export function ComponentB() {
  const { data, updateMessage } = useSharedData();

  return (
    <div>
      <p>Message: {data.message}</p>
      <input
        onChange={(e) => updateMessage(e.target.value)}
        placeholder="Update message"
      />
    </div>
  );
}
```

**Lưu ý:** Mỗi component dùng hook này sẽ có state riêng. Nếu muốn share state thực sự, cần dùng Context API.

**Ưu điểm:**
- ✅ Tái sử dụng logic
- ✅ Dễ test
- ✅ Tách biệt concerns

**Nhược điểm:**
- ❌ Mỗi component có state riêng (không share thực sự)
- ❌ Cần Context API nếu muốn share state thực sự

---

## 3. Context API

**Share global state** - Tạo Context để share state giữa nhiều components.

### Khi nào dùng:
- ✅ Nhiều components cần cùng một state
- ✅ Components ở xa nhau trong tree
- ✅ State cần persist trong session

### Ví dụ đơn giản:

```tsx
// contexts/shared-data-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SharedData {
  count: number;
  message: string;
}

interface SharedDataContextType {
  data: SharedData;
  increment: () => void;
  updateMessage: (message: string) => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SharedData>({
    count: 0,
    message: "Initial",
  });

  const increment = () => {
    setData((prev) => ({ ...prev, count: prev.count + 1 }));
  };

  const updateMessage = (message: string) => {
    setData((prev) => ({ ...prev, message }));
  };

  return (
    <SharedDataContext.Provider value={{ data, increment, updateMessage }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error("useSharedData must be used within SharedDataProvider");
  }
  return context;
}
```

**Setup trong layout:**

```tsx
// app/layout.tsx hoặc app/dashboard/layout.tsx
import { SharedDataProvider } from "@/contexts/shared-data-context";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SharedDataProvider>
      {children}
    </SharedDataProvider>
  );
}
```

**Sử dụng:**

```tsx
// Component A
"use client";

import { useSharedData } from "@/contexts/shared-data-context";

export function ComponentA() {
  const { data, increment } = useSharedData();

  return (
    <div>
      <p>Count: {data.count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// Component B
"use client";

import { useSharedData } from "@/contexts/shared-data-context";

export function ComponentB() {
  const { data, updateMessage } = useSharedData();

  return (
    <div>
      <p>Message: {data.message}</p>
      <input
        onChange={(e) => updateMessage(e.target.value)}
        placeholder="Update message"
      />
    </div>
  );
}
```

**Ví dụ trong project:** `AuthContext` - share user state

**Ưu điểm:**
- ✅ Share state thực sự giữa components
- ✅ Không cần prop drilling
- ✅ Có thể persist trong session

**Nhược điểm:**
- ❌ Setup phức tạp hơn
- ❌ Có thể gây re-render không cần thiết nếu không optimize

---

## 4. URL State (Query Params)

**Share qua URL** - Dùng query parameters để share state.

### Khi nào dùng:
- ✅ State cần share qua URL (filter, search, pagination)
- ✅ User có thể bookmark/share URL
- ✅ State cần sync với browser history

### Ví dụ:

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function FilterComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Đọc từ URL
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";

  const updateFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", newFilter);
    router.push(`?${params.toString()}`);
  };

  const updateSearch = (newSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <select value={filter} onChange={(e) => updateFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      
      <input
        value={search}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}

// Component khác cũng có thể đọc từ URL
export function DisplayComponent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";

  return (
    <div>
      <p>Filter: {filter}</p>
      <p>Search: {search}</p>
    </div>
  );
}
```

**Ưu điểm:**
- ✅ Share qua URL, có thể bookmark
- ✅ Sync với browser history
- ✅ Không cần setup Context

**Nhược điểm:**
- ❌ Chỉ phù hợp với một số loại state
- ❌ URL có thể dài nếu nhiều params

---

## 5. LocalStorage/SessionStorage

**Persist data** - Lưu data vào browser storage để share giữa các tabs và persist khi refresh.

### Khi nào dùng:
- ✅ Cần persist data khi refresh page
- ✅ Cần share data giữa các tabs
- ✅ User preferences, settings

### Ví dụ với Custom Hook:

```tsx
// hooks/use-local-storage.ts
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State để store value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Function để update value
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
```

**Sử dụng:**

```tsx
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";

export function ComponentA() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </div>
  );
}

export function ComponentB() {
  const [theme] = useLocalStorage("theme", "light");

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      Content with theme: {theme}
    </div>
  );
}
```

**Ví dụ trong project:** Token storage (`src/lib/api/token.ts`)

**Ưu điểm:**
- ✅ Persist khi refresh page
- ✅ Share giữa các tabs
- ✅ Đơn giản với custom hook

**Nhược điểm:**
- ❌ Chỉ lưu được string (cần JSON.stringify/parse)
- ❌ Không hoạt động trên server (SSR)

---

## 6. Khi nào dùng cách nào?

### Decision Tree:

```
Cần share data giữa components?
│
├─ Chỉ vài components gần nhau?
│  └─> Lift State Up (Props) ✅
│
├─ Cần tái sử dụng logic?
│  └─> Custom Hook ✅
│
├─ Nhiều components ở xa nhau?
│  ├─ Cần persist khi refresh?
│  │  └─> Context API + LocalStorage ✅
│  │
│  └─ Không cần persist?
│     └─> Context API ✅
│
├─ State cần trong URL? (filter, search, pagination)
│  └─> URL State (Query Params) ✅
│
└─ Cần persist và share giữa tabs?
   └─> LocalStorage/SessionStorage ✅
```

### So sánh nhanh:

| Cách | Độ phức tạp | Khi nào dùng | Ví dụ |
|------|-------------|--------------|-------|
| **Props** | ⭐ Đơn giản | Components gần nhau | Form inputs, dialog state |
| **Custom Hook** | ⭐⭐ Trung bình | Tái sử dụng logic | useForm, useFetch |
| **Context API** | ⭐⭐⭐ Phức tạp | Global state | AuthContext, ThemeContext |
| **URL State** | ⭐⭐ Trung bình | Filter, search, pagination | `/users?filter=active&page=2` |
| **LocalStorage** | ⭐⭐ Trung bình | Persist data | Theme, preferences |

---

## 📝 Ví dụ thực tế trong project

### 1. AuthContext (Context API)

```tsx
// Đã có sẵn trong project
import { useAuth } from "@/contexts/auth-context";

function Component() {
  const { user, loading, isAuthenticated } = useAuth();
  // ...
}
```

### 2. Token Storage (LocalStorage)

```tsx
// Đã có sẵn trong project
import { getAccessToken, setAccessToken } from "@/lib/api/token";

// Lưu token
setAccessToken(token);

// Đọc token
const token = getAccessToken();
```

### 3. URL State cho Filter

```tsx
// Ví dụ: Filter users
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function UserFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("role") || "all";

  const handleFilterChange = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", role);
    router.push(`/dashboard/users?${params.toString()}`);
  };

  return (
    <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
      <option value="all">All</option>
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
```

---

## 🎯 Best Practices

### 1. Bắt đầu từ đơn giản nhất

✅ **Luôn bắt đầu với Props** nếu có thể  
✅ **Nâng cấp lên Context** khi cần thiết  
❌ **Đừng over-engineer** - không cần Context cho mọi thứ

### 2. Tách biệt concerns

✅ **UI state** → useState (local)  
✅ **Shared state** → Context API  
✅ **Server state** → Server Components hoặc React Query  
✅ **Persistent state** → LocalStorage + Context

### 3. Optimize Context

✅ **Tách Context nhỏ** thay vì một Context lớn  
✅ **Dùng useMemo** cho value object  
✅ **Dùng useCallback** cho functions

```tsx
// ✅ Good: Tách Context nhỏ
const UserContext = createContext();
const ThemeContext = createContext();

// ❌ Bad: Một Context lớn
const AppContext = createContext(); // Chứa tất cả
```

---

## 📚 Tài liệu liên quan

- [State Management Guide](./STATE_MANAGEMENT.md)
- [Auth Context Explained](./AUTH_CONTEXT_EXPLAINED.md)
- [React Context API](https://react.dev/reference/react/useContext)

---

## 💡 Tóm tắt

**Cho data đơn giản:**

1. **Props** - Nếu components gần nhau
2. **Custom Hook** - Nếu cần tái sử dụng logic
3. **Context API** - Nếu nhiều components ở xa nhau
4. **URL State** - Nếu cần trong URL
5. **LocalStorage** - Nếu cần persist

**Quy tắc vàng:** Bắt đầu từ đơn giản nhất, nâng cấp khi cần thiết! 🚀
