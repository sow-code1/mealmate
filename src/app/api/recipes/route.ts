import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { normalizeIngredientName } from '@/lib/normalize'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const isMealPlanner = request.nextUrl.searchParams.get('mealplanner') === 'true'

        const withNutrition = request.nextUrl.searchParams.get('nutrition') === 'true'
        const recipes = await prisma.recipe.findMany({
            where: {
                userId: session.user.id,
                deleted: false,
            },
            orderBy: { createdAt: 'desc' },
            include: withNutrition ? { nutrition: true } : undefined,
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
        const { title, description, category, prepTime, cookTime, servings, tags, imageUrl, ingredients, steps } = body

        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                category,
                prepTime,
                cookTime,
                servings,
                tags,
                imageUrl,
                userId: session.user.id,
                isPublic: false,
                ingredients: {
                    create: (ingredients ?? []).map((i: { name: string; amount: string; unit?: string | null }) => ({
                        ...i,
                        name: normalizeIngredientName(i.name),
                    })),
                },
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