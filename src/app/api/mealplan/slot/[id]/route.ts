import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const slotId = parseInt(id)
        if (isNaN(slotId)) return NextResponse.json({ error: 'Invalid slot id' }, { status: 400 })

        const slot = await prisma.mealSlot.findUnique({
            where: { id: slotId },
            include: { mealPlan: true },
        })
        if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (slot.mealPlan.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.mealSlot.delete({ where: { id: slotId } })
        return NextResponse.json({ message: 'Slot removed' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to remove slot' }, { status: 500 })
    }
}
