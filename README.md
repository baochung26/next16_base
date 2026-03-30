# Next.js 16 Base Project

A production-oriented **Next.js 16 + TypeScript** starter focused on authentication, modular architecture, and clean scalability patterns.

## Highlights

- Next.js 16 App Router + React 19
- TypeScript-first structure
- JWT-based authentication flow
- Centralized API layer (Axios + service classes)
- Reusable UI with shadcn/ui + Tailwind CSS v4
- Ready for dashboard-style products

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run lint:fix` - fix ESLint issues
- `npm run type-check` - run TypeScript checks
- `npm run format` - format files with Prettier
- `npm run format:check` - validate formatting
- `npm run clean` - remove build cache artifacts

## Project Structure

```text
src/
  app/            # App Router pages
  components/     # UI and feature components
  contexts/       # React providers
  hooks/          # Reusable hooks
  lib/            # Core utilities and API client
  services/       # Domain service layer
  types/          # Shared TypeScript models
```

## Documentation

See [docs/README.md](./docs/README.md) for the full documentation index.

## Public Repo Notes

This repository is prepared as a portfolio-quality base project:

- Documentation is fully in English
- License and contribution guidelines are included
- CI checks lint, type safety, and build on every push/PR

## License

MIT. See [LICENSE](./LICENSE).
