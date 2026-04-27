'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
    { value: 'light', label: 'Light', desc: '1–3 days/week exercise', multiplier: 1.375 },
    { value: 'moderate', label: 'Moderate', desc: '3–5 days/week exercise', multiplier: 1.55 },
    { value: 'active', label: 'Active', desc: '6–7 days/week exercise', multiplier: 1.725 },
    { value: 'very_active', label: 'Very Active', desc: 'Intense daily training', multiplier: 1.9 },
]

const GOAL_TYPES = [
    { value: 'lose', label: 'Lose Weight', adj: -500, proteinPct: 0.35, carbPct: 0.35, fatPct: 0.30 },
    { value: 'maintain', label: 'Maintain', adj: 0, proteinPct: 0.25, carbPct: 0.45, fatPct: 0.30 },
    { value: 'gain', label: 'Gain Weight', adj: 300, proteinPct: 0.30, carbPct: 0.45, fatPct: 0.25 },
]

const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.85rem', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif',
    color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.82rem', fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)',
    marginBottom: '0.4rem', letterSpacing: '0.01em',
}

function calcTDEE(gender: string, age: number, height: number, weight: number, activityLevel: string): number {
    const bmr = gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161
    const mult = ACTIVITY_LEVELS.find(a => a.value === activityLevel)?.multiplier ?? 1.55
    return Math.round(bmr * mult)
}

export default function NutritionGoalsPage() {
    return <AuthGuard><NutritionGoalsContent /></AuthGuard>
}

