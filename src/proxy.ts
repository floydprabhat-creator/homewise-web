import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/types/constants';

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

/**
 * Redirects on cookie presence only; the API does the real session check.
 * A stale cookie lands on an app page, gets a 401 from the API, and the user is sent to /login.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (hasSession && (isAuthPage || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!hasSession && !isAuthPage && !pathname.startsWith('/invite/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API calls, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
