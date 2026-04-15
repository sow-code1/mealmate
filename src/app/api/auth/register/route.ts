import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json()
        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

        const hashed = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
            data: { name, email, password: hashed },
        })

        // Preset copying is now handled by NextAuth's createUser event in auth.ts
        // for both Google OAuth and email/password users — no need to do it here

        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
    }
}