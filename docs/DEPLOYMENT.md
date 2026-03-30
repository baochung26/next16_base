# Deployment Guide

## Pre-Deployment Checklist

```bash
npm install
npm run lint
npm run type-check
npm run build
```

## Required Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-strong-random-secret
```

## Vercel Deployment

1. Connect repository in Vercel
2. Set environment variables
3. Deploy from `main`

## Post-Deployment Checks

- Login and logout flow
- Protected route redirects
- API connectivity
- Basic page performance
