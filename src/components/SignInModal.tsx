'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Props {
    isOpen: boolean
    onClose: () => void
}

const inputStyle: React.CSSProperties = {
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

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    color: 'var(--foreground)',
    marginBottom: '0.4rem',
}

export default function SignInModal({ isOpen, onClose }: Props) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const backdropRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        if (!isOpen) { setEmail(''); setPassword(''); setError(null) }
    }, [isOpen])

    if (!isOpen) return null

    const handleLogin = async () => {
        if (!email || !password) { toast.error('Please enter your email and password'); return }
        setLoading(true)
        setError(null)
        const result = await signIn('credentials', { email, password, redirect: false })
        setLoading(false)
        if (result?.error) {
            setError('Invalid credentials or email not verified. Check your inbox.')
        } else {
            toast.success('Welcome back!')
            onClose()
            window.location.href = '/recipes'
        }
    }

    const handleGoogle = () => signIn('google', { callbackUrl: '/recipes' })

    return (
        <div
            ref={backdropRef}
            onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
            className="modal-backdrop"
        >
            <div className="modal-panel">
                <button onClick={onClose} className="modal-close" aria-label="Close">✕</button>

                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🍽️</span>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.6rem', fontWeight: 700,
                        color: 'var(--foreground)',
                        marginTop: '0.6rem', marginBottom: '0.3rem',
                    }}>
                        Welcome back
                    </h2>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.875rem' }}>
                        Sign in to access your recipes
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fdf3eb', border: '1px solid #f6ad55',
                        borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                        marginBottom: '1rem', fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.875rem', color: '#c05621', fontWeight: 500,
                    }}>
                        📧 {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={handleGoogle} className="google-btn">
                        <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16 }} alt="" />
                        Continue with Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email" style={inputStyle} value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="you@example.com" autoComplete="email"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password" style={inputStyle} value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="••••••••" autoComplete="current-password"
                        />
                    </div>

                    <button
                        onClick={handleLogin} disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%', textAlign: 'center', border: 'none',
                            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                        Don't have an account?{' '}
                        <Link href="/register" onClick={onClose} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
