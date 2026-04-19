'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

    useEffect(() => {
        const verified = searchParams.get('verified')
        const error = searchParams.get('error')

        if (verified === 'true') {
            setBanner({ type: 'success', message: '✅ Email verified! You can now sign in.' })
        } else if (error === 'invalid-token') {
            setBanner({ type: 'error', message: '❌ Invalid or already used verification link.' })
        } else if (error === 'token-expired') {
            setBanner({ type: 'error', message: '❌ Verification link expired. Please register again.' })
        } else if (error === 'server-error') {
            setBanner({ type: 'error', message: '❌ Something went wrong. Please try again.' })
        }
    }, [searchParams])

    const handleLogin = async () => {
        if (!email || !password) { toast.error('Please enter your email and password'); return }
        setLoading(true)
        const result = await signIn('credentials', { email, password, redirect: false })
        setLoading(false)

        if (result?.error) {
            // Check if it's unverified — we return null from authorize() which gives CredentialsSignin error
            setBanner({ type: 'info', message: '📧 Invalid credentials or email not verified. Check your inbox.' })
        } else {
            toast.success('Welcome back!')
            router.push('/recipes')
        }
    }

    const handleGoogle = () => signIn('google', { callbackUrl: '/recipes' })

    const bannerColors = {
        success: { bg: 'var(--primary-light)', border: 'var(--primary)', color: 'var(--primary)' },
        error: { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626' },
        info: { bg: '#fdf3eb', border: '#f6ad55', color: '#c05621' },
    }

    return (
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '2rem' }}>🍽️</span>
                </Link>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', fontWeight: 700, color: 'var(--foreground)', marginTop: '0.75rem', marginBottom: '0.4rem' }}>
                    Welcome back
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Sign in to your Caloracle account
                </p>
            </div>

            {banner && (
                <div style={{
                    background: bannerColors[banner.type].bg,
                    border: `1px solid ${bannerColors[banner.type].border}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.875rem',
                    color: bannerColors[banner.type].color,
                    fontWeight: 500,
                }}>
                    {banner.message}
                </div>
            )}

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

                {/* Email */}
                <div>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        style={inputStyle}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="you@example.com"
                    />
                </div>

                {/* Password */}
                <div>
                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        style={inputStyle}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="••••••••"
                    />
                </div>

                {/* Submit */}
                <button onClick={handleLogin} disabled={loading} className="btn-primary" style={{
                    width: '100%', textAlign: 'center', border: 'none',
                    opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.25rem',
                }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                    Don't have an account?{' '}
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}