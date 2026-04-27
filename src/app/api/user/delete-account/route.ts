import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { signOut } from 'next-auth/react'

export async function DELETE() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = session.user.id

        // Delete user (cascade will delete all related data)
        await prisma.user.delete({
            where: { id: userId },
        })

        // Sign out
        await signOut({ callbackUrl: '/' })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}
