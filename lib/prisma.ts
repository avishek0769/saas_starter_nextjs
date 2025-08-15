import { PrismaClient } from "../src/generated/prisma"

const generatePrismaClient = () => {
    return new PrismaClient()
}

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? generatePrismaClient()

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;