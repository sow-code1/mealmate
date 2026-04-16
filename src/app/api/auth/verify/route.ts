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

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token')
        if (!token) return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))

        // Find the token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        })

        if (!verificationToken) {
            return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
        }

        if (verificationToken.expires < new Date()) {
            // Token expired — delete it and redirect
            await prisma.verificationToken.delete({ where: { token } })
            return NextResponse.redirect(new URL('/login?error=token-expired', request.url))
        }

        // Mark user as verified
        const user = await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        })

        // Copy presets now that they're verified
        await copyPresetsToUser(user.id)

        // Clean up the token
        await prisma.verificationToken.delete({ where: { token } })

        return NextResponse.redirect(new URL('/login?verified=true', request.url))
    } catch (error) {
        console.error(error)
        return NextResponse.redirect(new URL('/login?error=server-error', request.url))
    }
}