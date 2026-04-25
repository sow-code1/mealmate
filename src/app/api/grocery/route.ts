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
        const ingredientMap = new Map<string, { amount: number; unit: string | null; recipeTitles: string[] }>()

        mealPlan.slots.forEach((slot) => {
            if (slot.recipe && !seenRecipeIds.has(slot.recipe.id)) {
                seenRecipeIds.add(slot.recipe.id)
                const count = recipeCounts.get(slot.recipe.id) ?? 1

                slot.recipe.ingredients.forEach((ing) => {
                    const parsed = parseAmount(ing.amount)
                    const scaledAmount = parsed !== null
                        ? parsed * count
                        : null // if unparseable, we can't aggregate

                    const key = `${ing.name.toLowerCase()}|${ing.unit || ''}`

                    if (scaledAmount !== null) {
                        const existing = ingredientMap.get(key)
                        if (existing) {
                            existing.amount += scaledAmount
                            existing.recipeTitles.push(slot.recipe!.title)
                        } else {
                            ingredientMap.set(key, {
                                amount: scaledAmount,
                                unit: ing.unit,
                                recipeTitles: [slot.recipe!.title],
                            })
                        }
                    } else {
                        // For unparseable amounts (e.g. "to taste"), keep as separate entries
                        const key = `${ing.name.toLowerCase()}|${ing.unit || ''}|${ing.amount}`
                        const existing = ingredientMap.get(key)
                        if (existing) {
                            existing.recipeTitles.push(slot.recipe!.title)
                        } else {
                            ingredientMap.set(key, {
                                amount: 0, // placeholder
                                unit: ing.unit,
                                recipeTitles: [slot.recipe!.title],
                            })
                        }
                    }
                })
            }
        })

        // Convert map to array
        const ingredients: { name: string; amount: string; unit: string | null; recipeTitles: string[] }[] = []

        ingredientMap.forEach((value, key) => {
            const [name, unit, rawAmount] = key.split('|')
            if (rawAmount) {
                // Unparseable amount
                ingredients.push({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    amount: rawAmount,
                    unit: unit || null,
                    recipeTitles: value.recipeTitles,
                })
            } else {
                // Parsed and aggregated amount
                ingredients.push({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    amount: formatAmount(value.amount),
                    unit: unit || null,
                    recipeTitles: value.recipeTitles,
                })
            }
        })

        // Sort by name
        ingredients.sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json(ingredients)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch grocery list' }, { status: 500 })
    }
}