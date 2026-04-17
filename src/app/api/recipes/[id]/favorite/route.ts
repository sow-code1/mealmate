import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const recipeId = parseInt(id)
        if (isNaN(recipeId)) return NextResponse.json({ error: 'Invalid recipe id' }, { status: 400 })

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
        if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (recipe.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updated = await prisma.recipe.update({
            where: { id: recipeId },
            data: { favorite: !recipe.favorite },
        })
        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
    }
}
