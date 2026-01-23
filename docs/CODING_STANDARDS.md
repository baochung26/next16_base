# Coding Standards

Chuẩn code và best practices cho project.

## 📋 Mục lục

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React Standards](#react-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Style](#code-style)
- [Comments & Documentation](#comments--documentation)

## 🎯 General Principles

### 1. DRY (Don't Repeat Yourself)

```typescript
// ❌ Bad: Duplicate code
function formatDate1(date: Date) {
  return date.toLocaleDateString("vi-VN");
}
function formatDate2(date: Date) {
  return date.toLocaleDateString("vi-VN");
}

// ✅ Good: Reusable function
function formatDate(date: Date) {
  return date.toLocaleDateString("vi-VN");
}
```

### 2. KISS (Keep It Simple, Stupid)

```typescript
// ❌ Bad: Overcomplicated
const result = array
  .filter((item) => item.active)
  .map((item) => ({ ...item, processed: true }))
  .reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

// ✅ Good: Simple and clear
const activeItems = array.filter((item) => item.active);
const processedItems = activeItems.map((item) => ({
  ...item,
  processed: true,
}));
```

### 3. YAGNI (You Aren't Gonna Need It)

Không code những tính năng chưa cần thiết.

### 4. Single Responsibility Principle

Mỗi function/component chỉ làm một việc.

```typescript
// ❌ Bad: Multiple responsibilities
function processUser(user: User) {
  validateUser(user);
  saveUser(user);
  sendEmail(user);
  logActivity(user);
}

// ✅ Good: Single responsibility
function validateUser(user: User) { ... }
function saveUser(user: User) { ... }
function sendEmail(user: User) { ... }
```

## 📘 TypeScript Standards

### Type Definitions

**Always define types** cho functions và components:

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### Avoid `any`

**Never use `any`** - sử dụng `unknown` hoặc proper types:

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error("Invalid data");
}
```

### Use Type Inference

Sử dụng type inference khi có thể:

```typescript
// ✅ Good: Type inferred
const users = ["user1", "user2"]; // string[]

// ✅ Good: Explicit when needed
const users: User[] = [];

// ❌ Bad: Unnecessary explicit
const users: string[] = ["user1", "user2"];
```

### Interface vs Type

- **Interface**: Cho objects, có thể extend
- **Type**: Cho unions, intersections, primitives

```typescript
// ✅ Good: Interface for objects
interface User {
  id: string;
  name: string;
}

// ✅ Good: Type for unions
type Status = "pending" | "approved" | "rejected";

// ✅ Good: Type for intersections
type AdminUser = User & { role: "admin" };
```

## ⚛️ React Standards

### Component Structure

```typescript
// 1. "use client" directive (if needed)
"use client";

// 2. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 3. Types/Interfaces
interface Props {
  title: string;
  onAction?: () => void;
}

// 4. Component
export default function Component({ title, onAction }: Props) {
  // 5. Hooks
  const [state, setState] = useState<string>("");

  // 6. Event handlers
  const handleClick = () => {
    // ...
  };

  // 7. Effects
  useEffect(() => {
    // ...
  }, []);

  // 8. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

### Server vs Client Components

**Default to Server Components** - chỉ dùng Client Component khi cần:

```typescript
// ✅ Good: Server Component (default)
export default function Page() {
  return <div>Static content</div>;
}

// ✅ Good: Client Component (when needed)
"use client";
export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Props Destructuring

**Always destructure props**:

```typescript
// ✅ Good
function Component({ title, description }: Props) {
  return <div>{title}</div>;
}

// ❌ Bad
function Component(props: Props) {
  return <div>{props.title}</div>;
}
```

### Event Handlers

**Named functions** cho event handlers:

```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};

<form onSubmit={handleSubmit}>

// ❌ Bad
<form onSubmit={(e) => { e.preventDefault(); ... }}>
```

### Conditional Rendering

**Use early returns** cho conditions:

```typescript
// ✅ Good
function Component({ user }: { user: User | null }) {
  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}

// ❌ Bad
function Component({ user }: { user: User | null }) {
  return (
    <div>
      {user ? <div>{user.name}</div> : <div>Loading...</div>}
    </div>
  );
}
```

## 📁 File Organization

### Import Order

1. React & Next.js
2. Third-party libraries
3. Internal components
4. Utilities & helpers
5. Types
6. Styles

```typescript
// ✅ Good
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types/api";
import "./styles.css";
```

### File Naming

- **Components**: PascalCase (`UserCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: camelCase (`constants.ts`)
- **Types**: camelCase (`api.ts`)
- **Pages**: `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`

### Directory Structure

```
src/
├── app/              # Next.js pages
├── components/        # React components
│   ├── ui/          # UI components
│   └── layout/      # Layout components
├── lib/              # Utilities
├── services/         # API services
├── hooks/            # Custom hooks
└── types/            # TypeScript types
```

## 🏷️ Naming Conventions

### Variables & Functions

- **camelCase** cho variables và functions
- **Descriptive names**: `getUserById` thay vì `getUser`
- **Boolean prefixes**: `is`, `has`, `should`, `can`

```typescript
// ✅ Good
const userName = "John";
const isActive = true;
const hasPermission = false;
function getUserById(id: string) { ... }

// ❌ Bad
const u = "John";
const active = true;
function get(id: string) { ... }
```

### Constants

- **UPPER_SNAKE_CASE** cho constants
- **camelCase** cho exported constants object

```typescript
// ✅ Good
const MAX_RETRIES = 3;
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
};
```

### Components

- **PascalCase** cho component names
- **Descriptive names**: `UserProfileCard` thay vì `Card`

```typescript
// ✅ Good
export function UserProfileCard() { ... }

// ❌ Bad
export function Card() { ... }
```

### Types & Interfaces

- **PascalCase** cho types và interfaces
- **Descriptive names**: `UserProfile` thay vì `User`

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
}

