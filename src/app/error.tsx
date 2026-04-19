'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.75rem' }}>
                Something went wrong
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                An unexpected error occurred. Please try again.
            </p>
            <button
                onClick={reset}
                className="btn-primary"
                style={{ border: 'none', cursor: 'pointer' }}
            >
                Try again
            </button>
        </div>
    )
}
