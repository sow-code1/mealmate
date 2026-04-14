import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: Request) {
    const session = await auth()
    // @ts-ignore
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { enabled } = await request.json()

    const response = NextResponse.json({ adminMode: enabled })
    response.cookies.set('adminMode', enabled ? 'true' : 'false', {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    })
    return response
}