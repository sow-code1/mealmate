import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createAdapter() {
    const connectionString = process.env.DATABASE_URL!
    if (process.env.NODE_ENV === 'production') {
        return new PrismaPg({
            connectionString,
            ssl: { rejectUnauthorized: false },
        })
    }
    return new PrismaPg({
        connectionString,
        ssl: { rejectUnauthorized: false },
    })
}

const adapter = createAdapter()

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma