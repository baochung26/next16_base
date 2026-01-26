# Lưu trữ token & bảo mật: localStorage, Cookie, Next.js vs React thuần

Tài liệu tổng hợp về: **tại sao lưu access token cả trong localStorage và cookie**, **khác biệt React thuần vs Next.js**, và **rủi ro lộ lọt cookie** (Next.js có cao hơn React thuần không).

---

## 1. Tổng quan: localStorage vs Cookie

| | **localStorage** | **Cookie (accessToken)** |
|--|--|--|
| **Môi trường** | Chỉ tồn tại trên **browser** (client) | Browser lưu; **tự gửi** kèm mọi request lên **cùng domain** → server đọc được |
| **Ai đọc?** | Chỉ JavaScript chạy trên **client** | **Server** (middleware, RSC, API route) qua `cookies.get("accessToken")` hoặc `request.cookies.get("accessToken")` |
| **Dùng để làm gì?** | Client gắn token vào header `Authorization` cho **API call** (Axios, fetch) | Server biết “đã đăng nhập” để **redirect**, **bảo vệ route**, **getServerUser** |

**Kết luận:** localStorage phục vụ **client**; cookie phục vụ **server** (vì server không có `localStorage`).

---

## 2. Mục đích từng nơi trong project

### 2.1. localStorage (`setAccessToken`, `getAccessToken`)

- **File:** `src/lib/api/token.ts`
- **Dùng bởi:** Axios interceptor trong `src/lib/api/client.ts`
- **Mục đích:** Mỗi request API từ **client** (auth, user, v.v.) tự động thêm `Authorization: Bearer <token>`.
- **Chạy ở:** Browser (Client Components, `useEffect`, `onSubmit`, v.v.)

### 2.2. Cookie (`setAccessTokenCookie`, `clearAuthCookies`)

- **File:** `src/lib/api/token.ts`
- **Dùng bởi:**
  - **Middleware** (`src/middleware.ts`): `request.cookies.get("accessToken")` → redirect `/dashboard` nếu chưa login, redirect `/auth/login` nếu đã login.
  - **Server-auth** (`src/lib/api/server-auth.ts`): `cookies().get("accessToken")` trong `getServerUser()`, `requireServerAdmin()` → RSC biết user và quyền.
- **Chạy ở:** Server (Edge/Node) khi xử lý request, **trước** khi trả HTML về browser.

### 2.3. Luồng đăng nhập (tóm tắt)

```
Login OK → setAccessToken(t)        → localStorage (cho client/Axios)
         → setAccessTokenCookie(t)  → cookie (cho middleware + RSC)
         → setUserInfo(...)         → localStorage (cho useAuth, không dùng trên server)
```

---

## 3. Tại sao Next.js cần cả hai?

### 3.1. Server không có localStorage

- **Middleware** và **Server Components** chạy trên **Node/Edge (server)**.
- Trên server **không tồn tại** `window`, `document`, `localStorage` → không thể `localStorage.getItem("accessToken")`.
- Thông tin duy nhất server nhận từ browser qua HTTP là: **headers** (vd. `Cookie`) và **body**. 
- **Cookie** được trình duyệt **tự gửi** kèm request (nếu cùng domain, path, SameSite cho phép) → server đọc bằng `cookies().get("accessToken")` hoặc `request.cookies.get("accessToken")`.

### 3.2. Client vẫn cần token cho API

- Axios và các API call từ **client** chạy trong browser → có `localStorage`.
- `getAccessToken()` đọc từ localStorage, interceptor gắn vào `Authorization` → phù hợp với backend (NestJS, v.v.) mong đợi `Bearer` token.

**Tóm lại:**  
- **Cookie** = cho **server** (middleware, RSC) vì server không đọc được localStorage.  
- **localStorage** = cho **client** (Axios, Client Components).

---

## 4. So sánh React thuần (SPA) vs Next.js

### 4.1. React thuần (CRA, Vite + React)

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER                                                        │
│  • Toàn bộ React chạy ở đây                                    │
│  • localStorage ✅ (getAccessToken, Axios gửi Bearer)            │
│  • Mọi kiểm tra auth, fetch đều ở client                        │
└─────────────────────────────────────────────────────────────────┘
          │
          │  fetch/axios (Authorization: Bearer <từ localStorage>)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (NestJS, …) – domain/port khác                     │
