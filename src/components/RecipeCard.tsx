interface RecipeCardProps {
    id: number
    title: string
    description: string | null
    category: string | null
    prepTime: number | null
    cookTime: number | null
    servings: number | null
}

export default function RecipeCard({
                                       id,
                                       title,
                                       description,
                                       category,
                                       prepTime,
                                       cookTime,
                                       servings,
                                   }: RecipeCardProps) {
    return (
        <a href={`/recipes/${id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {category ?? 'Uncategorized'}
          </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                    <span>Prep: {prepTime ?? 0} min</span>
                    <span>Cook: {cookTime ?? 0} min</span>
                    <span>Servings: {servings ?? 0}</span>
                </div>
            </div>
        </a>
    )
}