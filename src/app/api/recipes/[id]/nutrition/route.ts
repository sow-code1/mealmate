import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const recipeId = parseInt(id)

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
    if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // @ts-ignore
    const isAdmin = session?.user?.isAdmin === true
    if (recipe.userId !== session.user.id && !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { calories, protein, carbs, fat, fiber } = await request.json()

    const nutrition = await prisma.nutritionInfo.upsert({
        where: { recipeId },
        update: {
            calories: Number(calories),
            protein: Number(protein ?? 0),
            carbs: Number(carbs ?? 0),
            fat: Number(fat ?? 0),
            fiber: Number(fiber ?? 0),
        },
        create: {
            recipeId,
            calories: Number(calories),
            protein: Number(protein ?? 0),
            carbs: Number(carbs ?? 0),
            fat: Number(fat ?? 0),
            fiber: Number(fiber ?? 0),
        },
    })
    return NextResponse.json(nutrition)
}
