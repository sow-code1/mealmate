'use client'

import { useState } from 'react'
import RecipeCard from '@/components/RecipeCard'
import RecipeQuickView from '@/components/RecipeQuickView'
import AuthGuard from '@/components/AuthGuard'

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
    const [quickViewId, setQuickViewId] = useState<number | null>(null)

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
        <AuthGuard>
        <div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.6rem 1rem',
                        fontSize: '0.9rem',
                        fontFamily: 'DM Sans, sans-serif',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        outline: 'none',
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: 999,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            fontFamily: 'DM Sans, sans-serif',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            background: activeCategory === cat ? 'var(--primary)' : 'var(--muted-light)',
                            color: activeCategory === cat ? 'white' : 'var(--muted)',
                        }}
                    >
                        {cat === 'Favorites' ? '❤️ Favorites' : cat}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No recipes found</p>
                    <p style={{ fontSize: '0.85rem' }}>Try a different search or category</p>
                </div>
            ) : (
                <div key={`${activeCategory}-${search}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((recipe, index) => (
                        <div
                            key={recipe.id}
                            className="animate-card-in"
                            style={{ animationDelay: `${Math.min(index, 14) * 80}ms` }}
                        >
                            <RecipeCard
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
                                onQuickView={setQuickViewId}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
        <RecipeQuickView recipeId={quickViewId} onClose={() => setQuickViewId(null)} />
        </AuthGuard>
    )
}