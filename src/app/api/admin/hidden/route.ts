import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(request: Request) {
    try {
        const session = await auth()
        // @ts-ignore
        if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { recipeIds } = await request.json()

        // Find which of these are preset (public, no userId) vs private user recipes
        const recipes = await prisma.recipe.findMany({
            where: { id: { in: recipeIds } },
            select: { id: true, isPublic: true, userId: true },
        })

        const presetIds = recipes.filter((r) => r.isPublic && !r.userId).map((r) => r.id)
        const privateIds = recipes.filter((r) => !r.isPublic || r.userId).map((r) => r.id)

        // For preset recipes — just clear the hidden records, don't delete the recipe
        if (presetIds.length > 0) {
            await prisma.hiddenRecipe.deleteMany({
                where: { recipeId: { in: presetIds } },
            })
        }

        // For private user recipes — delete the recipe entirely (cascades hidden records)
        if (privateIds.length > 0) {
            await prisma.recipe.deleteMany({
                where: { id: { in: privateIds } },
            })
        }

        return NextResponse.json({ message: 'Done', presetCleared: presetIds.length, privateDeleted: privateIds.length })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}