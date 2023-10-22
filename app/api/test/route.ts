import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    const tests = await getTests()

    return NextResponse.json(
        {
            body: tests,
        },
        {
            status: 200,
        },
    )
}

async function getTests() {
    return prisma.test.findMany()
}

getTests()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
