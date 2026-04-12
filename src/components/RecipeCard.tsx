'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface RecipeCardProps {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
    favorite: boolean
    tags: string | null
    onFavoriteToggle?: (id: number, newFavorite: boolean) => void
}

export default function RecipeCard({
                                       id,
                                       title,
                                       description,
                                       category,
                                       prepTime,
                                       cookTime,
                                       servings,
                                       favorite: initialFavorite,
                                       tags,
                                       onFavoriteToggle,
                                   }: RecipeCardProps) {
    const [favorite, setFavorite] = useState(initialFavorite)

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const res = await fetch(`/api/recipes/${id}/favorite`, { method: 'PUT' })
            const data = await res.json()
            setFavorite(data.favorite)
            onFavoriteToggle?.(id, data.favorite)
            toast.success(data.favorite ? 'Added to favorites' : 'Removed from favorites')
        } catch {
            toast.error('Failed to update favorite')
        }
    }

    const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

    return (
        <a href={`/recipes/${id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative">
                <button
                    onClick={toggleFavorite}
                    className="absolute top-4 right-4 text-xl hover:scale-110 transition-transform"
                >
                    {favorite ? '❤️' : '🤍'}
                </button>
                <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {category ?? 'Uncategorized'}
          </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 pr-8">{title}</h2>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{description}</p>
                {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {tagList.map((tag) => (
                            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
                        ))}
                    </div>
                )}
                <div className="flex gap-4 text-xs text-gray-400">
                    <span>Prep: {prepTime ?? 0} min</span>
                    <span>Cook: {cookTime ?? 0} min</span>
                    <span>Servings: {servings ?? 0}</span>
                </div>
            </div>
        </a>
    )
}