│  Server của SPA chỉ gửi file tĩnh, KHÔNG chạy logic auth        │
└─────────────────────────────────────────────────────────────────┘
```

- **Server của SPA:** chỉ gửi HTML/JS/CSS tĩnh; **không** chạy React, **không** middleware, **không** RSC.
- **Auth:** toàn bộ ở client. Token lưu **localStorage** (hoặc cookie do **backend** set nếu dùng session cookie). **Không cần** cookie cho chính app React.
- **Kết luận:** Chỉ cần **localStorage** (hoặc chỉ cookie do backend quản lý) là đủ; không phát sinh nhu cầu “server của app React cần đọc token”.

### 4.2. Next.js (App Router)

```
┌─────────────────────────────────────────────────────────────────┐
│  SERVER (Node/Edge) – chạy TRƯỚC khi gửi HTML                   │
│  • Middleware: request.cookies.get("accessToken")              │
│  • RSC: cookies().get("accessToken") → getServerUser, require*  │
│  ❌ Không có: window, localStorage                              │
│  ✅ Chỉ có: request headers, Cookie                              │
└─────────────────────────────────────────────────────────────────┘
          │
          │  Response (HTML + data đã render)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER                                                        │
│  • Hydrate Client Components, Axios dùng localStorage          │
└─────────────────────────────────────────────────────────────────┘
```

- **Server Next.js:** chạy **middleware** (redirect) và **RSC** (getServerUser, requireServerAdmin) → **cần** biết đã login hay chưa **trên server**.
- Vì server **không có** localStorage → **bắt buộc** có token (hoặc session) trong **cookie**.
- **Kết luận:** Next.js cần **cookie** cho phần chạy trên server; **localStorage** cho phần chạy trên client. Đây là khác biệt **kiến trúc** (server + client), không phải “cách làm tùy ý”.

### 4.3. Bảng so sánh nhanh

| | **React thuần (SPA)** | **Next.js** |
|--|------------------------|-------------|
| **React chạy ở đâu?** | Chỉ **browser** | **Server** (middleware, RSC) + **browser** |
| **Server có logic “auth / redirect” không?** | **Không** (chỉ gửi file tĩnh) | **Có** (middleware, RSC) |
| **localStorage trên server?** | Không có “server React” | Server **không có** localStorage |
| **Cookie cho app?** | Thường **không bắt buộc** (trừ khi backend dùng cookie) | **Bắt buộc** nếu middleware/RSC cần biết “đã login” |

---

## 5. Rủi ro bảo mật chung

### 5.1. XSS (Cross-Site Scripting)

- **localStorage** và **cookie không HttpOnly** đều đọc được bằng JavaScript.
- Nếu có XSS, script có thể: `localStorage.getItem("accessToken")` hoặc `document.cookie` → đánh cắp token.
- **Giảm rủi ro:** escape output, tránh `dangerouslySetInnerHTML` tùy ý, CSP, dependency an toàn. **Cookie HttpOnly** (set từ server) chặn JS đọc cookie nhưng **không** set được từ `document.cookie`; muốn HttpOnly thì phải set qua API Route `Set-Cookie`.

### 5.2. CSRF (Cross-Site Request Forgery)

- **Cookie:** trình duyệt **tự gửi** kèm request same-site (và với SameSite=Lax thì cả một số top-level navigation). Form POST từ site khác (cross-site) thì SameSite=Lax **không** gửi cookie → giảm CSRF.
- **localStorage:** **không** tự gửi; chỉ khi JS của bạn gắn vào header thì mới có. Request cross-site do trang khác tạo **không** đọc được localStorage → **không** có CSRF qua localStorage.
- **Trong project:** cookie dùng `SameSite=Lax` → đã giảm đáng kể CSRF. Có thể bổ sung CSRF token cho form quan trọng nếu cần.

### 5.3. Secure (HTTPS)

- Cookie không `Secure` có thể gửi qua HTTP (mixed, redirect, cấu hình kém) → dễ bị nghe (MITM).
- **Trong project:** `setAccessTokenCookie` thêm `; Secure` khi `window.location.protocol === "https:"` (production). Local (http) không bật Secure để dev bình thường.

### 5.4. HttpOnly

- Cookie **HttpOnly** không đọc được bằng `document.cookie` → giảm mất token do XSS (phần cookie).
- **Giới hạn:** `document.cookie` **không thể** set HttpOnly. Muốn HttpOnly thì **server** (vd. `/api/auth/login`) phải trả `Set-Cookie` với `HttpOnly`. Hiện token vẫn set từ client sau khi nhận JSON → chưa dùng HttpOnly. Có thể nâng cấp sau bằng API set cookie.

---

## 6. Rủi ro lộ lọt cookie: Next.js có cao hơn React thuần không?

### 6.1. Tóm tắt

**Có thêm vài “mặt” rủi ro khi dùng cookie trong Next.js so với SPA chỉ dùng localStorage, nhưng đa phần có thể kiểm soát bằng cấu hình và quy ước. Không có nghĩa là Next.js “kém an toàn” nếu làm đúng.**

Dưới đây là từng hạng mục.

---

### 6.2. Token nằm ở hai nơi (localStorage + cookie)

| | **React SPA (chỉ localStorage)** | **Next.js (localStorage + cookie)** |
|--|--|--|
| **Số chỗ chứa token** | 1 (localStorage) | 2 (localStorage + cookie) |
| **Ý nghĩa** | Mất 1 chỗ = mất token | Mất 1 trong 2 = mất token |

- **XSS:** Cả localStorage và cookie (không HttpOnly) đều bị đọc bởi JS. XSS một lần có thể lấy cả hai. **Không tạo thêm** vector XSS mới, chỉ thêm **một bản sao** ở cookie.
- **Kết luận:** Rủi ro tăng **ít**; trọng tâm vẫn là chống XSS.

---

### 6.3. Cookie bị gửi tự động (và CSRF)

- **Cookie:** Gửi **tự động** với mọi request same-site (navigations, fetch same-origin, v.v.). 
- **localStorage:** Chỉ gửi khi code của bạn **chủ ý** gắn vào header → không có “gửi kèm mọi request” cho site khác.
- **CSRF:** Request from trang khác (vd. form `action="https://yourapp.com/api/..."`) với **cookie** có thể gửi kèm cookie nếu SameSite không chặt. **SameSite=Lax** đã chặn gửi cookie trong request POST cross-site từ context top-level. **Kết luận:** Đã giảm CSRF nhờ SameSite; đây là “mặt” mới so với SPA chỉ localStorage, nhưng đã xử lý.

---

### 6.4. Cookie đi qua server (và có thể bị log)

- **React SPA:** Server (static) thường **không** nhận token; token chỉ ở client và gửi thẳng tới **API backend** (domain khác).
- **Next.js:** Mỗi request vào domain Next.js (navigations, `/api/*`, v.v.) đều kèm header `Cookie` → **server Next.js** (và mọi proxy phía trước) **nhìn thấy** cookie.
- **Rủi ro:** Nếu server/proxy **log** header hoặc toàn bộ request (vd. `Cookie: accessToken=...`) → token có thể xuất hiện trong log, backup, SIEM. Log rò rỉ = token rò rỉ.
- **Kết luận:** Đây là **rủi ro thêm** so với SPA thuần: **phải** đảm bảo **không log** header `Cookie` (và nếu có, đã redact). Đây là việc vận hành (server, proxy, logging pipeline).

---

### 6.5. Token “trên dây” nhiều request hơn

- **SPA:** Token chủ yếu xuất hiện trong **các request API** (khi client gắn `Authorization`). Request tải HTML/JS (GET `/`) thường **không** có token.
- **Next.js:** Mọi **navigation** (GET `/dashboard`, `/profile`, …) và request same-origin đều kèm `Cookie` → token nằm trong **nhiều** request hơn.
- **Ý nghĩa:** Nếu bị nghe (MITM) trên kênh không mã hóa, số “đoạn chứa token” lớn hơn. Trên **HTTPS** (và cookie `Secure`), nội dung được mã hóa; nguy cơ chênh lệch **thực tế** so với SPA gửi `Authorization` qua HTTPS là **nhỏ**, miễn là **luôn HTTPS** (và Secure cho cookie).

---

### 6.6. Tổng hợp: Next.js có “lộ cookie” hơn React thuần?

| Hạng mục | So với React SPA (chỉ localStorage) | Mức độ | Cách xử lý trong project |
|----------|--------------------------------------|--------|---------------------------|
| Hai bản token (localStorage + cookie) | Tăng “diện” lưu trữ | Thấp | Chống XSS; cookie HttpOnly (nếu chuyển sang set từ server) giảm thêm |
| CSRF do cookie gửi tự động | Có thêm vector CSRF | Đã giảm | `SameSite=Lax`; có thể thêm CSRF token cho form nhạy cảm |
| Server (và proxy) thấy cookie | Có thể bị log / rò rỉ | Trung bình | **Không log** header `Cookie`; redact nếu bắt buộc log |
| Token xuất hiện trên nhiều request | Nhiều “đoạn” chứa token trên dây | Thấp nếu dùng HTTPS | HTTPS + `Secure` cho cookie (đã làm khi `https:`) |

**Kết luận:** Next.js **có thêm** các điểm cần để ý (cookie qua server, không log cookie, CSRF đã mitigate bằng SameSite), nhưng **không** hàm ý “lộ cookie” nhiều hơn nếu:

- Dùng **SameSite=Lax**, **Secure** (trên HTTPS), có thể tiến tới **HttpOnly** khi set từ server.
- **Không** ghi log `Cookie` ở server/proxy.
- **Luôn** dùng HTTPS ở production.

---

## 7. Khuyến nghị và checklist

### 7.1. Đã áp dụng trong project

- [x] **Cookie:** `path=/`, `max-age` (từ `APP_CONFIG.SESSION.COOKIE_MAX_AGE`), `SameSite=Lax`
- [x] **Secure:** Thêm `; Secure` khi `window.location.protocol === "https:"` (trong `setAccessTokenCookie`, `clearAuthCookies`)
- [x] **Tách logic:** `setAccessTokenCookie`, `clearAuthCookies` trong `src/lib/api/token.ts`; login dùng `setAccessTokenCookie`, logout dùng `clearAuthCookies`
- [x] **localStorage** chỉ dùng cho client (Axios, `getAccessToken`); **cookie** chỉ dùng cho middleware và RSC

### 7.2. Nên làm thêm (khi có thể)

- [ ] **HttpOnly:** Chuyển việc set `accessToken` cookie sang **API Route** (`/api/auth/login`) trả `Set-Cookie` với `HttpOnly; Secure; SameSite=Lax`. Client chỉ nhận JSON (hoặc không cần token nếu mọi thứ qua cookie). Cần chỉnh luồng login và có thể bỏ bản token trong localStorage nếu API chỉ dùng cookie (hoặc giữ localStorage nếu backend khác domain vẫn cần `Authorization`).
- [ ] **Không log Cookie:** Đảm bảo server Next.js và mọi reverse proxy **không** ghi log header `Cookie` (hoặc đã redact). Kiểm tra: logging middleware, cấu hình Nginx/v.v.
- [ ] **CSP (Content-Security-Policy):** Giảm surface XSS (inline script, domain không tin cậy). Bắt đầu từ `Content-Security-Policy` report-only rồi siết dần.

### 7.3. Checklist nhanh

| Việc | Trạng thái |
|------|------------|
| Cookie: path, max-age, SameSite=Lax | ✅ |
| Cookie: Secure khi HTTPS | ✅ |
| Cookie: HttpOnly | ❌ (cần set từ server) |
| Không log Cookie ở server/proxy | ⚠ Cần kiểm tra vận hành |
| Chống XSS (escape, CSP, v.v.) | ⚠ Áp dụng chung |
| HTTPS trong production | ⚠ Phụ thuộc môi trường |

---

## 8. Tham chiếu code trong project

| Chức năng | File | Hàm / chỗ dùng |
|-----------|------|-----------------|
| Set token (localStorage) | `src/lib/api/token.ts` | `setAccessToken` |
| Set token (cookie) | `src/lib/api/token.ts` | `setAccessTokenCookie` |
| Đọc token (client) | `src/lib/api/token.ts` | `getAccessToken` (localStorage) |
| Đọc token (server) | `src/middleware.ts` | `request.cookies.get("accessToken")` |
| Đọc token (RSC) | `src/lib/api/server-auth.ts` | `cookies().get("accessToken")` |
| Xóa cookie | `src/lib/api/token.ts` | `clearAuthCookies` |
| Login gọi set | `src/app/auth/login/page.tsx` | `setAccessToken`, `setAccessTokenCookie` |
| Logout gọi clear | `src/components/layout/header.tsx`, `src/components/layout/dashboard-layout.tsx` | `clearTokens`, `clearAuthCookies` |
| Axios gắn Bearer | `src/lib/api/client.ts` | `getAccessToken()` trong interceptor |

---

## 9. Tài liệu liên quan

- [WALKTHROUGH.md](./WALKTHROUGH.md) – Luồng login, `router.refresh`, cookie vs localStorage
- [API_USAGE.md](./API_USAGE.md) – Cách dùng API, token, service
- [ARCHITECTURE.md](./ARCHITECTURE.md) – Kiến trúc, luồng auth
- [LEARNING_GUIDE.md](./LEARNING_GUIDE.md) – Server vs Client, data flow
