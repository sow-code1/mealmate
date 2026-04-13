'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        if (!email || !password) { toast.error('Email and password required'); return }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); setLoading(false); return }
            await signIn('credentials', { email, password, callbackUrl: '/recipes' })
        } catch {
            toast.error('Failed to register')
            setLoading(false)
        }
    }

    const handleGoogle = () => signIn('google', { callbackUrl: '/recipes' })

    return (
        <div className="max-w-md mx-auto px-6 py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Create your account</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
                <button
                    onClick={handleGoogle}
                    className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    Continue with Google
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-green-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}