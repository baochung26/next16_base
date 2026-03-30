# Coding Standards

## General

- Prefer clarity over cleverness.
- Keep functions/components focused on one responsibility.
- Avoid duplicated logic and magic values.

## TypeScript

- Type all public function boundaries.
- Avoid `any` unless there is a clear reason.
- Keep shared domain types in `src/types`.

## React

- Keep page files orchestration-focused.
- Move reusable logic into hooks/services.
- Keep side effects explicit and isolated.

## Naming

- Components: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: follow existing project conventions

## Imports

- Prefer project alias imports (`@/...`) for internal modules.
- Keep import blocks tidy and grouped by origin.
