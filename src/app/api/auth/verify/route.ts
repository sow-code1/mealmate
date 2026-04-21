import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function copyPresetsToUser(userId: string) {
    const presets = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        include: { ingredients: true, steps: true },
    })
    for (const preset of presets) {
        await prisma.recipe.create({
            data: {
                title: preset.title,
                description: preset.description,
                imageUrl: preset.imageUrl,
                prepTime: preset.prepTime,
                cookTime: preset.cookTime,
                servings: preset.servings,
                category: preset.category,
                tags: preset.tags,
                isPublic: false,
                copiedFromPreset: true,
                userId,
                ingredients: { create: preset.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit })) },
                steps: { create: preset.steps.map(s => ({ order: s.order, instruction: s.instruction })) },
            },
        })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json()
        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
        }

        // Find the token by identifier (email) and token (code)
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { identifier: email, token: code },
        })

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
        }

        if (verificationToken.expires < new Date()) {
            // Token expired — delete it
            await prisma.verificationToken.delete({
                where: { identifier_token: { identifier: email, token: code } },
            })
            return NextResponse.json({ error: 'Code has expired. Please register again.' }, { status: 400 })
        }

        // Mark user as verified
        const user = await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        })

        // Copy presets now that they're verified
        await copyPresetsToUser(user.id)

        // Clean up the token
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token: code } },
        })

        return NextResponse.json({ message: 'Email verified successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}