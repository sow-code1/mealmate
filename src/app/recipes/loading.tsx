import RecipeSkeleton from '@/components/RecipeSkeleton'

export default function RecipesLoading() {
    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <div className="skeleton" style={{ height: 32, width: 160, marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: 16, width: 220 }} />
                </div>
                <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div className="skeleton" style={{ height: 42, borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {[80, 50, 80, 60, 65, 75, 80].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 32, width: w, borderRadius: 999 }} />
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <RecipeSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}
