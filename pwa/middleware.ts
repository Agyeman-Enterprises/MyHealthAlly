import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection
 * 
 * Checks for auth-token cookie to protect routes.
 * Works with the auth system in lib/auth/auth-utils.ts
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  const publicRoutes = [
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/',
    '/pricing',
  ];

  // Check if this is a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Static assets and API routes - skip auth check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Not authenticated - redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists - allow request
  // Note: In production, you'd also validate the token here or in API routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - static files
     * - images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
