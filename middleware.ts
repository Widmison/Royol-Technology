import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_PORTAL_ROLE_COOKIE,
  ADMIN_TOTP_GATE_COOKIE,
  CLIENT_SESSION_COOKIE,
} from "@/lib/authCookies";
import { verifyAdminTotpGateCookieEdge } from "@/lib/adminTotpGateVerify.edge";
import { isAdminDashboardHost } from "@/lib/adminDashboardHost";
import { looksLikePrismaUserId } from "@/lib/prismaUserId";
import { allowPublicTrackLookup, clientIp } from "@/lib/authRateLimit";

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
  "/staff",
  "/complete-profile",
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

function hasValidAdminSessionCookie(req: NextRequest): boolean {
  const v = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return typeof v === "string" && looksLikePrismaUserId(v);
}

function hasValidClientSessionCookie(req: NextRequest): boolean {
  const v = req.cookies.get(CLIENT_SESSION_COOKIE)?.value;
  return typeof v === "string" && looksLikePrismaUserId(v);
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

function pathnameBypassesAdminTotpGate(pathname: string): boolean {
  if (pathname === "/admin/setup-authenticator" || pathname.startsWith("/admin/setup-authenticator?")) {
    return true;
  }
  if (pathnameIsPublicAdminAuthSurface(pathname)) return true;
  if (pathname.startsWith("/api/admin/auth")) return true;
  if (pathname.startsWith("/api/admin/totp")) return true;
  if (pathname.startsWith("/api/admin/complete-profile")) return true;
  if (pathname.startsWith("/api/admin/signout")) return true;
  return false;
}

function pathnameNeedsAdminTotpGate(pathname: string, hostNoPort: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api/admin")) return true;
  if (isAdminDashboardHost(hostNoPort) && isAdminShortcut(pathname)) return true;
  return false;
}

async function enforceAdminPortalTotpGate(
  req: NextRequest,
  pathname: string,
  hostNoPort: string,
  authSecret: string | undefined,
  adminJwt: JWT | null,
  hasPortalAdminSession: boolean
): Promise<NextResponse | null> {
  if (!pathnameNeedsAdminTotpGate(pathname, hostNoPort)) return null;
  if (pathnameBypassesAdminTotpGate(pathname)) return null;
  if (!hasPortalAdminSession) return null;

  const secret = authSecret?.trim();
  if (!secret) return null;

  const cookieUid = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const jwtUid = typeof adminJwt?.sub === "string" ? adminJwt.sub : "";
  const userId =
    cookieUid && looksLikePrismaUserId(cookieUid)
      ? cookieUid
      : jwtUid && looksLikePrismaUserId(jwtUid)
        ? jwtUid
        : "";

  if (!userId) return null;

  const roleCookie = req.cookies.get(ADMIN_PORTAL_ROLE_COOKIE)?.value?.toLowerCase();
  if (roleCookie === "staff") return null;

  /** Gate cookie only (JWT can be stale after toggling 2FA). Issued at password TOTP login, TOTP enable, or GET /api/admin/totp when already enrolled. */
  const gateCookie = req.cookies.get(ADMIN_TOTP_GATE_COOKIE)?.value;
  const gateOk = await verifyAdminTotpGateCookieEdge(gateCookie, userId, secret);

  if (gateOk) return null;

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: "Authenticator enrollment required.", code: "totp_setup_required" },
      { status: 403 }
    );
  }

  return NextResponse.redirect(new URL("/admin/setup-authenticator", req.url));
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
  let jwtToken: JWT | null = null;
  if (secret) {
    try {
      jwtToken = (await getToken({
        req,
        secret,
        secureCookie: process.env.NODE_ENV === "production",
      })) as JWT | null;
    } catch {
      jwtToken = null;
    }
  }
  const adminJwt = jwtToken;
  /** Legacy NextAuth JWT (if present); admin cookie is the primary session for staff. */
  const hasJwtAdmin = !!adminJwt?.sub && adminJwt.role === "admin";

  function hasAdminAccess(): boolean {
    return hasJwtAdmin || hasValidAdminSessionCookie(req);
  }

  /** Skip host routing / auth for static assets (safe even when matcher hits file-like paths). */
  if (/\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$/i.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/track") {
    const tid = url.searchParams.get("id")?.trim();
    if (tid && !allowPublicTrackLookup(clientIp(req))) {
      return new NextResponse(
        "Too many tracking lookups from this connection. Please wait a minute and try again.",
        { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
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
    const hasClient = hasValidClientSessionCookie(req);
    return NextResponse.redirect(new URL(hasClient ? "/dashboard?tab=tracking" : "/login", req.url));
  }

  /**
   * Client dashboard — enforced on every host except the admin dashboard host,
   * where `/dashboard` is an admin shortcut (staff), not the client portal.
   */
  if (
    !isAdminDashboardHost(hostNoPort) &&
    (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
    !hasValidClientSessionCookie(req)
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

  const totpGateRedirect = await enforceAdminPortalTotpGate(
    req,
    pathname,
    hostNoPort,
    secret,
    adminJwt,
    hasAdminAccess()
  );
  if (totpGateRedirect) return totpGateRedirect;

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
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
