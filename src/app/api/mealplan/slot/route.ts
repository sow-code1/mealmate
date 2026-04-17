import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { day, mealType, recipeId, mealPlanId } = await request.json()

        if (!day || !mealType || !recipeId || !mealPlanId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const mealPlan = await prisma.mealPlan.findUnique({ where: { id: mealPlanId } })
        if (!mealPlan || mealPlan.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
        if (!recipe || recipe.userId !== session.user.id) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        }

        const existing = await prisma.mealSlot.findFirst({
            where: { mealPlanId, day, mealType },
        })
        if (existing) {
            const slot = await prisma.mealSlot.update({
                where: { id: existing.id },
                data: { recipeId },
                include: { recipe: true },
            })
            return NextResponse.json(slot)
        }
        const slot = await prisma.mealSlot.create({
            data: { day, mealType, recipeId, mealPlanId },
            include: { recipe: true },
        })
        return NextResponse.json(slot, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to assign recipe' }, { status: 500 })
    }
}
