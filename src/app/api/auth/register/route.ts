import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/lib/resend'

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json()
        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

        const hashed = await bcrypt.hash(password, 12)

        // Create user with emailVerified: null — they cannot log in until verified
        const user = await prisma.user.create({
            data: { name, email, password: hashed, emailVerified: null },
        })

        // Generate a secure random token
        const token = randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Store token in VerificationToken table
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        })

        // Send verification email via Resend
        await sendVerificationEmail(email, token)

        return NextResponse.json({ message: 'Check your email to verify your account' }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
    }
}