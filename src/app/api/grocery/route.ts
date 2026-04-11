import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getWeekStart() {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
}

export async function GET() {
    try {
        const weekStart = getWeekStart()
        const mealPlan = await prisma.mealPlan.findFirst({
            where: { weekStart },
            include: {
                slots: {
                    include: {
                        recipe: { include: { ingredients: true } },
                    },
                },
            },
        })
        if (!mealPlan) return NextResponse.json([])
        const ingredients: { name: string; amount: string; unit: string | null }[] = []
        mealPlan.slots.forEach((slot) => {
            if (slot.recipe) {
                slot.recipe.ingredients.forEach((ing) => {
                    ingredients.push({ name: ing.name, amount: ing.amount, unit: ing.unit })
                })
            }
        })
        return NextResponse.json(ingredients)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch grocery list' }, { status: 500 })
    }
}