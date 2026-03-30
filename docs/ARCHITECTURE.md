# Architecture Overview

## Summary

This project uses **Next.js 16 App Router** with a layered architecture and a service-based API integration pattern.

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Axios for HTTP
- React Hook Form + Zod

## Architecture Layers

1. Presentation Layer
- `src/app`
- `src/components`
- Responsible for pages, layouts, and UI interactions.

2. Business Layer
- `src/services`
- `src/hooks`
- `src/contexts`
- Responsible for feature logic and state orchestration.

3. Data Access Layer
- `src/lib/api`
- Responsible for HTTP client configuration, token handling, and standardized errors.

## Request Flow

1. UI triggers action.
2. Service method is called.
3. Service calls shared API client.
4. Interceptors append auth token and normalize failures.
5. UI receives typed result or handled error.

## Authentication Model

- Access token is used for authenticated API calls.
- Cookie is used for server-side route protection checks.
- Local storage is used by client-side API requests.

## Design Principles

- Keep pages thin and move logic into services/hooks.
- Reuse API client and avoid ad-hoc fetch logic.
- Favor explicit types at service boundaries.
- Keep component responsibilities small and composable.
