import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // @ts-ignore
        const isAdmin = session?.user?.isAdmin === true

        const recipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) },
            include: {
                ingredients: true,
                steps: { orderBy: { order: 'asc' } },
                user: { select: { name: true, email: true } },
            },
        })
        if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        if (recipe.userId !== session.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return NextResponse.json(recipe)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // @ts-ignore
        const isAdmin = session?.user?.isAdmin === true
        const cookieStore = await cookies()
        const adminMode = isAdmin && cookieStore.get('adminMode')?.value === 'true'

        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } })
        if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (recipe.userId !== session.user.id && !adminMode) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, category, prepTime, cookTime, servings, tags, ingredients, steps } = body

        await prisma.ingredient.deleteMany({ where: { recipeId: parseInt(id) } })
        await prisma.step.deleteMany({ where: { recipeId: parseInt(id) } })

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: {
                title, description, category, prepTime, cookTime, servings, tags,
                ingredients: ingredients ? { create: ingredients } : undefined,
                steps: steps ? { create: steps } : undefined,
            },
            include: {
                ingredients: true,
                steps: { orderBy: { order: 'asc' } },
            },
        })
        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // @ts-ignore
        const isAdmin = session?.user?.isAdmin === true
        const cookieStore = await cookies()
        const adminMode = isAdmin && cookieStore.get('adminMode')?.value === 'true'

        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } })
        if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (recipe.userId !== session.user.id && !adminMode) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (adminMode) {
            // Admin mode — permanently delete globally
            await prisma.recipe.delete({ where: { id: parseInt(id) } })
        } else {
            // Personal mode — soft delete, goes to hidden list
            await prisma.recipe.update({
                where: { id: parseInt(id) },
                data: { deleted: true, deletedAt: new Date() },
            })
        }

        return NextResponse.json({ message: 'Recipe deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
    }
}