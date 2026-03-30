# Next.js 16 Base Project

A production-ready **Next.js 16 + TypeScript** starter focused on auth flows, dashboard foundations, and scalable frontend architecture.

## Tech Stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Axios-based API client with service layer
- React Hook Form + Zod
- NextAuth v5 (optional provider setup)

## Current Features

- Public pages: Home, About, Features
- Auth pages: Login, Register, Forgot Password, Reset Password, Callback
- Protected pages: Profile and Dashboard area
- Dashboard modules: Users, Products, Orders, Reports, Documents, Settings
- Route protection via `src/proxy.ts` using `accessToken` cookie
- Token handling with access/refresh token storage and auto refresh flow
- Centralized API layer in `src/lib/api` and `src/services`

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env` from `.env.example` and set values:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production-please-use-a-random-string

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Optional (enable Google provider in NextAuth):

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Auto-fix ESLint issues
- `npm run type-check`: Run TypeScript checks
- `npm run format`: Format code with Prettier
- `npm run format:check`: Check code formatting
- `npm run clean`: Remove cache/build artifacts

## Project Structure

```text
src/
  app/              # App Router pages, layouts, and route-level states
  components/       # Shared UI and feature components
  contexts/         # React context providers
  hooks/            # Reusable hooks
  lib/              # Constants, utilities, auth, API infrastructure
    api/            # Axios client, interceptors, token/session helpers
  services/         # Domain services (auth, user, ...)
  types/            # Shared TypeScript models
```

## Quality & CI

GitHub Actions CI (`.github/workflows/ci.yml`) runs on push/PR to `main`:

- Lint
- Type check
- Build

## Documentation

See [docs/README.md](./docs/README.md) for full documentation index, including:

- Architecture
- API Usage
- Auth Storage and Security
- Deployment
- Troubleshooting

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT. See [LICENSE](./LICENSE).
