export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DeleteUserButton from '@/components/DeleteUserButton'

export default async function AdminUsersPage() {
    const session = await auth()
        if (!session.user.isAdmin) redirect('/')

    const users = await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isAdmin: true,
            _count: { select: { recipes: true } },
        },
    })

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                Users
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                {users.length} active account{users.length !== 1 ? 's' : ''}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map((user) => (
                    <div key={user.id} style={{
                        background: 'var(--card)', border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        boxShadow: 'var(--shadow-sm)',
                    }}>
                        {user.image ? (
                            <img src={user.image} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} alt="" />
                        ) : (
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--primary-light)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.9rem',
                                color: 'var(--primary)',
                            }}>
                                {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>
                                    {user.name ?? 'No name'}
                                </span>
                                {user.isAdmin && (
                                    <span style={{
                                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600,
                                        background: '#f3e8ff', color: '#9333ea',
                                        padding: '0.15rem 0.5rem', borderRadius: 999,
                                    }}>
                                        Admin
                                    </span>
                                )}
                            </div>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)' }}>
                                {user.email}
                            </span>
                        </div>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {user._count.recipes} recipe{user._count.recipes !== 1 ? 's' : ''}
                        </span>
                        {!user.isAdmin && (
                            <DeleteUserButton userId={user.id} userName={user.name ?? user.email ?? 'this user'} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
