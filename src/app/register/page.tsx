'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
}

const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--foreground)',
    marginBottom: '0.4rem',
}

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleRegister = async () => {
        if (!email || !password) { toast.error('Email and password required'); return }
        if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); setLoading(false); return }
            setSent(true)
        } catch {
            toast.error('Failed to register')
            setLoading(false)
        }
    }

    const handleGoogle = () => signIn('google', { callbackUrl: '/recipes' })

    // Success state — show check your email screen
    if (sent) {
        return (
            <div style={{ maxWidth: 440, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.75rem' }}>
                    Check your email
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    We sent a verification link to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>. Click the link to activate your account and start cooking.
                </p>
                <div style={{
                    background: 'var(--primary-light)', border: '1px solid var(--primary)',
                    borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                    color: 'var(--primary)', marginBottom: '2rem', fontWeight: 500,
                }}>
                    The link expires in 24 hours. Check your spam folder if you don't see it.
                </div>
                <Link href="/login" style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                    color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
                }}>
                    ← Back to Sign In
                </Link>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '2rem' }}>🍽️</span>
                </Link>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', fontWeight: 700, color: 'var(--foreground)', marginTop: '0.75rem', marginBottom: '0.4rem' }}>
                    Create your account
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Join MealMate and start cooking smarter
                </p>
            </div>

            <div style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)', padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
            }}>
                {/* Google */}
                <button onClick={handleGoogle} style={{
                    width: '100%', border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.7rem',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                    background: 'white', color: 'var(--foreground)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.6rem',
                    transition: 'background 0.15s ease',
                }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                    <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16 }} alt="Google" />
                    Continue with Google
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
                </div>

                {/* Name */}
                <div>
                    <label style={labelStyle}>Name</label>
                    <input
                        style={inputStyle}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                {/* Email */}
                <div>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        style={inputStyle}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                </div>

                {/* Password */}
                <div>
                    <label style={labelStyle}>Password <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(min 8 characters)</span></label>
                    <input
                        type="password"
                        style={inputStyle}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                </div>

                {/* Submit */}
                <button onClick={handleRegister} disabled={loading} className="btn-primary" style={{
                    width: '100%', textAlign: 'center', border: 'none',
                    opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.25rem',
                }}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}