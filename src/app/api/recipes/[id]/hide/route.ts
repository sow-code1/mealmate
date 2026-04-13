import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const existing = await prisma.hiddenRecipe.findUnique({
            where: { userId_recipeId: { userId: session.user.id, recipeId: parseInt(id) } },
        })

        if (existing) {
            await prisma.hiddenRecipe.delete({ where: { id: existing.id } })
            return NextResponse.json({ hidden: false })
        } else {
            await prisma.hiddenRecipe.create({
                data: { userId: session.user.id, recipeId: parseInt(id) },
            })
            return NextResponse.json({ hidden: true })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle hidden' }, { status: 500 })
    }
}