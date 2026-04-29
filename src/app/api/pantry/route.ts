import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { normalizeIngredientName } from '@/lib/normalize'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const items = await prisma.pantryItem.findMany({
            where: { userId: session.user.id },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        })

        return NextResponse.json(items)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch pantry items' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { name, quantity, unit, category, expiryDate } = body

        if (!name || !quantity) {
            return NextResponse.json({ error: 'Name and quantity are required' }, { status: 400 })
        }

        const item = await prisma.pantryItem.create({
            data: {
                name: normalizeIngredientName(name),
                quantity: parseFloat(quantity),
                unit: unit || null,
                category: category || null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                userId: session.user.id,
            },
        })

        return NextResponse.json(item)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create pantry item' }, { status: 500 })
    }
}
