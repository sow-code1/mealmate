import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }
})
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    await prisma.recipe.createMany({ data: [] })

    await prisma.recipe.create({
        data: {
            title: 'Spaghetti Carbonara',
            description: 'A classic Italian pasta dish with eggs, cheese, and pancetta.',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            category: 'Dinner',
            isPublic: true,
            imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1000&auto=format&fit=crop',
            ingredients: {
                create: [
                    { name: 'Spaghetti', amount: '400', unit: 'g' },
                    { name: 'Pancetta', amount: '150', unit: 'g' },
                    { name: 'Eggs', amount: '4', unit: '' },
                    { name: 'Parmesan', amount: '100', unit: 'g' },
                    { name: 'Black pepper', amount: '1', unit: 'tsp' },
                ],
            },
            steps: {
                create: [
                    { order: 1, instruction: 'Boil spaghetti in salted water until al dente.' },
                    { order: 2, instruction: 'Fry pancetta until crispy.' },
                    { order: 3, instruction: 'Mix eggs and parmesan in a bowl.' },
                    { order: 4, instruction: 'Combine hot pasta with pancetta, remove from heat, add egg mixture and toss quickly.' },
                    { order: 5, instruction: 'Season with black pepper and serve immediately.' },
                ],
            },
            nutrition: { create: { calories: 620, protein: 26, carbs: 70, fat: 27, fiber: 3 } },
        },
    })

    await prisma.recipe.create({
        data: {
            title: 'Honey Garlic Chicken',
            description: 'Sticky, sweet, and savory chicken thighs ready in 30 minutes.',
            prepTime: 5,
            cookTime: 25,
            servings: 4,
            category: 'Dinner',
            isPublic: true,
            imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=1000&auto=format&fit=crop',
            ingredients: {
                create: [
                    { name: 'Chicken thighs', amount: '600', unit: 'g' },
                    { name: 'Honey', amount: '3', unit: 'tbsp' },
                    { name: 'Soy sauce', amount: '2', unit: 'tbsp' },
                    { name: 'Garlic cloves', amount: '4', unit: '' },
                    { name: 'Olive oil', amount: '1', unit: 'tbsp' },
                ],
            },
            steps: {
                create: [
                    { order: 1, instruction: 'Mix honey, soy sauce, and minced garlic.' },
                    { order: 2, instruction: 'Heat oil in a pan over medium-high heat.' },
                    { order: 3, instruction: 'Sear chicken thighs 5 minutes per side.' },
                    { order: 4, instruction: 'Pour sauce over chicken and simmer 10 minutes until sticky.' },
                ],
            },
            nutrition: { create: { calories: 380, protein: 35, carbs: 20, fat: 15, fiber: 1 } },
        },
    })

    await prisma.recipe.create({
        data: {
            title: 'Overnight Oats',
            description: 'Easy high-protein breakfast you prep the night before.',
            prepTime: 5,
            cookTime: 0,
            servings: 1,
            category: 'Breakfast',
            isPublic: true,
            imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=1000&auto=format&fit=crop',
            ingredients: {
                create: [
                    { name: 'Rolled oats', amount: '80', unit: 'g' },
                    { name: 'Milk', amount: '200', unit: 'ml' },
                    { name: 'Greek yogurt', amount: '100', unit: 'g' },
                    { name: 'Honey', amount: '1', unit: 'tbsp' },
                    { name: 'Banana', amount: '1', unit: '' },
                ],
            },
            steps: {
                create: [
                    { order: 1, instruction: 'Combine oats, milk, and yogurt in a jar.' },
                    { order: 2, instruction: 'Stir in honey.' },
                    { order: 3, instruction: 'Refrigerate overnight.' },
                    { order: 4, instruction: 'Top with sliced banana before eating.' },
                ],
            },
            nutrition: { create: { calories: 460, protein: 18, carbs: 72, fat: 10, fiber: 7 } },
        },
    })

    await prisma.recipe.create({
        data: {
            title: 'Egg Fried Rice',
            description: 'Quick and satisfying fried rice with eggs and vegetables.',
            prepTime: 10,
            cookTime: 15,
            servings: 2,
            category: 'Lunch',
            isPublic: true,
            imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1000&auto=format&fit=crop',
            ingredients: {
                create: [
                    { name: 'Cooked rice', amount: '300', unit: 'g' },
                    { name: 'Eggs', amount: '3', unit: '' },
                    { name: 'Soy sauce', amount: '2', unit: 'tbsp' },
                    { name: 'Spring onions', amount: '3', unit: '' },
                    { name: 'Sesame oil', amount: '1', unit: 'tsp' },
                ],
            },
            steps: {
                create: [
                    { order: 1, instruction: 'Heat oil in a wok over high heat.' },
                    { order: 2, instruction: 'Scramble eggs and push to the side.' },
                    { order: 3, instruction: 'Add cold rice and stir fry 3 minutes.' },
                    { order: 4, instruction: 'Add soy sauce and sesame oil, toss well.' },
                    { order: 5, instruction: 'Garnish with spring onions and serve.' },
                ],
            },
            nutrition: { create: { calories: 420, protein: 15, carbs: 58, fat: 14, fiber: 2 } },
        },
    })

    await prisma.recipe.create({
        data: {
            title: 'Protein Smoothie',
            description: 'Post-workout banana protein smoothie.',
            prepTime: 5,
            cookTime: 0,
            servings: 1,
            category: 'Snack',
            isPublic: true,
            imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1000&auto=format&fit=crop',
            ingredients: {
                create: [
                    { name: 'Banana', amount: '1', unit: '' },
                    { name: 'Protein powder', amount: '30', unit: 'g' },
                    { name: 'Milk', amount: '250', unit: 'ml' },
                    { name: 'Peanut butter', amount: '1', unit: 'tbsp' },
                    { name: 'Ice', amount: '1', unit: 'cup' },
                ],
            },
            steps: {
                create: [
                    { order: 1, instruction: 'Add all ingredients to a blender.' },
                    { order: 2, instruction: 'Blend until smooth.' },
                    { order: 3, instruction: 'Pour and drink immediately.' },
                ],
            },
            nutrition: { create: { calories: 380, protein: 30, carbs: 42, fat: 8, fiber: 3 } },
        },
    })

    console.log('Done! Created 5 recipes.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
