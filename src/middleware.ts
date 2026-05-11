import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // CORS for public API routes
  if (pathname.startsWith('/api/public/')) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    const res = NextResponse.next()
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = req.cookies.get('admin_session')
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect /client routes (except /client login page itself)
  if (pathname.startsWith('/client') && pathname !== '/client') {
    const clientSession = req.cookies.get('client_session')
    if (!clientSession) {
      return NextResponse.redirect(new URL('/client', req.url))
    }
  }
}

export const config = {
  matcher: ['/api/public/:path*', '/admin/:path*', '/client/:path*'],
}
