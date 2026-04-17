'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Spinner from './Spinner'
import SignInModal from './SignInModal'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [returnTo, setReturnTo] = useState('')
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        setReturnTo(window.location.pathname)
    }, [])

    useEffect(() => {
        if (status === 'unauthenticated') setModalOpen(true)
    }, [status])

    if (status === 'loading') return <Spinner />

    if (!session) {
        return (
            <>
                <div style={{
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.25rem',
                    padding: '2rem',
                }}>
                    <span style={{ fontSize: '2.5rem' }}>🔒</span>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.4rem' }}>
                            Sign in to continue
                        </h2>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                            Create an account or sign in to access this page.
                        </p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="btn-primary"
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        Sign in
                    </button>
                </div>
                <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} returnTo={returnTo} />
            </>
        )
    }

    return <>{children}</>
}
