import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard');
  
  // Define auth routes (don't redirect these)
  const isAuthRoute = pathname.startsWith('/sign-in') || 
                     pathname.startsWith('/sign-up') || 
                     pathname.startsWith('/sso-callback');
  
  if (isProtectedRoute && !isAuthRoute) {
    // Check for Clerk session cookies
    const sessionCookieNames = [
      '__session',
      '__clerk_session',
      '__clerk_jwt',
      '__clerk_refresh_token'
    ];
    
    let hasValidSession = false;
    
    for (const cookieName of sessionCookieNames) {
      const cookie = request.cookies.get(cookieName);
      if (cookie?.value && cookie.value.trim() !== '') {
        hasValidSession = true;
        break;
      }
    }
    
    // Check Authorization header as fallback
    if (!hasValidSession) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ') && authHeader.length > 7) {
        hasValidSession = true;
      }
    }
    
    // If no valid session found, redirect to sign-in
    if (!hasValidSession) {
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('redirect_url', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


