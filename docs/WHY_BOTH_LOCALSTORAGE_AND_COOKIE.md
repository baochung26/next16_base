# Tại sao cần cả localStorage VÀ Cookie cho accessToken?

Tài liệu giải thích chi tiết: **Có thể chỉ dùng cookie không?** Và **Ưu điểm của localStorage so với cookie**.

---

## 🤔 Câu hỏi

> "Nếu Next.js chỉ cần `setAccessTokenCookie` và dùng nó luôn khi call API từ browser có được không? Tại sao hiện tại cần dùng localStorage để lưu accessToken trong khi có thể chỉ lưu cookie và lấy từ đó? Ưu điểm hơn khi lưu localStorage là gì?"

**Câu trả lời ngắn:** Có thể chỉ dùng cookie, nhưng có trade-offs. localStorage có nhiều ưu điểm cho client-side API calls.

---

## ✅ Có thể chỉ dùng Cookie không?

### Có, nhưng cần thay đổi cách làm

**Hiện tại (localStorage + Cookie):**
```typescript
// Login
setAccessToken(token);        // localStorage
setAccessTokenCookie(token);  // cookie

// Axios interceptor
const token = getAccessToken(); // Đọc từ localStorage
config.headers.Authorization = `Bearer ${token}`;
```

**Nếu chỉ dùng Cookie:**
```typescript
// Login
setAccessTokenCookie(token);  // Chỉ cookie

// Axios interceptor - Đọc từ cookie
function getAccessTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

const token = getAccessTokenFromCookie();
config.headers.Authorization = `Bearer ${token}`;
```

**✅ Hoạt động được**, nhưng có nhiều nhược điểm.

---

## 📊 So sánh localStorage vs Cookie

### 1. **Tự động gửi với requests**

| | **localStorage** | **Cookie** |
|--|------------------|------------|
| **Gửi tự động?** | ❌ **KHÔNG** - chỉ gửi khi code gửi | ✅ **CÓ** - tự động gửi với mọi request cùng domain |
| **Control** | ✅ Full control - chỉ gửi khi cần | ❌ Không control - gửi mọi request |

**Vấn đề với Cookie tự động gửi:**

```typescript
// ❌ Vấn đề: Cookie tự động gửi với MỌI request
fetch("/api/users");           // ✅ Có cookie (cần auth)
fetch("/api/public/stats");    // ❌ Có cookie (không cần auth) → lãng phí
fetch("/api/images/logo.png"); // ❌ Có cookie (không cần auth) → lãng phí
```

**Lợi ích localStorage:**
```typescript
// ✅ Chỉ gửi khi code gửi
const token = getAccessToken(); // Đọc từ localStorage
fetch("/api/users", {
  headers: { Authorization: `Bearer ${token}` } // ✅ Chỉ gửi khi cần
});

fetch("/api/public/stats"); // ✅ Không gửi token → không lãng phí
```

**Kết quả:**
- **localStorage**: Token chỉ gửi khi code gửi → **hiệu quả hơn**
- **Cookie**: Token gửi với mọi request → **lãng phí bandwidth**, **tăng CSRF risk**

---

### 2. **Đọc từ JavaScript**

| | **localStorage** | **Cookie** |
|--|------------------|------------|
| **Cách đọc** | `localStorage.getItem("key")` | `document.cookie.split(';').find(...)` |
| **Độ phức tạp** | ✅ Đơn giản, 1 dòng | ❌ Phức tạp, cần parse string |
| **Performance** | ✅ Nhanh (native API) | ⚠️ Chậm hơn (parse string) |

**Ví dụ:**

```typescript
// ✅ localStorage - Đơn giản
const token = localStorage.getItem("accessToken");

// ❌ Cookie - Phức tạp
function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}
const token = getCookie("accessToken");
```

**Nếu dùng HttpOnly cookie:**
```typescript
// ❌ HttpOnly cookie - KHÔNG ĐỌC ĐƯỢC từ JavaScript
// document.cookie → không có accessToken
// Phải dùng Server Component hoặc API Route để đọc
```

→ **localStorage đơn giản và linh hoạt hơn** cho client-side code.

---

### 3. **Size Limit**

| | **localStorage** | **Cookie** |
|--|------------------|------------|
| **Giới hạn** | ✅ ~5-10MB (tùy browser) | ❌ **4KB** (RFC 6265) |
| **JWT token** | ✅ Đủ chỗ (thường < 1KB) | ⚠️ Đủ chỗ nhưng gần giới hạn |

**Vấn đề với Cookie 4KB:**
- JWT token thường < 1KB → OK
- Nhưng nếu token lớn hoặc có nhiều cookies khác → có thể vượt 4KB
- **localStorage không có vấn đề này**

---

### 4. **CSRF Risk**

| | **localStorage** | **Cookie** |
|--|------------------|------------|
| **CSRF risk** | ✅ **Thấp** - không tự động gửi | ⚠️ **Cao hơn** - tự động gửi |
| **Mitigation** | ✅ Không cần (không tự động gửi) | ⚠️ Cần SameSite, CSRF token |

