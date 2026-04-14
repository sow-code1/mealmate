'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

interface Recipe {
    id: number
    title: string
}

interface Slot {
    id: number
    day: string
    mealType: string
    recipe: Recipe | null
}

interface MealPlan {
    id: number
    slots: Slot[]
}

export default function MealPlannerPage() {
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [modal, setModal] = useState<{ day: string; mealType: string } | null>(null)

    useEffect(() => {
        fetch('/api/mealplan').then((r) => r.json()).then(setMealPlan).catch(() => toast.error('Failed to load meal plan'))
        fetch('/api/recipes?mealplanner=true').then((r) => r.json()).then(setRecipes).catch(() => toast.error('Failed to load recipes'))
    }, [])

    const getSlot = (day: string, mealType: string) =>
        mealPlan?.slots.find((s) => s.day === day && s.mealType === mealType)

    const assignRecipe = async (recipeId: number) => {
        if (!modal || !mealPlan) return
        try {
            const res = await fetch('/api/mealplan/slot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day: modal.day, mealType: modal.mealType, recipeId, mealPlanId: mealPlan.id }),
            })
            const newSlot = await res.json()
            setMealPlan((prev) => {
                if (!prev) return prev
                const filtered = prev.slots.filter((s) => !(s.day === modal.day && s.mealType === modal.mealType))
                return { ...prev, slots: [...filtered, newSlot] }
            })
            toast.success('Recipe added to plan')
        } catch {
            toast.error('Failed to assign recipe')
        }
        setModal(null)
    }

    const removeSlot = async (slotId: number) => {
        try {
            await fetch(`/api/mealplan/slot/${slotId}`, { method: 'DELETE' })
            setMealPlan((prev) => {
                if (!prev) return prev
                return { ...prev, slots: prev.slots.filter((s) => s.id !== slotId) }
            })
            toast.success('Recipe removed')
        } catch {
            toast.error('Failed to remove recipe')
        }
    }

    if (!mealPlan) return <Spinner />

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
                <a href="/grocery" className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    View Grocery List
                </a>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr>
                        <th className="p-3 text-left text-sm font-medium text-gray-500 w-24">Meal</th>
                        {DAYS.map((day) => (
                            <th key={day} className="p-3 text-center text-sm font-medium text-gray-700">{day}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {MEAL_TYPES.map((mealType) => (
                        <tr key={mealType} className="border-t border-gray-100">
                            <td className="p-3 text-sm font-medium text-gray-500">{mealType}</td>
                            {DAYS.map((day) => {
                                const slot = getSlot(day, mealType)
                                return (
                                    <td key={day} className="p-2">
                                        {slot?.recipe ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-center">
                                                <p className="font-medium text-green-800 mb-1">{slot.recipe.title}</p>
                                                <button
                                                    onClick={() => removeSlot(slot.id)}
                                                    className="text-red-400 hover:text-red-600 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setModal({ day, mealType })}
                                                className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg text-gray-300 hover:border-green-400 hover:text-green-400 transition-colors text-xl"
                                            >
                                                +
                                            </button>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-96 max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Pick a recipe for {modal.day} {modal.mealType}</h2>
                            <button
                                onClick={() => setModal(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-2">
                            {recipes.map((recipe) => (
                                <button
                                    key={recipe.id}
                                    onClick={() => assignRecipe(recipe.id)}
                                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors text-sm"
                                >
                                    {recipe.title}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setModal(null)}
                            className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}