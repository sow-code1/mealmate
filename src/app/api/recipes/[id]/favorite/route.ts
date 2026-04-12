import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const recipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) },
        })
        if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { favorite: !recipe.favorite },
        })
        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
    }
}