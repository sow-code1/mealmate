export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            padding: '2rem',
        }}>
            <div style={{
                width: 40,
                height: 40,
                border: '3px solid var(--card-border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
        </div>
    )
}
