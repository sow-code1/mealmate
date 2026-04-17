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
        const recipeId = parseInt(id)
        if (isNaN(recipeId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const isAdmin = session.user.isAdmin === true

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                ingredients: true,
                steps: { orderBy: { order: 'asc' } },
                user: { select: { name: true, email: true } },
                nutrition: true,
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
        const recipeId = parseInt(id)
        if (isNaN(recipeId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const isAdmin = session.user.isAdmin === true
        const cookieStore = await cookies()
        const adminMode = isAdmin && cookieStore.get('adminMode')?.value === 'true'

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
        if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (recipe.userId !== session.user.id && !adminMode) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, category, prepTime, cookTime, servings, tags, imageUrl, ingredients, steps } = body

        await prisma.ingredient.deleteMany({ where: { recipeId } })
        await prisma.step.deleteMany({ where: { recipeId } })

        const updated = await prisma.recipe.update({
            where: { id: recipeId },
            data: {
                title, description, category, prepTime, cookTime, servings, tags, imageUrl,
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
        const recipeId = parseInt(id)
        if (isNaN(recipeId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const isAdmin = session.user.isAdmin === true
        const cookieStore = await cookies()
        const adminMode = isAdmin && cookieStore.get('adminMode')?.value === 'true'

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
        if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (recipe.userId !== session.user.id && !adminMode) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (adminMode) {
            await prisma.recipe.delete({ where: { id: recipeId } })
        } else {
            await prisma.recipe.update({
                where: { id: recipeId },
                data: { deleted: true, deletedAt: new Date() },
            })
        }

        return NextResponse.json({ message: 'Recipe deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
    }
}