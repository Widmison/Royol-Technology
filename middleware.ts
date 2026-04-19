import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import {
  ADMIN_SESSION_COOKIE,
  CLIENT_SESSION_COOKIE,
} from "@/lib/authCookies";

/**
 * Paths that may be visited on the admin host *without* the `/admin` prefix
 * (short URLs). Everything else (e.g. `/quote`, `/services`, `/track`) must
 * be served as the public app — do not rewrite to `/admin/...` or those
 * routes 404.
 */
const ADMIN_SHORTCUT_PREFIXES = [
  "/login",
  "/dashboard",
  "/shipments",
  "/invoices",
  "/clients",
  "/settings",
  "/scan",
  "/search",
] as const;

function isAdminShortcut(pathname: string): boolean {
  return ADMIN_SHORTCUT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function withPathHeader(req: NextRequest, pathnameForHeader: string) {
  const h = new Headers(req.headers);
  h.set("x-url-path", pathnameForHeader);
  return h;
}

function nextWithPath(req: NextRequest, pathnameForHeader: string) {
  return NextResponse.next({
    request: { headers: withPathHeader(req, pathnameForHeader) },
  });
}

/** `admin.example.com` or `admin.portal.example.com` */
function isAdminDashboardHost(host: string): boolean {
  return host.startsWith("admin.") || host.startsWith("admin.portal.");
}

function envHostname(envName: string): string | null {
  const raw = process.env[envName]?.trim();
  if (!raw) return null;
  try {
    const u = raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`);
    return u.hostname;
  } catch {
    return raw.split(":")[0] ?? null;
  }
}

function hasSessionCookie(req: NextRequest, name: string): boolean {
  const v = req.cookies.get(name)?.value;
  return typeof v === "string" && v.trim().length > 0;
}

function adminLoginRedirectUrl(req: NextRequest): URL {
  const hostname = req.headers.get("host") || "";
  const hostNoPort = hostname.split(":")[0] ?? hostname;
  if (isAdminDashboardHost(hostNoPort)) {
    return new URL("/login", req.url);
  }
  return new URL("/admin/login", req.url);
}

function pathnameIsPublicAdminAuthSurface(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login?") ||
    pathname === "/admin/access-denied" ||
    pathname.startsWith("/admin/access-denied?")
  );
}

function adminHostRequiresAdminSession(pathname: string): boolean {
  if (pathname.startsWith("/admin/print") || pathnameIsPublicAdminAuthSurface(pathname)) {
    return false;
  }
  if (pathname.startsWith("/admin")) {
    return true;
  }
  if (pathname === "/login" || pathname.startsWith("/login?")) {
    return false;
  }
  if (isAdminShortcut(pathname)) {
    return true;
  }
  return false;
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const hostname = req.headers.get("host") || "";
  const hostNoPort = hostname.split(":")[0] ?? hostname;

  const secret = process.env.AUTH_SECRET;
  const jwtToken = secret
    ? await getToken({
        req,
        secret,
        secureCookie: process.env.NODE_ENV === "production",
      })
    : null;
  const adminJwt = jwtToken as JWT | null;
  const hasGoogleAdmin = !!adminJwt?.sub && adminJwt.role === "admin";

  function hasAdminAccess(): boolean {
    return hasGoogleAdmin || hasSessionCookie(req, ADMIN_SESSION_COOKIE);
  }

  /** Skip host routing / auth for static assets (safe even when matcher hits file-like paths). */
  if (/\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const mainHost = envHostname("MEX509_MAIN_HOST");
  const portalHost = envHostname("MEX509_PORTAL_HOST");
  const adminHostCfg = envHostname("MEX509_ADMIN_HOST");

  if (mainHost && hostNoPort === mainHost) {
    if (
      portalHost &&
      (pathname.startsWith("/dashboard") ||
        pathname === "/login" ||
        pathname.startsWith("/login/") ||
        pathname.startsWith("/pay"))
    ) {
      return NextResponse.redirect(new URL(`https://${portalHost}${pathname}${url.search}`));
    }
    if (adminHostCfg && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL(`https://${adminHostCfg}${pathname}${url.search}`));
    }
  }

  if (portalHost && adminHostCfg && hostNoPort === portalHost && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(`https://${adminHostCfg}${pathname}${url.search}`));
  }

  if (portalHost && hostNoPort === portalHost && pathname === "/") {
    const hasClient = hasSessionCookie(req, CLIENT_SESSION_COOKIE);
    return NextResponse.redirect(new URL(hasClient ? "/dashboard?tab=tracking" : "/login", req.url));
  }

  /**
   * Client dashboard — enforced on every host except the admin dashboard host,
   * where `/dashboard` is an admin shortcut (staff), not the client portal.
   */
  if (
    !isAdminDashboardHost(hostNoPort) &&
    (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
    !hasSessionCookie(req, CLIENT_SESSION_COOKIE)
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /**
   * Admin UI (`/admin/*`) — NextAuth JWT session or legacy admin cookie.
   */
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/print") &&
    !pathnameIsPublicAdminAuthSurface(pathname) &&
    !hasAdminAccess()
  ) {
    return NextResponse.redirect(adminLoginRedirectUrl(req));
  }

  if (isAdminDashboardHost(hostNoPort)) {
    if (adminHostRequiresAdminSession(pathname) && !hasAdminAccess()) {
      return NextResponse.redirect(adminLoginRedirectUrl(req));
    }

    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin/login", req.url), {
        request: { headers: withPathHeader(req, "/admin/login") },
      });
    }

    if (pathname.startsWith("/admin")) {
      return nextWithPath(req, pathname);
    }

    if (isAdminShortcut(pathname)) {
      return NextResponse.rewrite(new URL(`/admin${pathname}${url.search}`, req.url), {
        request: { headers: withPathHeader(req, `/admin${pathname}`) },
      });
    }

    return nextWithPath(req, pathname);
  }

  return nextWithPath(req, pathname);
}

/**
 * Must run on `/dashboard`, `/admin`, `/login`, `/`, etc. Avoid overly broad exclusions.
 * Next.js matcher: exclude API + Next internals only (official pattern).
 */
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
