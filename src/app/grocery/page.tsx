'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Ingredient {
    name: string
    amount: string
    unit: string | null
    recipeTitle: string
}

interface GroupedRecipe {
    title: string
    ingredients: Ingredient[]
}

export default function GroceryPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'combined' | 'grouped'>('combined')
    const [checked, setChecked] = useState<Set<string>>(new Set())
    const [removed, setRemoved] = useState<Set<string>>(new Set())

    // Load from localStorage on mount
    useEffect(() => {
        const savedChecked = localStorage.getItem('grocery-checked')
        const savedRemoved = localStorage.getItem('grocery-removed')
        if (savedChecked) setChecked(new Set(JSON.parse(savedChecked)))
        if (savedRemoved) setRemoved(new Set(JSON.parse(savedRemoved)))
    }, [])

    // Fetch ingredients
    useEffect(() => {
        fetch('/api/grocery')
            .then((r) => r.json())
            .then((data) => {
                setIngredients(data)
                setLoading(false)
            })
    }, [])

    const saveChecked = (next: Set<string>) => {
        setChecked(next)
        localStorage.setItem('grocery-checked', JSON.stringify([...next]))
    }

    const saveRemoved = (next: Set<string>) => {
        setRemoved(next)
        localStorage.setItem('grocery-removed', JSON.stringify([...next]))
    }

    const toggleCheck = (key: string) => {
        const next = new Set(checked)
        next.has(key) ? next.delete(key) : next.add(key)
        saveChecked(next)
    }

    const removeItem = (key: string) => {
        const next = new Set(removed)
        next.add(key)
        saveRemoved(next)
        // Also uncheck it
        const nextChecked = new Set(checked)
        nextChecked.delete(key)
        saveChecked(nextChecked)
    }

    const removeAll = (keys: string[]) => {
        const next = new Set(removed)
        keys.forEach((k) => next.add(k))
        saveRemoved(next)
        const nextChecked = new Set(checked)
        keys.forEach((k) => nextChecked.delete(k))
        saveChecked(nextChecked)
    }

    const resetList = () => {
        if (!confirm('Reset the grocery list? All removed and checked items will be restored.')) return
        saveChecked(new Set())
        saveRemoved(new Set())
    }

    const ingredientKey = (ing: Ingredient) => `${ing.recipeTitle}__${ing.name}__${ing.amount}`

    const visibleIngredients = ingredients.filter((ing) => !removed.has(ingredientKey(ing)))

    // Group by recipe
    const grouped: GroupedRecipe[] = []
    visibleIngredients.forEach((ing) => {
        const existing = grouped.find((g) => g.title === ing.recipeTitle)
        if (existing) {
            existing.ingredients.push(ing)
        } else {
            grouped.push({ title: ing.recipeTitle, ingredients: [ing] })
        }
    })

    if (loading) return <div className="max-w-2xl mx-auto px-6 py-12 text-gray-400">Loading...</div>

    if (ingredients.length === 0) return (
        <div className="max-w-2xl mx-auto px-6 py-12 text-center text-gray-400">
            <p className="text-xl">No ingredients yet</p>
            <p className="text-sm mt-2">Add recipes to your meal plan first</p>
            <Link href="/mealplan" className="mt-4 inline-block text-green-600 hover:underline">Go to Meal Planner</Link>
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
                <button
                    onClick={resetList}
                    className="text-sm text-gray-400 hover:text-gray-600"
                >
                    Reset list
                </button>
            </div>

            {/* View toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setView('combined')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        view === 'combined' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Combined
                </button>
                <button
                    onClick={() => setView('grouped')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        view === 'grouped' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    By Recipe
                </button>
            </div>

            {visibleIngredients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p>All items removed or got!</p>
                    <button onClick={resetList} className="mt-2 text-green-600 hover:underline text-sm">Reset list</button>
                </div>
            ) : view === 'combined' ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
                    {visibleIngredients.map((ing) => {
                        const key = ingredientKey(ing)
                        return (
                            <div
                                key={key}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                    checked.has(key) ? 'opacity-50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div
                                    onClick={() => toggleCheck(key)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                                        checked.has(key) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                    }`}
                                >
                                    {checked.has(key) && <span className="text-white text-xs">✓</span>}
                                </div>
                                <span
                                    onClick={() => toggleCheck(key)}
                                    className={`flex-1 text-gray-700 cursor-pointer ${checked.has(key) ? 'line-through' : ''}`}
                                >
                  {ing.amount} {ing.unit} {ing.name}
                                    <span className="text-xs text-gray-400 ml-1">({ing.recipeTitle})</span>
                </span>
                                <button
                                    onClick={() => removeItem(key)}
                                    className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0"
                                    title="Remove item"
                                >
                                    ×
                                </button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {grouped.map((group) => {
                        const groupKeys = group.ingredients.map(ingredientKey)
                        return (
                            <div key={group.title} className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-semibold text-gray-900">{group.title}</h2>
                                    <button
                                        onClick={() => removeAll(groupKeys)}
                                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Got all ✓
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {group.ingredients.map((ing) => {
                                        const key = ingredientKey(ing)
                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                    checked.has(key) ? 'opacity-50' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div
                                                    onClick={() => toggleCheck(key)}
                                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                                                        checked.has(key) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                                    }`}
                                                >
                                                    {checked.has(key) && <span className="text-white text-xs">✓</span>}
                                                </div>
                                                <span
                                                    onClick={() => toggleCheck(key)}
                                                    className={`flex-1 text-gray-700 cursor-pointer ${checked.has(key) ? 'line-through' : ''}`}
                                                >
                          {ing.amount} {ing.unit} {ing.name}
                        </span>
                                                <button
                                                    onClick={() => removeItem(key)}
                                                    className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0"
                                                    title="Remove item"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}