function NutritionGoalsContent() {
    const { status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Body stats (TDEE calculator)
    const [gender, setGender] = useState<'male' | 'female'>('male')
    const [age, setAge] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [goalType, setGoalType] = useState('maintain')
    const [tdeeResult, setTdeeResult] = useState<number | null>(null)

    // Goals
    const [form, setForm] = useState({
        calorieGoal: '2000',
        proteinGoal: '150',
        carbGoal: '200',
        fatGoal: '65',
        activityLevel: 'moderate',
    })

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/login'); return }
        if (status !== 'authenticated') return
        fetch('/api/nutrition/goals')
            .then(r => r.json())
            .then(data => {
                if (data) {
                    setForm({
                        calorieGoal: String(data.calorieGoal ?? 2000),
                        proteinGoal: String(data.proteinGoal ?? 150),
                        carbGoal: String(data.carbGoal ?? 200),
                        fatGoal: String(data.fatGoal ?? 65),
                        activityLevel: data.activityLevel ?? 'moderate',
                    })
                    if (data.gender) setGender(data.gender)
                    if (data.age) setAge(String(data.age))
                    if (data.height) setHeight(String(data.height))
                    if (data.weight) setWeight(String(data.weight))
                    if (data.goalType) setGoalType(data.goalType)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [status, router])

    const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

    const handleCalculate = () => {
        const a = parseInt(age)
        const h = parseFloat(height)
        const w = parseFloat(weight)
        if (!a || !h || !w || a < 10 || a > 120 || h < 100 || h > 250 || w < 20 || w > 300) {
            toast.error('Enter valid age, height (cm), and weight (kg)')
            return
        }
        const tdee = calcTDEE(gender, a, h, w, form.activityLevel)
        const gt = GOAL_TYPES.find(g => g.value === goalType) ?? GOAL_TYPES[1]
        const targetCal = Math.max(1200, tdee + gt.adj)
        const protein = Math.round((targetCal * gt.proteinPct) / 4)
        const carbs = Math.round((targetCal * gt.carbPct) / 4)
        const fat = Math.round((targetCal * gt.fatPct) / 9)

        setTdeeResult(tdee)
        setForm(p => ({
            ...p,
            calorieGoal: String(targetCal),
            proteinGoal: String(protein),
            carbGoal: String(carbs),
            fatGoal: String(fat),
        }))
        toast.success('Goals calculated! Review and save below.')
    }

    const handleSave = async () => {
        const cal = parseInt(form.calorieGoal)
        if (!cal || cal < 500 || cal > 10000) { toast.error('Set a calorie goal between 500–10000'); return }

        setSaving(true)
        try {
            const res = await fetch('/api/nutrition/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calorieGoal: parseInt(form.calorieGoal) || 2000,
                    proteinGoal: parseInt(form.proteinGoal) || 150,
                    carbGoal: parseInt(form.carbGoal) || 200,
                    fatGoal: parseInt(form.fatGoal) || 65,
                    activityLevel: form.activityLevel,
                    age: parseInt(age) || null,
                    height: parseFloat(height) || null,
                    weight: parseFloat(weight) || null,
                    gender,
                    goalType,
                }),
            })
            if (!res.ok) throw new Error()
            toast.success('Goals saved!')
            router.push('/nutrition')
        } catch {
            toast.error('Failed to save goals')
        } finally {
            setSaving(false)
        }
    }

    if (status === 'loading' || loading) return null

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem' }}>
            <Link href="/nutrition" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)',
                textDecoration: 'none', marginBottom: '1.75rem', transition: 'color 0.15s ease',
            }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
                ← Back to Nutrition
            </Link>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.4rem' }}>
                Nutrition Goals
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Calculate your TDEE or set targets manually.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* TDEE Calculator */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                        Calculate My Goals
                    </h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                        Uses Mifflin-St Jeor formula. Auto-fills targets below.
                    </p>

                    {/* Gender toggle */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Biological Sex</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {(['male', 'female'] as const).map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGender(g)}
                                    style={{
                                        flex: 1, padding: '0.55rem', border: `1.5px solid ${gender === g ? 'var(--primary)' : 'var(--card-border)'}`,
                                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                        fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                        background: gender === g ? 'var(--primary-light)' : 'transparent',
                                        color: gender === g ? 'var(--primary)' : 'var(--muted)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Age / Height / Weight */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Age</label>
                            <input type="number" min="10" max="120" style={inputStyle} placeholder="25"
                                value={age} onChange={e => setAge(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Height (cm)</label>
                            <input type="number" min="100" max="250" style={inputStyle} placeholder="175"
                                value={height} onChange={e => setHeight(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Weight (kg)</label>
                            <input type="number" min="20" max="300" style={inputStyle} placeholder="70"
                                value={weight} onChange={e => setWeight(e.target.value)} />
                        </div>
                    </div>

                    {/* Goal type */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>Goal</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {GOAL_TYPES.map(g => (
                                <button
                                    key={g.value}
                                    onClick={() => setGoalType(g.value)}
                                    style={{
                                        flex: 1, padding: '0.55rem 0.25rem', border: `1.5px solid ${goalType === g.value ? 'var(--primary)' : 'var(--card-border)'}`,
                                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                        fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                                        background: goalType === g.value ? 'var(--primary-light)' : 'transparent',
                                        color: goalType === g.value ? 'var(--primary)' : 'var(--muted)',
                                        transition: 'all 0.15s ease', textAlign: 'center',
                                    }}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {tdeeResult !== null && (
                        <div style={{
                            padding: '0.85rem 1rem', marginBottom: '1rem',
                            background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--primary)',
                        }}>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                                TDEE: {tdeeResult} kcal/day
                                {' '}·{' '}
                                Target: {form.calorieGoal} kcal
                                {goalType === 'lose' ? ' (−500 deficit)' : goalType === 'gain' ? ' (+300 surplus)' : ' (maintenance)'}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleCalculate}
                        style={{
                            width: '100%', padding: '0.65rem', border: 'none',
                            borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            background: 'var(--primary)', color: 'white', transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        Calculate & Auto-fill Goals
                    </button>
                </div>

                {/* Activity level — shared between calculator and manual */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Activity Level
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {ACTIVITY_LEVELS.map(level => (
                            <div
                                key={level.value}
                                onClick={() => set('activityLevel', level.value)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                    border: `1.5px solid ${form.activityLevel === level.value ? 'var(--primary)' : 'var(--card-border)'}`,
                                    background: form.activityLevel === level.value ? 'var(--primary-light)' : 'transparent',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{
                                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                    border: `2px solid ${form.activityLevel === level.value ? 'var(--primary)' : 'var(--card-border)'}`,
                                    background: form.activityLevel === level.value ? 'var(--primary)' : 'var(--card)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {form.activityLevel === level.value && (
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--card)' }} />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)' }}>
                                        {level.label}
                                    </div>
                                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                        {level.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calorie goal */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Daily Calorie Goal
                    </h2>
                    <div>
                        <label style={labelStyle}>Target Calories (kcal/day)</label>
                        <input type="number" style={inputStyle} min="500" max="10000"
                            value={form.calorieGoal} onChange={e => set('calorieGoal', e.target.value)} />
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                            Typical: 1200–1500 (loss) · 1800–2200 (maintenance) · 2500–3500 (gain)
                        </p>
                    </div>
                </div>

                {/* Macro goals */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Macro Goals
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ ...labelStyle, color: '#3b82f6' }}>Protein (g)</label>
                            <input type="number" style={inputStyle} min="0"
                                value={form.proteinGoal} onChange={e => set('proteinGoal', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, color: 'var(--accent)' }}>Carbs (g)</label>
                            <input type="number" style={inputStyle} min="0"
                                value={form.carbGoal} onChange={e => set('carbGoal', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, color: '#a855f7' }}>Fat (g)</label>
                            <input type="number" style={inputStyle} min="0"
                                value={form.fatGoal} onChange={e => set('fatGoal', e.target.value)} />
                        </div>
                    </div>
                    <div style={{
                        marginTop: '1rem', padding: '0.85rem 1rem',
                        background: 'var(--muted-light)', borderRadius: 'var(--radius-sm)',
                    }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'var(--muted)' }}>
                            Macros from goals:{' '}
                            <strong style={{ color: 'var(--foreground)' }}>
                                {(parseInt(form.proteinGoal) || 0) * 4 + (parseInt(form.carbGoal) || 0) * 4 + (parseInt(form.fatGoal) || 0) * 9} kcal
                            </strong>
                            {' '}(P×4 + C×4 + F×9)
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={handleSave} disabled={saving}
                        className="btn-primary"
                        style={{ flex: 1, border: 'none', textAlign: 'center', opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                    >
                        {saving ? 'Saving...' : 'Save Goals'}
                    </button>
                    <button
                        onClick={() => router.push('/nutrition')}
                        style={{
                            padding: '0.75rem 1.5rem', border: '1px solid var(--card-border)',
                            borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                            fontWeight: 600, fontSize: '0.9rem', background: 'var(--card)',
                            color: 'var(--foreground)', cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
