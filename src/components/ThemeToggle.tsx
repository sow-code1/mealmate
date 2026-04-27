'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'menu' }) {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const isDark = mounted && resolvedTheme === 'dark'
    const toggle = () => setTheme(isDark ? 'light' : 'dark')
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

    if (variant === 'menu') {
        return (
            <button
                onClick={toggle}
                aria-label={label}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    textAlign: 'left', padding: '0.6rem 0.75rem',
                    color: 'var(--foreground)',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.95rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                }}
            >
                <span className="theme-toggle-icon" aria-hidden style={{ display: 'inline-flex', width: 18, height: 18 }}>
                    {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : null}
                </span>
                {mounted ? (isDark ? 'Light mode' : 'Dark mode') : 'Theme'}
            </button>
        )
    }

    return (
        <button
            onClick={toggle}
            aria-label={label}
            title={label}
            style={{
                width: 36, height: 36,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--muted)',
                cursor: 'pointer',
                transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
                flexShrink: 0,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--primary)'
                e.currentTarget.style.background = 'var(--muted-light)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.background = 'transparent'
            }}
        >
            <span
                style={{
                    display: 'inline-flex',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
                    transform: mounted ? 'rotate(0deg)' : 'rotate(-45deg)',
                    opacity: mounted ? 1 : 0,
                }}
                key={isDark ? 'moon' : 'sun'}
            >
                {mounted ? (isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />) : <span style={{ width: 16, height: 16 }} />}
            </span>
        </button>
    )
}
