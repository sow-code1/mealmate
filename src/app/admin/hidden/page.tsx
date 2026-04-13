export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DeleteAllHiddenButton from '@/components/DeleteAllHiddenButton'

export default async function AdminHiddenPage() {
    const session = await auth()
    // @ts-ignore
    if (!session?.user?.isAdmin) redirect('/')

    const hiddenRecipes = await prisma.hiddenRecipe.findMany({
        include: {
            recipe: true,
            user: { select: { name: true, email: true } },
        },
        orderBy: { id: 'desc' },
    })

    // Group by recipe
    const grouped = hiddenRecipes.reduce((acc, h) => {
        const key = h.recipeId
        if (!acc[key]) {
            acc[key] = { recipe: h.recipe, hiddenBy: [] }
        }
        acc[key].hiddenBy.push(h.user.name ?? h.user.email ?? 'Unknown')
        return acc
    }, {} as Record<number, { recipe: { id: number; title: string; category: string | null }, hiddenBy: string[] }>)

    const groupedList = Object.values(grouped)

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hidden Recipes</h1>
                    <p className="text-gray-500 text-sm mt-1">Recipes hidden by users — {groupedList.length} unique recipes</p>
                </div>
                {groupedList.length > 0 && (
                    <DeleteAllHiddenButton recipeIds={groupedList.map((g) => g.recipe.id)} />
                )}
            </div>

            {groupedList.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">No hidden recipes</p>
                    <p className="text-sm mt-2">Users haven't hidden any recipes yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedList.map(({ recipe, hiddenBy }) => (
                        <div key={recipe.id} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full mr-2">
                    {recipe.category ?? 'Uncategorized'}
                  </span>
                                    <span className="font-semibold text-gray-900">{recipe.title}</span>
                                </div>
                                <span className="text-xs text-gray-400">Hidden by {hiddenBy.length} user{hiddenBy.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {hiddenBy.map((name, i) => (
                                    <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                    👤 {name}
                  </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}