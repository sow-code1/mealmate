require('dotenv').config()
const { Client } = require('pg')

const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const ADMIN_ID = 'cmnxlkbk30000o0xkws7oy711'

async function main() {
    await c.connect()

    const marked = await c.query(`UPDATE "Recipe" SET "isPublic" = true WHERE "userId" IS NULL`)
    console.log('Marked', marked.rowCount, 'recipes as public')

    const copied = await c.query(`
        INSERT INTO "Recipe" (title, description, "imageUrl", "prepTime", "cookTime", servings, category, favorite, tags, "isPublic", deleted, "copiedFromPreset", "userId", "createdAt", "updatedAt")
        SELECT title, description, "imageUrl", "prepTime", "cookTime", servings, category, false, tags, false, false, true, $1, NOW(), NOW()
        FROM "Recipe"
        WHERE "isPublic" = true AND "userId" IS NULL
    `, [ADMIN_ID])
    console.log('Copied', copied.rowCount, 'recipes to admin account')

    await c.end()
}

main().catch(console.error)