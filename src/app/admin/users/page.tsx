export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DeleteUserButton from '@/components/DeleteUserButton'

export default async function AdminUsersPage() {
    const session = await auth()
    // @ts-ignore
    if (!session?.user?.isAdmin) redirect('/')

    const users = await prisma.user.findMany({
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
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-gray-500 text-sm mb-8">{users.length} total accounts</p>

            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                        {user.image ? (
                            <img src={user.image} className="w-10 h-10 rounded-full" alt="" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{user.name ?? 'No name'}</span>
                                {user.isAdmin && (
                                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Admin</span>
                                )}
                            </div>
                            <span className="text-sm text-gray-400">{user.email}</span>
                        </div>
                        <span className="text-sm text-gray-400 mr-4">{user._count.recipes} recipe{user._count.recipes !== 1 ? 's' : ''}</span>
                        {!user.isAdmin && (
                            <DeleteUserButton userId={user.id} userName={user.name ?? user.email ?? 'this user'} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}