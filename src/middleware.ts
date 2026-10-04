import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // If the user visits the main live domain, rewrite to the coming soon page
  // We check for both www.thenicelamps.com and thenicelamps.com
  if (
    hostname === 'thenicelamps.com' ||
    hostname === 'www.thenicelamps.com' ||
    hostname.includes('thenicelamps.com') // Catch-all for safety
  ) {
    // If they are trying to access static assets (like the logo) or API routes, let them through
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
    ) {
      return NextResponse.next()
    }

    // Rewrite all other requests to the coming soon page
    // This keeps the URL as 'thenicelamps.com/' in the browser but shows the coming-soon page content
    if (url.pathname !== '/coming-soon') {
      return NextResponse.rewrite(new URL('/coming-soon', request.url))
    }
  }

  // If they visit the Vercel app URL (thenicelamps-*.vercel.app), let them see the full store
  return NextResponse.next()
}

export const config = {
  // Apply the middleware to all routes except API routes and static files
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
