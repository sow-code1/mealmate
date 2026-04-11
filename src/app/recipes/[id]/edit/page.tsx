'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
    })

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
                    })
                    setLoading(false)
                })
        })
    }, [params])

    const handleSave = async () => {
        setSaving(true)
        await fetch(`/api/recipes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                prepTime: parseInt(form.prepTime) || 0,
                cookTime: parseInt(form.cookTime) || 0,
                servings: parseInt(form.servings) || 0,
            }),
        })
        router.push(`/recipes/${id}`)
    }

    if (loading) return <div className="max-w-2xl mx-auto px-6 py-12 text-gray-400">Loading...</div>

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