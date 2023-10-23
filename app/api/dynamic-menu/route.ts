import { NextResponse } from "next/server"
import axios, { AxiosError } from "axios"
import { load } from "cheerio"

type DayMenu = {
    date: Date
    lunch: Array<string>
    dinner: Array<string>
}

export async function GET() {
    const results: Array<DayMenu> = []

    for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)

        await getEntrees(date).then((res) => {
            results.push(res)
        })
    }

    return NextResponse.json(
        {
            body: results,
        },
        {
            status: 200,
        },
    )
}

async function getEntrees(date: Date): Promise<DayMenu> {
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

    return {
        lunch: lunchEntrees,
        dinner: dinnerEntrees,
        date,
    }
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

    if (entreesIndex === -1 || vegVeganIndex === -1) return []

    return rows.slice(entreesIndex + 1, vegVeganIndex)
}
