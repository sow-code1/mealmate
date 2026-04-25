export default function RecipeSkeleton() {
    return (
        <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
        }}>
            <div style={{ height: 4, background: 'var(--card-border)' }} />
            <div className="skeleton" style={{ height: 180, borderRadius: 0 }} />
            <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
                <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: '0.55rem' }} />
                <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: '0.3rem' }} />
                <div className="skeleton" style={{ height: 13, width: '55%', marginBottom: '0.9rem' }} />
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.9rem' }}>
                    <div className="skeleton" style={{ height: 20, width: 52, borderRadius: 999 }} />
                    <div className="skeleton" style={{ height: 20, width: 44, borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
                    <div className="skeleton" style={{ height: 13, width: 68 }} />
                    <div className="skeleton" style={{ height: 13, width: 80 }} />
                </div>
            </div>
        </div>
    )
}
