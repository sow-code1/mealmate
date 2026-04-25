import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const { name, quantity, unit, category, expiryDate, haveAmount } = body

        const item = await prisma.pantryItem.findFirst({
            where: { id: parseInt(id), userId: session.user.id },
        })

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

        const updated = await prisma.pantryItem.update({
            where: { id: parseInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
                ...(unit !== undefined && { unit }),
                ...(category !== undefined && { category }),
                ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
                ...(haveAmount !== undefined && { haveAmount: parseFloat(haveAmount) }),
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update pantry item' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        const item = await prisma.pantryItem.findFirst({
            where: { id: parseInt(id), userId: session.user.id },
        })

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

        await prisma.pantryItem.delete({
            where: { id: parseInt(id) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete pantry item' }, { status: 500 })
    }
}
