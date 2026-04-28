import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await request.json().catch(() => ({}))
    if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    const trimmed = name.trim().slice(0, 80)
    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: trimmed },
        select: { id: true, name: true },
    })
    return NextResponse.json(updated)
}
