export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import RecipesBrowser from '@/components/RecipesBrowser'
import { auth } from '@/auth'

export default async function RecipesPage() {
    const session = await auth()
    // @ts-ignore
    const isAdmin = session?.user?.isAdmin === true

    const recipes = await prisma.recipe.findMany({
        where: isAdmin ? {} : {
            OR: [
                { isPublic: true },
                ...(session?.user?.id ? [{ userId: session.user.id }] : []),
            ],
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Recipes {isAdmin && <span className="text-sm text-green-600 font-normal ml-2">Admin view</span>}
                </h1>
                {session && (
                    <Link
                        href="/recipes/new"
                        className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        + Add Recipe
                    </Link>
                )}
            </div>
            <RecipesBrowser recipes={recipes} />
        </div>
    )
}