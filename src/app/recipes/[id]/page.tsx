import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function RecipeDetailPage({
                                                   params,
                                               }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({
        where: { id: parseInt(id) },
        include: {
            ingredients: true,
            steps: { orderBy: { order: 'asc' } },
        },
    })

    if (!recipe) notFound()

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <Link href="/recipes" className="text-green-600 hover:underline text-sm mb-6 inline-block">
                ← Back to Recipes
            </Link>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="mb-6">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {recipe.category ?? 'Uncategorized'}
          </span>
                    <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{recipe.title}</h1>
                    <p className="text-gray-500">{recipe.description}</p>
                </div>

                <div className="flex gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                    <span>Prep: {recipe.prepTime ?? 0} min</span>
                    <span>Cook: {recipe.cookTime ?? 0} min</span>
                    <span>Servings: {recipe.servings ?? 0}</span>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
                    <ul className="space-y-2">
                        {recipe.ingredients.map((ing) => (
                            <li key={ing.id} className="flex items-center gap-2 text-gray-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                                {ing.amount} {ing.unit} {ing.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Steps</h2>
                    <ol className="space-y-4">
                        {recipe.steps.map((step) => (
                            <li key={step.id} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.order}
                </span>
                                <p className="text-gray-700 pt-0.5">{step.instruction}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    )
}