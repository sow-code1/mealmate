'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const { data: session } = useSession()
    // @ts-ignore
    const isAdmin = session?.user?.isAdmin === true

    const links = [
        { href: '/recipes', label: 'Recipes' },
        { href: '/mealplan', label: 'Meal Planner' },
        { href: '/grocery', label: 'Grocery List' },
        ...(isAdmin ? [{ href: '/admin/hidden', label: '⚙️ Admin' }] : []),
    ]

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-green-600">
                    🍽️ MealMate
                </Link>

                <div className="hidden sm:flex items-center gap-6">
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`font-medium transition-colors ${
                                pathname === href ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{session.user?.name ?? session.user?.email}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-sm text-red-500 hover:text-red-700 font-medium"
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                            Sign in
                        </Link>
                    )}
                </div>

                <button
                    className="sm:hidden text-gray-600 hover:text-green-600"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {menuOpen && (
                <div className="sm:hidden mt-4 flex flex-col gap-3 pb-2">
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className={`font-medium px-2 py-1 transition-colors ${
                                pathname === href ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                    {session ? (
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-left px-2 py-1 text-sm text-red-500 font-medium"
                        >
                            Sign out
                        </button>
                    ) : (
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="px-2 py-1 text-green-600 font-medium">
                            Sign in
                        </Link>
                    )}
                </div>
            )}
        </nav>
    )
}