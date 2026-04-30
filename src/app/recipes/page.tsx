export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Recipe Library',
    description: 'Browse, save, and organize your recipes with auto-calculated nutrition, dietary tags, and category filters.',
    alternates: { canonical: '/recipes' },
    openGraph: {
        title: 'Recipe Library | Caloracle',
        description: 'Browse, save, and organize your recipes with nutrition data.',
        type: 'website',
        url: '/recipes',
    },
}
import { prisma } from '@/lib/prisma'
import RecipesBrowser from '@/components/RecipesBrowser'
import { auth } from '@/auth'
import { cookies } from 'next/headers'

export default async function RecipesPage() {
    const session = await auth()
        const isAdmin = session?.user?.isAdmin === true
    const cookieStore = await cookies()
    const adminMode = isAdmin && cookieStore.get('adminMode')?.value === 'true'

    const recipes = await prisma.recipe.findMany({
        where: adminMode ? {
            userId: { not: null },
            copiedFromPreset: false,
            deleted: false,
        } : {
            userId: session!.user!.id,
            deleted: false,
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                        Recipes {adminMode && <span style={{ fontSize: '0.85rem', color: '#9333ea', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, marginLeft: '0.5rem' }}>⚙️ Admin mode</span>}
                    </h1>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        {adminMode ? 'Viewing all user-created recipes' : 'Your personal recipe collection'}
                    </p>
                </div>
                <Link href="/recipes/new" className="btn-primary">
                    + Add Recipe
                </Link>
            </div>
            <RecipesBrowser recipes={recipes} />
        </div>
    )
}