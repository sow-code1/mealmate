'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Spinner from '@/components/Spinner'
import AuthGuard from '@/components/AuthGuard'
import UnitSelect from '@/components/UnitSelect'

interface PantryItem {
    id: number
    name: string
    quantity: number
    unit: string | null
    category: string | null
    expiryDate: string | null
    haveAmount: number
    addedAt: string
    updatedAt: string
}

const CATEGORIES = ['Dairy', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Other']

export default function PantryPage() {
    return <AuthGuard><PantryContent /></AuthGuard>
}

function PantryContent() {
    const [items, setItems] = useState<PantryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'category' | 'expiry'>('name')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editQuantity, setEditQuantity] = useState('')

    const [form, setForm] = useState({
        name: '',
        quantity: '',
        unit: '',
        category: '',
        expiryDate: '',
    })

    useEffect(() => {
        fetch('/api/pantry')
            .then(r => r.json())
            .then(data => { setItems(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) { toast.error('Please enter an item name'); return }
        const qty = parseFloat(form.quantity)
        if (!form.quantity || isNaN(qty) || qty < 0.01) {
            toast.error('Please enter a valid amount')
            return
        }

        try {
            const res = await fetch('/api/pantry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    quantity: qty,
                    unit: form.unit || null,
                    category: form.category || null,
                    expiryDate: form.expiryDate || null,
                }),
            })
            if (res.ok) {
                const item = await res.json()
                setItems(prev => [...prev, item])
                setForm({ name: '', quantity: '', unit: '', category: '', expiryDate: '' })
                setShowAddForm(false)
                toast.success('Pantry item added')
            } else {
                toast.error('Failed to add item')
            }
        } catch {
            toast.error('Failed to add item')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await fetch(`/api/pantry/${id}`, { method: 'DELETE' })
            setItems(prev => prev.filter(i => i.id !== id))
        } catch {
            // Error handling
        }
    }

    const handleEditQuantity = async (id: number) => {
        if (!editQuantity) return

        try {
            const res = await fetch(`/api/pantry/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: editQuantity }),
            })
            if (res.ok) {
                const updated = await res.json()
                setItems(prev => prev.map(i => i.id === id ? updated : i))
                setEditingId(null)
                setEditQuantity('')
            }
        } catch {
            // Error handling
        }
    }

    const getExpiryStatus = (date: string | null) => {
        if (!date) return null
        const expiry = new Date(date)
        const today = new Date()
        const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= 0) return 'expired'
        if (daysUntil <= 3) return 'critical'
        if (daysUntil <= 7) return 'warning'
        return 'ok'
    }

    const filteredAndSorted = items
        .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '')
            if (sortBy === 'expiry') {
                if (!a.expiryDate && !b.expiryDate) return 0
                if (!a.expiryDate) return 1
                if (!b.expiryDate) return -1
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
            }
            return 0
        })

    const grouped = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = filteredAndSorted.filter(i => i.category === cat)
        return acc
    }, {} as Record<string, PantryItem[]>)

    const totalItems = items.length
    const lowStockCount = items.filter(i => i.quantity <= 1).length

    if (loading) return <Spinner />

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                        My Pantry
                    </h1>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {totalItems} items {lowStockCount > 0 && `· ${lowStockCount} low stock`}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: '0.5rem 1.1rem', border: 'none',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.82rem', color: 'white',
                        background: 'var(--primary)', cursor: 'pointer',
                    }}
                >
                    + Add Item
                </button>
            </div>

            {/* Add form */}
            {showAddForm && (
                <form onSubmit={handleSubmit} style={{
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Eggs"
                            required
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
                            Quantity *
                        </label>
                        <input
                            type="number"
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            value={form.quantity}
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                            placeholder="e.g. 12"
                            required
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
                            Unit
                        </label>
                        <UnitSelect
                            value={form.unit}
                            onChange={v => setForm({ ...form, unit: v })}
                            placeholder="Select unit"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            style={{
                                width: '100%', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                                fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                            }}
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                            Expiry Date <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                value={form.expiryDate}
                                onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                placeholder="No expiry date"
                                style={{
                                    width: '100%', border: '1px solid var(--card-border)',
                                    borderRadius: 'var(--radius-sm)', padding: '0.55rem 2rem 0.55rem 0.8rem',
                                    fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                                    color: form.expiryDate ? 'var(--foreground)' : 'var(--muted)',
                                    background: 'var(--background)', outline: 'none',
                                }}
                            />
                            {form.expiryDate && (
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, expiryDate: '' })}
                                    aria-label="Clear date"
                                    title="Clear date"
                                    style={{
                                        position: 'absolute',
                                        right: 6,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--muted)',
                                        fontSize: '1rem',
                                        lineHeight: 1,
                                        padding: '4px 6px',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <button
                            type="submit"
                            style={{
                                padding: '0.5rem 1.1rem', border: 'none',
                                borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                fontWeight: 600, fontSize: '0.82rem', color: 'white',
                                background: 'var(--primary)', cursor: 'pointer',
                            }}
                        >
                            Add Item
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            style={{
                                padding: '0.5rem 1.1rem', border: '1px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                                fontWeight: 600, fontSize: '0.82rem', color: 'var(--foreground)',
                                background: 'var(--card)', cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Search and sort */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: 200, border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                        fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                        color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                    }}
                />
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'name' | 'category' | 'expiry')}
                    style={{
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem',
                        fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
                        color: 'var(--foreground)', background: 'var(--background)', outline: 'none',
                    }}
                >
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                    <option value="expiry">Sort by Expiry</option>
                </select>
            </div>

            {/* Items grouped by category */}
            {Object.entries(grouped).map(([category, categoryItems]) => {
                if (categoryItems.length === 0) return null

                return (
                    <div key={category} style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif', fontSize: '1.25rem',
                            fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem',
                            paddingBottom: '0.5rem', borderBottom: '1px solid var(--card-border)',
                        }}>
                            {category}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {categoryItems.map(item => {
                                const expiryStatus = getExpiryStatus(item.expiryDate)
                                const isLowStock = item.quantity <= 1

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            background: 'var(--card)', border: '1px solid var(--card-border)',
                                            borderRadius: 'var(--radius)', padding: '1rem',
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            position: 'relative',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span style={{
                                                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                                                    fontWeight: 600, color: 'var(--foreground)',
                                                }}>
                                                    {item.name}
                                                </span>
                                                {isLowStock && (
                                                    <span style={{
                                                        background: '#fef3c7', color: '#92400e',
                                                        fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.4rem',
                                                        borderRadius: 999,
                                                    }}>
                                                        Low stock
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                                                {editingId === item.id ? (
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={editQuantity}
                                                        onChange={e => setEditQuantity(e.target.value)}
                                                        onBlur={() => handleEditQuantity(item.id)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                handleEditQuantity(item.id)
                                                            }
                                                        }}
                                                        autoFocus
                                                        style={{
                                                            width: 80, border: '1px solid var(--primary)',
                                                            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem',
                                                            fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
                                                            outline: 'none',
                                                        }}
                                                    />
                                                ) : (
                                                    <>
                                                        <span onClick={() => { setEditingId(item.id); setEditQuantity(String(item.quantity)) }}
                                                            style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                                            {item.quantity}
                                                        </span>
                                                        {item.unit && <span>{item.unit}</span>}
                                                    </>
                                                )}
                                                {item.expiryDate && (
                                                    <>
                                                        <span>·</span>
                                                        <span style={{
                                                            color: expiryStatus === 'expired' ? 'var(--danger)' :
                                                                   expiryStatus === 'critical' ? '#ea580c' :
                                                                   expiryStatus === 'warning' ? '#d97706' : 'var(--muted)',
                                                        }}>
                                                            {new Date(item.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--muted)', fontSize: '1.1rem', padding: '0.25rem',
                                                transition: 'color 0.15s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted)'}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {filteredAndSorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📦</div>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {search ? 'No items found' : 'Your pantry is empty'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            style={{ marginTop: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
                        >
                            Add your first item
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
