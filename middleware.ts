import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const hostNoPort = hostname.split(":")[0] ?? hostname;

  if (!hostNoPort.startsWith("admin.")) {
    return NextResponse.next();
  }

  if (url.pathname === "/") {
    return NextResponse.rewrite(new URL("/admin/login", req.url));
  }

  if (url.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (isAdminShortcut(url.pathname)) {
    return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
  }

  return NextResponse.next();
}

// Only run this middleware on actual pages, ignore images and CSS
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};