import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check for Clerk session cookies
    const hasSession = 
      request.cookies.has('__session') ||
      request.cookies.has('__clerk_jwt') ||
      request.headers.get('authorization')?.startsWith('Bearer ');
    
    if (!hasSession) {
      // Redirect to sign-in for protected routes
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  
  // Allow all requests to continue
  return NextResponse.next();
}

export const config = {
  // Only run middleware on dashboard routes to avoid interfering with public routes
  matcher: ['/dashboard/:path*'],
};