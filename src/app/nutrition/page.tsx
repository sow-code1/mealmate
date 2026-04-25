'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import AuthGuard from '@/components/AuthGuard'

interface FoodEntry {
    id: number
    date: string
    mealType: string
    label: string
    calories: number
    protein: number
    carbs: number
    fat: number
    servings: number
    recipeId: number | null
}

interface UserGoal {
    calorieGoal: number
    proteinGoal: number
    carbGoal: number
    fatGoal: number
}

interface Recipe {
    id: number
    title: string
    category: string | null
    servings: number | null
    nutrition: { calories: number; protein: number; carbs: number; fat: number } | null
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function todayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function offsetDate(base: string, days: number): string {
    const d = new Date(base + 'T12:00:00')
    d.setDate(d.getDate() + days)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
    const today = todayStr()
    const yesterday = offsetDate(today, -1)
    if (dateStr === today) return 'Today'
    if (dateStr === yesterday) return 'Yesterday'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// SVG Calorie Ring
function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
    const r = 52
    const cx = 60
    const cy = 60
    const circumference = 2 * Math.PI * r
    const pct = goal > 0 ? Math.min(1, consumed / goal) : 0
    const offset = circumference * (1 - pct)
    const over = consumed > goal

    return (
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted-light)" strokeWidth="10" />
                <circle
                    cx={cx} cy={cy} r={r} fill="none"
                    stroke={over ? '#ef4444' : 'var(--primary)'}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center',
            }}>
                <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.4rem', fontWeight: 700,
                    color: over ? '#ef4444' : 'var(--foreground)',
                    lineHeight: 1,
                }}>
                    {Math.round(consumed)}
                </span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', color: 'var(--muted)', marginTop: 2 }}>
                    / {goal} kcal
                </span>
            </div>
        </div>
    )
}

// Macro progress bar
function MacroBar({ label, consumed, goal, color }: { label: string; consumed: number; goal: number; color: string }) {
    const pct = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0
    return (
        <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'var(--foreground)' }}>{label}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {Math.round(consumed)}g / {goal}g
                </span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: 'var(--muted-light)', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 999,
                    background: color,
                    width: `${pct}%`,
                    transition: 'width 0.5s ease',
                }} />
            </div>
        </div>
    )
}

export default function NutritionPage() {
    return <AuthGuard><NutritionContent /></AuthGuard>
}

function NutritionContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [date, setDate] = useState(todayStr)
    const [entries, setEntries] = useState<FoodEntry[]>([])
    const [goal, setGoal] = useState<UserGoal | null>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [modalTab, setModalTab] = useState<'recipe' | 'custom'>('recipe')
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [recipeSearch, setRecipeSearch] = useState('')
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [addForm, setAddForm] = useState({
        mealType: 'Breakfast',
        servings: '1',
        label: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
    })
    const [adding, setAdding] = useState(false)

    const loadEntries = useCallback(async (d: string) => {
        setLoading(true)
        try {
            const [entriesRes, goalRes] = await Promise.all([
                fetch(`/api/nutrition/log?date=${d}`),
                fetch('/api/nutrition/goals'),
            ])
            if (entriesRes.ok) setEntries(await entriesRes.json())
            if (goalRes.ok) {
                const g = await goalRes.json()
                setGoal(g)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadEntries(date) }, [date, loadEntries])

    useEffect(() => {
        if (!showModal || recipes.length > 0) return
        fetch('/api/recipes?nutrition=true').then(r => r.json()).then(data => {
            // fetch nutrition for each recipe separately would be complex,
            // the GET /api/recipes doesn't include nutrition by default
            // We'll do a simple approach: just list recipes, nutrition fills automatically
            setRecipes(Array.isArray(data) ? data : [])
        })
    }, [showModal])

    const totals = entries.reduce(
        (acc, e) => ({ cal: acc.cal + e.calories, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
        { cal: 0, protein: 0, carbs: 0, fat: 0 }
    )

    const remaining = goal ? Math.max(0, goal.calorieGoal - totals.cal) : 0

    const handleDelete = async (id: number) => {
        await fetch(`/api/nutrition/log/${id}`, { method: 'DELETE' })
        setEntries(prev => prev.filter(e => e.id !== id))
        toast.success('Entry removed')
    }

    const openModal = (mealType?: string) => {
        setAddForm({ mealType: mealType ?? 'Breakfast', servings: '1', label: '', calories: '', protein: '', carbs: '', fat: '' })
        setSelectedRecipe(null)
        setRecipeSearch('')
        setModalTab('recipe')
        setShowModal(true)
    }

    const selectRecipe = (r: Recipe) => {
        setSelectedRecipe(r)
        setAddForm(prev => ({
            ...prev,
            label: r.title,
            servings: '1',
            calories: r.nutrition ? String(Math.round(r.nutrition.calories)) : '',
            protein: r.nutrition ? String(Math.round(r.nutrition.protein)) : '',
            carbs: r.nutrition ? String(Math.round(r.nutrition.carbs)) : '',
            fat: r.nutrition ? String(Math.round(r.nutrition.fat)) : '',
        }))
    }

    const handleServingsChange = (v: string) => {
        const s = parseFloat(v) || 1
        if (selectedRecipe?.nutrition) {
            setAddForm(prev => ({
                ...prev,
                servings: v,
                calories: String(Math.round(selectedRecipe.nutrition!.calories * s)),
                protein: String(Math.round(selectedRecipe.nutrition!.protein * s)),
                carbs: String(Math.round(selectedRecipe.nutrition!.carbs * s)),
                fat: String(Math.round(selectedRecipe.nutrition!.fat * s)),
            }))
        } else {
            setAddForm(prev => ({ ...prev, servings: v }))
        }
    }

    const handleAdd = async () => {
        const label = modalTab === 'recipe' ? (selectedRecipe?.title ?? addForm.label) : addForm.label
        const calories = parseFloat(addForm.calories)
        if (!label) { toast.error('Please select a recipe or enter a food name'); return }
        if (!calories || isNaN(calories)) { toast.error('Please enter calories'); return }

        setAdding(true)
        try {
            const res = await fetch('/api/nutrition/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    mealType: addForm.mealType.toLowerCase(),
                    label,
                    calories,
                    protein: parseFloat(addForm.protein) || 0,
                    carbs: parseFloat(addForm.carbs) || 0,
                    fat: parseFloat(addForm.fat) || 0,
                    servings: parseFloat(addForm.servings) || 1,
                    recipeId: modalTab === 'recipe' ? selectedRecipe?.id ?? null : null,
                }),
            })
            if (!res.ok) throw new Error()
            const entry = await res.json()
            setEntries(prev => [...prev, entry])
            setShowModal(false)
            toast.success('Logged!')
        } catch {
            toast.error('Failed to log food')
        } finally {
            setAdding(false)
        }
    }

    if (status === 'loading') return null

    const filteredRecipes = recipes.filter(r => r.title.toLowerCase().includes(recipeSearch.toLowerCase()))

    const inputStyle: React.CSSProperties = {
        width: '100%', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)',
        padding: '0.55rem 0.8rem', fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
    }
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.78rem', fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem',
    }

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

            {/* Header */}
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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                        Nutrition
                    </h1>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.875rem' }}>
                        Track your daily calories and macros
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link href="/nutrition/goals" style={{
                        padding: '0.5rem 1rem', border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.82rem', color: 'var(--muted)',
                        textDecoration: 'none', background: 'var(--card)',
                    }}>
                        ⚙ Goals
                    </Link>
                    <button
                        onClick={() => openModal()}
                        style={{
                            padding: '0.5rem 1.1rem', border: 'none',
                            borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                            fontWeight: 600, fontSize: '0.82rem', color: 'white',
                            background: 'var(--primary)', cursor: 'pointer',
                        }}
                    >
                        + Log Food
                    </button>
                </div>
            </div>

            {/* Date nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setDate(d => offsetDate(d, -1))} style={{
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-sm)', width: 34, height: 34,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '1rem',
                    color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>‹</button>
                <span style={{
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                    color: 'var(--foreground)', minWidth: 100, textAlign: 'center',
                }}>
                    {formatDate(date)}
                </span>
                <button
                    onClick={() => setDate(d => offsetDate(d, 1))}
                    disabled={date >= todayStr()}
                    style={{
                        background: 'var(--card)', border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)', width: 34, height: 34,
                        cursor: date >= todayStr() ? 'not-allowed' : 'pointer',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '1rem',
                        color: date >= todayStr() ? 'var(--card-border)' : 'var(--muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: date >= todayStr() ? 0.4 : 1,
                    }}
                >›</button>
                {date !== todayStr() && (
                    <button onClick={() => setDate(todayStr())} style={{
                        background: 'none', border: 'none', color: 'var(--primary)',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem',
                        cursor: 'pointer', padding: '0.25rem 0.5rem',
                    }}>
                        Today
                    </button>
                )}
            </div>

            {/* No goals banner */}
            {!goal && !loading && (
                <div style={{
                    background: 'var(--accent-light)', border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
                    marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '1rem',
                }}>
                    <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>
                            Set your calorie goal to get started
                        </p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                            Without a goal, we'll use 2000 kcal as the default.
                        </p>
                    </div>
                    <Link href="/nutrition/goals" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        Set Goals
                    </Link>
                </div>
            )}

            {/* Summary card */}
            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '1.75rem',
                marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <CalorieRing consumed={totals.cal} goal={goal?.calorieGoal ?? 2000} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                    {Math.round(totals.cal)}
                                </div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eaten</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {remaining}
                                </div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                    {goal?.calorieGoal ?? 2000}
                                </div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal</div>
                            </div>
                        </div>
                        <MacroBar label="Protein" consumed={totals.protein} goal={goal?.proteinGoal ?? 150} color="#3b82f6" />
                        <MacroBar label="Carbs" consumed={totals.carbs} goal={goal?.carbGoal ?? 200} color="var(--accent)" />
                        <MacroBar label="Fat" consumed={totals.fat} goal={goal?.fatGoal ?? 65} color="#a855f7" />
                    </div>
                </div>
            </div>

            {/* Meal sections */}
            {MEAL_TYPES.map(meal => {
                const mealEntries = entries.filter(e => e.mealType === meal.toLowerCase())
                const mealCals = mealEntries.reduce((sum, e) => sum + e.calories, 0)

                return (
                    <div key={meal} style={{
                        background: 'var(--card)', border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius)', marginBottom: '1rem',
                        boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
                    }}>
                        {/* Meal header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            borderBottom: mealEntries.length > 0 ? '1px solid var(--card-border)' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>
                                    {meal === 'Breakfast' ? '🌅' : meal === 'Lunch' ? '🥗' : meal === 'Dinner' ? '🍽️' : '🍎'}
                                </span>
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)' }}>
                                    {meal}
                                </span>
                                {mealCals > 0 && (
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--muted)' }}>
                                        {Math.round(mealCals)} kcal
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => openModal(meal)}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--primary)',
                                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                                    fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem 0.5rem',
                                }}
                            >
                                + Add
                            </button>
                        </div>

                        {/* Entries */}
                        {mealEntries.map(entry => (
                            <div key={entry.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem 1.25rem',
                                borderBottom: '1px solid var(--muted-light)',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>
                                        {entry.label}
                                        {entry.servings !== 1 && (
                                            <span style={{ color: 'var(--muted)', fontWeight: 400 }}> × {entry.servings}</span>
                                        )}
                                    </span>
                                    {(entry.protein > 0 || entry.carbs > 0 || entry.fat > 0) && (
                                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                                            P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · F {Math.round(entry.fat)}g
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)' }}>
                                        {Math.round(entry.calories)} kcal
                                    </span>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--muted)', fontSize: '1rem', lineHeight: 1,
                                            padding: '0.2rem', transition: 'color 0.15s ease',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}

                        {mealEntries.length === 0 && (
                            <div style={{ padding: '0.75rem 1.25rem' }}>
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)' }}>
                                    Nothing logged yet
                                </span>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Add Food Modal */}
            {showModal && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
                    className="modal-backdrop"
                >
                    <div className="modal-panel" style={{ maxWidth: 480 }}>
                        <button onClick={() => setShowModal(false)} className="modal-close">✕</button>

                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.25rem' }}>
                            Log Food
                        </h2>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            {(['recipe', 'custom'] as const).map(tab => (
                                <button key={tab} onClick={() => setModalTab(tab)} style={{
                                    flex: 1, padding: '0.55rem', border: 'none', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                                    background: modalTab === tab ? 'var(--primary)' : 'var(--card)',
                                    color: modalTab === tab ? 'white' : 'var(--muted)',
                                    transition: 'all 0.15s ease',
                                }}>
                                    {tab === 'recipe' ? '📖 From Recipes' : '✏️ Custom'}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {/* Meal type */}
                            <div>
                                <label style={labelStyle}>Meal Type</label>
                                <select style={inputStyle} value={addForm.mealType} onChange={e => setAddForm(p => ({ ...p, mealType: e.target.value }))}>
                                    {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {modalTab === 'recipe' ? (
                                <>
                                    <div>
                                        <label style={labelStyle}>Search Recipes</label>
                                        <input
                                            style={inputStyle} placeholder="Search your recipes..."
                                            value={recipeSearch}
                                            onChange={e => setRecipeSearch(e.target.value)}
                                        />
                                    </div>
                                    <div style={{
                                        maxHeight: 180, overflowY: 'auto',
                                        border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)',
                                    }}>
                                        {filteredRecipes.length === 0 ? (
                                            <div style={{ padding: '1rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center' }}>
                                                No recipes found
                                            </div>
                                        ) : filteredRecipes.map(r => (
                                            <div
                                                key={r.id}
                                                onClick={() => selectRecipe(r)}
                                                style={{
                                                    padding: '0.65rem 0.9rem', cursor: 'pointer',
                                                    background: selectedRecipe?.id === r.id ? 'var(--primary-light)' : 'transparent',
                                                    borderBottom: '1px solid var(--muted-light)',
                                                    transition: 'background 0.12s ease',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                }}
                                                onMouseEnter={e => { if (selectedRecipe?.id !== r.id) (e.currentTarget as HTMLDivElement).style.background = 'var(--muted-light)' }}
                                                onMouseLeave={e => { if (selectedRecipe?.id !== r.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                                            >
                                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: 'var(--foreground)', fontWeight: selectedRecipe?.id === r.id ? 600 : 400 }}>
                                                    {r.title}
                                                </span>
                                                {r.nutrition ? (
                                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                                                        {Math.round(r.nutrition.calories)} kcal
                                                    </span>
                                                ) : (
                                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--muted)' }}>
                                                        no info
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {selectedRecipe && (
                                        <div>
                                            <label style={labelStyle}>Servings</label>
                                            <input type="number" min="0.5" step="0.5" style={inputStyle}
                                                value={addForm.servings}
                                                onChange={e => handleServingsChange(e.target.value)} />
                                        </div>
                                    )}

                                    {/* Calories (editable even for recipes, in case no nutrition data) */}
                                    {selectedRecipe && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                            <div>
                                                <label style={labelStyle}>Calories *</label>
                                                <input type="number" style={inputStyle} placeholder="kcal"
                                                    value={addForm.calories}
                                                    onChange={e => setAddForm(p => ({ ...p, calories: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Protein (g)</label>
                                                <input type="number" style={inputStyle} placeholder="0"
                                                    value={addForm.protein}
                                                    onChange={e => setAddForm(p => ({ ...p, protein: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Carbs (g)</label>
                                                <input type="number" style={inputStyle} placeholder="0"
                                                    value={addForm.carbs}
                                                    onChange={e => setAddForm(p => ({ ...p, carbs: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Fat (g)</label>
                                                <input type="number" style={inputStyle} placeholder="0"
                                                    value={addForm.fat}
                                                    onChange={e => setAddForm(p => ({ ...p, fat: e.target.value }))} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={labelStyle}>Food Name *</label>
                                        <input style={inputStyle} placeholder="e.g. Chicken breast, 150g"
                                            value={addForm.label}
                                            onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        <div>
                                            <label style={labelStyle}>Calories *</label>
                                            <input type="number" style={inputStyle} placeholder="kcal"
                                                value={addForm.calories}
                                                onChange={e => setAddForm(p => ({ ...p, calories: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Protein (g)</label>
                                            <input type="number" style={inputStyle} placeholder="0"
                                                value={addForm.protein}
                                                onChange={e => setAddForm(p => ({ ...p, protein: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Carbs (g)</label>
                                            <input type="number" style={inputStyle} placeholder="0"
                                                value={addForm.carbs}
                                                onChange={e => setAddForm(p => ({ ...p, carbs: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Fat (g)</label>
                                            <input type="number" style={inputStyle} placeholder="0"
                                                value={addForm.fat}
                                                onChange={e => setAddForm(p => ({ ...p, fat: e.target.value }))} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleAdd} disabled={adding}
                                className="btn-primary"
                                style={{ width: '100%', border: 'none', textAlign: 'center', opacity: adding ? 0.6 : 1, cursor: adding ? 'not-allowed' : 'pointer', marginTop: '0.25rem' }}
                            >
                                {adding ? 'Logging...' : 'Log Food'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
