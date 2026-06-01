import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // We use a simple client-side auth for the demo, 
  // but this is where a real NextAuth or JWT token check would happen.
  // Since we rely on localStorage for the mock auth which isn't available in middleware,
  // we will just allow the request through and let the client-side layout handle the redirect.
  // In a production app, we would verify a cookie token here:
  
  /*
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
