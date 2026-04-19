import Link from 'next/link'

export default function NotFound() {
    return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '8rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1 }}>
                404
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                Page not found
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/" className="btn-primary">
                Go Home
            </Link>
        </div>
    )
}