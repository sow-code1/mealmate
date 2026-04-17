import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const GOAL_PRESETS: Record<string, { calorieGoal: number; proteinGoal: number; carbGoal: number; fatGoal: number }> = {
    lose_fat:       { calorieGoal: 1600, proteinGoal: 160, carbGoal: 140, fatGoal: 50 },
    build_muscle:   { calorieGoal: 2600, proteinGoal: 200, carbGoal: 260, fatGoal: 80 },
    maintain:       { calorieGoal: 2000, proteinGoal: 150, carbGoal: 200, fatGoal: 65 },
}

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { onboardingSeen: true },
    })

    return NextResponse.json({ onboardingSeen: user?.onboardingSeen ?? false })
}

export async function PATCH(request: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { goalType } = await request.json()

    await prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingSeen: true },
    })

    if (goalType && GOAL_PRESETS[goalType]) {
        const preset = GOAL_PRESETS[goalType]
        await prisma.userGoal.upsert({
            where: { userId: session.user.id },
            update: { goalType, ...preset },
            create: { userId: session.user.id, goalType, ...preset },
        })
    }

    return NextResponse.json({ ok: true })
}
