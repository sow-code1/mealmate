import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
                userId: userId,
                ingredients: {
                    create: preset.ingredients.map((ing) => ({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit,
                    })),
                },
                steps: {
                    create: preset.steps.map((step) => ({
                        order: step.order,
                        instruction: step.instruction,
                    })),
                },
            },
        })
    }
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
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })
                if (!user || !user.password) return null
                const valid = await bcrypt.compare(credentials.password as string, user.password)
                if (!valid) return null
                return user
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { isAdmin: true },
                })
                token.isAdmin = dbUser?.isAdmin ?? false
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                // @ts-ignore
                session.user.isAdmin = token.isAdmin
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            // Fires once for any new user — Google OAuth or email/password
            if (user.id) {
                await copyPresetsToUser(user.id)
            }
        },
    },
    trustHost: true,
})