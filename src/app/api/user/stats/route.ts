import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = session.user.id

        const [totalRecipes, totalMealPlans, totalDaysLogged] = await Promise.all([
            prisma.recipe.count({ where: { userId, deleted: false } }),
            prisma.mealPlan.count({ where: { userId } }),
            prisma.foodEntry.count({ where: { userId } }),
        ])

        return NextResponse.json({
            totalRecipes,
            totalMealPlans,
            totalDaysLogged,
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
    }
}
