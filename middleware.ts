import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get the hostname (e.g., 'admin.mex509.com' or 'localhost:3000')
  const hostname = req.headers.get('host') || '';

  // Check if the URL starts with the 'admin' subdomain
  if (hostname.startsWith('admin.')) {
    
    // If they just go to admin.yourwebsite.com/, rewrite them to the login page
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/admin/login', req.url));
    }
    
    // If they go to admin.yourwebsite.com/dashboard, rewrite to /admin/dashboard
    if (!url.pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
    }
  }

  // Otherwise, let them browse the normal public website
  return NextResponse.next();
}

// Only run this middleware on actual pages, ignore images and CSS
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};