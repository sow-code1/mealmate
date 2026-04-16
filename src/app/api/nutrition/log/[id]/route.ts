import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const entry = await prisma.foodEntry.findUnique({ where: { id: parseInt(id) } })
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (entry.userId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    await prisma.foodEntry.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ ok: true })
}
