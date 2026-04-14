'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function AdminModeToggle() {
    const [adminMode, setAdminMode] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('adminMode='))
            ?.split('=')[1]
        setAdminMode(cookie === 'true')
    }, [])

    const toggle = async () => {
        setLoading(true)
        const newMode = !adminMode
        await fetch('/api/admin/mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: newMode }),
        })
        setAdminMode(newMode)
        toast.success(newMode ? 'Admin mode ON' : 'Admin mode OFF')
        window.location.reload()
        setLoading(false)
    }

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                adminMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {loading ? '...' : adminMode ? '⚙️ Admin ON' : '⚙️ Admin OFF'}
        </button>
    )
}