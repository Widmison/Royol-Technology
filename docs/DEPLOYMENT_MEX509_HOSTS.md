# Deploy MEX509: mex509.com + portal + admin

## 0. Launch checklist (do this in order)

1. **Push code** to GitHub or GitLab (`main` branch).
2. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project** → **Import** your repo.
3. **Framework Preset:** Next.js (auto). **Root directory:** repo root. **Build Command:** default (`next build`). **Install Command:** default (`npm install` — runs `postinstall` → `prisma generate`).
4. Before clicking Deploy, open **Environment Variables** and add **every** variable from **section 3** below for **Production** (and Preview if you use previews).
5. Click **Deploy**. Wait for the build to finish (fix errors if any).
6. **Settings → Domains:** add `mex509.com`, `portal.mex509.com`, `admin.portal.mex509.com` (and optional `www.mex509.com`).
7. For each domain, Vercel shows **DNS records**. In **Hostinger → Domains → your domain → DNS / Nameservers:**
   - Point nameservers to Vercel **or** stay on Hostinger DNS and add the **A / CNAME** records exactly as Vercel lists.
8. Wait for DNS (often 5–30 minutes; can be longer). SSL turns green in Vercel when ready.
9. **Redeploy** once if you added domains after first deploy (**Deployments → … → Redeploy**).
10. Run **section 4** smoke tests.

**CLI alternative (optional):** from the project folder, `npx vercel login` then `npx vercel` (link project), then `npx vercel --prod` after env vars are set in the dashboard.

**Local check before push:** `npm run deploy:check` (runs production build).

---

Your app is **one Next.js project**. The clean production setup is **one Node host** (recommended: **Vercel**) with **three domains** and the env vars below. Middleware already routes:

| Domain | Role |
|--------|------|
| **mex509.com** | Marketing / public site (`/`, `/quote`, `/track`, `/services`, …) |
| **portal.mex509.com** | Client login + dashboard + `/pay` + API used by the portal |
| **admin.portal.mex509.com** | Admin UI (`/admin/...`, shortcuts like `/scan`) |

Requests to **mex509.com/login**, **mex509.com/dashboard**, or **mex509.com/pay** are **redirected** to **portal.mex509.com**. Requests to **mex509.com/admin** are redirected to **admin.portal.mex509.com**.

---

## 1. Recommended: Vercel (one deploy, three domains)

1. Push this repo to GitHub/GitLab and **Import** the project in [Vercel](https://vercel.com).
2. Add **Production** environment variables (section 3 below).
3. In the Vercel project → **Settings → Domains**, add:
   - `mex509.com`
   - `www.mex509.com` (optional; add redirect www → apex or the reverse in Vercel)
   - `portal.mex509.com`
   - `admin.portal.mex509.com`
4. Vercel will show **DNS records** to add at your registrar (usually Hostinger DNS).

### DNS at Hostinger (example)

Point each hostname to Vercel as instructed (often):

- **A** record for `@` (apex) → Vercel’s IPs *or* **CNAME** `cname.vercel-dns.com` if your DNS allows apex CNAME (ALIAS).
- **CNAME** `portal` → `cname.vercel-dns.com` (or the target Vercel shows).
- **CNAME** `admin.portal` → same target as `portal` (or separate record per Vercel UI).

Enable **HTTPS** in Vercel for all domains (automatic once DNS validates).

---

## 2. If you insist on “marketing files on Hostinger”

**Option A (best):** Don’t upload a separate marketing build. Keep **mex509.com** on the **same** Vercel deployment as the portals (section 1). Your marketing pages are already routes like `/`, `/services`, `/quote` in this repo.

**Option B:** Hostinger **only DNS**: leave web hosting unused and set **DNS** records to Vercel (section 1). No file upload needed.

**Option C:** Static marketing site on Hostinger **and** Next on Vercel — you maintain **two** deployments and must link “Login” to `https://portal.mex509.com/login` with **absolute URLs**. API calls from the static site to the portal need **CORS** (not configured by default). Avoid unless you know you need this.

---

## 3. Required production environment variables

Set these in Vercel → Settings → Environment Variables (Production). Hostnames **without** `https://` (the code normalizes them).

```bash
# Split routing (your live domains)
MEX509_MAIN_HOST=mex509.com
MEX509_PORTAL_HOST=portal.mex509.com
MEX509_ADMIN_HOST=admin.portal.mex509.com

# Public URL for emails (password reset, etc.) — client portal origin
NEXT_PUBLIC_SITE_URL=https://portal.mex509.com

# Database & secrets (see .env.example)
DATABASE_URL=postgresql://...
MEX509_ADMIN_PASSWORD=...
MEX509_PAYMENT_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=MEX509 <info@mex509.com>
```

Optional:

```bash
# If cookies must be shared across subdomains (usually not required; default is host-only)
# AUTH_COOKIE_DOMAIN=.mex509.com
```

After changing env vars, **redeploy** (Redeploy in Vercel or push a commit).

---

## 4. Smoke tests after deploy

1. **mex509.com** — Home, `/quote`, `/track` load.
2. **mex509.com/login** — Redirects to **portal.mex509.com/login**.
3. **portal.mex509.com** — Root redirects to `/login` or `/dashboard` depending on session.
4. **portal.mex509.com/dashboard** — Requires login.
5. **admin.portal.mex509.com** — Root shows admin login; `/admin/scan` works after login.
6. Password reset email links use **NEXT_PUBLIC_SITE_URL** (portal).

---

## 5. Running on Hostinger VPS / Node (advanced)

If you use Hostinger **VPS** or a plan with **Node.js**:

1. Build: `npm ci && npx prisma generate && npm run build`
2. Run: `npm run start` (port 3000) behind **Nginx** reverse proxy.
3. Issue **Let’s Encrypt** certs for all three hostnames.
4. Set the **same env vars** as in section 3 on the server.

Shared **PHP-only** hosting cannot run this Next.js app; use Vercel or a Node-capable server.

---

## 6. Admin email / password

Admin login is configured in code/env (`lib/adminAuthConfig.ts`, `MEX509_ADMIN_PASSWORD`). Use **https://admin.portal.mex509.com** (or `/admin/login` after redirect from mex509.com).
