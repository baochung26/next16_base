# Documentation Index

Tài liệu đầy đủ cho project development.

## 📚 Tài liệu theo chủ đề

### 🚀 Getting Started

- **[Learning Guide](./LEARNING_GUIDE.md)** - Hướng dẫn học React & Next.js
  - React rendering model
  - Server vs Client Components
  - Routing & Layout
  - Data flow & State management
  - Hooks & Lifecycle
  - Performance optimization

- **[Walkthrough](./WALKTHROUGH.md)** - Luồng hoạt động thực tế trong project
  - User login flow từng bước
  - File nào xử lý, data lưu ở đâu
  - Request flow và state management
  - Ví dụ thực tế với code

- **[Auth Context – Giải thích chi tiết](./AUTH_CONTEXT_EXPLAINED.md)** - Học React/Next qua `auth-context.tsx`
  - Từng dòng: "use client", import, Context, Provider, useAuth
  - useState, useEffect, refetch, luồng hoạt động
  - Cách dùng trong component, khái niệm cần nắm

- **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Hướng dẫn bắt đầu phát triển
  - Setup project
  - Development workflow
  - Coding standards
  - Adding new features
  - Testing

### 🏗️ Architecture & Design

- **[Architecture Overview](./ARCHITECTURE.md)** - Tổng quan kiến trúc
  - Technology stack
  - Architecture patterns
  - Data flow
  - Authentication flow
  - API architecture

- **[Auth Storage & Security](./AUTH_STORAGE_AND_SECURITY.md)** - Lưu trữ token & bảo mật
  - localStorage vs cookie, mục đích từng nơi
  - Tại sao Next.js cần cả hai (server không có localStorage)
  - So sánh React thuần vs Next.js
  - Rủi ro lộ lọt cookie, khuyến nghị và checklist

- **[Coding Standards](./CODING_STANDARDS.md)** - Chuẩn code
  - TypeScript standards
  - React standards
  - File organization
  - Naming conventions
  - Code style

### 🔧 Development

- **[Feature Development Guide](./FEATURE_DEVELOPMENT.md)** - Phát triển feature mới
  - Feature planning
  - Development steps
  - Complete examples
  - Best practices

- **[API Usage Guide](./API_USAGE.md)** - Sử dụng API
  - API structure
  - Service usage
  - Error handling
  - Token management

- **[UI & Layout Guide](./UI_LAYOUT.md)** - UI components và layouts
  - shadcn/ui components
  - Layout components
  - Styling guidelines
  - Theming

### 🔄 Workflow

- **[Git Workflow](./GIT_WORKFLOW.md)** - Quy trình Git
  - Branch strategy
  - Commit messages
  - Pull request process
  - Code review guidelines

### 🚢 Deployment

- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy project
  - Prerequisites
  - Vercel deployment
  - Other platforms
  - Docker deployment
  - Post-deployment

### 🐛 Troubleshooting

- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Xử lý lỗi
  - Common errors
  - Build issues
  - Runtime errors
  - API issues
  - Authentication issues

- **[Optimization Guide](./OPTIMIZATION_GUIDE.md)** - Tối ưu source code
  - Tách component lớn thành nhỏ
  - Performance optimization (memoization)
  - Custom hooks
  - Giảm code duplication
  - Type safety
  - Checklist tối ưu

- **[Server vs Client Fetching](./SERVER_VS_CLIENT_FETCHING.md)** - Khi nào fetch data ở đâu
  - Tại sao project hiện tại dùng Client Components
  - Khi nào nên dùng Server Components
  - Hybrid approach
  - Ví dụ cụ thể cho project

- **[Why Both localStorage and Cookie](./WHY_BOTH_LOCALSTORAGE_AND_COOKIE.md)** - Tại sao cần cả hai
  - Có thể chỉ dùng cookie không?
  - Ưu điểm localStorage so với cookie
  - So sánh chi tiết
  - Khi nào nên dùng gì

### 📖 Reference

- **[Auth Context – Giải thích chi tiết](./AUTH_CONTEXT_EXPLAINED.md)** - Phân tích `auth-context.tsx`

- **[Auth Storage & Security](./AUTH_STORAGE_AND_SECURITY.md)** - localStorage, cookie, Next.js vs React, rủi ro lộ lọt

- **[State Management Guide](./STATE_MANAGEMENT.md)** - Quản lý state
  - Current approach
  - State types
  - Best practices
  - Future improvements

  - Test accounts
  - User roles
  - Password information

## 🗺️ Navigation Guide

### Cho người mới bắt đầu

1. Đọc [Development Guide](./DEVELOPMENT_GUIDE.md) để setup
2. Xem [Architecture Overview](./ARCHITECTURE.md) để hiểu cấu trúc
3. Tham khảo [Coding Standards](./CODING_STANDARDS.md) khi code

### Cho developer

1. [Feature Development Guide](./FEATURE_DEVELOPMENT.md) - Phát triển feature
2. [API Usage Guide](./API_USAGE.md) - Tích hợp API
3. [UI Layout Guide](./UI_LAYOUT.md) - Tạo UI components

### Cho team lead

1. [Git Workflow](./GIT_WORKFLOW.md) - Quy trình Git
2. [Coding Standards](./CODING_STANDARDS.md) - Chuẩn code
3. [Architecture Overview](./ARCHITECTURE.md) - Kiến trúc

### Cho DevOps

1. [Deployment Guide](./DEPLOYMENT.md) - Deploy project
2. [Troubleshooting Guide](./TROUBLESHOOTING.md) - Xử lý lỗi

## 📋 Quick Reference

### Common Tasks

| Task                | Document                                                    |
| ------------------- | ----------------------------------------------------------- |
| Setup project       | [Development Guide](./DEVELOPMENT_GUIDE.md#getting-started) |
| Add new feature     | [Feature Development Guide](./FEATURE_DEVELOPMENT.md)       |
| Use API             | [API Usage Guide](./API_USAGE.md)                           |
| Create UI component | [UI Layout Guide](./UI_LAYOUT.md)                           |
| Fix error           | [Troubleshooting Guide](./TROUBLESHOOTING.md)               |
| Deploy              | [Deployment Guide](./DEPLOYMENT.md)                         |
| Git workflow        | [Git Workflow](./GIT_WORKFLOW.md)                           |
| Auth storage & security | [Auth Storage & Security](./AUTH_STORAGE_AND_SECURITY.md) |
| Optimize code      | [Optimization Guide](./OPTIMIZATION_GUIDE.md)              |
| Server vs Client fetching | [Server vs Client Fetching](./SERVER_VS_CLIENT_FETCHING.md) |
| Why localStorage + cookie | [Why Both localStorage and Cookie](./WHY_BOTH_LOCALSTORAGE_AND_COOKIE.md) |

### Code Examples

- **API Service**: [API Usage Guide](./API_USAGE.md#sử-dụng-services)
- **Component**: [UI Layout Guide](./UI_LAYOUT.md#components)
- **Feature**: [Feature Development Guide](./FEATURE_DEVELOPMENT.md#example-user-management-feature)

## 🔍 Search Documentation

Sử dụng search trong IDE hoặc GitHub để tìm:

- Function names
- Component names
- API endpoints
- Error messages

## 📝 Contributing to Documentation

Khi cập nhật documentation:

1. Follow markdown format
2. Use clear headings
3. Include code examples
4. Update index if needed
5. Test code examples

## 📞 Support

Nếu cần hỗ trợ:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing documentation
3. Check GitHub issues
4. Create new issue

## 📚 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
