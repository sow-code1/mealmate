'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Spinner from '@/components/Spinner'

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

    useEffect(() => {
        const savedChecked = localStorage.getItem('grocery-checked')
        const savedRemoved = localStorage.getItem('grocery-removed')
        if (savedChecked) setChecked(new Set(JSON.parse(savedChecked)))
        if (savedRemoved) setRemoved(new Set(JSON.parse(savedRemoved)))
    }, [])

    useEffect(() => {
        fetch('/api/grocery')
            .then(r => r.json())
            .then(data => { setIngredients(data); setLoading(false) })
            .catch(() => setLoading(false))
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
        const nc = new Set(checked)
        nc.delete(key)
        saveChecked(nc)
    }

    const removeAll = (keys: string[]) => {
        const next = new Set(removed)
        keys.forEach(k => next.add(k))
        saveRemoved(next)
        const nc = new Set(checked)
        keys.forEach(k => nc.delete(k))
        saveChecked(nc)
    }

    const resetList = () => {
        if (!confirm('Reset the grocery list? All removed and checked items will be restored.')) return
        saveChecked(new Set())
        saveRemoved(new Set())
    }

    const ingredientKey = (ing: Ingredient) => `${ing.recipeTitle}__${ing.name}__${ing.amount}`
    const visibleIngredients = ingredients.filter(ing => !removed.has(ingredientKey(ing)))

    const grouped: GroupedRecipe[] = []
    visibleIngredients.forEach(ing => {
        const existing = grouped.find(g => g.title === ing.recipeTitle)
        if (existing) existing.ingredients.push(ing)
        else grouped.push({ title: ing.recipeTitle, ingredients: [ing] })
    })

    const checkedCount = visibleIngredients.filter(i => checked.has(ingredientKey(i))).length
    const totalCount = visibleIngredients.length

    if (loading) return <Spinner />

    if (ingredients.length === 0) return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                Your list is empty
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                Add recipes to your meal plan first and they'll appear here.
            </p>
            <Link href="/mealplan" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                Go to Meal Planner
            </Link>
        </div>
    )

    return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
            {/* Header */}
            <Link href="/mealplan" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                color: 'var(--muted)', textDecoration: 'none',
                marginBottom: '1rem', transition: 'color 0.15s ease',
            }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
                ← Back to Meal Planner
            </Link>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                        Grocery List
                    </h1>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {checkedCount} of {totalCount} items collected
                    </p>
                </div>
                <button
                    onClick={resetList}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
                        color: 'var(--muted)', padding: '0.3rem 0', marginTop: '0.25rem',
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                >
                    Reset list
                </button>
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
                <div style={{ height: 4, background: 'var(--card-border)', borderRadius: 999, marginBottom: '1.75rem', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', background: 'var(--primary)', borderRadius: 999,
                        width: `${(checkedCount / totalCount) * 100}%`,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            )}

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {(['combined', 'grouped'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: 999,
                            fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s ease', border: 'none',
                            background: view === v ? 'var(--primary)' : 'var(--muted-light)',
                            color: view === v ? 'white' : 'var(--muted)',
                        }}
                    >
                        {v === 'combined' ? 'All Items' : 'By Recipe'}
                    </button>
                ))}
            </div>

            {visibleIngredients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        All items collected or removed!
                    </p>
                    <button
                        onClick={resetList}
                        style={{ marginTop: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
                    >
                        Reset list
                    </button>
                </div>
            ) : view === 'combined' ? (
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    {visibleIngredients.map((ing, idx) => {
                        const key = ingredientKey(ing)
                        const isChecked = checked.has(key)
                        const isLast = idx === visibleIngredients.length - 1
                        return (
                            <div
                                key={key}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                                    padding: '0.8rem 1.25rem',
                                    borderBottom: isLast ? 'none' : '1px solid var(--card-border)',
                                    background: isChecked ? 'var(--muted-light)' : 'var(--card)',
                                    transition: 'background 0.15s',
                                    opacity: isChecked ? 0.6 : 1,
                                }}
                            >
                                {/* Checkbox */}
                                <div
                                    onClick={() => toggleCheck(key)}
                                    style={{
                                        width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                                        border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--card-border)'}`,
                                        background: isChecked ? 'var(--primary)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {isChecked && (
                                        <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1 }}>✓</span>
                                    )}
                                </div>

                                {/* Text */}
                                <div onClick={() => toggleCheck(key)} style={{ flex: 1, cursor: 'pointer' }}>
                                    <span style={{
                                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                                        color: 'var(--foreground)', fontWeight: 500,
                                        textDecoration: isChecked ? 'line-through' : 'none',
                                    }}>
                                        <strong style={{ fontWeight: 700 }}>{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</strong>{' '}
                                        {ing.name}
                                    </span>
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.4rem' }}>
                                        {ing.recipeTitle}
                                    </span>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() => removeItem(key)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--card-border)', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.1rem', flexShrink: 0, transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--card-border)')}
                                    title="Remove item"
                                >
                                    ×
                                </button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {grouped.map(group => {
                        const groupKeys = group.ingredients.map(ingredientKey)
                        const allChecked = groupKeys.every(k => checked.has(k))
                        return (
                            <div key={group.title} style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                {/* Group header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.9rem 1.25rem',
                                    borderBottom: '1px solid var(--card-border)',
                                    background: 'var(--muted-light)',
                                }}>
                                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                                        {group.title}
                                    </h2>
                                    <button
                                        onClick={() => allChecked ? groupKeys.forEach(k => {
                                            const next = new Set(checked); next.delete(k); saveChecked(next)
                                        }) : removeAll(groupKeys)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
                                            fontWeight: 600, color: 'var(--primary)', padding: 0,
                                        }}
                                    >
                                        Got all ✓
                                    </button>
                                </div>

                                {/* Ingredients */}
                                {group.ingredients.map((ing, idx) => {
                                    const key = ingredientKey(ing)
                                    const isChecked = checked.has(key)
                                    const isLast = idx === group.ingredients.length - 1
                                    return (
                                        <div
                                            key={key}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.85rem',
                                                padding: '0.75rem 1.25rem',
                                                borderBottom: isLast ? 'none' : '1px solid var(--card-border)',
                                                background: isChecked ? 'var(--muted-light)' : 'var(--card)',
                                                opacity: isChecked ? 0.6 : 1,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div
                                                onClick={() => toggleCheck(key)}
                                                style={{
                                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                                                    border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--card-border)'}`,
                                                    background: isChecked ? 'var(--primary)' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {isChecked && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1 }}>✓</span>}
                                            </div>
                                            <span
                                                onClick={() => toggleCheck(key)}
                                                style={{
                                                    flex: 1, cursor: 'pointer',
                                                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                                                    color: 'var(--foreground)', fontWeight: 400,
                                                    textDecoration: isChecked ? 'line-through' : 'none',
                                                }}
                                            >
                                                <strong style={{ fontWeight: 700 }}>{ing.amount}{ing.unit ? ` ${ing.unit}` : ''}</strong>{' '}
                                                {ing.name}
                                            </span>
                                            <button
                                                onClick={() => removeItem(key)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--card-border)', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.1rem', flexShrink: 0, transition: 'color 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--card-border)')}
                                                title="Remove item"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
