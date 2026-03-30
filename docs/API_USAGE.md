# API Usage Guide

## Overview

API calls are centralized via a shared Axios client and service classes.

## Key Paths

- `src/lib/api/client.ts`: Axios instance and interceptors
- `src/lib/api/base.service.ts`: Shared service base
- `src/lib/api/token.ts`: Token helpers
- `src/services/auth.service.ts`: Authentication calls
- `src/services/user.service.ts`: User-related calls

## Environment

Set API base URL in `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Usage Pattern

```ts
import { authService, userService } from "@/services";

const loginResult = await authService.login({
  identifier: "admin@example.com",
  password: "password123",
});

const users = await userService.getUsers();
```

## Best Practices

- Use service methods from `@/services`
- Keep direct HTTP calls out of page components
- Handle API errors via shared error format utilities
- Keep request and response models typed
