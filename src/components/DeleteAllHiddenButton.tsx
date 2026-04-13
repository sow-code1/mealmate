'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeleteAllHiddenButton({ recipeIds }: { recipeIds: number[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDeleteAll = async () => {
        if (!confirm(`Permanently delete all ${recipeIds.length} hidden recipes? This cannot be undone.`)) return
        setLoading(true)
        try {
            await fetch('/api/admin/hidden', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeIds }),
            })
            toast.success('All hidden recipes deleted')
            router.refresh()
        } catch {
            toast.error('Failed to delete recipes')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDeleteAll}
            disabled={loading}
            className="bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
            {loading ? 'Deleting...' : `Delete All (${recipeIds.length})`}
        </button>
    )
}