# Development Guide

## Prerequisites

- Node.js 20+
- npm 10+

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open: `http://localhost:3000`

## Common Scripts

- `npm run dev`: Start development server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript checks
- `npm run build`: Build production bundle
- `npm run format`: Format supported files

## Project Structure

```text
src/
  app/            # Next.js App Router pages
  components/     # Reusable UI and feature components
  contexts/       # React context providers
  hooks/          # Reusable hooks
  lib/            # Shared utilities and API layer
  services/       # Feature services (auth, user, ...)
  types/          # Shared TypeScript types
```

## Development Workflow

1. Create a branch from `main`
2. Implement changes with small commits
3. Run lint + type-check + build locally
4. Open pull request with clear scope and test notes
