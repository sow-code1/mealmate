'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AddToMealPlanModal from './AddToMealPlanModal'

interface QuickRecipe {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
    tags: string | null
    ingredients: { id: number; name: string; amount: string; unit: string | null }[]
    nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number } | null
}

interface Props {
    recipeId: number | null
    onClose: () => void
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    breakfast: { bg: '#fdf3eb', text: '#9a4e1c' },
    lunch:     { bg: '#eef4ef', text: '#2d5235' },
    dinner:    { bg: '#f0f4ff', text: '#2d4a8a' },
    snack:     { bg: '#fef9e7', text: '#856404' },
    dessert:   { bg: '#fdf0f5', text: '#9c2c6e' },
    drink:     { bg: '#f0faff', text: '#1a6b9a' },
    default:   { bg: '#f5f3ef', text: '#78716c' },
}

export default function RecipeQuickView({ recipeId, onClose }: Props) {
    const [recipe, setRecipe] = useState<QuickRecipe | null>(null)
    const [loading, setLoading] = useState(false)
    const [mealPlanModal, setMealPlanModal] = useState(false)

    useEffect(() => {
        if (!recipeId) { setRecipe(null); return }
        setLoading(true)
        fetch(`/api/recipes/${recipeId}`)
            .then(r => r.json())
            .then(setRecipe)
            .catch(() => setRecipe(null))
            .finally(() => setLoading(false))
    }, [recipeId])

    useEffect(() => {
        if (!recipeId) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [recipeId, onClose])

    if (!recipeId) return null

    const cat = recipe?.category?.toLowerCase() ?? 'default'
    const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default
    const totalTime = (recipe?.prepTime ?? 0) + (recipe?.cookTime ?? 0)

    return (
        <>
            <div
                className="modal-backdrop"
                onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
            >
                <div className="modal-panel" style={{ maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                    <button onClick={onClose} className="modal-close" aria-label="Close">✕</button>

                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
                            Loading…
                        </div>
                    ) : recipe ? (
                        <>
                            {/* Image placeholder */}
                            <div style={{
                                height: 160,
                                background: colors.bg,
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.25rem',
                                position: 'relative',
                            }}>
                                <span style={{
                                    fontFamily: 'Playfair Display, serif',
                                    fontSize: '5rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)',
                                    opacity: 0.12,
                                    userSelect: 'none',
                                }}>
                                    {recipe.title[0]}
                                </span>
                                {recipe.category && (
                                    <span style={{
                                        position: 'absolute',
                                        bottom: 10, left: 12,
                                        background: 'var(--primary)', color: 'white',
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontSize: '0.65rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        padding: '0.22rem 0.6rem', borderRadius: 999,
                                    }}>
                                        {recipe.category}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h2 style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: '1.4rem', fontWeight: 700,
                                color: 'var(--foreground)',
                                marginBottom: '0.5rem', lineHeight: 1.3,
                            }}>
                                {recipe.title}
                            </h2>

                            {recipe.description && (
                                <p style={{
                                    fontFamily: 'DM Sans, sans-serif',
                                    color: 'var(--muted)', fontSize: '0.85rem',
                                    lineHeight: 1.6, marginBottom: '1rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical' as const,
                                    overflow: 'hidden',
                                }}>
                                    {recipe.description}
                                </p>
                            )}

                            {/* Meta */}
                            {(totalTime > 0 || recipe.servings) && (
                                <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                    {totalTime > 0 && (
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            ⏱ {totalTime} min
                                        </span>
                                    )}
                                    {recipe.servings && (
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            🍽 {recipe.servings} servings
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Macros */}
                            {recipe.nutrition && (
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '0.5rem', marginBottom: '1.25rem',
                                }}>
                                    {[
                                        { label: 'Calories', value: Math.round(recipe.nutrition.calories), unit: '' },
                                        { label: 'Protein', value: Math.round(recipe.nutrition.protein), unit: 'g' },
                                        { label: 'Carbs', value: Math.round(recipe.nutrition.carbs), unit: 'g' },
                                        { label: 'Fat', value: Math.round(recipe.nutrition.fat), unit: 'g' },
                                    ].map(({ label, value, unit }) => (
                                        <div key={label} style={{
                                            background: 'var(--muted-light)',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '0.6rem 0.5rem',
                                            textAlign: 'center',
                                        }}>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                                {value}{unit}
                                            </div>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                {label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ingredients preview */}
                            {recipe.ingredients.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--foreground)', marginBottom: '0.6rem' }}>
                                        Ingredients
                                    </p>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        {recipe.ingredients.slice(0, 4).map(ing => (
                                            <li key={ing.id} style={{
                                                fontFamily: 'DM Sans, sans-serif',
                                                fontSize: '0.85rem', color: 'var(--foreground)',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
                                                <span style={{ color: 'var(--muted)', minWidth: 60 }}>{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</span>
                                                {ing.name}
                                            </li>
                                        ))}
                                        {recipe.ingredients.length > 4 && (
                                            <li style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', paddingLeft: '1rem' }}>
                                                +{recipe.ingredients.length - 4} more ingredients
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Link
                                    href={`/recipes/${recipe.id}`}
                                    onClick={onClose}
                                    className="btn-primary"
                                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.875rem', padding: '0.6rem 1rem' }}
                                >
                                    View Full Recipe
                                </Link>
                                <button
                                    onClick={() => setMealPlanModal(true)}
                                    className="btn-outline"
                                    style={{ flex: 1, fontSize: '0.875rem', padding: '0.6rem 1rem', cursor: 'pointer' }}
                                >
                                    📅 Add to Plan
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
                            Failed to load recipe.
                        </div>
                    )}
                </div>
            </div>

            {recipe && (
                <AddToMealPlanModal
                    isOpen={mealPlanModal}
                    onClose={() => { setMealPlanModal(false); onClose() }}
                    recipeId={recipe.id}
                    recipeTitle={recipe.title}
                />
            )}
        </>
    )
}
