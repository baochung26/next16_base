# Feature Development Guide

Hướng dẫn phát triển feature mới từ đầu đến cuối.

## 📋 Mục lục

- [Overview](#overview)
- [Feature Planning](#feature-planning)
- [Development Steps](#development-steps)
- [Example: User Management Feature](#example-user-management-feature)
- [Best Practices](#best-practices)

## 🎯 Overview

Quy trình phát triển feature mới:

```
1. Planning → 2. Setup → 3. Development → 4. Testing → 5. Documentation
```

## 📝 Feature Planning

### 1. Define Requirements

Trả lời các câu hỏi:

- **What**: Feature làm gì?
- **Who**: Ai sử dụng?
- **Why**: Tại sao cần?
- **How**: Làm thế nào?

### 2. Break Down into Tasks

Chia feature thành các tasks nhỏ:

```
Feature: User Profile
├── Task 1: Create profile page
├── Task 2: Add edit form
├── Task 3: Add avatar upload
└── Task 4: Add password change
```

### 3. Design API (if needed)

Thiết kế API endpoints:

```typescript
// GET /api/users/me - Get current user
// PUT /api/users/me - Update profile
// POST /api/users/avatar - Upload avatar
// PUT /api/users/password - Change password
```

## 🚀 Development Steps

### Step 1: Create Branch

```bash
git checkout -b feature/user-profile
```

### Step 2: Add Constants

Thêm routes và endpoints vào `src/lib/constants.ts`:

```typescript
export const ROUTES = {
  // ...
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
};

export const API_ENDPOINTS = {
  // ...
  USERS: {
    ME: "/users/me",
    UPDATE_PROFILE: "/users/me",
    UPLOAD_AVATAR: "/users/avatar",
    CHANGE_PASSWORD: "/users/password",
  },
};
```

### Step 3: Implement Service Method

Thêm method vào service class để gọi trực tiếp backend API:

```typescript
// src/services/user.service.ts
async getUserById(id: string): Promise<User> {
  return this.safeCall(() =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`)
  );
}

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

### Step 4: Create Service

Tạo service class trong `src/services/`:

```typescript
// src/services/user.service.ts
import { BaseService } from "@/lib/api/base.service";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants";

class UserService extends BaseService {
  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return this.safeCall(async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.ME);
      return this.handleResponse(response);
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest) {
    return this.safeCall(async () => {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      );
      return this.handleResponse(response);
    });
  }
}

export const userService = new UserService();
```

### Step 5: Create Types

Thêm types vào `src/types/api.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### Step 6: Create Page Component

Tạo page trong `src/app/profile/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services";
import { Loading } from "@/components/loading";
import { Card } from "@/components/ui/card";
import type { User } from "@/types/api";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getCurrentUser();
      setUser(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </Card>
    </div>
  );
}
```

### Step 7: Add Navigation

Thêm link vào navigation:

```typescript
// src/components/layout/header.tsx
import { ROUTES } from "@/lib/constants";

<Link href={ROUTES.PROFILE}>Profile</Link>
```

### Step 8: Test Feature

1. **Manual Testing**
   - Test happy path
   - Test error cases
   - Test edge cases

2. **Check Types**

   ```bash
   npm run type-check
   ```

3. **Lint**
   ```bash
   npm run lint
   ```

### Step 9: Commit and Push

```bash
git add .
git commit -m "feat(profile): add user profile page"
git push origin feature/user-profile
```

## 📚 Example: User Management Feature

### Complete Example

**Feature**: User Management trong Dashboard

#### 1. Constants

```typescript
// src/lib/constants.ts
export const ROUTES = {
  DASHBOARD: {
    USERS: "/dashboard/users",
  },
};

export const API_ENDPOINTS = {
  USERS: {
    LIST: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
};
```

#### 2. Types

```typescript
// src/types/api.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: "admin" | "user";
}
```

#### 3. Service

```typescript
// src/services/user.service.ts
class UserService extends BaseService {
  async getUsers(params?: { page?: number; limit?: number }) {
    return this.safeCall(async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, {
        params,
      });
      return this.handleResponse(response);
    });
  }

  async getUserById(id: string) {
    return this.safeCall(async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(id));
      return this.handleResponse(response);
    });
  }

  async createUser(data: CreateUserRequest) {
    return this.safeCall(async () => {
      const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
      return this.handleResponse(response);
    });
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    return this.safeCall(async () => {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.UPDATE(id),
        data
      );
      return this.handleResponse(response);
    });
  }

  async deleteUser(id: string) {
    return this.safeCall(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
      return this.handleResponse(response);
    });
  }
}
```

#### 4. Page Component

```typescript
// src/app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/loading";
import { toast } from "@/hooks/use-toast";
import type { User } from "@/types/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <h1>Users</h1>
        <table>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </table>
      </Card>
    </div>
  );
}
```

## ✅ Best Practices

### 1. Start Small

- Implement basic version trước
- Add features incrementally
- Refactor khi cần

### 2. Use Constants

- Always use constants từ `@/lib/constants`
- Không hard-code strings/numbers

### 3. Error Handling

- Always handle errors
- Show user-friendly messages
- Log errors for debugging

### 4. Loading States

- Show loading states
- Use skeleton loaders
- Disable buttons khi loading

### 5. Validation

- Validate input
- Use Zod schemas
- Show validation errors

### 6. Testing

- Test manually
- Test error cases
- Test edge cases

### 7. Documentation

- Add JSDoc comments
- Update README nếu cần
- Document API changes

## 📋 Feature Checklist

Trước khi hoàn thành feature:

- [ ] Constants added
- [ ] Types defined
- [ ] Service method implemented
- [ ] Service methods implemented
- [ ] Page component created
- [ ] Navigation added
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Validation added
- [ ] Manual testing completed
- [ ] Types checked
- [ ] Linting passed
- [ ] Code formatted
- [ ] Documentation updated

## 📚 Related Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [API Usage Guide](./API_USAGE.md)
- [Coding Standards](./CODING_STANDARDS.md)
