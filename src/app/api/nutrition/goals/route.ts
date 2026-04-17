import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const goal = await prisma.userGoal.findUnique({ where: { userId: session.user.id } })
        return NextResponse.json(goal)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { calorieGoal, proteinGoal, carbGoal, fatGoal, activityLevel, age, height, weight, gender, goalType } = await request.json()

        const goal = await prisma.userGoal.upsert({
            where: { userId: session.user.id },
            update: { calorieGoal, proteinGoal, carbGoal, fatGoal, activityLevel, age, height, weight, gender, goalType },
            create: { userId: session.user.id, calorieGoal, proteinGoal, carbGoal, fatGoal, activityLevel, age, height, weight, gender, goalType },
        })
        return NextResponse.json(goal)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to save goals' }, { status: 500 })
    }
}
