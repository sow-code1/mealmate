'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

const inputStyle = {
    width: '100%',
    border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.85rem',
    fontSize: '0.9rem',
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--foreground)',
    background: 'var(--background)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
}

const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--foreground)',
    marginBottom: '0.4rem',
    letterSpacing: '0.01em',
}

export default function NewRecipePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [form, setForm] = useState({
        title: '', description: '', category: '',
        prepTime: '', cookTime: '', servings: '', tags: '',
    })
    const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }])
    const [steps, setSteps] = useState([{ instruction: '' }])

    const updateIngredient = (i: number, field: string, value: string) => {
        const updated = [...ingredients]
        updated[i] = { ...updated[i], [field]: value }
        setIngredients(updated)
    }

    const updateStep = (i: number, value: string) => {
        const updated = [...steps]
        updated[i].instruction = value
        setSteps(updated)
    }

    const handleSubmit = async () => {
        if (!form.title) { toast.error('Title is required'); return }
        setLoading(true)
        try {
            await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    imageUrl,
                    prepTime: parseInt(form.prepTime) || 0,
                    cookTime: parseInt(form.cookTime) || 0,
                    servings: parseInt(form.servings) || 0,
                    ingredients,
                    steps: steps.map((s, i) => ({ ...s, order: i + 1 })),
                }),
            })
            toast.success('Recipe created!')
            router.push('/recipes')
        } catch {
            toast.error('Failed to create recipe')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
            <button onClick={() => router.push('/recipes')} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                color: 'var(--muted)', textDecoration: 'none',
                marginBottom: '1.75rem', transition: 'color 0.15s ease',
            }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
                ← Back to Recipes
            </button>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                Add New Recipe
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Fill in the details below to add a recipe to your collection.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                {/* Image upload */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <label style={labelStyle}>Recipe Photo <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                    <ImageUpload onUpload={(url) => setImageUrl(url)} />
                </div>

                {/* Basic info */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>Basic Info</h2>
                    <div>
                        <label style={labelStyle}>Title *</label>
                        <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Honey Garlic Chicken" />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short description of the recipe..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option value="">Select category</option>
                                {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'].map(c => (
                                    <option key={c} value={c.toLowerCase()}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Servings</label>
                            <input type="number" style={inputStyle} value={form.servings} onChange={(e) => setForm({ ...form, servings: e.target.value })} placeholder="4" />
                        </div>
                        <div>
                            <label style={labelStyle}>Prep Time (min)</label>
                            <input type="number" style={inputStyle} value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} placeholder="15" />
                        </div>
                        <div>
                            <label style={labelStyle}>Cook Time (min)</label>
                            <input type="number" style={inputStyle} value={form.cookTime} onChange={(e) => setForm({ ...form, cookTime: e.target.value })} placeholder="30" />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Dietary Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma separated)</span></label>
                        <input style={inputStyle} placeholder="vegetarian, gluten-free, high-protein" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                    </div>
                </div>

                {/* Ingredients */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>Ingredients</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {ingredients.map((ing, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input style={{ ...inputStyle, width: 80 }} placeholder="Amt" value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)} />
                                <input style={{ ...inputStyle, width: 75 }} placeholder="Unit" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} />
                                <input style={{ ...inputStyle, flex: 1 }} placeholder="Ingredient name" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} />
                                {ingredients.length > 1 && (
                                    <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem', lineHeight: 1 }}>×</button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setIngredients([...ingredients, { name: '', amount: '', unit: '' }])} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                        + Add ingredient
                    </button>
                </div>

                {/* Steps */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>Steps</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', flexShrink: 0, marginTop: 6 }}>
                                    {i + 1}
                                </div>
                                <textarea style={{ ...inputStyle, flex: 1, resize: 'vertical' }} rows={2} placeholder="Describe this step..." value={step.instruction} onChange={(e) => updateStep(i, e.target.value)} />
                                {steps.length > 1 && (
                                    <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem', marginTop: 6, lineHeight: 1 }}>×</button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setSteps([...steps, { instruction: '' }])} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                        + Add step
                    </button>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1, textAlign: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
                        {loading ? 'Saving...' : 'Save Recipe'}
                    </button>
                    <button onClick={() => router.push('/recipes')} style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}