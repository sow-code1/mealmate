import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Daily Nutrition Log',
    description: 'Log meals, track daily calories and macros, hit your nutrition goals with Caloracle.',
    alternates: { canonical: '/nutrition' },
    openGraph: {
        title: 'Daily Nutrition Log | Caloracle',
        description: 'Log meals, track daily calories and macros, hit your nutrition goals.',
        type: 'website',
        url: '/nutrition',
    },
}

export default function NutritionLayout({ children }: { children: React.ReactNode }) {
    return children
}
