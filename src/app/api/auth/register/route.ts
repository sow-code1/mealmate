import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json()
        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

        const existing = await prisma.user.findUnique({ where: { email } })

        let userEmail = email

        if (existing) {
            // Already verified — block duplicate registration
            if (existing.emailVerified) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
            }
            // Not verified yet — allow resend (clean up old tokens)
            await prisma.verificationToken.deleteMany({ where: { identifier: email } })
            userEmail = existing.email!
        } else {
            const hashed = await bcrypt.hash(password, 12)
            // Create user with emailVerified: null — they cannot log in until verified
            await prisma.user.create({
                data: { name, email, password: hashed, emailVerified: null },
            })
        }

        // Generate a 6-digit OTP code
        const token = Math.floor(100000 + Math.random() * 900000).toString()
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

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