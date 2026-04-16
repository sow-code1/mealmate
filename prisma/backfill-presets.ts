import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }
})
const prisma = new PrismaClient({ adapter })

async function backfillPresetsToUser(userId: string, presets: any[]) {
    const userPresets = await prisma.recipe.findMany({
        where: { userId, copiedFromPreset: true },
        select: { title: true },
    })
    const userTitles = new Set(userPresets.map((r: any) => r.title))

    let copied = 0
    for (const preset of presets) {
        if (userTitles.has(preset.title)) continue
        await prisma.recipe.create({
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
                userId,
                ingredients: {
                    create: preset.ingredients.map((i: any) => ({
                        name: i.name,
                        amount: i.amount,
                        unit: i.unit,
                    })),
                },
                steps: {
                    create: preset.steps.map((s: any) => ({
                        order: s.order,
                        instruction: s.instruction,
                    })),
                },
                ...(preset.nutrition ? {
                    nutrition: {
                        create: {
                            calories: preset.nutrition.calories,
                            protein: preset.nutrition.protein,
                            carbs: preset.nutrition.carbs,
                            fat: preset.nutrition.fat,
                            fiber: preset.nutrition.fiber,
                        },
                    },
                } : {}),
            },
        })
        copied++
    }
    return copied
}

async function main() {
    console.log('Loading public presets...')
    const presets = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        include: { ingredients: true, steps: true, nutrition: true },
    })
    console.log(`Found ${presets.length} public presets`)

    const users = await prisma.user.findMany({ select: { id: true, email: true } })
    console.log(`Processing ${users.length} users...\n`)

    let totalCopied = 0
    for (const user of users) {
        const recipeCount = await prisma.recipe.count({ where: { userId: user.id } })
        if (recipeCount >= presets.length) {
            console.log(`  ✓ ${user.email} — already has ${recipeCount} recipes, skipping`)
            continue
        }
        const copied = await backfillPresetsToUser(user.id, presets)
        totalCopied += copied
        console.log(`  + ${user.email} — copied ${copied} missing presets (had ${recipeCount}, now ${recipeCount + copied})`)
    }

    console.log(`\nDone! Copied ${totalCopied} recipes across ${users.length} users.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