**CSRF với Cookie:**

```html
<!-- Attacker's website -->
<form action="https://yourapp.com/api/transfer-money" method="POST">
  <input type="hidden" name="amount" value="1000" />
  <input type="hidden" name="to" value="attacker-account" />
</form>
<script>document.forms[0].submit();</script>
```

**Với Cookie:**
- Cookie tự động gửi với form submit → Request có token → **CSRF thành công** (nếu không có SameSite/CSRF token)

**Với localStorage:**
- Token không tự động gửi → Form submit không có token → **CSRF thất bại**

**Mitigation cho Cookie:**
- `SameSite=Lax` (đã có) → giảm CSRF nhưng không hoàn toàn
- CSRF token → phức tạp hơn

→ **localStorage an toàn hơn** về CSRF.

---

### 5. **Cross-Origin Requests**

| | **localStorage** | **Cookie** |
|--|------------------|------------|
| **Cross-origin** | ✅ Không tự động gửi | ⚠️ Phụ thuộc CORS + credentials |
| **Control** | ✅ Full control | ⚠️ Phụ thuộc CORS config |

**Vấn đề với Cookie + Cross-Origin:**

```typescript
// Backend API ở domain khác (NestJS)
const API_URL = "https://api.example.com";

// ❌ Cookie không tự động gửi với cross-origin requests
fetch(`${API_URL}/api/users`); // Không có cookie

// ✅ Phải dùng credentials: 'include'
fetch(`${API_URL}/api/users`, {
  credentials: 'include' // ✅ Gửi cookie
});

// ⚠️ Backend phải config CORS:
// Access-Control-Allow-Origin: https://yourapp.com
// Access-Control-Allow-Credentials: true
```

**Với localStorage:**
```typescript
// ✅ Đơn giản: đọc token và gửi trong header
const token = getAccessToken();
fetch(`${API_URL}/api/users`, {
  headers: { Authorization: `Bearer ${token}` } // ✅ Luôn hoạt động
});
```

→ **localStorage linh hoạt hơn** cho cross-origin API calls.

---

### 6. **HttpOnly Cookie**

| | **localStorage** | **Cookie (HttpOnly)** |
|--|------------------|----------------------|
| **Đọc từ JS** | ✅ Có thể | ❌ **KHÔNG** - chỉ server đọc được |
| **Bảo mật** | ⚠️ Có thể bị XSS đọc | ✅ **An toàn hơn** - XSS không đọc được |

**HttpOnly Cookie - Ưu điểm:**
- ✅ XSS không đọc được → an toàn hơn
- ✅ Chỉ server đọc được → bảo mật tốt

**HttpOnly Cookie - Nhược điểm:**
- ❌ Client-side code không đọc được → **không thể dùng trong Axios interceptor**
- ❌ Phải dùng Server Component hoặc API Route để đọc
- ❌ Phức tạp hơn cho client-side API calls

**Giải pháp nếu dùng HttpOnly:**
```typescript
// ❌ Không thể đọc từ client
const token = getCookie("accessToken"); // undefined (HttpOnly)

// ✅ Phải qua API Route
// Client → Next.js API Route → Đọc cookie → Gọi backend API
fetch("/api/proxy/users", {
  credentials: 'include' // Cookie tự động gửi đến Next.js API Route
});

// Next.js API Route
export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value; // ✅ Đọc được
  const response = await fetch(`${BACKEND_API}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
}
```

→ **Phức tạp hơn**, cần thêm API Route layer.

---

## 🎯 Tại sao project hiện tại dùng cả hai?

### Kiến trúc hiện tại

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                           │
│                                                              │
│  localStorage:                                              │
│    - Axios interceptor đọc token                           │
│    - Gửi trong Authorization header                         │
│    - Chỉ gửi khi code gửi (control)                        │
│                                                              │
│  Cookie:                                                    │
│    - Middleware đọc (route protection)                     │
│    - Server Components đọc (getServerUser)                  │
│    - Tự động gửi với requests (server cần)                 │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │  Authorization: Bearer       │  Cookie header
         │  (từ localStorage)           │  (tự động)
         ▼                              ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│  Backend API (NestJS)   │  │  Next.js Server         │
│  - Nhận Bearer token    │  │  - Middleware           │
│  - Validate JWT         │  │  - Server Components   │
└─────────────────────────┘  └─────────────────────────┘
```

**Lý do:**

1. **localStorage cho Client API calls:**
   - ✅ Control khi nào gửi token
   - ✅ Đơn giản, dễ đọc từ JavaScript
   - ✅ Không tự động gửi → giảm CSRF risk
   - ✅ Linh hoạt cho cross-origin requests

2. **Cookie cho Server (middleware, RSC):**
   - ✅ Server không có localStorage → phải dùng cookie
   - ✅ Middleware cần đọc để protect routes
   - ✅ Server Components cần đọc để check auth

---

## 🔄 Có thể chỉ dùng Cookie không?

