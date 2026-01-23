# Tài liệu UI Components và Layout

## Tổng quan

Project sử dụng **shadcn/ui** làm thư viện UI components chính, kết hợp với **Tailwind CSS v4** và **Radix UI** để tạo ra các components đẹp, accessible và dễ tùy chỉnh.

## Cấu trúc thư mục

```
src/
├── components/
│   ├── ui/              # UI Components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   └── layout/          # Layout Components
│       ├── header.tsx
│       ├── footer.tsx
│       ├── main-layout.tsx
│       ├── auth-layout.tsx
│       └── dashboard-layout.tsx
```

## UI Components

### 1. Button

Component button với nhiều variants và sizes.

**Import:**

```typescript
import { Button } from "@/components/ui/button";
```

**Variants:**

- `default`: Button mặc định (primary)
- `destructive`: Button màu đỏ (cho hành động xóa)
- `outline`: Button với border
- `secondary`: Button màu secondary
- `ghost`: Button không có background
- `link`: Button giống link

**Sizes:**

- `default`: Kích thước mặc định
- `sm`: Nhỏ
- `lg`: Lớn
- `icon`: Chỉ icon

**Ví dụ:**

```tsx
<Button>Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

### 2. Card

Component card để hiển thị nội dung trong container.

**Import:**

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
```

**Ví dụ:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### 3. Dialog

Component dialog/modal để hiển thị popup.

**Import:**

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
```

**Ví dụ:**

```tsx
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Content here</div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### 4. Form

Component form với react-hook-form và zod validation.

**Import:**

```typescript
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
```

**Ví dụ:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    email: "",
  },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>;
```

### 5. Input

Component input field.

**Import:**

```typescript
import { Input } from "@/components/ui/input";
```

**Ví dụ:**

```tsx
<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="email@example.com" />
<Input type="password" />
```

### 6. Label

Component label cho form fields.

**Import:**

```typescript
import { Label } from "@/components/ui/label";
```

**Ví dụ:**

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" />
```

### 7. Dropdown Menu

Component dropdown menu.

**Import:**

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

**Ví dụ:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 8. Toast

Component toast notification.

**Import:**

```typescript
import { useToast } from "@/hooks/use-toast";
```

**Ví dụ:**

```tsx
const { toast } = useToast();

// Success toast
toast({
  title: "Success",
  description: "Operation completed successfully",
  variant: "success",
});

// Error toast
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});

// Default toast
toast({
  title: "Notification",
  description: "This is a notification",
});
```

**Variants:**

- `default`: Toast mặc định
- `success`: Toast thành công (màu xanh)
- `destructive`: Toast lỗi (màu đỏ)

**Setup:**
Thêm `<Toaster />` vào root layout:

```tsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 9. Pagination

Component pagination cho danh sách.

**Import:**

```typescript
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
```

**Ví dụ:**

```tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
const totalPages = Math.ceil(totalItems / itemsPerPage);

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
      />
    </PaginationItem>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <PaginationItem key={page}>
        <PaginationLink
          onClick={() => setCurrentPage(page)}
          isActive={currentPage === page}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}

    <PaginationItem>
      <PaginationNext
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        className={
          currentPage === totalPages ? "pointer-events-none opacity-50" : ""
        }
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>;
```

## Layout Components

### 1. MainLayout

Layout chính cho các trang public (home, about, etc.).

**Import:**

```typescript
import { MainLayout } from "@/components/layout/main-layout";
```

**Ví dụ:**

```tsx
export default function HomePage() {
  return (
    <MainLayout>
      <div>Page content</div>
    </MainLayout>
  );
}
```

**Bao gồm:**

- Header với navigation và auth buttons
- Footer
- Responsive container

### 2. AuthLayout

Layout cho các trang authentication (login, register, etc.).

**Import:**

```typescript
import { AuthLayout } from "@/components/layout/auth-layout";
```

**Ví dụ:**

```tsx
export default function LoginPage() {
  return (
    <AuthLayout>
      <div>Login form</div>
    </AuthLayout>
  );
}
```

**Đặc điểm:**

- Không có Header/Footer
- Link về trang chủ
- Centered layout

### 3. DashboardLayout

Layout cho dashboard với sidebar navigation.

**Import:**

```typescript
import { DashboardLayout } from "@/components/layout/dashboard-layout";
```

**Ví dụ:**

```tsx
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div>Dashboard content</div>
    </DashboardLayout>
  );
}
```

**Tính năng:**

- Sidebar với menu navigation
- Top bar với title
- Responsive với mobile menu
- Nút "Về trang chủ" và "Đăng xuất"

**Menu Items:**

- Tổng quan (`/dashboard`)
- Người dùng (`/dashboard/users`)
- Sản phẩm (`/dashboard/products`)
- Đơn hàng (`/dashboard/orders`)
- Báo cáo (`/dashboard/reports`)
- Tài liệu (`/dashboard/documents`)
- Cài đặt (`/dashboard/settings`)

### 4. Header

Component header chính của ứng dụng.

**Tính năng:**

- Logo và navigation links
- Theme toggle
- User dropdown menu (khi đã đăng nhập)
- Auth buttons (khi chưa đăng nhập)
- Responsive design

**User Dropdown Menu:**

- Profile link
- Dashboard link (nếu là admin)
- Logout button

### 5. Footer

Component footer của ứng dụng.

**Ví dụ:**

```tsx
<Footer />
```

## Styling và Theming

### Tailwind CSS

Project sử dụng Tailwind CSS v4 với các utilities classes.

**Common Classes:**

- `container`: Container với max-width responsive
- `mx-auto`: Center horizontally
- `px-4 sm:px-6 lg:px-8`: Responsive padding
- `gap-4`: Spacing giữa items
- `rounded-lg`: Border radius
- `shadow-lg`: Shadow effect

### Dark Mode

Project hỗ trợ dark mode với `next-themes`.

**Setup:**

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>;
```

