import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isStaticFile = pathname.startsWith('/_next') || pathname.includes('favicon.ico')
    const isApiAuth = pathname.startsWith('/api/auth')
    const isProtectedApi = pathname.startsWith('/api/') && !isApiAuth

    if (isStaticFile || isApiAuth || !isProtectedApi) return NextResponse.next()

    const sessionToken =
        request.cookies.get('authjs.session-token') ??
        request.cookies.get('next-auth.session-token') ??
        request.cookies.get('__Secure-authjs.session-token') ??
        request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
