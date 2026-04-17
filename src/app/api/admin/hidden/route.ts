import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(request: Request) {
    try {
        const session = await auth()
                if (!session.user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { recipeIds } = await request.json()

        await prisma.recipe.deleteMany({
            where: { id: { in: recipeIds } },
        })

        return NextResponse.json({ message: 'Permanently deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}