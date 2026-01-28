# Token Refresh - Hướng dẫn và Implementation

## 📋 Tổng quan

### Vấn đề

Khi **access token hết hạn**, user sẽ bị logout và phải login lại → **Trải nghiệm kém**.

### Giải pháp

Sử dụng **refresh token** để tự động lấy access token mới khi access token hết hạn.

---

## 🔄 Khi nào cần refresh token?

### 1. Access Token hết hạn

```
Timeline:
├─ 9:00 AM: User login → Access token (hết hạn sau 1h)
├─ 9:30 AM: User đang dùng app → Token còn hợp lệ ✅
├─ 10:00 AM: Access token hết hạn ❌
└─ 10:05 AM: User làm việc tiếp → Cần refresh token để lấy access token mới
```

### 2. Tình huống thực tế

- **Access Token**: Thời hạn ngắn (15 phút - 1 giờ) → Bảo mật cao
- **Refresh Token**: Thời hạn dài (7-30 ngày) → Dùng để lấy access token mới

### 3. Flow hoạt động

```
1. User login
   ↓
2. Backend trả về:
   - access_token (hết hạn sau 1h)
   - refresh_token (hết hạn sau 7 ngày)
   ↓
3. Lưu cả 2 tokens vào localStorage
   ↓
4. Khi access token hết hạn (401):
   → Tự động gọi /auth/refresh với refresh_token
   → Nhận access_token mới
   → Retry request ban đầu
   → User không bị logout
```

---

## 🛠️ Implementation

### Step 1: Lưu refresh token khi login

**File:** `src/app/auth/login/page.tsx`

✅ **Đã được implement tự động trong `authService.login()`**

Khi login thành công, `authService.login()` sẽ tự động:
- Lưu `access_token` vào localStorage
- Lưu `refresh_token` vào localStorage (nếu có)
- Set cookie cho server-side access

Không cần thêm code trong login page, service đã xử lý sẵn.

### Step 2: Implement auto-refresh trong axios interceptor

**File:** `src/lib/api/client.ts`

✅ **Đã được implement**

Auto-refresh token đã được implement trong axios response interceptor:

1. **Khi nhận 401 Unauthorized:**
   - Check xem có refresh token không
   - Nếu có: Gọi `/auth/refresh` với refresh token
   - Lưu tokens mới (token rotation)
   - Retry request ban đầu với access token mới
   - User không bị logout

2. **Khi refresh token cũng hết hạn:**
   - Clear tất cả tokens
   - Redirect về `/auth/login`

3. **Queue mechanism:**
   - Nếu nhiều requests cùng lúc bị 401, chỉ refresh 1 lần
   - Các requests khác đợi refresh xong rồi retry

**Code đã được implement trong:** `src/lib/api/client.ts`

---

## 📝 Backend API Requirements

### 1. Login Response Format

Backend trả về trực tiếp object (không có wrapper):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-24T12:00:00.000Z",
  "updatedAt": "2024-01-24T12:00:00.000Z",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "user-id:token-id"
}
```

**Lưu ý:**
- `access_token`: JWT token, hết hạn sau **15 phút**
- `refresh_token`: Format `"user-id:token-id"`, hết hạn sau **7 ngày**

### 2. Refresh Token Endpoint

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "user-id:token-id"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "user-id:new-token-id"
}
```

**Lưu ý:**
- Refresh token cũ sẽ bị **revoke** (token rotation)
- Refresh token mới sẽ được trả về và có thời gian sống **7 ngày** từ thời điểm refresh

**Error Response (refresh token expired):**
```json
{
  "message": "Invalid or expired refresh token",
  "statusCode": 401
}
```

---

## ✅ Benefits

1. **Better UX**: User không bị logout khi access token hết hạn
2. **Security**: Access token ngắn hạn → Giảm rủi ro nếu bị lộ
3. **Automatic**: Tự động refresh, không cần user action
4. **Seamless**: User không nhận thấy token đã được refresh

---

## 🔍 Testing

### Test Case 1: Access token hết hạn

```typescript
// 1. Login và lưu tokens
await authService.login({ email, password });

// 2. Đợi access token hết hạn (hoặc manually expire)
// 3. Gọi API bất kỳ
await userService.getCurrentUser();

// ✅ Expected: Tự động refresh token và retry request
// ✅ User không bị logout
```

### Test Case 2: Refresh token cũng hết hạn

```typescript
// 1. Login và lưu tokens
await authService.login({ email, password });

// 2. Expire cả access token và refresh token
// 3. Gọi API bất kỳ

// ✅ Expected: Redirect về /auth/login
```

---

## 📚 References

- [JWT Refresh Token Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
