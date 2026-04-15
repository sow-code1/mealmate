import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

function getWeekStart() {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const weekStart = getWeekStart()

        let mealPlan = await prisma.mealPlan.findFirst({
            where: { weekStart, userId: session.user.id },
            include: {
                slots: {
                    include: { recipe: true },
                },
            },
        })

        if (!mealPlan) {
            mealPlan = await prisma.mealPlan.create({
                data: { weekStart, userId: session.user.id },
                include: {
                    slots: {
                        include: { recipe: true },
                    },
                },
            })
        }

        return NextResponse.json(mealPlan)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch meal plan' }, { status: 500 })
    }
}