import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const recipes = await prisma.recipe.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(recipes)
    } catch (error) {
        console.error('RECIPES ERROR:', error)
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, description, category, prepTime, cookTime, servings, ingredients, steps } = body

        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                category,
                prepTime,
                cookTime,
                servings,
                ingredients: {
                    create: ingredients ?? [],
                },
                steps: {
                    create: steps ?? [],
                },
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