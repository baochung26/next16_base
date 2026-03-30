# UI and Layout Guide

## UI Stack

- Tailwind CSS v4
- shadcn/ui components
- Radix UI primitives

## Structure

- `src/components/ui`: low-level reusable UI building blocks
- `src/components/layout`: app-level layouts (main, auth, dashboard)

## Conventions

- Keep feature logic out of low-level UI components.
- Prefer composition over deeply coupled monolithic components.
- Reuse existing UI primitives before introducing new ones.
- Maintain responsive behavior for mobile and desktop.
