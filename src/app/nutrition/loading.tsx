export default function NutritionLoading() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div className="skeleton" style={{ height: 32, width: 200 }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 'var(--radius-sm)' }} />
                    <div className="skeleton" style={{ height: 36, width: 120, borderRadius: 'var(--radius-sm)' }} />
                    <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 'var(--radius-sm)' }} />
                </div>
            </div>
            {/* Summary card skeleton */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 140, height: 140, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: '1rem' }} />
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <div className="skeleton" style={{ height: 13, width: 70 }} />
                                <div className="skeleton" style={{ height: 13, width: 50 }} />
                            </div>
                            <div className="skeleton" style={{ height: 8, borderRadius: 999 }} />
                        </div>
                    ))}
                </div>
            </div>
            {/* Food entries skeleton */}
            {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="skeleton" style={{ height: 16, width: 140, marginBottom: '0.4rem' }} />
                        <div className="skeleton" style={{ height: 13, width: 100 }} />
                    </div>
                    <div className="skeleton" style={{ height: 22, width: 60 }} />
                </div>
            ))}
        </div>
    )
}
