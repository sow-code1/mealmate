'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'

interface Ingredient {
    id: number
    name: string
    amount: string
    unit: string | null
}

interface Step {
    id: number
    order: number
    instruction: string
}

interface Recipe {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
    tags: string | null
    isPublic: boolean
    userId: string | null
    user: { name: string | null; email: string | null } | null
    ingredients: Ingredient[]
    steps: Step[]
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { data: session } = useSession()
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [acting, setActing] = useState(false)
    const [id, setId] = useState<string | null>(null)

    useEffect(() => {
        params.then(({ id }) => {
            setId(id)
            fetch(`/api/recipes/${id}`)
                .then((r) => {
                    if (r.status === 401) { router.push('/login'); return null }
                    return r.json()
                })
                .then((data) => { if (data) setRecipe(data) })
                .catch(() => toast.error('Failed to load recipe'))
        })
    }, [params])

    const isOwner = recipe?.userId === session?.user?.id
    // @ts-ignore
    const isAdmin = session?.user?.isAdmin === true
    const isPreset = recipe?.isPublic && !recipe?.userId

    const handleAction = async () => {
        if (!confirm('Delete this recipe?')) return
        setActing(true)
        try {
            if (isPreset && !isAdmin) {
                await fetch(`/api/recipes/${id}/hide`, { method: 'POST' })
                toast.success('Recipe deleted')
                router.push('/recipes')
            } else {
                await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
                toast.success('Recipe deleted')
                router.push('/recipes')
            }
        } catch {
            toast.error('Failed to delete recipe')
            setActing(false)
        }
    }

    if (!recipe) return <Spinner />

    const tagList = recipe.tags ? recipe.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const canEdit = isOwner || isAdmin
    const canActOnRecipe = isOwner || isAdmin || (isPreset && !!session)
    const addedBy = recipe.user?.name ?? recipe.user?.email ?? 'Unknown'

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <Link href="/recipes" className="text-green-600 hover:underline text-sm mb-6 inline-block">
                ← Back to Recipes
            </Link>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {recipe.category ?? 'Uncategorized'}
              </span>
                            {isAdmin && recipe.userId && (
                                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  👤 Added by {addedBy}
                </span>
                            )}
                            {isAdmin && isPreset && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  🌐 Public preset
                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{recipe.title}</h1>
                        <p className="text-gray-500">{recipe.description}</p>
                        {tagList.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {tagList.map((tag) => (
                                    <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 ml-4">
                        {canEdit && (
                            <Link
                                href={`/recipes/${id}/edit`}
                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Edit
                            </Link>
                        )}
                        {canActOnRecipe && (
                            <button
                                onClick={handleAction}
                                disabled={acting}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {acting ? '...' : 'Delete'}
                            </button>
                        )}
                    </div>
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