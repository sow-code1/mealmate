'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

const OTP_LENGTH = 6

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    // OTP state
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
    const [verifying, setVerifying] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    // Auto-focus first OTP box when switching to the code screen
    useEffect(() => {
        if (sent) {
            setResendCooldown(60)
            setTimeout(() => inputRefs.current[0]?.focus(), 100)
        }
    }, [sent])

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

    const handleVerify = async (code: string) => {
        if (code.length !== OTP_LENGTH) return
        setVerifying(true)
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error)
                setOtp(Array(OTP_LENGTH).fill(''))
                inputRefs.current[0]?.focus()
            } else {
                toast.success('Email verified! Signing you in...')
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                })
                if (result?.ok) {
                    router.push('/recipes')
                } else {
                    // Fallback: redirect to login if auto sign-in fails
                    router.push('/login?verified=true')
                }
            }
        } catch {
            toast.error('Verification failed')
        }
        setVerifying(false)
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            if (res.ok) {
                toast.success('New code sent!')
                setResendCooldown(60)
                setOtp(Array(OTP_LENGTH).fill(''))
                inputRefs.current[0]?.focus()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Failed to resend')
            }
        } catch {
            toast.error('Failed to resend code')
        }
    }

    // OTP input handlers
    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)

        // Auto-advance to next box
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all digits filled
        const fullCode = newOtp.join('')
        if (fullCode.length === OTP_LENGTH) {
            handleVerify(fullCode)
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
        if (!pasted) return
        const newOtp = Array(OTP_LENGTH).fill('')
        pasted.split('').forEach((char, i) => { newOtp[i] = char })
        setOtp(newOtp)
        // Focus last filled or submit
        const lastIndex = Math.min(pasted.length, OTP_LENGTH) - 1
        inputRefs.current[lastIndex]?.focus()
        if (pasted.length === OTP_LENGTH) {
            handleVerify(pasted)
        }
    }

    const handleGoogle = () => signIn('google', { callbackUrl: '/recipes' })

    // OTP verification screen
    if (sent) {
        return (
            <div style={{ maxWidth: 440, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔐</div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.75rem' }}>
                    Enter verification code
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    We sent a 6-digit code to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>
                </p>

                {/* OTP Input Boxes */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '0.5rem',
                    marginBottom: '1.5rem',
                }}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            onPaste={i === 0 ? handleOtpPaste : undefined}
                            disabled={verifying}
                            style={{
                                width: '3rem',
                                height: '3.5rem',
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                fontFamily: "'Courier New', monospace",
                                color: 'var(--primary)',
                                border: digit ? '2px solid var(--primary)' : '1.5px solid var(--card-border)',
                                borderRadius: 'var(--radius-sm)',
                                background: digit ? 'var(--primary-light)' : 'var(--background)',
                                outline: 'none',
                                transition: 'all 0.15s ease',
                                opacity: verifying ? 0.6 : 1,
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,107,69,0.12)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = digit ? 'var(--primary)' : 'var(--card-border)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                    ))}
                </div>

                {/* Verifying indicator */}
                {verifying && (
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 500 }}>
                        Verifying...
                    </p>
                )}

                {/* Expiry & resend info */}
                <div style={{
                    background: 'var(--primary-light)', border: '1px solid var(--primary)',
                    borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                    color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 500,
                }}>
                    Code expires in 10 minutes. Check your spam folder if you don&apos;t see it.
                </div>

                {/* Resend button */}
                <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    style={{
                        background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                        color: resendCooldown > 0 ? 'var(--muted)' : 'var(--primary)',
                        fontWeight: 600, padding: '0.5rem', marginBottom: '1rem',
                    }}
                >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>

                <br />
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
                    Join Caloracle and start cooking smarter
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
                    background: 'var(--card)', color: 'var(--foreground)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.6rem',
                    transition: 'background 0.15s ease',
                }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
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