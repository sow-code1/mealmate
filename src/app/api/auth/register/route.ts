import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json()
        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

        const hashed = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
            data: { name, email, password: hashed },
        })

        const presets = await prisma.recipe.findMany({
            where: { isPublic: true, userId: null },
            include: { ingredients: true, steps: true },
        })

        for (const preset of presets) {
            await prisma.recipe.create({
                data: {
                    title: preset.title,
                    description: preset.description,
                    imageUrl: preset.imageUrl,
                    prepTime: preset.prepTime,
                    cookTime: preset.cookTime,
                    servings: preset.servings,
                    category: preset.category,
                    tags: preset.tags,
                    isPublic: false,
                    copiedFromPreset: true,
                    userId: user.id,
                    ingredients: {
                        create: preset.ingredients.map((ing) => ({
                            name: ing.name,
                            amount: ing.amount,
                            unit: ing.unit,
                        })),
                    },
                    steps: {
                        create: preset.steps.map((step) => ({
                            order: step.order,
                            instruction: step.instruction,
                        })),
                    },
                },
            })
        }

        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
    }
}