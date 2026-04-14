export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import RecipesBrowser from '@/components/RecipesBrowser'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export default async function RecipesPage() {
    const session = await auth()
    // @ts-ignore
    const isAdmin = session?.user?.isAdmin === true
    const cookieStore = await cookies()
    const adminMode = isAdmin && cookieStore.get('adminMode')?.value === 'true'

    const recipes = await prisma.recipe.findMany({
        where: adminMode ? {
            userId: { not: null },
            copiedFromPreset: false,
            deleted: false,
        } : {
            userId: session!.user!.id,
            deleted: false,
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Recipes {adminMode && <span className="text-sm text-purple-600 font-normal ml-2">⚙️ Admin mode</span>}
                </h1>
                <Link
                    href="/recipes/new"
                    className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    + Add Recipe
                </Link>
            </div>
            <RecipesBrowser recipes={recipes} />
        </div>
    )
}