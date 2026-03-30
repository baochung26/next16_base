# Troubleshooting Guide

## Common Issues

### `Module not found`

- Verify path alias usage (`@/...`)
- Confirm file exists and casing matches

### TypeScript errors

- Run `npm run type-check`
- Ensure imported types are correct and up to date

### Auth redirect loops

- Verify token/cookie write and clear logic
- Verify middleware route matching conditions

### Build failures

- Run `npm run lint` and `npm run type-check` first
- Confirm required environment variables are set
