import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

function parseAmount(amount: string): number | null {
    const trimmed = amount.trim()
    const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])
    const fraction = trimmed.match(/^(\d+)\/(\d+)$/)
    if (fraction) return parseInt(fraction[1]) / parseInt(fraction[2])
    const num = parseFloat(trimmed)
    return isNaN(num) ? null : num
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const date = request.nextUrl.searchParams.get('date')
        if (!date) return NextResponse.json({ error: 'date param required' }, { status: 400 })

        const entries = await prisma.foodEntry.findMany({
            where: { userId: session.user.id, date },
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(entries)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { date, mealType, label, calories, protein, carbs, fat, servings, recipeId } = await request.json()

        if (!date || !mealType || !label || calories == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const userId = session.user.id
        const recipeIdNum = recipeId ? Number(recipeId) : null
        const servingsNum = Number(servings ?? 1)

        const result = await prisma.$transaction(async (tx) => {
            const entry = await tx.foodEntry.create({
                data: {
                    date,
                    mealType,
                    label,
                    calories: Number(calories),
                    protein: Number(protein ?? 0),
                    carbs: Number(carbs ?? 0),
                    fat: Number(fat ?? 0),
                    servings: servingsNum,
                    recipeId: recipeIdNum,
                    userId,
                },
            })

            let deductedCount = 0
            if (recipeIdNum) {
                const recipe = await tx.recipe.findFirst({
                    where: { id: recipeIdNum, userId },
                    include: { ingredients: true },
                })
                if (recipe) {
                    const pantry = await tx.pantryItem.findMany({ where: { userId } })
                    const pantryByName = new Map(pantry.map(p => [p.name.toLowerCase().trim(), p]))

                    for (const ing of recipe.ingredients) {
                        const key = ing.name.toLowerCase().trim()
                        const item = pantryByName.get(key)
                        if (!item) continue
                        const ingAmt = parseAmount(ing.amount)
                        if (ingAmt === null) continue
                        const usedAmount = ingAmt * servingsNum
                        const newQty = Math.max(0, item.quantity - usedAmount)
                        await tx.pantryItem.update({
                            where: { id: item.id },
                            data: { quantity: newQty },
                        })
                        deductedCount++
                    }
                }
            }
            return { entry, deductedCount }
        })

        return NextResponse.json({ ...result.entry, deductedCount: result.deductedCount }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to log entry' }, { status: 500 })
    }
}
