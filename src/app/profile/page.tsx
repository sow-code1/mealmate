'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'
import AuthGuard from '@/components/AuthGuard'

interface UserStats {
    totalRecipes: number
    totalMealPlans: number
    totalDaysLogged: number
}

interface UserGoal {
    calorieGoal: number
    proteinGoal: number
    carbGoal: number
    fatGoal: number
}

export default function ProfilePage() {
    return <AuthGuard><ProfileContent /></AuthGuard>
}

function ProfileContent() {
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<UserStats | null>(null)
    const [goal, setGoal] = useState<UserGoal | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [savingName, setSavingName] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [deleting, setDeleting] = useState(false)

    const [goalForm, setGoalForm] = useState({
        calorieGoal: '',
        proteinGoal: '',
        carbGoal: '',
        fatGoal: '',
    })

    useEffect(() => {
        if (!session?.user?.id) return

        Promise.all([
            fetch('/api/user/stats').then(r => r.json()),
            fetch('/api/nutrition/goals').then(r => r.json()),
        ]).then(([statsData, goalData]) => {
            setStats(statsData)
            setGoal(goalData)
            setDisplayName(session.user?.name || '')
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [session])

    const handleSaveName = async () => {
        if (!displayName.trim()) return

        setSavingName(true)
        try {
            const res = await fetch('/api/user/name', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: displayName }),
            })
            if (res.ok) {
                toast.success('Name updated')
                setEditingName(false)
            }
        } catch {
            toast.error('Failed to update name')
        } finally {
            setSavingName(false)
        }
    }

    const handleSaveGoals = async () => {
        try {
            const res = await fetch('/api/nutrition/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calorieGoal: parseInt(goalForm.calorieGoal) || 2000,
                    proteinGoal: parseInt(goalForm.proteinGoal) || 150,
                    carbGoal: parseInt(goalForm.carbGoal) || 200,
                    fatGoal: parseInt(goalForm.fatGoal) || 65,
                }),
            })
            if (res.ok) {
                const updated = await res.json()
                setGoal(updated)
                toast.success('Goals updated')
            }
        } catch {
            toast.error('Failed to update goals')
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm')
            return
        }

        setDeleting(true)
        try {
            const res = await fetch('/api/user/delete-account', {
                method: 'DELETE',
            })
            if (res.ok) {
                toast.success('Account deleted')
                await signOut({ callbackUrl: '/' })
            }
        } catch {
            toast.error('Failed to delete account')
        } finally {
            setDeleting(false)
        }
    }

    if (status === 'loading' || loading) return <Spinner />

    if (!session) return null

    const initials = (session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
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
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                Profile
            </h1>

            {/* Profile info */}
            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '2rem', marginBottom: '2rem',
                display: 'flex', gap: '2rem', alignItems: 'flex-start',
            }}>
                {/* Avatar */}
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 700, color: 'var(--primary)',
                    flexShrink: 0,
                }}>
                    {session.user?.image ? (
                        <img
                            src={session.user.image}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        initials
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {editingName ? (
                        <>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveName() } }}
                                autoFocus
                                style={{
                                    fontSize: '1.1rem', fontWeight: 600,
                                    fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)',
                                    background: 'var(--background)', border: '1px solid var(--primary)',
                                    borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem',
                                    outline: 'none',
                                }}
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={savingName}
                                style={{
                                    padding: '0.4rem 0.8rem', border: 'none',
                                    borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                    fontWeight: 600, fontSize: '0.8rem', color: 'white',
                                    background: 'var(--primary)', cursor: savingName ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {savingName ? 'Saving...' : 'Save'}
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 style={{
                                fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem',
                                fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem',
                            }}>
                                {session.user?.name || 'No name set'}
                            </h2>
                            <button
                                onClick={() => setEditingName(true)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
                                    color: 'var(--primary)', textDecoration: 'underline',
                                    padding: 0,
                                }}
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: 'var(--muted)' }}>
                    {session.user?.email || 'No email'}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Member since {(session.user as { createdAt?: string })?.createdAt ? new Date((session.user as { createdAt?: string }).createdAt!).toLocaleDateString() : 'Unknown'}
                </p>
                </div>
            </div>

            {/* Stats */}
            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem',
            }}>
                <h3 style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.1rem',
                    fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem',
                }}>
                    Your Stats
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ background: 'var(--muted-light)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                            {stats?.totalRecipes || 0}
                        </div>
                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Recipes Created
                        </div>
                    </div>
                    <div style={{ background: 'var(--muted-light)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                            {stats?.totalMealPlans || 0}
                        </div>
                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Meal Plans
                        </div>
                    </div>
                    <div style={{ background: 'var(--muted-light)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                            {stats?.totalDaysLogged || 0}
                        </div>
                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Days Logged
                        </div>
                    </div>
                </div>
            </div>

            {/* Nutrition Goals */}
            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem',
            }}>
                <h3 style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.1rem',
                    fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem',
                }}>
                    Nutrition Goals
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Daily Calories
                        </label>
                        <input
                            type="number"
                            value={goalForm.calorieGoal}
                            onChange={e => setGoalForm({ ...goalForm, calorieGoal: e.target.value })}
                            placeholder="2000"
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                                fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Protein (g)
                        </label>
                        <input
                            type="number"
                            value={goalForm.proteinGoal}
                            onChange={e => setGoalForm({ ...goalForm, proteinGoal: e.target.value })}
                            placeholder="150"
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                                fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Carbs (g)
                        </label>
                        <input
                            type="number"
                            value={goalForm.carbGoal}
                            onChange={e => setGoalForm({ ...goalForm, carbGoal: e.target.value })}
                            placeholder="200"
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                                fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Fat (g)
                        </label>
                        <input
                            type="number"
                            value={goalForm.fatGoal}
                            onChange={e => setGoalForm({ ...goalForm, fatGoal: e.target.value })}
                            placeholder="65"
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                                fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSaveGoals}
                    style={{
                        padding: '0.5rem 1rem', border: 'none',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.875rem', color: 'white',
                        background: 'var(--primary)', cursor: 'pointer',
                    }}
                >
                    Save Goals
                </button>
            </div>

            {/* Danger Zone */}
            <div style={{
                background: '#fef2f2', border: '1px solid #dc2626',
                borderRadius: 'var(--radius)', padding: '1.5rem',
            }}>
                <h3 style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.1rem',
                    fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem',
                }}>
                    Danger Zone
                </h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '1rem' }}>
                    Once you delete your account, all your data will be permanently removed and cannot be recovered.
                </p>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        padding: '0.5rem 1rem', border: '1px solid #dc2626',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.875rem', color: 'var(--danger)',
                        background: 'var(--card)', cursor: 'pointer',
                    }}
                >
                    Delete Account
                </button>

                {showDeleteConfirm && (
                    <div style={{
                        marginTop: '1rem', padding: '1rem',
                        background: 'var(--card)', borderRadius: 'var(--radius-sm)',
                    }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '0.75rem' }}>
                            Type <strong>DELETE</strong> to confirm account deletion:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                                fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)',
                                outline: 'none', textTransform: 'uppercase',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: '0.4rem 0.8rem', border: '1px solid var(--card-border)',
                                    borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                    fontSize: '0.8rem', color: 'var(--foreground)',
                                    background: 'var(--card)', cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || deleteConfirmText !== 'DELETE'}
                                style={{
                                    padding: '0.4rem 0.8rem', border: 'none',
                                    borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                    fontSize: '0.8rem', color: 'white',
                                    background: 'var(--danger)', cursor: deleting || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {deleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
