import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get all unique dates with logged entries for the current user
        const entries = await prisma.foodEntry.findMany({
            where: { userId: session.user.id },
            select: { date: true },
            distinct: ['date'],
            orderBy: { date: 'desc' },
        })

        const dates = entries.map(e => e.date)
        return NextResponse.json(dates)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch logged dates' }, { status: 500 })
    }
}
