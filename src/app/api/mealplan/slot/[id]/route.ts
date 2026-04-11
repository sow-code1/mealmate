import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.mealSlot.delete({ where: { id: parseInt(id) } })
        return NextResponse.json({ message: 'Slot removed' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to remove slot' }, { status: 500 })
    }
}