'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminDeleteButton({
                                              recipeIds,
                                              label,
                                              small = false,
                                          }: {
    recipeIds: number[]
    label: string
    small?: boolean
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Permanently delete ${recipeIds.length > 1 ? `all ${recipeIds.length} recipes` : 'this recipe'}? This cannot be undone.`)) return
        setLoading(true)
        try {
            await fetch('/api/admin/hidden', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeIds }),
            })
            toast.success('Permanently deleted')
            router.refresh()
        } catch {
            toast.error('Failed to delete')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 ${
                small ? 'px-3 py-1 text-xs rounded-lg' : 'px-5 py-2 rounded-lg'
            }`}
        >
            {loading ? '...' : label}
        </button>
    )
}