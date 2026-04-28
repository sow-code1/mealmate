import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 15

async function copyPresetsToUser(userId: string) {
    const existing = await prisma.recipe.count({ where: { userId } })
    if (existing > 0) return

    const presets = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        include: { ingredients: true, steps: true, nutrition: true },
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
                ingredients: {
                    create: preset.ingredients.map(i => ({
                        name: i.name,
                        amount: i.amount,
                        unit: i.unit,
                    })),
                },
                steps: {
                    create: preset.steps.map(s => ({
                        order: s.order,
                        instruction: s.instruction,
                    })),
                },
                ...(preset.nutrition ? {
                    nutrition: {
                        create: {
                            calories: preset.nutrition.calories,
                            protein: preset.nutrition.protein,
                            carbs: preset.nutrition.carbs,
                            fat: preset.nutrition.fat,
                            fiber: preset.nutrition.fiber,
                        },
                    },
                } : {}),
            },
        })
    }
}

async function checkRateLimit(email: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)

    const recentAttempts = await prisma.loginAttempt.count({
        where: {
            email,
            createdAt: { gte: windowStart },
        },
    })

    return recentAttempts >= MAX_ATTEMPTS
}

async function recordLoginAttempt(email: string) {
    await prisma.loginAttempt.create({ data: { email } })

    // Clean up old attempts older than 15 minutes to keep the table lean
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
    await prisma.loginAttempt.deleteMany({
        where: {
            email,
            createdAt: { lt: windowStart },
        },
    })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string

                // Check rate limit first
                const isRateLimited = await checkRateLimit(email)
                if (isRateLimited) return null

                const user = await prisma.user.findUnique({ where: { email } })

                if (!user || !user.password) {
                    // Record attempt even for non-existent users to prevent enumeration
                    await recordLoginAttempt(email)
                    return null
                }

                const valid = await bcrypt.compare(credentials.password as string, user.password)

                if (!valid) {
                    await recordLoginAttempt(email)
                    return null
                }

                // Block login if email not verified
                if (!user.emailVerified) return null

                // Successful login — clear attempts
                await prisma.loginAttempt.deleteMany({ where: { email } })

                return user
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('signIn callback:', { user, account, profile })
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { isAdmin: true },
                })
                token.isAdmin = dbUser?.isAdmin ?? false
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin ?? false
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            console.log('createUser event:', user)
            if (user.id) {
                try {
                    await copyPresetsToUser(user.id)
                } catch (error) {
                    console.error('Failed to copy presets to user:', user.id, error)
                }
            }
        },
    },
    trustHost: true,
})