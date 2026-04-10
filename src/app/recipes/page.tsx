export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface Recipe {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
}

export default async function RecipesPage() {
    const recipes: Recipe[] = await prisma.recipe.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
                <Link
                    href="/recipes/new"
                    className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    + Add Recipe
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe: Recipe) => (
                    <Link href={`/recipes/${recipe.id}`} key={recipe.id}>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {recipe.category ?? 'Uncategorized'}
                </span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h2>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                            <div className="flex gap-4 text-xs text-gray-400">
                                <span>Prep: {recipe.prepTime ?? 0} min</span>
                                <span>Cook: {recipe.cookTime ?? 0} min</span>
                                <span>Servings: {recipe.servings ?? 0}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}