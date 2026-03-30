# Git Workflow Guide

## Branching

- `main`: stable branch
- Feature branches: `feature/<name>`
- Fix branches: `fix/<name>`
- Chore branches: `chore/<name>`

## Commit Messages

Use conventional prefixes when possible:

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

Example:

```bash
feat(auth): add refresh-token retry handling
```

## Pull Requests

- Keep PR scope focused
- Include validation steps (`lint`, `type-check`, `build`)
- Document behavior changes and migration notes (if any)
