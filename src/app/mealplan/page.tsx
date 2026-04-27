'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'
import AuthGuard from '@/components/AuthGuard'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const MEAL_ICONS: Record<string, string> = {
    Breakfast: '☀️',
    Lunch: '🥗',
    Dinner: '🍽',
    Snack: '⚡',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    breakfast: { bg: '#fdf3eb', text: '#9a4e1c' },
    lunch: { bg: '#eef4ef', text: '#2d5235' },
    dinner: { bg: '#f0f4ff', text: '#2d4a8a' },
    snack: { bg: '#fef9e7', text: '#856404' },
    dessert: { bg: '#fdf0f5', text: '#9c2c6e' },
    drink: { bg: '#f0faff', text: '#1a6b9a' },
    default: { bg: 'var(--muted-light)', text: 'var(--muted)' },
}

interface Recipe {
    id: number
    title: string
    category: string | null
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
    return <AuthGuard><MealPlannerContent /></AuthGuard>
}

function MealPlannerContent() {
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [modal, setModal] = useState<{ day: string; mealType: string } | null>(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [showClearConfirm, setShowClearConfirm] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch('/api/mealplan').then(r => r.json()),
            fetch('/api/recipes?mealplanner=true').then(r => r.json()),
        ]).then(([plan, recs]) => {
            setMealPlan(plan)
            setRecipes(recs)
            setLoading(false)
        }).catch(() => {
            toast.error('Failed to load meal plan')
            setLoading(false)
        })
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
            setMealPlan(prev => {
                if (!prev) return prev
                const filtered = prev.slots.filter(s => !(s.day === modal.day && s.mealType === modal.mealType))
                return { ...prev, slots: [...filtered, newSlot] }
            })
            toast.success('Added to plan')
        } catch {
            toast.error('Failed to assign recipe')
        }
        setModal(null)
        setSearch('')
    }

    const removeSlot = async (slotId: number) => {
        try {
            await fetch(`/api/mealplan/slot/${slotId}`, { method: 'DELETE' })
            setMealPlan(prev => prev ? { ...prev, slots: prev.slots.filter(s => s.id !== slotId) } : prev)
            toast.success('Removed')
        } catch {
            toast.error('Failed to remove')
        }
    }

    const clearWeek = async () => {
        if (!mealPlan) return
        try {
            await fetch(`/api/mealplan/clear-week`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mealPlanId: mealPlan.id }),
            })
            setMealPlan(prev => prev ? { ...prev, slots: [] } : prev)
            toast.success('Week cleared')
            setShowClearConfirm(false)
        } catch {
            toast.error('Failed to clear week')
        }
    }

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <Spinner />

    return (
        <>
            <div style={{ maxWidth: '100%', padding: '2.5rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', boxSizing: 'border-box', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <Link href="/recipes" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                            color: 'var(--muted)', textDecoration: 'none',
                            marginBottom: '1rem', transition: 'color 0.15s ease',
                        }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                        >
                            ← Back to Recipes
                        </Link>
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Weekly Meal Plan
                        </h1>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                            Plan your meals for the week ahead
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href="/grocery" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem', padding: '0.55rem 1.25rem', border: 'none' }}>
                            🛒 View Grocery List
                        </Link>
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            style={{
                                padding: '0.55rem 1.25rem', border: '1px solid var(--danger-border)',
                                borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                fontWeight: 600, fontSize: '0.875rem', color: 'var(--danger)',
                                background: 'none', cursor: 'pointer',
                            }}
                        >
                            Clear Week
                        </button>
                    </div>
                </div>

                {/* Clear confirmation */}
                {showClearConfirm && (
                    <div style={{
                        maxWidth: 1200, margin: '0 auto', background: 'var(--danger-light)',
                        border: '1px solid var(--danger-border)', borderRadius: 'var(--radius)',
                        padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                    }}>
                        <div>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--danger)' }}>
                                Remove all meals from this week's plan?
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                style={{
                                    background: 'var(--card)', border: '1px solid var(--card-border)',
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                    fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={clearWeek}
                                style={{
                                    background: 'var(--danger)', border: 'none', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
                                    color: 'white', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div style={{ maxWidth: 1200, margin: '0 auto', overflowX: 'auto', paddingBottom: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minWidth: 700, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div />
                            {DAYS.map((day, i) => {
                                const isWeekend = i >= 5
                                return (
                                    <div key={day} style={{
                                        textAlign: 'center', padding: '0.65rem 0.25rem',
                                        borderRadius: 'var(--radius-sm)',
                                        background: isWeekend ? 'var(--primary-light)' : 'var(--card)',
                                        border: '1px solid var(--card-border)',
                                    }}>
                                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1rem', color: isWeekend ? 'var(--primary)' : 'var(--foreground)', letterSpacing: '-0.01em' }}>
                                            {day}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Meal rows */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {MEAL_TYPES.map(mealType => (
                            <div key={mealType} style={{ display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: '0.5rem', flex: 1, minHeight: 80 }}>
                                {/* Meal type label */}
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    padding: '0.5rem 0.25rem', gap: '0.2rem',
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{MEAL_ICONS[mealType]}</span>
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
                                        {mealType}
                                    </span>
                                </div>

                                {/* Day cells */}
                                {DAY_FULL.map(day => {
                                    const slot = getSlot(day, mealType)
                                    const cat = slot?.recipe?.category?.toLowerCase() ?? 'default'
                                    const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default

                                    return (
                                        <div key={day} style={{ minHeight: 80, height: '100%' }}>
                                            {slot?.recipe ? (
                                                <div style={{
                                                    height: '100%', minHeight: 80,
                                                    background: colors.bg,
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--card-border)',
                                                    padding: '0.5rem 0.6rem',
                                                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                                    gap: '0.4rem',
                                                    position: 'relative',
                                                }}>
                                                    <p style={{
                                                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
                                                        fontWeight: 600, color: colors.text,
                                                        lineHeight: 1.35, margin: 0,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical' as const,
                                                        overflow: 'hidden',
                                                    }}>
                                                        {slot.recipe.title}
                                                    </p>
                                                    <button
                                                        onClick={() => removeSlot(slot.id)}
                                                        style={{
                                                            background: 'none', border: 'none', padding: 0,
                                                            fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem',
                                                            color: 'var(--muted)', cursor: 'pointer',
                                                            textAlign: 'left', transition: 'color 0.1s',
                                                        }}
                                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                                                    >
                                                        Remove ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setModal({ day, mealType })}
                                                    style={{
                                                        width: '100%', height: '100%', minHeight: 80,
                                                        border: '1.5px dashed var(--card-border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: 'transparent',
                                                        cursor: 'pointer', fontSize: '1.25rem',
                                                        color: 'var(--card-border)',
                                                        transition: 'all 0.15s ease',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = 'var(--primary)'
                                                        e.currentTarget.style.color = 'var(--primary)'
                                                        e.currentTarget.style.background = 'var(--primary-light)'
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = 'var(--card-border)'
                                                        e.currentTarget.style.color = 'var(--card-border)'
                                                        e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipe picker modal */}
            {modal && (
                <div
                    className="modal-backdrop"
                    onClick={() => { setModal(null); setSearch('') }}
                >
                    <div
                        className="modal-panel"
                        style={{ maxWidth: 460, width: '100%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={() => { setModal(null); setSearch('') }}>✕</button>

                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.2rem' }}>
                            Add a recipe
                        </h2>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                            {modal.mealType} · {modal.day}
                        </p>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem',
                                fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)',
                                outline: 'none', marginBottom: '0.75rem',
                                boxSizing: 'border-box',
                            }}
                        />

                        {/* Recipe list */}
                        <div style={{ overflowY: 'auto', maxHeight: 360, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {filteredRecipes.length === 0 ? (
                                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>
                                    No recipes found
                                </p>
                            ) : filteredRecipes.map(recipe => {
                                const cat = recipe.category?.toLowerCase() ?? 'default'
                                const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default
                                return (
                                    <button
                                        key={recipe.id}
                                        onClick={() => assignRecipe(recipe.id)}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            padding: '0.75rem 1rem',
                                            border: '1px solid var(--card-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'var(--card)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            transition: 'all 0.12s ease',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = colors.bg
                                            e.currentTarget.style.borderColor = 'var(--primary)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'var(--card)'
                                            e.currentTarget.style.borderColor = 'var(--card-border)'
                                        }}
                                    >
                                        {recipe.category && (
                                            <span style={{
                                                fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700,
                                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                                background: colors.bg, color: colors.text,
                                                padding: '0.2rem 0.5rem', borderRadius: 999,
                                                whiteSpace: 'nowrap', flexShrink: 0,
                                            }}>
                                                {recipe.category}
                                            </span>
                                        )}
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                                            {recipe.title}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
