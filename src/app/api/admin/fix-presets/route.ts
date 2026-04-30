import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

interface UserResult {
    email: string | null
    presetsBefore: number
    presetsAdded: number
    presetsAfter: number
}

export async function POST() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!session.user.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    try {
        const presets = await prisma.recipe.findMany({
            where: { isPublic: true, userId: null },
            include: { ingredients: true, steps: true, nutrition: true },
        })
        if (presets.length === 0) {
            return NextResponse.json({ error: 'No public presets found in DB. Seed first.' }, { status: 500 })
        }

        const users = await prisma.user.findMany({ select: { id: true, email: true } })
        const presetTitles = new Set(presets.map(p => p.title))
        const results: UserResult[] = []
        let totalAdded = 0

        for (const user of users) {
            const existing = await prisma.recipe.findMany({
                where: { userId: user.id, copiedFromPreset: true },
                select: { title: true },
            })
            const have = new Set(existing.map(r => r.title))
            const missing = presets.filter(p => presetTitles.has(p.title) && !have.has(p.title))

            for (const p of missing) {
                await prisma.recipe.create({
                    data: {
                        title: p.title,
                        description: p.description,
                        imageUrl: p.imageUrl,
                        prepTime: p.prepTime,
                        cookTime: p.cookTime,
                        servings: p.servings,
                        category: p.category,
                        tags: p.tags,
                        isPublic: false,
                        copiedFromPreset: true,
                        userId: user.id,
                        ingredients: {
                            create: p.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit })),
                        },
                        steps: {
                            create: p.steps.map(s => ({ order: s.order, instruction: s.instruction })),
                        },
                        ...(p.nutrition ? {
                            nutrition: {
                                create: {
                                    calories: p.nutrition.calories,
                                    protein: p.nutrition.protein,
                                    carbs: p.nutrition.carbs,
                                    fat: p.nutrition.fat,
                                    fiber: p.nutrition.fiber,
                                },
                            },
                        } : {}),
                    },
                })
            }

            results.push({
                email: user.email,
                presetsBefore: existing.length,
                presetsAdded: missing.length,
                presetsAfter: existing.length + missing.length,
            })
            totalAdded += missing.length
            if (missing.length > 0) {
                console.log(`fix-presets: +${missing.length} for ${user.email}`)
            }
        }

        return NextResponse.json({
            totalPresets: presets.length,
            usersProcessed: users.length,
            totalAdded,
            results: results.filter(r => r.presetsAdded > 0),
        })
    } catch (error) {
        console.error('fix-presets error:', error)
        return NextResponse.json({ error: 'Failed to fix presets' }, { status: 500 })
    }
}