### Option 1: Chỉ Cookie (không HttpOnly)

**Cách làm:**
```typescript
// Login
setAccessTokenCookie(token); // Chỉ cookie

// Axios interceptor
function getAccessTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith('accessToken='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

const token = getAccessTokenFromCookie();
config.headers.Authorization = `Bearer ${token}`;
```

**Nhược điểm:**
- ❌ Cookie tự động gửi với mọi request → lãng phí bandwidth
- ❌ CSRF risk cao hơn (dù có SameSite)
- ❌ Đọc từ cookie phức tạp hơn localStorage
- ❌ Giới hạn 4KB
- ❌ Không có HttpOnly → XSS có thể đọc được

**Kết luận:** Không tốt hơn localStorage.

---

### Option 2: HttpOnly Cookie + API Route Proxy

**Cách làm:**
```typescript
// Login - Set HttpOnly cookie từ API Route
// POST /api/auth/login
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const response = await authService.login({ email, password });
  
  // Set HttpOnly cookie
  const res = NextResponse.json(response);
  res.cookies.set("accessToken", response.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 86400,
  });
  return res;
}

// Client - Gọi qua Next.js API Route
fetch("/api/proxy/users", {
  credentials: 'include' // Cookie tự động gửi
});

// Next.js API Route - Proxy
export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const response = await fetch(`${BACKEND_API}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
}
```

**Ưu điểm:**
- ✅ HttpOnly → XSS không đọc được → an toàn hơn
- ✅ Cookie tự động gửi → không cần đọc từ JS

**Nhược điểm:**
- ❌ Phức tạp hơn: cần API Route proxy cho mọi backend call
- ❌ Thêm một layer (Next.js API Route) → latency tăng
- ❌ Cookie vẫn tự động gửi với mọi request → lãng phí
- ❌ Khó debug hơn (không thấy token trong DevTools)

**Kết luận:** An toàn hơn nhưng phức tạp hơn, phù hợp khi:
- Backend API cùng domain với Next.js
- Ưu tiên bảo mật cao (HttpOnly)
- Chấp nhận thêm API Route layer

---

## 📊 Bảng so sánh tổng hợp

| Tiêu chí | **localStorage** | **Cookie (không HttpOnly)** | **Cookie (HttpOnly)** |
|----------|------------------|----------------------------|----------------------|
| **Đọc từ JS** | ✅ Dễ (`getItem`) | ⚠️ Khó (parse string) | ❌ Không thể |
| **Tự động gửi** | ❌ Không | ✅ Có | ✅ Có |
| **Control** | ✅ Full control | ❌ Không control | ❌ Không control |
| **CSRF risk** | ✅ Thấp | ⚠️ Cao hơn | ⚠️ Cao hơn |
| **XSS risk** | ⚠️ Có thể đọc | ⚠️ Có thể đọc | ✅ Không đọc được |
| **Size limit** | ✅ ~5-10MB | ❌ 4KB | ❌ 4KB |
| **Cross-origin** | ✅ Dễ | ⚠️ Cần CORS | ⚠️ Cần CORS |
| **Server đọc** | ❌ Không | ✅ Có | ✅ Có |
| **Độ phức tạp** | ✅ Đơn giản | ⚠️ Trung bình | ❌ Phức tạp |

---

## 🎯 Kết luận & Khuyến nghị

### ✅ Project hiện tại đúng khi:

1. **Backend API ở domain khác** (NestJS) → localStorage linh hoạt hơn
2. **Cần control khi nào gửi token** → localStorage cho control tốt hơn
3. **Giảm CSRF risk** → localStorage không tự động gửi
4. **Đơn giản, dễ maintain** → localStorage API đơn giản

### 🔄 Nên cân nhắc chỉ Cookie khi:

1. **Backend API cùng domain** với Next.js
2. **Ưu tiên bảo mật cao** (HttpOnly) → chấp nhận phức tạp hơn
3. **Chấp nhận API Route proxy layer** → thêm latency nhưng an toàn hơn

### 📝 Best Practice cho project hiện tại:

**Giữ nguyên (localStorage + Cookie):**
- ✅ **localStorage**: Cho client-side API calls (Axios) → control tốt, đơn giản
- ✅ **Cookie**: Cho server-side (middleware, RSC) → server cần cookie

**Cải thiện có thể:**
- Thêm **HttpOnly** cho cookie (set từ API Route thay vì `document.cookie`)
- Giữ localStorage cho client-side API calls
- Cookie HttpOnly chỉ dùng cho server-side

---

## 📚 Tài liệu liên quan

- [AUTH_STORAGE_AND_SECURITY.md](./AUTH_STORAGE_AND_SECURITY.md) - Chi tiết về localStorage vs cookie
- [SERVER_VS_CLIENT_FETCHING.md](./SERVER_VS_CLIENT_FETCHING.md) - Server vs Client Components
- [WALKTHROUGH.md](./WALKTHROUGH.md) - Luồng hoạt động thực tế
