export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import RecipeCard from '@/components/RecipeCard'
import Link from 'next/link'

export default async function RecipesPage() {
    const recipes = await prisma.recipe.findMany({
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
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        id={recipe.id}
                        title={recipe.title}
                        description={recipe.description}
                        category={recipe.category}
                        prepTime={recipe.prepTime}
                        cookTime={recipe.cookTime}
                        servings={recipe.servings}
                    />
                ))}
            </div>
        </div>
    )
}