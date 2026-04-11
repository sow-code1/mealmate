import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { day, mealType, recipeId, mealPlanId } = await request.json()
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