'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Spinner from '@/components/Spinner'

// Parses amounts like "30", "1/2", "2.5", "1 1/2" into a number
function parseAmount(amount: string): number | null {
    const trimmed = amount.trim()

    // Handle mixed fractions like "1 1/2"
    const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    if (mixed) {
        return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])
    }

    // Handle simple fractions like "1/2"
    const fraction = trimmed.match(/^(\d+)\/(\d+)$/)
    if (fraction) {
        return parseInt(fraction[1]) / parseInt(fraction[2])
    }

    // Handle plain numbers like "30" or "2.5"
    const num = parseFloat(trimmed)
    if (!isNaN(num)) return num

    return null
}

interface Ingredient {
    name: string
    amount: string
    unit: string | null
    recipeTitles: string[]
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
    const [showConfirm, setShowConfirm] = useState(false)
    const [undoAvailable, setUndoAvailable] = useState(false)
    const [undoCountdown, setUndoCountdown] = useState(0)
    const [previousChecked, setPreviousChecked] = useState<Set<string>>(new Set())
    const [previousRemoved, setPreviousRemoved] = useState<Set<string>>(new Set())
    const [haveQuantities, setHaveQuantities] = useState<Record<string, number>>({})

    useEffect(() => {
        const savedChecked = localStorage.getItem('grocery-checked')
        const savedRemoved = localStorage.getItem('grocery-removed')
        const savedHave = localStorage.getItem('grocery-have')
        if (savedChecked) setChecked(new Set(JSON.parse(savedChecked)))
        if (savedRemoved) setRemoved(new Set(JSON.parse(savedRemoved)))
        if (savedHave) setHaveQuantities(JSON.parse(savedHave))
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
    const saveHave = (next: Record<string, number>) => {
        setHaveQuantities(next)
        localStorage.setItem('grocery-have', JSON.stringify(next))
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
        setShowConfirm(true)
    }

    const confirmReset = () => {
        // Save previous state for undo
        setPreviousChecked(new Set(checked))
        setPreviousRemoved(new Set(removed))

        // Reset
        saveChecked(new Set())
        saveRemoved(new Set())
        setShowConfirm(false)

        // Show undo button
        setUndoAvailable(true)
        setUndoCountdown(10)

        // Start countdown
        const interval = setInterval(() => {
            setUndoCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setUndoAvailable(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const undoReset = () => {
        // Restore previous state
        saveChecked(previousChecked)
        saveRemoved(previousRemoved)
        setUndoAvailable(false)
        setUndoCountdown(0)
    }

    const ingredientKey = (ing: Ingredient) => `${ing.recipeTitles.join('|')}__${ing.name}__${ing.amount}`
    const visibleIngredients = ingredients.filter(ing => !removed.has(ingredientKey(ing)))

    const grouped: GroupedRecipe[] = []
    visibleIngredients.forEach(ing => {
        const recipeTitle = ing.recipeTitles[0] || 'Unknown'
        const existing = grouped.find(g => g.title === recipeTitle)
        if (existing) existing.ingredients.push(ing)
        else grouped.push({ title: recipeTitle, ingredients: [ing] })
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
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {undoAvailable ? (
                        <button
                            onClick={undoReset}
                            style={{
                                background: 'var(--primary)', border: 'none', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
                                color: 'white', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
                                transition: 'opacity 0.15s',
                            }}
                        >
                            Undo ({undoCountdown}s)
                        </button>
                    ) : (
                        <button
                            onClick={resetList}
                            style={{
                                background: 'none', border: '1px solid var(--danger)', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
                                color: 'var(--danger)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                const target = e.currentTarget as HTMLButtonElement
                                target.style.background = 'var(--danger)'
                                target.style.color = 'white'
                            }}
                            onMouseLeave={e => {
                                const target = e.currentTarget as HTMLButtonElement
                                target.style.background = 'none'
                                target.style.color = 'var(--danger)'
                            }}
                        >
                            Reset List
                        </button>
                    )}
                </div>
            </div>

            {/* Confirmation dialog */}
            {showConfirm && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #dc2626',
                    borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                    marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '1rem',
                }}>
                    <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--danger)' }}>
                            Reset all items?
                        </p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                            This cannot be undone.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setShowConfirm(false)}
                            style={{
                                background: 'var(--card)', border: '1px solid var(--card-border)',
                                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReset}
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
                        style={{ marginTop: '0.75rem', background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 600, padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)' }}
                    >
                        Reset List
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
                                        {ing.recipeTitles.length === 1
                                            ? ing.recipeTitles[0]
                                            : ing.recipeTitles.slice(0, -1).join(', ') + ' and ' + ing.recipeTitles[ing.recipeTitles.length - 1]
                                        }
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                            Need:
                                        </span>
                                        <span style={{ fontWeight: 600, color: 'var(--foreground)', marginRight: '0.25rem' }}>
                                            {ing.amount}{ing.unit ? ` ${ing.unit}` : ''}
                                        </span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={haveQuantities[key] || ''}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value) || 0
                                                setHaveQuantities(prev => ({ ...prev, [key]: val }))
                                                saveHave({ ...haveQuantities, [key]: val })
                                            }}
                                            placeholder="0"
                                            style={{
                                                width: 50, border: '1px solid var(--card-border)',
                                                borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.4rem',
                                                fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
                                                outline: 'none',
                                            }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                            Have:
                                        </span>
                                        <span style={{
                                            fontWeight: 600,
                                            color: (haveQuantities[key] || 0) >= (parseAmount(ing.amount) || 0) ? '#16a34a' : 'var(--foreground)',
                                            marginRight: '0.25rem',
                                        }}>
                                            {haveQuantities[key] || 0}
                                        </span>
                                        {ing.unit && <span>{ing.unit}</span>}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                            Still need:
                                        </span>
                                        <span style={{
                                            fontWeight: 600,
                                            color: (haveQuantities[key] || 0) >= (parseAmount(ing.amount) || 0) ? '#16a34a' : 'var(--foreground)',
                                        }}>
                                            {Math.max(0, (parseAmount(ing.amount) || 0) - (haveQuantities[key] || 0)).toFixed(1)}
                                        </span>
                                        {ing.unit && <span>{ing.unit}</span>}
                                    </div>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() => removeItem(key)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--card-border)', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.1rem', flexShrink: 0, transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
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
                                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
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
