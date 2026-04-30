import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Smart Grocery List',
    description: 'Auto-aggregated grocery list pulled from your weekly meal plan, with pantry deduction and "still need" calculations.',
    alternates: { canonical: '/grocery' },
    openGraph: {
        title: 'Smart Grocery List | Caloracle',
        description: 'Auto-aggregated grocery list from your meal plan.',
        type: 'website',
        url: '/grocery',
    },
}

export default function GroceryLayout({ children }: { children: React.ReactNode }) {
    return children
}
