import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session from cookies
  const sessionCookie = request.cookies.get('session');
  
  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/api/auth/login'];
  
  // If accessing public route, allow access
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // If no session cookie, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    const { role } = session;
    
    // Role-based routing
    const roleRoutes = {
      STUDENT: ['/student'],
      TEACHER: ['/teacher'],
      PARENT: ['/parent']
    };
    
    // Check if user is accessing correct role-based route
    const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] || [];
    const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));
    
    // If accessing wrong route, redirect to correct dashboard
    if (!isAllowedRoute && pathname !== '/') {
      const defaultRoute = allowedRoutes[0];
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
    
    // If accessing root, redirect to appropriate dashboard
    if (pathname === '/') {
      const defaultRoute = allowedRoutes[0];
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
    
    return NextResponse.next();
    
  } catch (error) {
    // Invalid session, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
