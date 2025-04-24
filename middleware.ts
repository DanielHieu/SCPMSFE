import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Get the incoming response
    const response = NextResponse.next();
    
    // Set cache control headers to disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify the paths that require authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - auth/signin (signin page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 