**Sử dụng:**

```tsx
import { ThemeToggle } from "@/components/theme-toggle";

<ThemeToggle />;
```

**CSS Variables:**

```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

## Best Practices

### 1. Component Organization

- Đặt UI components trong `src/components/ui/`
- Đặt layout components trong `src/components/layout/`
- Sử dụng barrel exports (`index.ts`) để import dễ dàng

### 2. Responsive Design

- Luôn sử dụng responsive classes: `sm:`, `md:`, `lg:`
- Test trên nhiều screen sizes
- Mobile-first approach

**Ví dụ:**

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{/* Content */}</div>
```

### 3. Accessibility

- Sử dụng semantic HTML
- Thêm `aria-label` cho icon buttons
- Đảm bảo keyboard navigation
- Sử dụng proper heading hierarchy

**Ví dụ:**

```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

### 4. Form Validation

- Luôn sử dụng Zod schema
- Hiển thị error messages rõ ràng
- Validate cả client và server side

**Ví dụ:**

```tsx
const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
```

### 5. Loading States

- Hiển thị loading state khi đang xử lý
- Disable buttons khi submitting
- Sử dụng skeleton loaders cho content

**Ví dụ:**

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Đang xử lý...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

### 6. Error Handling

- Hiển thị error messages rõ ràng
- Sử dụng toast notifications cho errors
- Có fallback UI cho error states

**Ví dụ:**

```tsx
try {
  await submitForm();
  toast({
    title: "Success",
    variant: "success",
  });
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
}
```

## Common Patterns

### 1. Card với Stats

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground">+20 from last month</p>
  </CardContent>
</Card>
```

### 2. Table với Actions

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b">
      <th className="text-left p-4 text-sm font-medium">Name</th>
      <th className="text-right p-4 text-sm font-medium">Actions</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item) => (
      <tr key={item.id} className="border-b hover:bg-muted/50">
        <td className="p-4">{item.name}</td>
        <td className="p-4 text-right">
          <DropdownMenu>{/* Actions */}</DropdownMenu>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### 3. Form với Dialog

```tsx
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Item</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>;
```

## Customization

### Thêm Component mới từ shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:

```bash
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
```

### Tùy chỉnh Theme

Chỉnh sửa `src/app/globals.css` để thay đổi CSS variables:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

### Tùy chỉnh Components

Tất cả components trong `src/components/ui/` có thể được chỉnh sửa trực tiếp. Chúng được copy vào project, không phải node_modules.

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

## Examples

Xem các ví dụ thực tế trong:

- `src/app/page.tsx` - Home page với cards
- `src/app/auth/login/page.tsx` - Form với validation
- `src/app/dashboard/users/page.tsx` - Table với pagination và dialogs
- `src/components/layout/header.tsx` - Header với dropdown menu
