export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminDeleteButton from '@/components/AdminDeleteButton'

export default async function AdminHiddenPage() {
    const session = await auth()
        if (!session?.user?.isAdmin) redirect('/')

    const deletedRecipes = await prisma.recipe.findMany({
        where: { deleted: true },
        include: {
            user: { select: { name: true, email: true } },
            ingredients: true,
            steps: true,
        },
        orderBy: { deletedAt: 'desc' },
    })

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Deleted Recipes</h1>
                    <p className="text-gray-500 text-sm mt-1">{deletedRecipes.length} recipes deleted by users</p>
                </div>
                {deletedRecipes.length > 0 && (
                    <AdminDeleteButton recipeIds={deletedRecipes.map((r) => r.id)} label="Permanently Delete All" />
                )}
            </div>

            {deletedRecipes.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">No deleted recipes</p>
                    <p className="text-sm mt-2">Users haven't deleted any recipes yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {deletedRecipes.map((recipe) => (
                        <div key={recipe.id} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full mr-2">
                    {recipe.category ?? 'Uncategorized'}
                  </span>
                                    <span className="font-semibold text-gray-900">{recipe.title}</span>
                                </div>
                                <AdminDeleteButton recipeIds={[recipe.id]} label="Delete" small />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  👤 {recipe.user?.name ?? recipe.user?.email ?? 'Unknown'}
                </span>
                                <span className="text-xs text-gray-400">
                  Deleted {recipe.deletedAt ? new Date(recipe.deletedAt).toLocaleDateString() : 'recently'}
                </span>
                            </div>
                            {recipe.description && (
                                <p className="text-sm text-gray-500 mt-2">{recipe.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}