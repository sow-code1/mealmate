import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

function getWeekStart() {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    return monday
}

// Parses amounts like "30", "1/2", "2.5", "1 1/2" into a number
function parseAmount(amount: string): number | null {
    const trimmed = amount.trim()

    // Handle mixed fractions like "1 1/2"
    const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (mixed) {
        return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])
    }

    // Handle simple fractions like "1/2"
    const fraction = trimmed.match(/^(\d+)\/(\d+)$/)
    if (fraction) {
        return parseInt(fraction[1]) / parseInt(fraction[2])
    }

    // Handle plain numbers like "30" or "2.5"
    const num = parseFloat(trimmed)
    if (!isNaN(num)) return num

    return null
}

// Formats a number back to a clean string — avoids ugly floats like "1.9999999"
function formatAmount(value: number): string {
    // Round to 2 decimal places, then strip trailing zeros
    return parseFloat(value.toFixed(2)).toString()
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const weekStart = getWeekStart()
        const mealPlan = await prisma.mealPlan.findFirst({
            where: { weekStart, userId: session.user.id },
            include: {
                slots: {
                    include: {
                        recipe: { include: { ingredients: true } },
                    },
                },
            },
        })

        if (!mealPlan) return NextResponse.json([])

        // Count how many times each recipe appears in the meal plan
        const recipeCounts = new Map<number, number>()
        mealPlan.slots.forEach((slot) => {
            if (slot.recipe) {
                recipeCounts.set(slot.recipe.id, (recipeCounts.get(slot.recipe.id) ?? 0) + 1)
            }
        })

        // Collect ingredients once per unique recipe, with amounts multiplied by slot count
        const seenRecipeIds = new Set<number>()
        const ingredients: { name: string; amount: string; unit: string | null; recipeTitle: string }[] = []

        mealPlan.slots.forEach((slot) => {
            if (slot.recipe && !seenRecipeIds.has(slot.recipe.id)) {
                seenRecipeIds.add(slot.recipe.id)
                const count = recipeCounts.get(slot.recipe.id) ?? 1

                slot.recipe.ingredients.forEach((ing) => {
                    const parsed = parseAmount(ing.amount)
                    const scaledAmount = parsed !== null
                        ? formatAmount(parsed * count)
                        : ing.amount // if unparseable (e.g. "to taste"), leave as-is

                    ingredients.push({
                        name: ing.name,
                        amount: scaledAmount,
                        unit: ing.unit,
                        recipeTitle: slot.recipe!.title,
                    })
                })
            }
        })

        return NextResponse.json(ingredients)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch grocery list' }, { status: 500 })
    }
}