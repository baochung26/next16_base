# Next.js App với Authentication

Template Next.js 16 hoàn chỉnh với authentication, UI components đẹp mắt, và cấu trúc code chuẩn. Sẵn sàng để phát triển ứng dụng của bạn.

## 🚀 Tính năng

- ✅ **Next.js 16** với App Router và React 19
- ✅ **TypeScript** cho type safety
- ✅ **Authentication** với JWT token-based auth
- ✅ **UI Components** từ shadcn/ui
- ✅ **Dark Mode** với next-themes
- ✅ **API Integration** với Axios, sẵn sàng tích hợp NestJS
- ✅ **Form Validation** với React Hook Form + Zod
- ✅ **Dashboard** đầy đủ tính năng với sidebar navigation
- ✅ **Responsive Design** cho mọi thiết bị

## 📋 Yêu cầu

- Node.js 20.x trở lên
- npm, yarn, hoặc pnpm

## 🛠️ Cài đặt

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd next_20260123
   ```

2. **Cài đặt dependencies**

   ```bash
   npm install
   # hoặc
   yarn install
   # hoặc
   pnpm install
   ```

3. **Cấu hình environment variables**

   ```bash
   cp .env.example .env
   ```

   Chỉnh sửa `.env` với các giá trị phù hợp:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   ```

4. **Chạy development server**

   ```bash
   npm run dev
   ```

6. **Mở trình duyệt**
   ```
   http://localhost:3000
   ```

## 📁 Cấu trúc Project

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── ...
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...
├── lib/                   # Utilities và helpers
│   ├── api/              # API client và utilities
│   └── ...
├── services/              # API service classes
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── middleware.ts         # Next.js middleware
```

## 🎯 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Kiểm tra TypeScript types
- `npm run format` - Format code với Prettier
- `npm run format:check` - Kiểm tra code formatting
- `npm run seed` - Seed mock user data
- `npm run clean` - Xóa build artifacts

## 🔐 Authentication

Project sử dụng JWT token-based authentication:

- **Fake API**: Local Next.js API routes (development)
- **Real API**: NestJS backend (production)

Xem [API_USAGE.md](./docs/API_USAGE.md) để biết thêm chi tiết.

### Mock Users

- **Admin**: `admin@example.com` / `password123`
- **User**: `johndoe@example.com` / `password123`
- **Test**: `test@example.com` / `password123`

Xem [MOCK_USERS.md](./docs/MOCK_USERS.md) để biết thêm.

## 📚 Documentation

### Learning Resources

- **[Learning Guide](./docs/LEARNING_GUIDE.md)** - Hướng dẫn học React & Next.js qua project
  - React rendering model (Server vs Client Components)
  - Routing & Layout trong Next.js App Router
  - Data flow và State management
  - Hooks & Lifecycle
  - Performance optimization

- **[Walkthrough](./docs/WALKTHROUGH.md)** - Luồng hoạt động thực tế
  - User login flow từng bước chi tiết
  - File nào xử lý, data lưu ở đâu
  - Request flow và state management
  - Ví dụ thực tế với code từ project

### Core Documentation

- [Development Guide](./docs/DEVELOPMENT_GUIDE.md) - Hướng dẫn phát triển dự án
- [Architecture Overview](./docs/ARCHITECTURE.md) - Tổng quan kiến trúc và design patterns
- [Coding Standards](./docs/CODING_STANDARDS.md) - Chuẩn code và best practices
- [Feature Development Guide](./docs/FEATURE_DEVELOPMENT.md) - Hướng dẫn phát triển feature mới

### API & Integration

- [API Usage Guide](./docs/API_USAGE.md) - Hướng dẫn sử dụng API
- [MOCK_USERS.md](./docs/MOCK_USERS.md) - Mock user data

### UI & Layout

- [UI & Layout Guide](./docs/UI_LAYOUT.md) - Hướng dẫn UI components và layouts

### Workflow & Deployment

- [Git Workflow](./docs/GIT_WORKFLOW.md) - Quy trình làm việc với Git
- [Deployment Guide](./docs/DEPLOYMENT.md) - Hướng dẫn deploy project

### Troubleshooting

- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Xử lý lỗi thường gặp

### State Management

- [State Management Guide](./docs/STATE_MANAGEMENT.md) - Quản lý state trong project

## 🎨 UI Components

Project sử dụng [shadcn/ui](https://ui.shadcn.com/) cho UI components:

- Button, Card, Dialog, Form, Input, Label
- Dropdown Menu, Toast, Pagination
- Tất cả components có thể tùy chỉnh

Xem [UI_LAYOUT.md](./docs/UI_LAYOUT.md) để biết thêm.

## 🔧 Cấu hình

### Environment Variables

Xem `.env.example` để biết các biến môi trường cần thiết.

### TypeScript

Path aliases đã được cấu hình:

- `@/*` → `src/*`

### Tailwind CSS

Project sử dụng Tailwind CSS v4 với CSS variables cho theming.

## 🚢 Deployment

### Vercel (Recommended)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình environment variables
4. Deploy

### Other Platforms

Project có thể deploy trên bất kỳ platform nào hỗ trợ Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📝 License

MIT License

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
