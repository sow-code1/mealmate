import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://main.dgicjir07hk6h.amplifyapp.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    const routes = [
        { path: '/', priority: 1.0, change: 'weekly' as const },
        { path: '/login', priority: 0.5, change: 'monthly' as const },
        { path: '/register', priority: 0.7, change: 'monthly' as const },
        { path: '/recipes', priority: 0.9, change: 'weekly' as const },
        { path: '/mealplan', priority: 0.9, change: 'weekly' as const },
        { path: '/grocery', priority: 0.8, change: 'weekly' as const },
        { path: '/pantry', priority: 0.8, change: 'weekly' as const },
        { path: '/nutrition', priority: 0.9, change: 'daily' as const },
    ]
    return routes.map(r => ({
        url: `${SITE_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.change,
        priority: r.priority,
    }))
}
