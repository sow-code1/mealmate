'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const DAY_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

interface Props {
    isOpen: boolean
    onClose: () => void
    recipeId: number
    recipeTitle: string
}

export default function AddToMealPlanModal({ isOpen, onClose, recipeId, recipeTitle }: Props) {
    const [selectedDay, setSelectedDay] = useState('Monday')
    const [selectedMeal, setSelectedMeal] = useState('Dinner')
    const [mealPlanId, setMealPlanId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        fetch('/api/mealplan')
            .then(r => r.json())
            .then(data => setMealPlanId(data?.id ?? null))
            .catch(() => toast.error('Failed to load meal plan'))
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleAdd = async () => {
        if (!mealPlanId) { toast.error('Meal plan not found'); return }
        setSaving(true)
        try {
            const res = await fetch('/api/mealplan/slot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day: selectedDay, mealType: selectedMeal, recipeId, mealPlanId }),
            })
            if (!res.ok) throw new Error()
            toast.success(`Added to ${DAY_SHORT[selectedDay]} ${selectedMeal} 📅`)
            onClose()
        } catch {
            toast.error('Failed to add to meal plan')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
        >
            <div className="modal-panel" style={{ maxWidth: 400 }}>
                <button onClick={onClose} className="modal-close" aria-label="Close">✕</button>

                <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📅</span>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.35rem', fontWeight: 700,
                        color: 'var(--foreground)',
                        marginTop: '0.5rem', marginBottom: '0.25rem',
                    }}>
                        Add to Meal Plan
                    </h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)' }}>
                        {recipeTitle}
                    </p>
                </div>

                {/* Day picker */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                        Day
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
                        {DAYS.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                style={{
                                    padding: '0.45rem 0',
                                    borderRadius: 'var(--radius-sm)',
                                    border: selectedDay === day ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                                    background: selectedDay === day ? 'var(--primary-light)' : 'var(--card)',
                                    color: selectedDay === day ? 'var(--primary)' : 'var(--muted)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: '0.7rem',
                                    fontWeight: selectedDay === day ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s ease',
                                }}
                            >
                                {DAY_SHORT[day]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Meal type picker */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                        Meal
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {MEAL_TYPES.map(meal => (
                            <button
                                key={meal}
                                onClick={() => setSelectedMeal(meal)}
                                style={{
                                    padding: '0.6rem 0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: selectedMeal === meal ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                                    background: selectedMeal === meal ? 'var(--primary-light)' : 'var(--card)',
                                    color: selectedMeal === meal ? 'var(--primary)' : 'var(--foreground)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: '0.85rem',
                                    fontWeight: selectedMeal === meal ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s ease',
                                    textAlign: 'left',
                                }}
                            >
                                {meal}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    disabled={saving}
                    className="btn-primary"
                    style={{ width: '100%', textAlign: 'center', border: 'none', opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                    {saving ? 'Adding…' : `Add to ${DAY_SHORT[selectedDay]} ${selectedMeal}`}
                </button>
            </div>
        </div>
    )
}
