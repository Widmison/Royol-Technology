# Go-live checklist (MEX509)

Code-side hardening is in place (quote validation, rate limits, CSP, OTP pepper enforcement in production, TypeScript on builds). **You** still need to configure hosting and secrets.

## 1. Vercel project

1. **Git**: Confirm **Production Branch** is the branch that contains this Next app (not an unrelated `main` mini-site).
2. **Environment variables**: Copy from `.env.example` into **Project → Settings → Environment Variables** for **Production** (and Preview if you use previews).
3. **Domains**: Attach `mex509.com` (and portal/admin hosts if split). Enable HTTPS (automatic on Vercel).

## 2. Secrets you must set before production traffic

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Pooled URL ok for runtime; pair with `DIRECT_URL` for migrations (see `.env.example`). |
| `DIRECT_URL` | Session/direct Postgres URL for Prisma CLI & migrations. |
| `AUTH_SECRET` | `openssl rand -base64 32` — required for NextAuth JWT checks in middleware. |
| **`MEX509_ADMIN_OTP_PEPPER`** | **≥16 characters**, random (e.g. `openssl rand -hex 32`). Without this on Vercel/production, **admin email OTP login will error** until set. |
| `MEX509_ADMIN_DEFAULT_PASSWORD` or `MEX509_ADMIN_PASSWORD` | Bootstrap staff password path per `lib/adminAuthConfig.ts`. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, e.g. `https://mex509.com` — used for metadata, sitemap, emails. |

Optional: `MEX509_PAYMENT_SECRET`, `AUTH_COOKIE_DOMAIN`, `MEX509_MAIN_HOST` / `MEX509_PORTAL_HOST` / `MEX509_ADMIN_HOST`, Google OAuth vars, `BLOB_READ_WRITE_TOKEN` if using pickup uploads.

## 3. After first deploy

1. Run **smoke tests**: home, `/services`, `/quote` submit, `/track`, client **signup/login**, **password reset**, **admin login** (OTP email arrives, code works).
2. Watch **Vercel → Logs** for 500s during OTP step — usually missing `MEX509_ADMIN_OTP_PEPPER` or email DNS.
3. Run `npm audit` periodically; remaining **moderate** issues tied to Prisma dev tooling may require upstream updates (`npm audit fix --force` can downgrade Prisma — avoid unless you accept the migration).

## 4. Content-Security-Policy

The app sends a **baseline CSP** in `next.config.ts`. If a third-party script or analytics URL is blocked, add its origin under `connect-src` / `script-src` as needed, or temporarily relax during debugging.

## 5. Legal / business

- Review `/conditions-generales` copy vs your actual terms.
- Ensure **Resend** sending domain is verified (SPF/DKIM).

## 6. Monitoring (recommended)

- Enable **Vercel Analytics / Speed Insights** (already in dependencies).
- Optionally add **Sentry** or similar for server/client errors.

When stuck, note **which step fails** (quote submit, admin OTP, etc.) and the **HTTP status** from the browser Network tab.
