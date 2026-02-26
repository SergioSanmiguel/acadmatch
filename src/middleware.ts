import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If authenticated but profile incomplete, redirect to profile setup
    // (except if already on setup page)
    if (
      token &&
      !(token as any).profileComplete &&
      !pathname.startsWith('/profile/setup') &&
      !pathname.startsWith('/api/')
    ) {
      return NextResponse.redirect(new URL('/profile/setup', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/feed/:path*',
    '/matches/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/favorites/:path*',
  ],
};
