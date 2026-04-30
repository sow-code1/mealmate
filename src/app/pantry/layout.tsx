import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pantry & Inventory Manager',
    description: 'Track what you have at home, manage expiry dates, and auto-deduct ingredients when you log recipes.',
    alternates: { canonical: '/pantry' },
    openGraph: {
        title: 'Pantry & Inventory Manager | Caloracle',
        description: 'Track what you have at home and auto-deduct on meal logs.',
        type: 'website',
        url: '/pantry',
    },
}

export default function PantryLayout({ children }: { children: React.ReactNode }) {
    return children
}
