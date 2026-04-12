import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="max-w-xl mx-auto px-6 py-32 text-center">
            <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
            <p className="text-xl text-gray-700 mb-2">Page not found</p>
            <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
            <Link href="/" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Go Home
            </Link>
        </div>
    )
}