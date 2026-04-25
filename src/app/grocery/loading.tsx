export default function GroceryLoading() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <div className="skeleton" style={{ height: 32, width: 180, marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: 16, width: 260 }} />
                </div>
                <div className="skeleton" style={{ height: 40, width: 140, borderRadius: 'var(--radius-sm)' }} />
            </div>
            {[1, 2, 3].map(section => (
                <div key={section} style={{ marginBottom: '2rem' }}>
                    <div className="skeleton" style={{ height: 20, width: 120, marginBottom: '1rem' }} />
                    {Array.from({ length: 3 + section }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid var(--card-border)' }}>
                            <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
                            <div className="skeleton" style={{ height: 15, width: `${50 + Math.random() * 30}%` }} />
                            <div className="skeleton" style={{ height: 15, width: 60, marginLeft: 'auto' }} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
