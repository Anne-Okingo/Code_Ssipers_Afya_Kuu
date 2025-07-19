import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard/doctor',
  '/dashboard/admin',
  '/dashboard',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/assessment',
  '/how-it-works',
  '/api',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Allow public routes and static files
  if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  if (isProtectedRoute) {
    // Get user session from cookies or headers
    const userCookie = request.cookies.get('afya_kuu_user');

    // If no user session found, redirect to assessment (login/signup)
    if (!userCookie || !userCookie.value) {
      const url = request.nextUrl.clone();
      url.pathname = '/assessment';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('message', 'login_required');
      return NextResponse.redirect(url);
    }
    
    try {
      // Parse user data from cookie
      const userData = JSON.parse(userCookie.value);
      
      // Check user type for specific dashboard routes
      if (pathname.startsWith('/dashboard/doctor') && userData.userType !== 'doctor') {
        // Redirect to correct dashboard or back to assessment
        if (userData.userType === 'admin') {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard/admin';
          return NextResponse.redirect(url);
        } else {
          // Redirect back to assessment with error message
          const url = request.nextUrl.clone();
          url.pathname = '/assessment';
          url.searchParams.set('error', 'access_denied');
          url.searchParams.set('message', 'doctor_access_required');
          return NextResponse.redirect(url);
        }
      }

      if (pathname.startsWith('/dashboard/admin') && userData.userType !== 'admin') {
        // Redirect to correct dashboard or back to assessment
        if (userData.userType === 'doctor') {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard/doctor';
          return NextResponse.redirect(url);
        } else {
          // Redirect back to assessment with error message
          const url = request.nextUrl.clone();
          url.pathname = '/assessment';
          url.searchParams.set('error', 'access_denied');
          url.searchParams.set('message', 'admin_access_required');
          return NextResponse.redirect(url);
        }
      }
      
    } catch (error) {
      // Invalid cookie data, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/assessment';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('error', 'invalid_session');
      url.searchParams.set('message', 'session_expired');
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
