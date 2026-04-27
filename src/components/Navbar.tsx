'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import AdminModeToggle from '@/components/AdminModeToggle'
import SignInModal from '@/components/SignInModal'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [showSignInModal, setShowSignInModal] = useState(false)
    const { data: session } = useSession()
        const isAdmin = session?.user?.isAdmin === true

    const links = [
        { href: '/recipes', label: 'Recipes' },
        { href: '/mealplan', label: 'Meal Planner' },
        { href: '/grocery', label: 'Grocery List' },
        { href: '/pantry', label: 'Pantry' },
        { href: '/nutrition', label: 'Nutrition' },
        ...(isAdmin ? [
            { href: '/admin/users', label: 'Users' },
            { href: '/admin/hidden', label: 'Hidden' },
        ] : []),
    ]

    const handleProtectedClick = (e: React.MouseEvent, href: string) => {
        if (!session) {
            e.preventDefault()
            setMenuOpen(false)
            setShowSignInModal(true)
        }
    }

    return (
        <>
            <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--card-border)' }} className="px-6 py-0 sticky top-0 z-50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <span className="text-2xl">🍽️</span>
                        <span style={{
                            fontFamily: 'Playfair Display, serif',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: 'var(--primary)',
                            letterSpacing: '-0.01em'
                        }}>
                            Caloracle
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden sm:flex items-center gap-1">
                        {links.map(({ href, label }) => {
                            const isActive = pathname === href
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={(e) => handleProtectedClick(e, href)}
                                    className={`nav-link${isActive ? ' active' : ''}`}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right side */}
                    <div className="hidden sm:flex items-center gap-3">
                        {isAdmin && <AdminModeToggle />}
                        <ThemeToggle />
                        {session ? (
                            <div className="flex items-center gap-3">
                                <div style={{
                                    width: 32, height: 32,
                                    borderRadius: '50%',
                                    background: 'var(--primary-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 600, fontSize: '0.8rem',
                                    color: 'var(--primary)',
                                    fontFamily: 'DM Sans, sans-serif',
                                    flexShrink: 0,
                                }}>
                                    {(session.user?.name ?? session.user?.email ?? 'U')[0].toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {session.user?.name ?? session.user?.email}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    style={{
                                        fontSize: '0.85rem', color: 'var(--muted)',
                                        fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)',
                                        transition: 'color 0.15s ease',
                                    }}
                                    onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--danger)'}
                                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--muted)'}
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSignInModal(true)}
                                className="btn-primary"
                                style={{ padding: '0.45rem 1.1rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                            >
                                Sign in
                            </button>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button
                        className="sm:hidden flex flex-col gap-1.5 p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'transparent' : 'var(--foreground)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', borderRadius: 2 }} />
                        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--foreground)', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1, borderRadius: 2 }} />
                        <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'transparent' : 'var(--foreground)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', borderRadius: 2 }} />
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div style={{ borderTop: '1px solid var(--card-border)', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }} className="sm:hidden">
                        {links.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={(e) => {
                                    handleProtectedClick(e, href)
                                    if (session) setMenuOpen(false)
                                }}
                                style={{
                                    padding: '0.6rem 0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    color: pathname === href ? 'var(--primary)' : 'var(--foreground)',
                                    background: pathname === href ? 'var(--primary-light)' : 'transparent',
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    textDecoration: 'none',
                                }}
                            >
                                {label}
                            </Link>
                        ))}
                        {isAdmin && <div className="py-1"><AdminModeToggle /></div>}
                        <ThemeToggle variant="menu" />
                        {session ? (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--danger)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.95rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Sign out
                            </button>
                        ) : (
                            <button
                                onClick={() => { setMenuOpen(false); setShowSignInModal(true) }}
                                style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Sign in
                            </button>
                        )}
                    </div>
                )}
            </nav>

            <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} returnTo={pathname} />
        </>
    )
}
