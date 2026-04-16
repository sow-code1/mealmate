'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Light', desc: '1–3 days/week exercise' },
    { value: 'moderate', label: 'Moderate', desc: '3–5 days/week exercise' },
    { value: 'active', label: 'Active', desc: '6–7 days/week exercise' },
    { value: 'very_active', label: 'Very Active', desc: 'Intense daily training' },
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

export default function NutritionGoalsPage() {
    const { status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [status, router])

    const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

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
                Set your daily calorie and macro targets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                            Typical ranges: 1200–1500 (weight loss) · 1800–2200 (maintenance) · 2500–3500 (muscle gain)
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
                            Macros from your goals:{' '}
                            <strong style={{ color: 'var(--foreground)' }}>
                                {(parseInt(form.proteinGoal) || 0) * 4 + (parseInt(form.carbGoal) || 0) * 4 + (parseInt(form.fatGoal) || 0) * 9} kcal
                            </strong>
                            {' '}(P×4 + C×4 + F×9)
                        </p>
                    </div>
                </div>

                {/* Activity level */}
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
                                    background: form.activityLevel === level.value ? 'var(--primary)' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {form.activityLevel === level.value && (
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
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
