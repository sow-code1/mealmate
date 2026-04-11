'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const pathname = usePathname()

    const links = [
        { href: '/recipes', label: 'Recipes' },
        { href: '/mealplan', label: 'Meal Planner' },
        { href: '/grocery', label: 'Grocery List' },
    ]

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-green-600">
                    🍽️ MealMate
                </Link>
                <div className="flex gap-6">
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`font-medium transition-colors ${
                                pathname === href
                                    ? 'text-green-600'
                                    : 'text-gray-600 hover:text-green-600'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}