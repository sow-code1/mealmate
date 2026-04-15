import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        // @ts-ignore
        if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // Delete all recipes owned by this user first (no cascade on Recipe->User relation)
        await prisma.recipe.deleteMany({ where: { userId: id } })

        // Delete meal plans (slots cascade from MealPlan, so this covers MealSlot too)
        await prisma.mealPlan.deleteMany({ where: { userId: id } })

        // Delete the user — Account, Session, HiddenRecipe cascade automatically
        await prisma.user.delete({ where: { id } })

        return NextResponse.json({ message: 'User deleted' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}