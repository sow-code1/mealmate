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
    pantryHave: number
    needed: number | null
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

    const refetchGrocery = () => {
        fetch('/api/grocery')
            .then(r => r.json())
            .then(data => { setIngredients(data); setLoading(false) })
            .catch(() => setLoading(false))
    }

    useEffect(() => {
        refetchGrocery()
        // Re-pull when user returns to tab — picks up pantry edits made elsewhere
        const onFocus = () => refetchGrocery()
        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refetchGrocery() })
        return () => {
            window.removeEventListener('focus', onFocus)
        }
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
                    {visibleIngredients.map((ing) => {
                        const key = ingredientKey(ing)
                        const isChecked = checked.has(key)
                        return (
                            <GroceryRow
                                key={key}
                                ing={ing}
                                isChecked={isChecked}
                                manualHave={haveQuantities[key]}
                                onToggle={() => toggleCheck(key)}
                                onHaveChange={(val) => {
                                    setHaveQuantities(prev => ({ ...prev, [key]: val }))
                                    saveHave({ ...haveQuantities, [key]: val })
                                }}
                                onRemove={() => removeItem(key)}
                            />
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
                                {group.ingredients.map((ing) => {
                                    const key = ingredientKey(ing)
                                    const isChecked = checked.has(key)
                                    return (
                                        <GroceryRow
                                            key={key}
                                            ing={ing}
                                            isChecked={isChecked}
                                            manualHave={haveQuantities[key]}
                                            onToggle={() => toggleCheck(key)}
                                            onHaveChange={(val) => {
                                                setHaveQuantities(prev => ({ ...prev, [key]: val }))
                                                saveHave({ ...haveQuantities, [key]: val })
                                            }}
                                            onRemove={() => removeItem(key)}
                                        />
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

// ─── Row component ────────────────────────────────────────────────
interface RowProps {
    ing: Ingredient
    isChecked: boolean
    manualHave: number | undefined
    onToggle: () => void
    onHaveChange: (v: number) => void
    onRemove: () => void
}

function GroceryRow({ ing, isChecked, manualHave, onToggle, onHaveChange, onRemove }: RowProps) {
    const needed = ing.needed ?? parseAmount(ing.amount) ?? 0
    const have = manualHave !== undefined ? manualHave : ing.pantryHave
    const stillNeed = Math.max(0, needed - have)
    const hasNumeric = ing.needed !== null
    const fullySatisfied = hasNumeric && have >= needed && needed > 0
    const partial = hasNumeric && have > 0 && have < needed
    const fmt = (n: number) => parseFloat(n.toFixed(2)).toString()
    const unitSuffix = ing.unit ? ` ${ing.unit}` : ''

    return (
        <div
            className="grocery-row"
            style={{
                background: isChecked ? 'var(--muted-light)' : 'var(--card)',
                opacity: isChecked ? 0.55 : 1,
            }}
        >
            {/* Checkbox */}
            <div
                className="grocery-check"
                onClick={onToggle}
                style={{
                    width: 22, height: 22, borderRadius: 6, cursor: 'pointer',
                    border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--card-border)'}`,
                    background: isChecked ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                }}
            >
                {isChecked && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>✓</span>}
            </div>

            {/* Name + recipes */}
            <div className="grocery-name" onClick={onToggle} style={{ cursor: 'pointer', minWidth: 0 }}>
                <div style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem',
                    color: 'var(--foreground)', fontWeight: 600,
                    textDecoration: isChecked ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {ing.name}
                </div>
                <div style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem',
                    color: 'var(--muted)', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {ing.recipeTitles.join(', ')}
                </div>
                {fullySatisfied && (
                    <span className="grocery-pantry-badge" style={{ marginTop: 4 }}>
                        ✓ In Pantry
                    </span>
                )}
            </div>

            {/* Quantities wrapper */}
            <div className="grocery-quantities">
                {/* Need */}
                <div className="grocery-qty">
                    <span className="grocery-qty-label">Need</span>
                    <span className="grocery-qty-value">{ing.amount}{unitSuffix}</span>
                </div>

                {/* Have */}
                <div className="grocery-qty">
                    <span className="grocery-qty-label">Have</span>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="grocery-have-input"
                        value={have || ''}
                        placeholder={ing.pantryHave > 0 ? fmt(ing.pantryHave) : '0'}
                        onChange={e => onHaveChange(parseFloat(e.target.value) || 0)}
                    />
                </div>

                {/* Still need */}
                <div className="grocery-qty">
                    <span className="grocery-qty-label">Still need</span>
                    {hasNumeric ? (
                        <span className={`grocery-qty-value${stillNeed === 0 ? ' satisfied' : partial ? ' partial' : ''}`}>
                            {fmt(stillNeed)}{unitSuffix}
                        </span>
                    ) : (
                        <span className="grocery-qty-value" style={{ color: 'var(--muted)' }}>—</span>
                    )}
                </div>
            </div>

            {/* Remove */}
            <button
                className="grocery-del"
                onClick={onRemove}
                aria-label="Remove item"
                title="Remove item"
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--card-border)', fontSize: '1.25rem', lineHeight: 1,
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--card-border)'; e.currentTarget.style.background = 'transparent' }}
            >
                ×
            </button>
        </div>
    )
}
