# Troubleshooting Guide

Hướng dẫn xử lý các lỗi thường gặp.

## 📋 Mục lục

- [Common Errors](#common-errors)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [API Issues](#api-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)

## ❌ Common Errors

### 1. "Event handlers cannot be passed to Client Component props"

**Error Message:**

```
Event handlers cannot be passed to Client Component props.
<button onClick={function onClick} ...>
```

**Cause**: Server Component đang truyền event handler vào Client Component.

**Solution**: Thêm `"use client"` directive vào đầu file component.

```typescript
// ✅ Fix
"use client";

export default function Component() {
  return <button onClick={handleClick}>Click</button>;
}
```

### 2. "Module not found"

**Error Message:**

```
Module not found: Can't resolve '@/components/ui/button'
```

**Cause**: Import path không đúng hoặc file không tồn tại.

**Solution**:

- Kiểm tra path alias trong `tsconfig.json`
- Sử dụng absolute paths với `@/*`
- Đảm bảo file tồn tại

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";

// ❌ Bad
import { Button } from "../../components/ui/button";
```

### 3. "Cannot find name"

**Error Message:**

```
Cannot find name 'Home'
```

**Cause**: Import thiếu hoặc sai tên.

**Solution**: Kiểm tra imports

```typescript
// ✅ Good
import { Home } from "lucide-react";

// ❌ Bad
// Missing import
<Home />
```

### 4. "Type 'X' is not assignable to type 'Y'"

**Error Message:**

```
Type 'string' is not assignable to type 'number'
```

**Cause**: Type mismatch.

**Solution**: Fix type hoặc cast

```typescript
// ✅ Good
const id: number = parseInt(stringId, 10);

// ✅ Good (if sure)
const id = stringId as unknown as number;
```

## 🔨 Build Issues

### Build Fails with Type Errors

**Solution:**

```bash
# Check types
npm run type-check

# Fix types or add type assertions
```

### Build Fails with ESLint Errors

**Solution:**

```bash
# Check lint
npm run lint

# Auto-fix
npm run lint:fix
```

### Build is Slow

**Solution:**

```bash
# Clean build
npm run clean

# Rebuild
npm run build
```

### "Cannot find module" in Build

**Solution:**

```bash
# Clear cache
rm -rf .next node_modules

# Reinstall
npm install

# Rebuild
npm run build
```

## 🐛 Runtime Errors

### "Hydration Error"

**Error Message:**

```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Cause**: Server và client render khác nhau.

**Solution:**

- Kiểm tra `useEffect` hooks
- Đảm bảo không có browser-only APIs trong Server Components
- Sử dụng `suppressHydrationWarning` nếu cần

```typescript
// ✅ Good
"use client";
import { useEffect, useState } from "react";

export default function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div>Client-only content</div>;
}
```

### "ReferenceError: window is not defined"

**Cause**: Sử dụng `window` trong Server Component.

**Solution**:

- Move to Client Component
- Check `typeof window !== "undefined"`

```typescript
// ✅ Good
"use client";
export default function Component() {
  useEffect(() => {
    // window is available here
    window.localStorage.setItem("key", "value");
  }, []);
}

// ✅ Good (Server Component)
if (typeof window !== "undefined") {
  // Use window
}
```

### "Cannot read property of undefined"

**Cause**: Accessing property on undefined/null.

**Solution**: Add null checks

```typescript
// ✅ Good
if (user && user.name) {
  return <div>{user.name}</div>;
}

// ✅ Good (Optional chaining)
return <div>{user?.name}</div>;
```

## 🌐 API Issues

### "Network Error" or "Failed to fetch"

**Cause**:

- Backend không chạy
- CORS issue
- Wrong API URL

**Solution:**

1. Check backend is running
2. Check `NEXT_PUBLIC_API_URL` in `.env`
3. Check CORS configuration in backend

```typescript
// Check API URL
console.log(process.env.NEXT_PUBLIC_API_URL);
```

### "401 Unauthorized"

**Cause**: Token không hợp lệ hoặc hết hạn.

**Solution:**

1. Check token in localStorage
2. Re-login
3. Check token expiration

```typescript
// Check token
const token = getAccessToken();
console.log("Token:", token);
```

### "404 Not Found"

**Cause**: API endpoint không tồn tại.

**Solution:**

1. Check endpoint URL
2. Check backend routes
3. Use constants for endpoints

```typescript
// ✅ Good
import { API_ENDPOINTS } from "@/lib/constants";
apiClient.get(API_ENDPOINTS.AUTH.LOGIN);
```

### "500 Internal Server Error"

**Cause**: Server error.

**Solution:**

1. Check backend logs
2. Check request payload
3. Check server configuration

## 🔐 Authentication Issues

### Login Redirects to Login Page

**Cause**: Token không được lưu hoặc middleware block.

**Solution:**

1. Check token is saved after login
2. Check middleware logic
3. Check cookies

```typescript
// Debug token
console.log("Access token:", getAccessToken());
console.log("User info:", getUserInfo());
```

### Token Expired Immediately

**Cause**: Token expiration time quá ngắn.

**Solution:**

1. Check token expiration in backend
2. Implement refresh token
3. Check token generation

### Logout Doesn't Work

**Cause**: Tokens không được clear.

**Solution:**

```typescript
// Ensure clearTokens is called
import { clearTokens } from "@/lib/api/token";

clearTokens();
// Also clear cookies if needed
```

## ⚡ Performance Issues

### Slow Page Load

**Solution:**

1. Check bundle size
2. Use dynamic imports
3. Optimize images
4. Check API response times

```typescript
// Dynamic import
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Loading />,
});
```

### Memory Leaks

**Cause**: Event listeners hoặc subscriptions không cleanup.

**Solution:**

```typescript
// ✅ Good
useEffect(() => {
  const handler = () => {
    /* ... */
  };
  window.addEventListener("resize", handler);

  return () => {
    window.removeEventListener("resize", handler);
  };
}, []);
```

### Large Bundle Size

**Solution:**

1. Analyze bundle

```bash
npm run build
# Check .next/analyze
```

2. Use dynamic imports
3. Remove unused dependencies
4. Tree-shake unused code

## 🔧 Debugging Tips

### Enable Debug Logging

```typescript
// In development
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}
```

### Use React DevTools

- Install React DevTools extension
- Inspect component tree
- Check props and state

### Use Network Tab

- Check API requests
- Verify request/response
- Check status codes

### Check Console

- Look for errors
- Check warnings
- Verify logs

## 📞 Getting Help

1. **Check Documentation**
   - [Development Guide](./DEVELOPMENT_GUIDE.md)
   - [API Usage Guide](./API_USAGE.md)
   - [UI Layout Guide](./UI_LAYOUT.md)

2. **Search Issues**
   - Check GitHub issues
   - Search Stack Overflow
   - Check Next.js docs

3. **Create Issue**
   - Provide error message
   - Include steps to reproduce
   - Add code snippets
   - Include environment info

## 🛠️ Useful Commands

```bash
# Clean everything
npm run clean
rm -rf node_modules .next
npm install

# Check types
npm run type-check

# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Build
npm run build

# Start production
npm start
```

## 📚 Resources

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TypeScript Error Messages](https://typescript.tv/errors/)
