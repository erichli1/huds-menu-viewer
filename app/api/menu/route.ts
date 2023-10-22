import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    const tests = await getMenuItems()

    return NextResponse.json(
        {
            body: tests,
        },
        {
            status: 200,
        },
    )
}

async function getMenuItems() {
    return prisma.menu.findMany()
}

getMenuItems()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
