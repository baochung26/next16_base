# Mock Users for Testing

Dữ liệu mock users đã được seed vào database để test đăng nhập.

## Test Accounts

### 1. Admin User

- **Email**: `admin@example.com`
- **Username**: `admin`
- **Password**: `password123`
- **Name**: Admin User

### 2. John Doe

- **Email**: `john@example.com`
- **Username**: `johndoe`
- **Password**: `admin123`
- **Name**: John Doe

### 3. Test User

- **Email**: `user@example.com`
- **Password**: `user123`
- **Name**: Test User
- **Note**: User này không có username, chỉ có thể đăng nhập bằng email

## Cách sử dụng

### Đăng nhập bằng Email

Bạn có thể đăng nhập bằng email của bất kỳ user nào ở trên.

### Đăng nhập bằng Username

Bạn có thể đăng nhập bằng username cho user có username:

- `admin` (password: `password123`)
- `johndoe` (password: `admin123`)

## Seed lại data

Nếu bạn muốn reset lại mock data, chạy lệnh:

```bash
npm run seed
```

Hoặc copy nội dung từ `src/lib/db/mock-users.json` vào `src/lib/db/users.json`

## Lưu ý

- Tất cả passwords đã được hash bằng bcrypt
- Passwords gốc là: `password123`, `admin123`, `user123`
- File `users.json` sẽ được cập nhật khi có user mới đăng ký
- Để reset về mock data ban đầu, chạy `npm run seed`
