'use client'

import { useState } from 'react'
import RecipeCard from '@/components/RecipeCard'

interface Recipe {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
    favorite: boolean
    tags: string | null
}

const CATEGORIES = ['All', 'Favorites', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']

export default function RecipesBrowser({ recipes: initialRecipes }: { recipes: Recipe[] }) {
    const [recipes, setRecipes] = useState(initialRecipes)
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')

    const handleFavoriteToggle = (id: number, newFavorite: boolean) => {
        setRecipes((prev) =>
            prev.map((r) => (r.id === id ? { ...r, favorite: newFavorite } : r))
        )
    }

    const filtered = recipes.filter((recipe) => {
        const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase())
        const matchesCategory =
            activeCategory === 'All' ||
            (activeCategory === 'Favorites' ? recipe.favorite : recipe.category === activeCategory)
        return matchesSearch && matchesCategory
    })

    return (
        <div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="flex gap-2 flex-wrap mb-8">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            activeCategory === cat
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat === 'Favorites' ? '❤️ Favorites' : cat}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">No recipes found</p>
                    <p className="text-sm mt-2">Try a different search or category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            id={recipe.id}
                            title={recipe.title}
                            description={recipe.description}
                            category={recipe.category}
                            prepTime={recipe.prepTime}
                            cookTime={recipe.cookTime}
                            servings={recipe.servings}
                            favorite={recipe.favorite}
                            tags={recipe.tags}
                            onFavoriteToggle={handleFavoriteToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}