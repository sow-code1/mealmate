import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-green-600">
                    🍽️ MealMate
                </Link>
                <div className="flex gap-6">
                    <Link href="/recipes" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                        Recipes
                    </Link>
                    <Link href="/meal-planner" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                        Meal Planner
                    </Link>
                </div>
            </div>
        </nav>
    );
}