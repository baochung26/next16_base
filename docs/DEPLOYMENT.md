# Deployment Guide

Hướng dẫn deploy project lên các platform.

## 📋 Mục lục

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Other Platforms](#other-platforms)
- [Post-Deployment](#post-deployment)

## ✅ Prerequisites

### Build Check

Trước khi deploy, đảm bảo:

```bash
# Install dependencies
npm install

# Run type check
npm run type-check

# Run lint
npm run lint

# Build project
npm run build
```

Nếu build thành công, project sẵn sàng deploy.

## 🔐 Environment Variables

### Required Variables

Tạo file `.env.production` hoặc set trong platform:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1

# NextAuth (if using)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generate NEXTAUTH_SECRET

```bash
# Generate secret
openssl rand -base64 32
```

## 🚀 Vercel Deployment (Recommended)

### Step 1: Prepare Repository

1. Push code lên GitHub/GitLab/Bitbucket
2. Đảm bảo `.gitignore` đúng
3. Đảm bảo `package.json` có build script

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Import Project**
   - Click "Add New Project"
   - Import từ Git repository
   - Select repository

3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Environment Variables**
   - Add all required variables
   - Set for Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 3: Custom Domain (Optional)

1. Go to Project Settings
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions

### Vercel Configuration File

Tạo `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

## 🌐 Other Platforms

### Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Import from Git

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Add in Site Settings → Environment Variables

4. **Deploy**

### AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect repository

2. **Build Settings**

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - "**/*"
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add in App Settings

### Railway

1. **Create New Project**
   - Connect GitHub repository

2. **Configure**
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Environment Variables**
   - Add in Variables tab

### Render

1. **Create New Web Service**
   - Connect repository

2. **Settings**
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   - Add in Environment tab

## 📦 Docker Deployment

### Dockerfile

Tạo `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Tạo `docker-compose.yml`:

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    env_file:
      - .env.production
```

### Build and Run

```bash
# Build image
docker build -t next-app .

# Run container
docker run -p 3000:3000 --env-file .env.production next-app
```

## 🔧 Next.js Configuration

### Standalone Output

Trong `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For Docker
  // Other config...
};

export default nextConfig;
```

## ✅ Post-Deployment

### 1. Verify Deployment

- [ ] Home page loads
- [ ] Authentication works
- [ ] API calls work
- [ ] Dark mode works
- [ ] All pages accessible

### 2. Performance Check

- [ ] Lighthouse score > 90
- [ ] Page load time < 3s
- [ ] No console errors

### 3. Security Check

- [ ] Environment variables not exposed
- [ ] HTTPS enabled
- [ ] CORS configured correctly

### 4. Monitoring

Set up monitoring:

- **Error tracking**: Sentry
- **Analytics**: Google Analytics, Vercel Analytics
- **Uptime monitoring**: UptimeRobot, Pingdom

## 🔄 CI/CD Pipeline

### GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 Troubleshooting

### Build Fails

1. **Check Node version**: Ensure Node 20+
2. **Clear cache**: `rm -rf .next node_modules`
3. **Reinstall**: `npm install`
4. **Check logs**: Review build logs for errors

### Environment Variables Not Working

1. **Check naming**: Must start with `NEXT_PUBLIC_` for client-side
2. **Redeploy**: Variables require redeploy
3. **Check platform**: Ensure variables set correctly

### API Calls Fail

1. **Check CORS**: Backend must allow frontend domain
2. **Check API URL**: Ensure correct in environment variables
3. **Check network**: Verify backend is accessible

## 📚 Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
