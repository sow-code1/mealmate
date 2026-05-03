import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }
})
const prisma = new PrismaClient({ adapter })

// Canonical imageUrl for each preset recipe (matched by title)
const IMAGE_MAP: Record<string, string> = {
    'Spaghetti Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1000&auto=format&fit=crop',
    'Honey Garlic Chicken': 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=1000&auto=format&fit=crop',
    'Overnight Oats': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=1000&auto=format&fit=crop',
    'Egg Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1000&auto=format&fit=crop',
    'Protein Smoothie': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1000&auto=format&fit=crop',
    'Turkish Eggs (Çılbır)': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop',
    'Japanese Tamagoyaki': 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?q=80&w=1000&auto=format&fit=crop',
    'Huevos Rancheros': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1000&auto=format&fit=crop',
    'High-Protein Banana Pancakes': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000&auto=format&fit=crop',
    'Smoked Salmon & Avocado Toast': 'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=1000&auto=format&fit=crop',
    'Thai Larb Gai': 'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=1000&auto=format&fit=crop',
    'Korean Bibimbap': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=1000&auto=format&fit=crop',
    'Greek Chicken Souvlaki Wraps': 'https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=1000&auto=format&fit=crop',
    'Vietnamese Beef Pho': 'https://images.unsplash.com/photo-1583224944844-5b268c057b72?q=80&w=1000&auto=format&fit=crop',
    'Turkish Red Lentil Soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop',
    'Moroccan Chicken Tagine': 'https://images.unsplash.com/photo-1602253057119-44d745d9b860?q=80&w=1000&auto=format&fit=crop',
    'Butter Chicken (Murgh Makhani)': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop',
    'Spanish Chicken Paella': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000&auto=format&fit=crop',
    'Teriyaki Salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop',
    'Kung Pao Chicken': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1000&auto=format&fit=crop',
    'Lebanese Kafta with Bulgur': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000&auto=format&fit=crop',
    'Italian Chicken Piccata': 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?q=80&w=1000&auto=format&fit=crop',
    'High-Protein Hummus': 'https://images.unsplash.com/photo-1571197119282-7c4e2c39c2d3?q=80&w=1000&auto=format&fit=crop',
    'Cottage Cheese & Berry Bowl': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000&auto=format&fit=crop',
    'Turkey & Cheese Roll-Ups': 'https://images.unsplash.com/photo-1593253787226-39d4ad17be5a?q=80&w=1000&auto=format&fit=crop',
    'Edamame with Sea Salt & Chili': 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?q=80&w=1000&auto=format&fit=crop',
    'Protein Chocolate Mousse': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1000&auto=format&fit=crop',
    'Greek Yogurt Bark with Berries': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?q=80&w=1000&auto=format&fit=crop',
    'Peanut Butter Banana Nice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=1000&auto=format&fit=crop',
    'Ricotta Lemon Cheesecake Cups': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000&auto=format&fit=crop',
}

