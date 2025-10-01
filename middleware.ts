import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value

  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // If no session token, redirect to signin
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // If session token exists but is invalid, the /api/auth/me endpoint will handle it
    // and the AuthProvider will redirect the user
  }

  // If user is on signin/signup pages and has a valid session, redirect to dashboard
  if ((request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup') && sessionToken) {
    try {
      // Basic check - if session token exists and is valid JSON, redirect to dashboard
      JSON.parse(sessionToken)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Invalid session token, let them stay on signin/signup
    }
  }

  return NextResponse.next()
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
}
