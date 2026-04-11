'use client'

import { useState, useEffect } from 'react'

interface Ingredient {
    name: string
    amount: string
    unit: string | null
}

export default function GroceryPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [checked, setChecked] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/grocery')
            .then((r) => r.json())
            .then((data) => {
                setIngredients(data)
                setLoading(false)
            })
    }, [])

    const toggle = (i: number) => {
        setChecked((prev) => {
            const next = new Set(prev)
            next.has(i) ? next.delete(i) : next.add(i)
            return next
        })
    }

    if (loading) return <div className="max-w-2xl mx-auto px-6 py-12 text-gray-400">Loading...</div>

    if (ingredients.length === 0) return (
        <div className="max-w-2xl mx-auto px-6 py-12 text-center text-gray-400">
            <p className="text-xl">No ingredients yet</p>
            <p className="text-sm mt-2">Add recipes to your meal plan first</p>
            <a href="/mealplan" className="mt-4 inline-block text-green-600 hover:underline">Go to Meal Planner</a>
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
                <button
                    onClick={() => setChecked(new Set())}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Clear all checks
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                {ingredients.map((ing, i) => (
                    <div
                        key={i}
                        onClick={() => toggle(i)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            checked.has(i) ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            checked.has(i) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                        }`}>
                            {checked.has(i) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`text-gray-700 ${checked.has(i) ? 'line-through' : ''}`}>
              {ing.amount} {ing.unit} {ing.name}
            </span>
                    </div>
                ))}
            </div>
        </div>
    )
}