type UserStatus = "active" | "inactive";

// ❌ Bad
interface U { ... }
type S = "a" | "i";
```

## 💅 Code Style

### Indentation

- **2 spaces** cho indentation
- **Consistent** across files

### Line Length

- **Max 80-100 characters** per line
- **Break long lines** appropriately

```typescript
// ✅ Good
const result = await apiClient.post<ApiResponse<LoginResponse>>(
  API_ENDPOINTS.AUTH.LOGIN,
  credentials
);

// ❌ Bad
const result = await apiClient.post<ApiResponse<LoginResponse>>(
  API_ENDPOINTS.AUTH.LOGIN,
  credentials
);
```

### Spacing

- **Space after keywords**: `if (condition)`
- **Space around operators**: `a + b`
- **No space in function calls**: `func()`
- **Space in object literals**: `{ a: 1, b: 2 }`

```typescript
// ✅ Good
if (condition) {
  const result = a + b;
  func();
  const obj = { a: 1, b: 2 };
}

// ❌ Bad
if (condition) {
  const result = a + b;
  func();
  const obj = { a: 1, b: 2 };
}
```

### Semicolons

- **Always use semicolons**

```typescript
// ✅ Good
const name = "John";

// ❌ Bad
const name = "John";
```

### Quotes

- **Double quotes** cho strings (Prettier default)
- **Single quotes** cho JSX attributes (nếu cần)

```typescript
// ✅ Good
const message = "Hello";
<Button className="btn">Click</Button>

// ❌ Bad
const message = 'Hello';
```

## 💬 Comments & Documentation

### JSDoc Comments

**Use JSDoc** cho functions và classes:

```typescript
/**
 * Login user with email and password
 * @param credentials - Login credentials
 * @returns User data and tokens
 * @throws {ApiError} If credentials are invalid
 */
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // ...
}
```

### Inline Comments

**Use sparingly** - code should be self-documenting:

```typescript
// ✅ Good: Explains why, not what
// Using setTimeout to debounce API calls
setTimeout(() => {
  fetchData();
}, 300);

// ❌ Bad: Explains what (obvious from code)
// Set timeout to 300ms
setTimeout(() => {
  fetchData();
}, 300);
```

### TODO Comments

**Use TODO comments** cho future work:

```typescript
// TODO: Add error handling for network failures
// FIXME: This should use React Query instead
// NOTE: This is a temporary solution
```

## 🔍 Code Review Checklist

Trước khi submit PR, kiểm tra:

- [ ] Code follows TypeScript standards
- [ ] No `any` types
- [ ] Proper error handling
- [ ] Constants used instead of magic strings
- [ ] Components properly typed
- [ ] No console.logs in production code
- [ ] Code formatted with Prettier
- [ ] No linting errors
- [ ] Comments added where needed
- [ ] Tests added (if applicable)

## 🛠️ Tools

### Prettier

Format code automatically:

```bash
npm run format
```

### ESLint

Check code quality:

```bash
npm run lint
npm run lint:fix
```

### TypeScript

Check types:

```bash
npm run type-check
```

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Next.js Best Practices](https://nextjs.org/docs)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
