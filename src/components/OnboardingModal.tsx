'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const GOALS = [
    {
        value: 'lose_fat',
        emoji: '🔥',
        label: 'Lose Fat',
        desc: 'Calorie deficit, high protein',
        preview: '1,600 kcal · 160g protein',
    },
    {
        value: 'build_muscle',
        emoji: '💪',
        label: 'Build Muscle',
        desc: 'Calorie surplus, strength focus',
        preview: '2,600 kcal · 200g protein',
    },
    {
        value: 'maintain',
        emoji: '⚖️',
        label: 'Maintain',
        desc: 'Balanced macros, steady energy',
        preview: '2,000 kcal · 150g protein',
    },
]

interface Props {
    onComplete: () => void
}

export default function OnboardingModal({ onComplete }: Props) {
    const [selected, setSelected] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!selected) { toast.error('Please select a goal'); return }
        setSaving(true)
        try {
            await fetch('/api/user/onboarding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalType: selected }),
            })
            toast.success('Goals set! Your nutrition targets are ready.')
            onComplete()
        } catch {
            toast.error('Failed to save — please try again')
        } finally {
            setSaving(false)
        }
    }

    const handleSkip = async () => {
        await fetch('/api/user/onboarding', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goalType: null }),
        }).catch(() => {})
        onComplete()
    }

    return (
        <div className="modal-backdrop" style={{ zIndex: 2000 }}>
            <div className="modal-panel" style={{ maxWidth: 460, zIndex: 2001 }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>🎯</span>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.5rem', fontWeight: 700,
                        color: 'var(--foreground)',
                        marginTop: '0.6rem', marginBottom: '0.3rem',
                    }}>
                        What's your goal?
                    </h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: 'var(--muted)' }}>
                        We'll pre-fill your nutrition targets. You can always change them later.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {GOALS.map(goal => (
                        <button
                            key={goal.value}
                            onClick={() => setSelected(goal.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.1rem',
                                borderRadius: 'var(--radius)',
                                border: selected === goal.value
                                    ? '2px solid var(--primary)'
                                    : '1.5px solid var(--card-border)',
                                background: selected === goal.value ? 'var(--primary-light)' : 'var(--card)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{goal.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: selected === goal.value ? 'var(--primary)' : 'var(--foreground)' }}>
                                    {goal.label}
                                </div>
                                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                                    {goal.desc}
                                </div>
                            </div>
                            <div style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: selected === goal.value ? 'var(--primary)' : 'var(--muted)',
                                textAlign: 'right',
                                flexShrink: 0,
                                lineHeight: 1.4,
                            }}>
                                {goal.preview.split(' · ').map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={handleSave}
                        disabled={!selected || saving}
                        className="btn-primary"
                        style={{
                            flex: 1, border: 'none', textAlign: 'center',
                            opacity: !selected || saving ? 0.6 : 1,
                            cursor: !selected || saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? 'Saving…' : 'Set my goal'}
                    </button>
                    <button
                        onClick={handleSkip}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '0.85rem', color: 'var(--muted)',
                            background: 'none', border: 'none',
                            cursor: 'pointer', padding: '0.5rem',
                            transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    )
}
