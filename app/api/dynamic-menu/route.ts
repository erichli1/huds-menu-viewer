import { NextResponse } from "next/server"
import axios, { AxiosError } from "axios"
import { load } from "cheerio"

const HUDS_MENU_TYPE = 14 // 14 is default, 05 is smaller view with only entrees

type DayMenu = {
    date: Date
    lunch: Array<string>
    dinner: Array<string>
    soup: Array<string>
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
        date,
        lunch: true,
    })
    const lunchEntrees = pullEntreesFromRows(lunchResults)
    if (date.getDay() === 0 && lunchEntrees.length !== 0) lunchEntrees.push("Brunch")

    const dinnerResults = await fetchRowsInTable({
        date,
        lunch: false,
    })

    const dinnerEntrees = pullEntreesFromRows(dinnerResults)
    const soup = pullSoupFromDinnerRows(dinnerResults)

    return {
        lunch: lunchEntrees,
        dinner: dinnerEntrees,
        soup,
        date,
    }
}

function fetchRowsInTable({ date, lunch }: { date: Date; lunch: boolean }): Promise<Array<string>> {
    const meal =
        date.getDay() === 0
            ? lunch
                ? 0 // when sunday, lunch is meal 0
                : 1
            : lunch
            ? 1 // when not sunday, lunch is meal 1
            : 2
    const dateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`

    return axios
        .get(
            `https://www.foodpro.huds.harvard.edu/foodpro/menu_items.asp?date=${dateString}&type=${HUDS_MENU_TYPE}&meal=${meal}`,
        )
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

function pullSoupFromDinnerRows(rows: Array<string>): Array<string> {
    const soupIndex = rows.indexOf("Today's Soup")
    const saladBar = rows.indexOf("Salad Bar")

    if (soupIndex === -1 || saladBar === -1) return []

    return rows.slice(soupIndex + 1, saladBar)
}
