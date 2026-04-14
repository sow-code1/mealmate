import Link from 'next/link'
import { auth } from '@/auth'

export default async function Home() {
    const session = await auth()

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-50 to-white px-6 py-24 text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">
                    Cook Smarter with <span className="text-green-600">MealMate</span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                    Save your favorite recipes, plan your meals for the week, and generate a grocery list automatically. All in one place.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link
                        href={session ? '/recipes' : '/login'}
                        className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                        Browse Recipes
                    </Link>
                    <Link
                        href={session ? '/mealplan' : '/login'}
                        className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                        Plan My Week
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need to eat well</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
                        <div className="text-4xl mb-4">📖</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Recipe Manager</h3>
                        <p className="text-gray-500 text-sm">Save, organize, and search your recipes with dietary tags and category filters.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
                        <div className="text-4xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Meal Planner</h3>
                        <p className="text-gray-500 text-sm">Plan breakfast, lunch, dinner, and snacks for every day of the week.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
                        <div className="text-4xl mb-4">🛒</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Grocery List</h3>
                        <p className="text-gray-500 text-sm">Automatically generate a shopping list from your weekly meal plan.</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-green-600 px-6 py-16 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to start cooking?</h2>
                <p className="text-green-100 mb-8 text-lg">Sign up free and start building your personal recipe collection.</p>
                {session ? (
                    <Link
                        href="/recipes/new"
                        className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors inline-block"
                    >
                        + Add Your First Recipe
                    </Link>
                ) : (
                    <Link
                        href="/register"
                        className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors inline-block"
                    >
                        Create Free Account
                    </Link>
                )}
            </div>
        </div>
    )
}