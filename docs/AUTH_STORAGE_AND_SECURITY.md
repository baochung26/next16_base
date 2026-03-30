# Auth Storage and Security

## Why Both Local Storage and Cookies?

This project uses both to support client and server concerns:

- Local storage: convenient for client-side API headers
- Cookie: required for server-side route checks/middleware decisions

## Practical Split

- Client components read token from local storage for authenticated requests.
- Server-side logic (middleware/server helpers) reads auth cookie.

## Security Notes

- Never commit real secrets.
- Use strong values for `NEXTAUTH_SECRET` in production.
- Use HTTPS in production to protect cookie transport.
- Keep access token lifetime short; use refresh token rotation where possible.
- Clear local storage and cookies during logout.

## Recommended Production Hardening

- Prefer HTTP-only secure cookies for sensitive token handling where backend architecture allows.
- Add rate limiting and anomaly monitoring on auth endpoints.
- Audit CORS settings and allowed origins.
