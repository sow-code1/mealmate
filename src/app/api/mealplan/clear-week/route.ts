import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { mealPlanId } = body

        if (!mealPlanId) return NextResponse.json({ error: 'Meal plan ID required' }, { status: 400 })

        // Verify the meal plan belongs to the user
        const mealPlan = await prisma.mealPlan.findFirst({
            where: { id: mealPlanId, userId: session.user.id },
        })

        if (!mealPlan) return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })

        // Delete all slots for this meal plan
        await prisma.mealSlot.deleteMany({
            where: { mealPlanId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to clear week' }, { status: 500 })
    }
}
