'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'

interface Ingredient {
    id: number
    name: string
    amount: string
    unit: string | null
}

interface Step {
    id: number
    order: number
    instruction: string
}

interface NutritionInfo {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
}

interface Recipe {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
    tags: string | null
    isPublic: boolean
    userId: string | null
    copiedFromPreset: boolean
    user: { name: string | null; email: string | null } | null
    ingredients: Ingredient[]
    steps: Step[]
    nutrition: NutritionInfo | null
}

function useTimer() {
    const [timers, setTimers] = useState<Record<number, { seconds: number; running: boolean; original: number }>>({})
    const intervalRefs = useRef<Record<number, NodeJS.Timeout>>({})

    const startTimer = (stepOrder: number, seconds: number) => {
        if (intervalRefs.current[stepOrder]) clearInterval(intervalRefs.current[stepOrder])
        setTimers(prev => ({ ...prev, [stepOrder]: { seconds, running: true, original: seconds } }))
        intervalRefs.current[stepOrder] = setInterval(() => {
            setTimers(prev => {
                const current = prev[stepOrder]
                if (!current || current.seconds <= 0) {
                    clearInterval(intervalRefs.current[stepOrder])
                    toast.success(`⏱ Step ${stepOrder} timer done!`)
                    return { ...prev, [stepOrder]: { ...current, seconds: 0, running: false } }
                }
                return { ...prev, [stepOrder]: { ...current, seconds: current.seconds - 1 } }
            })
        }, 1000)
    }

    const resetTimer = (stepOrder: number) => {
        clearInterval(intervalRefs.current[stepOrder])
        setTimers(prev => {
            const original = prev[stepOrder]?.original ?? 0
            return { ...prev, [stepOrder]: { seconds: original, running: false, original } }
        })
    }

    const pauseTimer = (stepOrder: number) => {
        clearInterval(intervalRefs.current[stepOrder])
        setTimers(prev => ({ ...prev, [stepOrder]: { ...prev[stepOrder], running: false } }))
    }

    return { timers, startTimer, resetTimer, pauseTimer }
}

