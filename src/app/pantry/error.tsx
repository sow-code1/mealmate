'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            padding: '2rem',
            textAlign: 'center',
        }}>
            <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                marginBottom: '0.5rem',
            }}>
                Something went wrong!
            </h2>
            <p style={{
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--muted)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
            }}>
                Failed to load your pantry items.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                    onClick={reset}
                    style={{
                        padding: '0.5rem 1rem', border: 'none',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.875rem', color: 'white',
                        background: 'var(--primary)', cursor: 'pointer',
                    }}
                >
                    Try again
                </button>
                <Link
                    href="/pantry"
                    style={{
                        padding: '0.5rem 1rem', border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)',
                        background: 'var(--card)', cursor: 'pointer', textDecoration: 'none',
                    }}
                >
                    Go to Pantry
                </Link>
            </div>
        </div>
    )
}
