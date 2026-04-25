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
    imageUrl?: string | null
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
                    className="input-field"
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
                <div style={{ textAlign: 'center', padding: '5rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.45, userSelect: 'none' }}>
                        {activeCategory === 'Favorites' ? '❤️' : search ? '🔍' : '🍽️'}
                    </div>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                        {search
                            ? 'No recipes match your search'
                            : activeCategory === 'Favorites'
                            ? 'No favorites yet'
                            : `No ${activeCategory === 'All' ? '' : activeCategory.toLowerCase() + ' '}recipes yet`}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.75rem', lineHeight: 1.65 }}>
                        {search
                            ? 'Try different keywords or clear the search'
                            : activeCategory === 'Favorites'
                            ? 'Tap the heart on any recipe to save it here'
                            : 'Add your first recipe to get started'}
                    </p>
                    {!search && activeCategory === 'All' && (
                        <a href="/recipes/new" className="btn-primary" style={{ fontSize: '0.9rem' }}>
                            + Add Recipe
                        </a>
                    )}
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
                                imageUrl={recipe.imageUrl}
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