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
    const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])
    const fraction = trimmed.match(/^(\d+)\/(\d+)$/)
    if (fraction) return parseInt(fraction[1]) / parseInt(fraction[2])
    const num = parseFloat(trimmed)
    if (!isNaN(num)) return num
    return null
}

function formatAmount(value: number): string {
    return parseFloat(value.toFixed(2)).toString()
}

function normalize(s: string): string {
    return s.toLowerCase().trim()
}

function titleCase(s: string): string {
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const weekStart = getWeekStart()
        const [mealPlan, pantryItems] = await Promise.all([
            prisma.mealPlan.findFirst({
                where: { weekStart, userId: session.user.id },
                include: { slots: { include: { recipe: { include: { ingredients: true } } } } },
            }),
            prisma.pantryItem.findMany({ where: { userId: session.user.id } }),
        ])

        if (!mealPlan) return NextResponse.json([])

        const recipeCounts = new Map<number, number>()
        mealPlan.slots.forEach(slot => {
            if (slot.recipe) recipeCounts.set(slot.recipe.id, (recipeCounts.get(slot.recipe.id) ?? 0) + 1)
        })

        // Build pantry lookup keyed by normalized ingredient name → total quantity
        const pantryMap = new Map<string, number>()
        pantryItems.forEach(p => {
            const key = normalize(p.name)
            pantryMap.set(key, (pantryMap.get(key) ?? 0) + p.quantity)
        })

        const seenRecipeIds = new Set<number>()
        const ingredientMap = new Map<string, { displayName: string; amount: number; unit: string | null; rawAmount?: string; recipeTitles: string[] }>()

        mealPlan.slots.forEach(slot => {
            if (slot.recipe && !seenRecipeIds.has(slot.recipe.id)) {
                seenRecipeIds.add(slot.recipe.id)
                const count = recipeCounts.get(slot.recipe.id) ?? 1

                slot.recipe.ingredients.forEach(ing => {
                    const parsed = parseAmount(ing.amount)
                    const normName = normalize(ing.name)
                    const normUnit = (ing.unit || '').toLowerCase().trim()

                    if (parsed !== null) {
                        const key = `${normName}|${normUnit}`
                        const existing = ingredientMap.get(key)
                        const scaled = parsed * count
                        if (existing) {
                            existing.amount += scaled
                            existing.recipeTitles.push(slot.recipe!.title)
                        } else {
                            ingredientMap.set(key, {
                                displayName: titleCase(normName),
                                amount: scaled,
                                unit: ing.unit,
                                recipeTitles: [slot.recipe!.title],
                            })
                        }
                    } else {
                        // Unparseable: keep as separate entry per raw amount
                        const key = `${normName}|${normUnit}|${ing.amount}`
                        const existing = ingredientMap.get(key)
                        if (existing) {
                            existing.recipeTitles.push(slot.recipe!.title)
                        } else {
                            ingredientMap.set(key, {
                                displayName: titleCase(normName),
                                amount: 0,
                                unit: ing.unit,
                                rawAmount: ing.amount,
                                recipeTitles: [slot.recipe!.title],
                            })
                        }
                    }
                })
            }
        })

        const ingredients: {
            name: string
            amount: string
            unit: string | null
            recipeTitles: string[]
            pantryHave: number
            needed: number | null
        }[] = []

        ingredientMap.forEach(value => {
            const pantryHave = pantryMap.get(normalize(value.displayName)) ?? 0
            if (value.rawAmount !== undefined) {
                ingredients.push({
                    name: value.displayName,
                    amount: value.rawAmount,
                    unit: value.unit,
                    recipeTitles: value.recipeTitles,
                    pantryHave,
                    needed: null,
                })
            } else {
                ingredients.push({
                    name: value.displayName,
                    amount: formatAmount(value.amount),
                    unit: value.unit,
                    recipeTitles: value.recipeTitles,
                    pantryHave,
                    needed: value.amount,
                })
            }
        })

        ingredients.sort((a, b) => a.name.localeCompare(b.name))
        return NextResponse.json(ingredients)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch grocery list' }, { status: 500 })
    }
}
