'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Delete ${userName}? This will also delete all their recipes.`)) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error)
            } else {
                toast.success('User deleted')
                router.refresh()
            }
        } catch {
            toast.error('Failed to delete user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
        >
            {loading ? '...' : 'Remove'}
        </button>
    )
}