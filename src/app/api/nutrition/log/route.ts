import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const date = request.nextUrl.searchParams.get('date')
        if (!date) return NextResponse.json({ error: 'date param required' }, { status: 400 })

        const entries = await prisma.foodEntry.findMany({
            where: { userId: session.user.id, date },
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(entries)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { date, mealType, label, calories, protein, carbs, fat, servings, recipeId } = await request.json()

        if (!date || !mealType || !label || calories == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const entry = await prisma.foodEntry.create({
            data: {
                date,
                mealType,
                label,
                calories: Number(calories),
                protein: Number(protein ?? 0),
                carbs: Number(carbs ?? 0),
                fat: Number(fat ?? 0),
                servings: Number(servings ?? 1),
                recipeId: recipeId ? Number(recipeId) : null,
                userId: session.user.id,
            },
        })
        return NextResponse.json(entry, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to log entry' }, { status: 500 })
    }
}
