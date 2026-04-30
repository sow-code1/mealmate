import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Weekly Meal Planner',
    description: 'Plan breakfast, lunch, dinner, and snacks for the week with drag-and-drop meal planning and auto grocery lists.',
    alternates: { canonical: '/mealplan' },
    openGraph: {
        title: 'Weekly Meal Planner | Caloracle',
        description: 'Plan breakfast, lunch, dinner, and snacks for the week.',
        type: 'website',
        url: '/mealplan',
    },
}

export default function MealPlanLayout({ children }: { children: React.ReactNode }) {
    return children
}
