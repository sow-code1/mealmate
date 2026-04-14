require('dotenv').config()
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const prisma = new PrismaClient({ adapter })

const ADMIN_ID = 'cmnxlkbk30000o0xkws7oy711'

async function main() {
    // Mark presets as public
    const marked = await prisma.recipe.updateMany({
        where: { userId: null },
        data: { isPublic: true }
    })
    console.log('Marked', marked.count, 'recipes as public')

    // Get all presets with ingredients and steps
    const presets = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        include: { ingredients: true, steps: true }
    })

    console.log('Found', presets.length, 'presets to copy')

    for (const preset of presets) {
        const copy = await prisma.recipe.create({
            data: {
                title: preset.title,
                description: preset.description,
                imageUrl: preset.imageUrl,
                prepTime: preset.prepTime,
                cookTime: preset.cookTime,
                servings: preset.servings,
                category: preset.category,
                tags: preset.tags,
                isPublic: false,
                copiedFromPreset: true,
                userId: ADMIN_ID,
                ingredients: {
                    create: preset.ingredients.map((ing) => ({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit,
                    }))
                },
                steps: {
                    create: preset.steps.map((step) => ({
                        order: step.order,
                        instruction: step.instruction,
                    }))
                }
            }
        })
        console.log('Copied:', copy.title, 'with', preset.ingredients.length, 'ingredients and', preset.steps.length, 'steps')
    }

    await prisma.$disconnect()
}

main().catch(console.error)