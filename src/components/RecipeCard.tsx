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
    imageUrl?: string | null
    onFavoriteToggle?: (id: number, newFavorite: boolean) => void
    onQuickView?: (id: number) => void
}

export default function RecipeCard({
                                       id, title, description, category, prepTime, cookTime, servings,
                                       favorite: initialFavorite, tags, imageUrl, onFavoriteToggle, onQuickView,
                                   }: RecipeCardProps) {
    const [favorite, setFavorite] = useState(initialFavorite)
    const [hovered, setHovered] = useState(false)

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
    const totalTime = (prepTime ?? 0) + (cookTime ?? 0)

    const categoryColors: Record<string, string> = {
        breakfast: '#fdf3eb', lunch: '#eef4ef', dinner: '#f0f4ff',
        snack: '#fef9e7', dessert: '#fdf0f5', drink: '#f0faff', default: '#f5f3ef',
    }
    const accentBg = categoryColors[(category ?? 'default').toLowerCase()] ?? categoryColors.default

    return (
        <a href={`/recipes/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                    boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transform: hovered ? 'translateY(-3px)' : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                }}
            >
                {/* Top accent strip */}
                <div style={{ height: 4, background: `linear-gradient(90deg, var(--primary), ${accentBg})` }} />

                {/* Letter placeholder or Image */}
                <div style={{ height: 180, background: accentBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '4rem',
                            opacity: 0.15,
                            userSelect: 'none',
                            fontWeight: 700,
                            color: 'var(--primary)',
                        }}>
                            {title[0]}
                        </span>
                    )}

                    {/* Action buttons */}
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '0.35rem' }}>
                        {onQuickView && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(id) }}
                                title="Quick view"
                                style={{
                                    background: 'white', border: '1px solid var(--card-border)',
                                    borderRadius: '50%', width: 34, height: 34,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: '0.9rem',
                                    boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s ease',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                👁
                            </button>
                        )}
                        <button
                            onClick={toggleFavorite}
                            style={{
                                background: 'white', border: '1px solid var(--card-border)',
                                borderRadius: '50%', width: 34, height: 34,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '1rem',
                                boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {favorite ? '❤️' : '🤍'}
                        </button>
                    </div>

                    {/* Category badge */}
                    <div style={{
                        position: 'absolute', bottom: 10, left: 10,
                        background: 'var(--primary)', color: 'white',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        fontSize: '0.68rem', letterSpacing: '0.06em',
                        textTransform: 'uppercase', padding: '0.25rem 0.65rem', borderRadius: 999,
                    }}>
                        {category ?? 'Uncategorized'}
                    </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                        {title}
                    </h2>
                    {description && (
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: 300 }}>
                            {description}
                        </p>
                    )}
                    {tagList.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                            {tagList.slice(0, 3).map((tag) => (
                                <span key={tag} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.2rem 0.55rem', borderRadius: 999, fontWeight: 500 }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {(totalTime > 0 || servings) && (
                        <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
                            {totalTime > 0 && (
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>⏱ {totalTime} min</span>
                            )}
                            {servings && (
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>🍽 {servings} servings</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </a>
    )
}