'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [id, setId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        tags: '',
    })
    const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }])
    const [steps, setSteps] = useState([{ instruction: '' }])

    useEffect(() => {
        params.then(({ id }) => {
            setId(id)
            fetch(`/api/recipes/${id}`)
                .then((r) => r.json())
                .then((recipe) => {
                    setForm({
                        title: recipe.title ?? '',
                        description: recipe.description ?? '',
                        category: recipe.category ?? '',
                        prepTime: recipe.prepTime?.toString() ?? '',
                        cookTime: recipe.cookTime?.toString() ?? '',
                        servings: recipe.servings?.toString() ?? '',
                        tags: recipe.tags ?? '',
                    })
                    setIngredients(recipe.ingredients?.map((i: { name: string; amount: string; unit: string }) => ({
                        name: i.name,
                        amount: i.amount,
                        unit: i.unit ?? '',
                    })) ?? [{ name: '', amount: '', unit: '' }])
                    setSteps(recipe.steps?.map((s: { instruction: string }) => ({
                        instruction: s.instruction,
                    })) ?? [{ instruction: '' }])
                    setLoading(false)
                })
                .catch(() => toast.error('Failed to load recipe'))
        })
    }, [params])

    const handleSave = async () => {
        if (!form.title) { toast.error('Title is required'); return }
        setSaving(true)
        try {
            await fetch(`/api/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    prepTime: parseInt(form.prepTime) || 0,
                    cookTime: parseInt(form.cookTime) || 0,
                    servings: parseInt(form.servings) || 0,
                    ingredients,
                    steps: steps.map((s, i) => ({ ...s, order: i + 1 })),
                }),
            })
            toast.success('Recipe saved!')
            router.push(`/recipes/${id}`)
        } catch {
            toast.error('Failed to save recipe')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Recipe</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={form.servings}
                            onChange={(e) => setForm({ ...form, servings: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={form.prepTime}
                            onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            value={form.cookTime}
                            onChange={(e) => setForm({ ...form, cookTime: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Tags <span className="text-gray-400 font-normal">(comma separated)</span>
                    </label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="vegetarian, gluten-free, high-protein"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                    <div className="space-y-2">
                        {ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    placeholder="Amount"
                                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={ing.amount}
                                    onChange={(e) => {
                                        const updated = [...ingredients]
                                        updated[i].amount = e.target.value
                                        setIngredients(updated)
                                    }}
                                />
                                <input
                                    placeholder="Unit"
                                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={ing.unit}
                                    onChange={(e) => {
                                        const updated = [...ingredients]
                                        updated[i].unit = e.target.value
                                        setIngredients(updated)
                                    }}
                                />
                                <input
                                    placeholder="Ingredient name"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={ing.name}
                                    onChange={(e) => {
                                        const updated = [...ingredients]
                                        updated[i].name = e.target.value
                                        setIngredients(updated)
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIngredients([...ingredients, { name: '', amount: '', unit: '' }])}
                        className="mt-2 text-sm text-green-600 hover:underline"
                    >
                        + Add ingredient
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                    <div className="space-y-2">
                        {steps.map((step, i) => (
                            <div key={i} className="flex gap-2 items-start">
                <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  {i + 1}
                </span>
                                <textarea
                                    placeholder="Step instruction"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    rows={2}
                                    value={step.instruction}
                                    onChange={(e) => {
                                        const updated = [...steps]
                                        updated[i].instruction = e.target.value
                                        setSteps(updated)
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setSteps([...steps, { instruction: '' }])}
                        className="mt-2 text-sm text-green-600 hover:underline"
                    >
                        + Add step
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => router.push(`/recipes/${id}`)}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}