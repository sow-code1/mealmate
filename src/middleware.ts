import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const publicPaths = ['/', '/login', '/register']
    const isPublicPath = publicPaths.includes(pathname)
    const isApiAuth = pathname.startsWith('/api/auth')
    const isStaticFile = pathname.startsWith('/_next') || pathname.includes('favicon.ico')

    if (isStaticFile || isApiAuth || isPublicPath) return NextResponse.next()

    const sessionToken =
        request.cookies.get('authjs.session-token') ??
        request.cookies.get('next-auth.session-token') ??
        request.cookies.get('__Secure-authjs.session-token') ??
        request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}