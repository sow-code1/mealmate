import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isMealPlanner = request.nextUrl.searchParams.get('mealplanner') === 'true'

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: session.user.id,
                deleted: false,
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(recipes)
    } catch (error) {
        console.error('RECIPES ERROR:', error)
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const body = await request.json()
        const { title, description, category, prepTime, cookTime, servings, tags, ingredients, steps } = body

        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                category,
                prepTime,
                cookTime,
                servings,
                tags,
                userId: session.user.id,
                isPublic: false,
                ingredients: { create: ingredients ?? [] },
                steps: { create: steps ?? [] },
            },
            include: {
                ingredients: true,
                steps: true,
            },
        })
        return NextResponse.json(recipe, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
    }
}