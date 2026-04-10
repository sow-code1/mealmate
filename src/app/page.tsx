import Link from "next/link";

export default function Home() {
  return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-green-600">MealMate</span> 🍽️
        </h1>
        <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto">
          Your personal recipe manager and weekly meal planner. Save recipes, plan your week, and eat better.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
              href="/recipes"
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Browse Recipes
          </Link>
          <Link
              href="/meal-planner"
              className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Plan My Week
          </Link>
        </div>
      </div>
  );
}