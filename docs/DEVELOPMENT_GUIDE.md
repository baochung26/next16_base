# Development Guide

Hướng dẫn phát triển dự án từ project base này.

## 📋 Mục lục

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x trở lên
- npm, yarn, hoặc pnpm
- Git

### Initial Setup

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd next_20260123
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Chỉnh sửa `.env` với các giá trị phù hợp.

4. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── profile/           # User profile
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── error.tsx          # Global error page
│   ├── loading.tsx        # Global loading
│   └── not-found.tsx      # 404 page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── providers/        # Context providers
│   └── ...
├── lib/                   # Utilities & helpers
│   ├── api/              # API client & utilities
│   ├── db/               # Database utilities (mock)
│   ├── utils/            # Utility functions
│   ├── constants.ts      # Application constants
│   └── ...
├── services/              # API service classes
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── index.ts
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── middleware.ts          # Next.js middleware
└── ...
```

## 🔄 Development Workflow

### Daily Workflow

1. **Pull latest changes**

   ```bash
   git pull origin main
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes**
   - Write code
   - Test locally
   - Format code: `npm run format`
   - Check types: `npm run type-check`
   - Lint: `npm run lint`

4. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Checks

Trước khi commit, chạy:

```bash
# Format code
npm run format

# Check TypeScript types
npm run type-check

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix
```

## 📝 Coding Standards

### TypeScript

- **Always use TypeScript**: Không sử dụng `any` type
- **Type definitions**: Định nghĩa types trong `src/types/`
- **Interfaces vs Types**: Ưu tiên `interface` cho objects, `type` cho unions/intersections

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad
const user: any = { ... };
```

### React Components

- **Server vs Client Components**:
  - Server Components mặc định (không có `"use client"`)
  - Chỉ dùng Client Component khi cần interactivity (onClick, useState, useEffect)

```typescript
// ✅ Server Component (default)
export default function Page() {
  return <div>Static content</div>;
}

// ✅ Client Component (when needed)
"use client";
export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

- **Component Structure**:

  ```typescript
  // 1. Imports
  import { ... } from "...";

  // 2. Types/Interfaces
  interface Props { ... }

  // 3. Component
  export default function Component({ ... }: Props) {
    // 4. Hooks
    const [state, setState] = useState();

    // 5. Handlers
    const handleClick = () => { ... };

    // 6. Render
    return <div>...</div>;
  }
  ```

### File Naming

- **Components**: PascalCase (`UserCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: camelCase (`constants.ts`)
- **Types**: camelCase (`api.ts`)
- **Pages**: `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`

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
```

### Constants Usage

**Always use constants** từ `@/lib/constants`:

```typescript
// ✅ Good
import { ROUTES, API_ENDPOINTS } from "@/lib/constants";
<Link href={ROUTES.AUTH.LOGIN}>Login</Link>

// ❌ Bad
<Link href="/auth/login">Login</Link>
```

## 🎯 Adding New Features

### 1. New Page

1. **Create page file**

   ```typescript
   // src/app/your-page/page.tsx
   export default function YourPage() {
     return <div>Your page content</div>;
   }
   ```

2. **Add route to constants**

   ```typescript
   // src/lib/constants.ts
   export const ROUTES = {
     // ...
     YOUR_PAGE: "/your-page",
   };
   ```

3. **Add navigation link** (if needed)

### 2. New API Endpoint

1. **Create API route**

   ```typescript
   // src/app/api/your-endpoint/route.ts
   import { NextResponse } from "next/server";

   export async function GET() {
     return NextResponse.json({ message: "Hello" });
   }
   ```

2. **Add to constants**

   ```typescript
   // src/lib/constants.ts
   export const API_ENDPOINTS = {
     // ...
     YOUR_ENDPOINT: "/your-endpoint",
   };
   ```

3. **Create service method** (if needed)

   ```typescript
   // src/services/your.service.ts
   import { BaseService } from "@/lib/api/base.service";
   import { API_ENDPOINTS } from "@/lib/constants";

   class YourService extends BaseService {
     async getData() {
       return this.safeCall(() => apiClient.get(API_ENDPOINTS.YOUR_ENDPOINT));
     }
   }
   ```

### 3. New UI Component

1. **Create component**

   ```typescript
   // src/components/your-component.tsx
   interface Props {
     // ...
   }

   export function YourComponent({ ... }: Props) {
     return <div>...</div>;
   }
   ```

2. **Use shadcn/ui** (if applicable)
   ```bash
   npx shadcn@latest add [component-name]
   ```

### 4. New Service

1. **Create service class**

   ```typescript
   // src/services/your.service.ts
   import { BaseService } from "@/lib/api/base.service";
   import { apiClient } from "@/lib/api/client";
   import { API_ENDPOINTS } from "@/lib/constants";

   class YourService extends BaseService {
     async getData() {
       return this.safeCall(() => apiClient.get(API_ENDPOINTS.YOUR_ENDPOINT));
     }
   }

   export const yourService = new YourService();
   ```

2. **Export from index**
   ```typescript
   // src/services/index.ts
   export { yourService } from "./your.service";
   ```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test dark mode
- [ ] Test authentication flow
- [ ] Test error handling
- [ ] Test loading states

### Testing Best Practices

1. **Test user flows**: Login → Dashboard → Feature → Logout
2. **Test error cases**: Invalid input, network errors, 404 pages
3. **Test edge cases**: Empty states, loading states, error states

## 🐛 Troubleshooting

### Common Issues

#### 1. "Event handlers cannot be passed to Client Component props"

**Problem**: Server Component đang truyền event handler vào Client Component.

**Solution**: Thêm `"use client"` vào đầu file component.

```typescript
"use client"; // Add this
export default function Component() {
  return <button onClick={handleClick}>Click</button>;
}
```

#### 2. "Module not found"

**Problem**: Import path không đúng.

**Solution**: Sử dụng path alias `@/*` thay vì relative paths.

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";

// ❌ Bad
import { Button } from "../../components/ui/button";
```

#### 3. Build errors

**Solution**:

```bash
# Clean build
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 4. TypeScript errors

**Solution**:

```bash
# Check types
npm run type-check

# Restart TypeScript server in IDE
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Follow coding standards
2. Write clear commit messages
3. Test your changes
4. Update documentation if needed
5. Create PR with clear description

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra [Troubleshooting](#troubleshooting)
2. Xem [API Usage Guide](./API_USAGE.md)
3. Xem [UI Layout Guide](./UI_LAYOUT.md)
4. Tạo issue trên repository
