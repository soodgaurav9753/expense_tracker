// middleware.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Public routes and API routes that should be accessible without auth
const publicRoutes = ['/login', '/sign', '/logo.png']
const publicAPIs = ['/api/login', '/api/sign', '/api/verify', '/api/send','/api/update-password','/api/send-otp','/api/verify-otp']

export async function middleware(request) {
  const cookieStore = cookies()
  const { pathname } = request.nextUrl
  const userid = cookieStore.get('token')?.value

  // Allow public pages
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow specific public APIs
  if (publicAPIs.some(api => pathname.startsWith(api))) {
    return NextResponse.next()
  }

  // If no userid and trying to access protected route, redirect to login
  if (!userid) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
