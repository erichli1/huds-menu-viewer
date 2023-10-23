import { NextResponse } from "next/server"
import axios, { AxiosError } from "axios"
import { load } from "cheerio"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
    const date = new Date()
    date.setDate(date.getDate() + 6)

    const lunchResults = await fetchRowsInTable({
        date: `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`,
        lunch: true,
    })
    const lunchEntrees = pullEntreesFromRows(lunchResults)

    const dinnerResults = await fetchRowsInTable({
        date: `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`,
        lunch: false,
    })
    const dinnerEntrees = pullEntreesFromRows(dinnerResults)

    await addEntriesToDatabase({ entrees: lunchEntrees, date, lunch: true })
    await addEntriesToDatabase({ entrees: dinnerEntrees, date, lunch: false })

    // TODO: add error handling
    return NextResponse.json(
        {
            body: {
                lunch: lunchEntrees,
                dinner: dinnerEntrees,
                date,
            },
        },
        {
            status: 200,
        },
    )
}

function fetchRowsInTable({ date, lunch }: { date: string; lunch: boolean }): Promise<Array<string>> {
    const meal = lunch ? "1" : "2"

    return axios
        .get(`https://www.foodpro.huds.harvard.edu/foodpro/menu_items.asp?date=${date}&type=05&meal=${meal}`)
        .then((res) => {
            const html = res.data
            const $ = load(html)

            const rows: Array<string> = []

            const trElements = $("tr")
            trElements.each((_, element) => {
                const rowData = $(element)
                    .text()
                    .replace(/[\t\n]/g, "") // Remove tabs and newlines
                    .split(/(\d|\|)/)[0] // Only keep substring up to first number or pipe character
                    .trim()
                rows.push(rowData)
            })

            return rows
        })
        .catch((error: AxiosError) => {
            console.error(`There was an error with ${error.config?.url}.`)
            console.error(error.toJSON())

            return []
        })
}

function pullEntreesFromRows(rows: Array<string>): Array<string> {
    const entreesIndex = rows.indexOf("Entrees")
    const vegVeganIndex = rows.indexOf("Veg,Vegan")

    return rows.slice(entreesIndex + 1, vegVeganIndex)
}

async function addEntriesToDatabase({ entrees, date, lunch }: { entrees: Array<string>; date: Date; lunch: boolean }) {
    await entrees.forEach(async (entree) => {
        await prisma.menu.create({
            data: {
                name: entree,
                date,
                lunch,
            },
        })
    })
}
