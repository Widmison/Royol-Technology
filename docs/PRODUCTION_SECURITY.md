# Production security checklist (MEX509)

Use this before and after each deploy.

## 1. Required environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (never commit; use Vercel / Neon secrets). |
| `MEX509_ADMIN_PASSWORD` | Admin portal password (long random string; rotate periodically). |
| `MEX509_PAYMENT_SECRET` | **Required in production** — random 32+ bytes (e.g. `openssl rand -hex 32`). Signs hidden `payToken` on `/pay/[id]` so arbitrary requests cannot mark invoices paid. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email (verification, password reset, tracking). |
| `NEXT_PUBLIC_SITE_URL` | Optional; Used in reset emails as a link to the portal login. Password reset sends a **6-digit code** (same channel as signup verification). |
| `AUTH_COOKIE_DOMAIN` | Optional; set when sharing cookies across subdomains (e.g. `.yourdomain.com`). |

Host routing (if split domains): `MEX509_MAIN_HOST`, `MEX509_PORTAL_HOST`, `MEX509_ADMIN_HOST` — match your DNS.

## 2. Passwords and accounts

- **Client and admin passwords** are stored as **bcrypt** hashes (cost 12). Existing plaintext hashes in the database are upgraded automatically on next successful login.
- **Admin portal** bootstraps the admin row on first successful login using `MEX509_ADMIN_PASSWORD`; the database stores only a bcrypt hash, not the raw env password.
- **Admin-created clients** must receive a password meeting the same policy as self-signup (length, upper, lower, digit, symbol).

## 3. Sessions and cookies

- Session cookies: `httpOnly`, `SameSite=Lax`, `Secure` in production / on Vercel.
- Optional `FORCE_SECURE_COOKIES=1` for staging HTTPS that is not marked `NODE_ENV=production`.

## 4. Rate limiting

- Login, signup, forgot/reset password, and admin login are rate-limited per IP (best-effort in each server instance). For strict global limits, enable **Vercel Firewall** or **Upstash Ratelimit**.

## 5. HTTP headers

`next.config.ts` sets HSTS (when served over HTTPS), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. Review if you embed the site in iframes or need camera outside `/admin/scan`.

## 6. Payment flow (`/api/pay`)

- Confirms requests only when `payToken` matches an HMAC of the invoice id using `MEX509_PAYMENT_SECRET`.
- Without the secret in **production**, payment buttons stay disabled and the API rejects forged posts.

## 7. Operational hygiene

- Run `npm audit` regularly; patch dependencies.
- Do **not** log verification codes, reset tokens, or passwords in production (server logs should stay clean).
- Restrict admin URLs to trusted networks or VPN if possible; admin email allowlist is in `lib/adminAuthConfig.ts` — consider moving to env for multi-admin later.

## 8. Post-go-live

- Monitor Vercel function logs and database access.
- Rotate `MEX509_PAYMENT_SECRET` only with a coordinated deploy (tokens on old payment pages invalidate).
- After password hashing deploy, spot-check: client login, admin login, password reset, admin “create client”, pay flow with a test invoice.