function extractMinutes(instruction: string): number | null {
    const match = instruction.match(/(\d+)\s*min/i)
    return match ? parseInt(match[1]) : null
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { data: session } = useSession()
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [acting, setActing] = useState(false)
    const [id, setId] = useState<string | null>(null)
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
    const [activeStep, setActiveStep] = useState<number | null>(null)
    const [cookingMode, setCookingMode] = useState(false)
    const [showLogModal, setShowLogModal] = useState(false)
    const [logForm, setLogForm] = useState({ mealType: 'Dinner', servings: '1' })
    const [logging, setLogging] = useState(false)
    const ingredientRefs = useRef<Record<number, HTMLDivElement | null>>({})
    const { timers, startTimer, resetTimer, pauseTimer } = useTimer()

    useEffect(() => {
        params.then(({ id }) => {
            setId(id)
            fetch(`/api/recipes/${id}`)
                .then((r) => {
                    if (r.status === 401) { router.push('/login'); return null }
                    if (r.status === 404) { router.push('/recipes'); return null }
                    return r.json()
                })
                .then((data) => { if (data) setRecipe(data) })
                .catch(() => toast.error('Failed to load recipe'))
        })
    }, [params])

    // Wake Lock API — keep screen on in cooking mode
    useEffect(() => {
        let wakeLock: WakeLockSentinel | null = null
        if (cookingMode && 'wakeLock' in navigator) {
            navigator.wakeLock.request('screen').then(lock => { wakeLock = lock })
        }
        return () => { wakeLock?.release() }
    }, [cookingMode])

    const toggleIngredient = (ingId: number) => {
        setCheckedIngredients(prev => {
            const next = new Set(prev)
            next.has(ingId) ? next.delete(ingId) : next.add(ingId)

            // Auto-scroll to next unchecked ingredient
            if (!next.has(ingId)) return next
            const allIds = recipe?.ingredients.map(i => i.id) ?? []
            const nextUnchecked = allIds.find(id => !next.has(id) && id !== ingId)
            if (nextUnchecked && ingredientRefs.current[nextUnchecked]) {
                setTimeout(() => {
                    ingredientRefs.current[nextUnchecked]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 150)
            }
            return next
        })
    }

    const isOwner = recipe?.userId === session?.user?.id
    // @ts-ignore
    const isAdmin = session?.user?.isAdmin === true
    const isPreset = recipe?.isPublic && !recipe?.userId

    const handleAction = async () => {
        if (!confirm('Delete this recipe?')) return
        setActing(true)
        try {
            if (isPreset && !isAdmin) {
                await fetch(`/api/recipes/${id}/hide`, { method: 'POST' })
            } else {
                await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
            }
            toast.success('Recipe deleted')
            router.push('/recipes')
        } catch {
            toast.error('Failed to delete recipe')
            setActing(false)
        }
    }

    const handleLog = async () => {
        if (!recipe) return
        const servings = parseFloat(logForm.servings) || 1
        const n = recipe.nutrition
        setLogging(true)
        try {
            const today = new Date()
            const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            const res = await fetch('/api/nutrition/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    mealType: logForm.mealType.toLowerCase(),
                    label: recipe.title,
                    calories: n ? Math.round(n.calories * servings) : 0,
                    protein: n ? Math.round(n.protein * servings) : 0,
                    carbs: n ? Math.round(n.carbs * servings) : 0,
                    fat: n ? Math.round(n.fat * servings) : 0,
                    servings,
                    recipeId: recipe.id,
                }),
            })
            if (!res.ok) throw new Error()
            toast.success('Logged to nutrition diary!')
            setShowLogModal(false)
        } catch {
            toast.error('Failed to log meal')
        } finally {
            setLogging(false)
        }
    }

    if (!recipe) return <Spinner />

    const tagList = recipe.tags ? recipe.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const canEdit = isOwner || isAdmin
    const canActOnRecipe = isOwner || isAdmin || (isPreset && !!session)
    const addedBy = recipe.user?.name ?? recipe.user?.email ?? 'Unknown'

    const categoryColors: Record<string, string> = {
        breakfast: '#fdf3eb', lunch: '#eef4ef', dinner: '#f0f4ff',
        snack: '#fef9e7', dessert: '#fdf0f5', drink: '#f0faff', default: '#f5f3ef',
    }
    const accentBg = categoryColors[(recipe.category ?? 'default').toLowerCase()] ?? categoryColors.default

    // Cooking mode UI
    if (cookingMode) {
        const currentStepIndex = activeStep !== null ? activeStep - 1 : 0
        const currentStep = recipe.steps[currentStepIndex]
        const isLastStep = currentStepIndex >= recipe.steps.length - 1
        const timerMinutes = currentStep ? extractMinutes(currentStep.instruction) : null

        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'var(--background)',
                zIndex: 100, display: 'flex', flexDirection: 'column',
                padding: '2rem 1.5rem', overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Cooking Mode
                        </p>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)' }}>
                            {recipe.title}
                        </h2>
                    </div>
                    <button onClick={() => setCookingMode(false)} style={{
                        background: 'var(--muted-light)', border: 'none', borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 1rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                        fontSize: '0.85rem', color: 'var(--foreground)', cursor: 'pointer',
                    }}>
                        Exit
                    </button>
                </div>

                {/* Step progress */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
                    {recipe.steps.map((_, i) => (
                        <div key={i} onClick={() => setActiveStep(i + 1)} style={{
                            flex: 1, height: 4, borderRadius: 999, cursor: 'pointer',
                            background: i < (activeStep ?? 1) ? 'var(--primary)' : 'var(--card-border)',
                            transition: 'background 0.3s ease',
                        }} />
                    ))}
                </div>

                {/* Current step */}
                {currentStep && (
                    <div style={{
                        background: 'var(--card)', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--card-border)', padding: '2.5rem',
                        marginBottom: '1.5rem', flex: 1,
                        boxShadow: 'var(--shadow-md)',
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.1rem',
                            marginBottom: '1.5rem',
                        }}>
                            {currentStep.order}
                        </div>
                        <p style={{
                            fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                            lineHeight: 1.7, color: 'var(--foreground)', fontWeight: 400,
                        }}>
                            {currentStep.instruction}
                        </p>

                        {/* Timer */}
                        {timerMinutes && (
                            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--muted-light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.75rem' }}>
                                    {timers[currentStep.order] ? formatTime(timers[currentStep.order].seconds) : `${timerMinutes}:00`}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    {!timers[currentStep.order]?.running ? (
                                        <button onClick={() => startTimer(currentStep.order, timers[currentStep.order]?.seconds ?? timerMinutes * 60)} style={{
                                            background: 'var(--primary)', color: 'white', border: 'none',
                                            borderRadius: 'var(--radius-sm)', padding: '0.5rem 1.25rem',
                                            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                                        }}>
                                            ▶ Start Timer
                                        </button>
                                    ) : (
                                        <button onClick={() => pauseTimer(currentStep.order)} style={{
                                            background: 'var(--accent)', color: 'white', border: 'none',
                                            borderRadius: 'var(--radius-sm)', padding: '0.5rem 1.25rem',
                                            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                                        }}>
                                            ⏸ Pause
                                        </button>
                                    )}
                                    <button onClick={() => resetTimer(currentStep.order)} style={{
                                        background: 'var(--muted-light)', color: 'var(--foreground)', border: '1px solid var(--card-border)',
                                        borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem',
                                        fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                                    }}>
                                        ↺ Reset
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setActiveStep(Math.max(1, (activeStep ?? 1) - 1))}
                        disabled={(activeStep ?? 1) <= 1}
                        style={{
                            flex: 1, padding: '0.9rem',
                            border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                            background: 'var(--card)', color: 'var(--foreground)',
                            cursor: (activeStep ?? 1) <= 1 ? 'not-allowed' : 'pointer',
                            opacity: (activeStep ?? 1) <= 1 ? 0.4 : 1,
                        }}
                    >
                        ← Previous
                    </button>
                    {isLastStep ? (
                        <button onClick={() => { setCookingMode(false); toast.success('Recipe complete! 🎉') }} style={{
                            flex: 1, padding: '0.9rem',
                            border: 'none', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                            background: 'var(--primary)', color: 'white', cursor: 'pointer',
                        }}>
                            🎉 Done!
                        </button>
                    ) : (
                        <button onClick={() => setActiveStep((activeStep ?? 1) + 1)} style={{
                            flex: 1, padding: '0.9rem',
                            border: 'none', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                            background: 'var(--primary)', color: 'white', cursor: 'pointer',
                        }}>
                            Next →
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

            {/* Back link */}
            <Link href="/recipes" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                color: 'var(--muted)', textDecoration: 'none',
                marginBottom: '1.75rem', transition: 'color 0.15s ease',
            }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
                ← Back to Recipes
            </Link>

            {/* Hero section */}
            <div style={{
                background: accentBg, borderRadius: 'var(--radius-lg)',
                padding: '2.5rem', marginBottom: '1.5rem',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', right: -20, top: -20,
                    fontFamily: 'Playfair Display, serif', fontSize: '12rem', fontWeight: 700,
                    color: 'var(--primary)', opacity: 0.06, lineHeight: 1,
                    userSelect: 'none', pointerEvents: 'none',
                }}>
                    {recipe.title[0]}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{
                        background: 'var(--primary)', color: 'white',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        fontSize: '0.7rem', letterSpacing: '0.06em',
                        textTransform: 'uppercase', padding: '0.3rem 0.75rem', borderRadius: 999,
                    }}>
                        {recipe.category ?? 'Uncategorized'}
                    </span>
                    {isAdmin && recipe.userId && !recipe.copiedFromPreset && (
                        <span style={{ background: '#f3e8ff', color: '#9333ea', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: 999 }}>
                            👤 Added by {addedBy}
                        </span>
                    )}
                    {isAdmin && recipe.copiedFromPreset && (
                        <span style={{ background: '#dbeafe', color: '#2563eb', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: 999 }}>
                            🌐 Public
                        </span>
                    )}
                </div>

                <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                    fontWeight: 700, color: 'var(--foreground)',
                    marginBottom: '0.75rem', lineHeight: 1.15, position: 'relative',
                }}>
                    {recipe.title}
                </h1>

                {recipe.description && (
                    <p style={{
                        fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)',
                        fontSize: '1rem', lineHeight: 1.7, fontWeight: 300,
                        maxWidth: 560, marginBottom: '1.25rem', position: 'relative',
                    }}>
                        {recipe.description}
                    </p>
                )}

                {tagList.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                        {tagList.map((tag) => (
                            <span key={tag} style={{
                                fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
                                background: 'var(--accent-light)', color: 'var(--accent)',
                                padding: '0.25rem 0.65rem', borderRadius: 999, fontWeight: 500,
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {/* Log meal button */}
                    {session && (
                        <button onClick={() => setShowLogModal(true)} style={{
                            padding: '0.55rem 1.25rem', border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                            fontSize: '0.85rem', color: 'white',
                            background: 'var(--accent)', cursor: 'pointer',
                            transition: 'background 0.15s ease',
                        }}>
                            🔥 Log Meal
                        </button>
                    )}
                    {/* Cooking mode button */}
                    <button onClick={() => { setActiveStep(1); setCookingMode(true) }} style={{
                        padding: '0.55rem 1.25rem', border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                        fontSize: '0.85rem', color: 'white',
                        background: 'var(--primary)', cursor: 'pointer',
                        transition: 'background 0.15s ease',
                    }}>
                        👨‍🍳 Start Cooking
                    </button>
                    {canEdit && (
                        <Link href={`/recipes/${id}/edit`} style={{
                            padding: '0.55rem 1.25rem',
                            border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-sm)',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                            fontSize: '0.85rem', color: 'var(--primary)',
                            textDecoration: 'none', background: 'white',
                        }}>
                            ✏️ Edit
                        </Link>
                    )}
                    {canActOnRecipe && (
                        <button onClick={handleAction} disabled={acting} style={{
                            padding: '0.55rem 1.25rem', border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                            fontSize: '0.85rem', color: 'white',
                            background: acting ? '#f87171' : '#ef4444',
                            cursor: acting ? 'not-allowed' : 'pointer',
                            opacity: acting ? 0.7 : 1,
                        }}>
                            {acting ? 'Deleting...' : '🗑 Delete'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Prep Time', value: `${recipe.prepTime ?? 0} min`, icon: '⏱' },
                    { label: 'Cook Time', value: `${recipe.cookTime ?? 0} min`, icon: '🔥' },
                    { label: 'Servings', value: `${recipe.servings ?? 0}`, icon: '🍽' },
                ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                        background: 'var(--card)', border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius)', padding: '1.1rem',
                        textAlign: 'center', boxShadow: 'var(--shadow-sm)',
                    }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{icon}</div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)' }}>{value}</div>
                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Nutrition panel */}
            {recipe.nutrition && (
                <div style={{
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius)', padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
                }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                        Nutrition per serving
                    </p>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Calories', value: `${Math.round(recipe.nutrition.calories)} kcal`, color: 'var(--primary)' },
                            { label: 'Protein', value: `${Math.round(recipe.nutrition.protein)}g`, color: '#3b82f6' },
                            { label: 'Carbs', value: `${Math.round(recipe.nutrition.carbs)}g`, color: 'var(--accent)' },
                            { label: 'Fat', value: `${Math.round(recipe.nutrition.fat)}g`, color: '#a855f7' },
                            ...(recipe.nutrition.fiber > 0 ? [{ label: 'Fiber', value: `${Math.round(recipe.nutrition.fiber)}g`, color: '#16a34a' }] : []),
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ textAlign: 'center', minWidth: 60 }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', fontWeight: 700, color }}>{value}</div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ingredients */}
            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '1.75rem',
                marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)' }}>
                        Ingredients
                    </h2>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {checkedIngredients.size}/{recipe.ingredients.length} checked
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {recipe.ingredients?.map((ing) => {
                        const checked = checkedIngredients.has(ing.id)
                        return (
                            <div
                                key={ing.id}
                                ref={el => { ingredientRefs.current[ing.id] = el }}
                                onClick={() => toggleIngredient(ing.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                                    padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-sm)',
                                    background: checked ? 'var(--primary-light)' : 'var(--muted-light)',
                                    cursor: 'pointer', transition: 'all 0.15s ease',
                                    opacity: checked ? 0.7 : 1,
                                }}
                            >
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                    border: `2px solid ${checked ? 'var(--primary)' : 'var(--card-border)'}`,
                                    background: checked ? 'var(--primary)' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                }}>
                                    {checked && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                                </div>
                                <span style={{
                                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                                    color: 'var(--foreground)', fontWeight: 400,
                                    textDecoration: checked ? 'line-through' : 'none',
                                    transition: 'all 0.15s ease',
                                }}>
                                    <strong style={{ fontWeight: 600 }}>{ing.amount} {ing.unit}</strong> {ing.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Log meal modal */}
            {showLogModal && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setShowLogModal(false) }}
                    className="modal-backdrop"
                >
                    <div className="modal-panel" style={{ maxWidth: 380 }}>
                        <button onClick={() => setShowLogModal(false)} className="modal-close">✕</button>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Log this meal
                        </h2>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                            {recipe.title}
                            {recipe.nutrition && ` · ${Math.round(recipe.nutrition.calories)} kcal/serving`}
                        </p>
                        {!recipe.nutrition && (
                            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--foreground)' }}>
                                ⚠️ No nutrition info on this recipe. Calories will be logged as 0.{' '}
                                {id && <a href={`/recipes/${id}/edit`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Add nutrition →</a>}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.4rem' }}>
                                    Meal Type
                                </label>
                                <select
                                    style={{ width: '100%', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: 'var(--background)', outline: 'none' }}
                                    value={logForm.mealType}
                                    onChange={e => setLogForm(p => ({ ...p, mealType: e.target.value }))}
                                >
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.4rem' }}>
                                    Servings
                                </label>
                                <input type="number" min="0.5" step="0.5"
                                    style={{ width: '100%', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', background: 'var(--background)', outline: 'none' }}
                                    value={logForm.servings}
                                    onChange={e => setLogForm(p => ({ ...p, servings: e.target.value }))}
                                />
                            </div>
                            {recipe.nutrition && (
                                <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--foreground)' }}>
                                    Total: <strong>{Math.round(recipe.nutrition.calories * (parseFloat(logForm.servings) || 1))} kcal</strong>
                                    {' '}· P {Math.round(recipe.nutrition.protein * (parseFloat(logForm.servings) || 1))}g
                                    · C {Math.round(recipe.nutrition.carbs * (parseFloat(logForm.servings) || 1))}g
                                    · F {Math.round(recipe.nutrition.fat * (parseFloat(logForm.servings) || 1))}g
                                </div>
                            )}
                            <button
                                onClick={handleLog} disabled={logging}
                                className="btn-primary"
                                style={{ width: '100%', border: 'none', textAlign: 'center', opacity: logging ? 0.6 : 1, cursor: logging ? 'not-allowed' : 'pointer' }}
                            >
                                {logging ? 'Logging...' : '🔥 Log to Diary'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steps */}
            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
            }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1.25rem' }}>
                    Steps
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recipe.steps?.map((step) => {
                        const isActive = activeStep === step.order
                        const timerMinutes = extractMinutes(step.instruction)
                        const timer = timers[step.order]

                        return (
                            <div key={step.id}>
                                <div
                                    onClick={() => setActiveStep(isActive ? null : step.order)}
                                    style={{
                                        display: 'flex', gap: '1rem', alignItems: 'flex-start',
                                        padding: '1rem 1.1rem', borderRadius: 'var(--radius-sm)',
                                        background: isActive ? 'var(--primary-light)' : 'var(--muted-light)',
                                        border: `1.5px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                        background: isActive ? 'var(--primary)' : 'var(--card)',
                                        border: `2px solid ${isActive ? 'var(--primary)' : 'var(--card-border)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                                        color: isActive ? 'white' : 'var(--muted)',
                                        transition: 'all 0.2s ease', marginTop: 2,
                                    }}>
                                        {step.order}
                                    </div>
                                    <p style={{
                                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
                                        color: 'var(--foreground)', lineHeight: 1.65,
                                        fontWeight: isActive ? 500 : 400,
                                        flex: 1,
                                    }}>
                                        {step.instruction}
                                    </p>
                                </div>

                                {/* Inline timer — shows when step is active and has a duration */}
                                {isActive && timerMinutes && (
                                    <div style={{
                                        marginTop: '0.4rem', padding: '0.9rem 1.1rem',
                                        background: 'var(--card)', border: '1px solid var(--card-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                    }}>
                                        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', minWidth: 64 }}>
                                            {timer ? formatTime(timer.seconds) : `${timerMinutes}:00`}
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            {!timer?.running ? (
                                                <button onClick={(e) => { e.stopPropagation(); startTimer(step.order, timer?.seconds ?? timerMinutes * 60) }} style={{
                                                    background: 'var(--primary)', color: 'white', border: 'none',
                                                    borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem',
                                                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                                }}>
                                                    ▶ Start
                                                </button>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); pauseTimer(step.order) }} style={{
                                                    background: 'var(--accent)', color: 'white', border: 'none',
                                                    borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem',
                                                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                                }}>
                                                    ⏸ Pause
                                                </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); resetTimer(step.order) }} style={{
                                                background: 'var(--muted-light)', color: 'var(--foreground)',
                                                border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)',
                                                padding: '0.4rem 0.75rem', fontFamily: 'DM Sans, sans-serif',
                                                fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                                            }}>
                                                ↺
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}