async function main() {
    // ─── STEP 1: Remove duplicate public presets ────────────────────────────
    console.log('\n[1/4] Detecting duplicate public presets...')
    const allPublic = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
    })

    // Keep earliest ID per title, delete newer duplicates
    const seenTitles = new Map<string, number>()
    const duplicateIds: number[] = []
    for (const r of allPublic) {
        if (seenTitles.has(r.title)) {
            duplicateIds.push(r.id)
        } else {
            seenTitles.set(r.title, r.id)
        }
    }

    if (duplicateIds.length > 0) {
        console.log(`  Deleting ${duplicateIds.length} duplicate public presets: IDs ${duplicateIds.join(', ')}`)
        await prisma.recipe.deleteMany({ where: { id: { in: duplicateIds } } })
    } else {
        console.log('  No duplicates found.')
    }

    // ─── STEP 2: Update imageUrls on canonical public presets ──────────────
    console.log('\n[2/4] Updating imageUrls on canonical public presets...')
    const canonicalPresets = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        select: { id: true, title: true, imageUrl: true },
        orderBy: { id: 'asc' },
    })
    console.log(`  Found ${canonicalPresets.length} canonical public presets`)

    let imageUpdated = 0
    for (const preset of canonicalPresets) {
        const url = IMAGE_MAP[preset.title]
        if (!url) {
            console.log(`  WARNING: No image mapping for "${preset.title}"`)
            continue
        }
        if (preset.imageUrl !== url) {
            await prisma.recipe.update({ where: { id: preset.id }, data: { imageUrl: url } })
            imageUpdated++
            console.log(`  ✓ Updated image: ${preset.title}`)
        }
    }
    console.log(`  ${imageUpdated} imageUrls updated, ${canonicalPresets.length - imageUpdated} already correct`)

    // ─── STEP 3: Re-fetch canonical presets (now with images) ──────────────
    console.log('\n[3/4] Fetching updated canonical presets...')
    const presets = await prisma.recipe.findMany({
        where: { isPublic: true, userId: null },
        include: { ingredients: true, steps: true, nutrition: true },
        orderBy: { id: 'asc' },
    })
    console.log(`  Loaded ${presets.length} presets (all should have images now)`)

    const missingImages = presets.filter(p => !p.imageUrl)
    if (missingImages.length > 0) {
        console.log(`  WARNING: ${missingImages.length} presets still have no image: ${missingImages.map(p => p.title).join(', ')}`)
    }

    // ─── STEP 4: Reset user presets ─────────────────────────────────────────
    console.log('\n[4/4] Resetting user presets...')
    const users = await prisma.user.findMany({ select: { id: true, email: true, isAdmin: true } })

    for (const user of users) {
        // Count existing presets
        const existingPresets = await prisma.recipe.findMany({
            where: { userId: user.id, copiedFromPreset: true },
            select: { id: true },
        })
        const deletedCount = existingPresets.length

        // Delete all existing preset copies for this user
        await prisma.recipe.deleteMany({
            where: { userId: user.id, copiedFromPreset: true },
        })

        // Re-create 30 fresh presets
        for (const p of presets) {
            await prisma.recipe.create({
                data: {
                    title: p.title,
                    description: p.description,
                    imageUrl: p.imageUrl,
                    prepTime: p.prepTime,
                    cookTime: p.cookTime,
                    servings: p.servings,
                    category: p.category,
                    tags: p.tags,
                    isPublic: false,
                    copiedFromPreset: true,
                    userId: user.id,
                    ingredients: {
                        create: p.ingredients.map(i => ({
                            name: i.name,
                            amount: i.amount,
                            unit: i.unit,
                        })),
                    },
                    steps: {
                        create: p.steps.map(s => ({
                            order: s.order,
                            instruction: s.instruction,
                        })),
                    },
                    ...(p.nutrition ? {
                        nutrition: {
                            create: {
                                calories: p.nutrition.calories,
                                protein: p.nutrition.protein,
                                carbs: p.nutrition.carbs,
                                fat: p.nutrition.fat,
                                fiber: p.nutrition.fiber,
                            },
                        },
                    } : {}),
                },
            })
        }

        const label = user.isAdmin ? '[ADMIN] ' : ''
        console.log(`  ${label}${user.email}: deleted ${deletedCount} presets, added ${presets.length} fresh presets`)
    }

    // ─── VERIFICATION ────────────────────────────────────────────────────────
    console.log('\n=== VERIFICATION ===')
    for (const user of users) {
        const total = await prisma.recipe.count({ where: { userId: user.id, copiedFromPreset: true } })
        const withImg = await prisma.recipe.count({ where: { userId: user.id, copiedFromPreset: true, imageUrl: { not: null } } })
        const label = user.isAdmin ? '[ADMIN] ' : ''
        const ok = total === presets.length && withImg === presets.length
        console.log(`  ${ok ? '✓' : '✗'} ${label}${user.email}: ${total} presets, ${withImg} with images`)
    }

    console.log('\nDone!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
