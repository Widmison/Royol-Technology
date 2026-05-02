# Production security checklist (MEX509)

Use this before and after each deploy. See also **`docs/PRE_LAUNCH.md`** for Vercel steps.

## 1. Required environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (never commit; use Vercel / Neon secrets). |
| `DIRECT_URL` | Non-pooled or session URL for Prisma migrate / CLI (often required with Supabase). |
| `AUTH_SECRET` | NextAuth JWT verification in middleware (`openssl rand -base64 32`). |
| **`MEX509_ADMIN_OTP_PEPPER`** | **Required on Vercel/production** (≥16 chars). Salts admin email OTP hashes; app throws at OTP use if missing in prod. |
| `MEX509_ADMIN_DEFAULT_PASSWORD` or `MEX509_ADMIN_PASSWORD` | Bootstrap staff admin login (see `lib/adminAuthConfig.ts`). |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email (verification, password reset, tracking, admin OTP). |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, emails (e.g. `https://mex509.com`). |
| `AUTH_COOKIE_DOMAIN` | Optional; set when sharing cookies across subdomains (e.g. `.yourdomain.com`). |

Optional: `MEX509_PAYMENT_SECRET` (signed tokens if used), host routing `MEX509_MAIN_HOST`, `MEX509_PORTAL_HOST`, `MEX509_ADMIN_HOST`, Google OAuth vars, `BLOB_READ_WRITE_TOKEN` for pickup uploads.

## 2. Passwords and accounts

- **Client and admin passwords** are stored as **bcrypt** hashes (cost 12). Weak legacy hashes are upgraded on next successful login.
- **Staff admin sign-in** uses password → email OTP → optional TOTP; OTP hashing uses `MEX509_ADMIN_OTP_PEPPER`.
- **Admin-created clients** must meet the same password policy as self-signup.

## 3. Sessions and cookies

- Session cookies: `httpOnly`, `SameSite=Lax`, `Secure` in production / on Vercel.
- Optional `FORCE_SECURE_COOKIES=1` for staging HTTPS that is not marked `NODE_ENV=production`.

## 4. Rate limiting

- **Auth routes**: sliding window per IP (best-effort in-process).
- **Quote form (`POST /api/quote`)**: stricter limit (8/min/IP) plus server-side field validation to reduce spam.

For strict global limits, enable **Vercel Firewall** or **Upstash Ratelimit**.

## 5. HTTP headers

`next.config.ts` sets **HSTS**, **X-Frame-Options**, **X-Content-Type-Options**, **Referrer-Policy**, **Permissions-Policy**, and a **Content-Security-Policy** baseline. Adjust CSP if you add third-party scripts.

## 6. Payment flow (`/api/pay`)

- Public `POST /api/pay` is disabled; marking paid is staff-only via `POST /api/admin/invoices/[id]/mark-paid`.

## 7. Operational hygiene

- Run `npm audit` regularly; patch Next/React when advisories apply.
- Do **not** log verification codes, reset tokens, or passwords in production.
- Staff email allowlist lives in `lib/adminStaffRegistry.ts` — review before launch.

## 8. Post-go-live

- Monitor Vercel function logs and database access.
- After deploy, spot-check: client login, admin login (OTP), password reset, quote submit, pay instructions page.
