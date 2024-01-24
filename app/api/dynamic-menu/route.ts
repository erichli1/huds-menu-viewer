import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosError } from "axios"
import { load } from "cheerio"
import url from "url"

const HUDS_MENU_TYPE = 14 // 14 is default, 05 is smaller view with only entrees
const POSSIBLE_HEADERS = [
    "Today's Soup",
    "Salad Bar",
    "Entrees",
    "Veg,Vegan",
    "Starch And Potatoes",
    "Vegetables",
    "Plant protein",
    "Desserts",
    "Brown Rice station",
    "Bistro Bowl",
    "Fresh Fruit",
    "Whole Grain Pasta Bar",
    "Brain Break",
    "Delish",
    "Chili Bar",
    "Fresh Fruit",
    "Sand/ Deli",
    "Halal",
    "Sides",
    "From the Grill",
    "Brunch",
]

type DayMenu = {
    date: Date
    lunch: Array<string>
    dinner: Array<string>
    soup: Array<string>
}

export async function GET(request: NextRequest) {
    const params = url.parse(request.url, true).query

    const promises = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)

        return getDailyResultPromises(date).then((result) => processDailyResults(date, result))
    })

    const results = await Promise.all(promises)

    return NextResponse.json(
        {
            body: results,
        },
        {
            status: 200,
            headers: {
                "Cache-Control": "s-maxage=64800, stale-while-revalidate",
            },
        },
    )
}

async function getDailyResultPromises(date: Date): Promise<Array<Array<string>>> {
    return Promise.all([fetchRowsInTable({ date, lunch: true }), fetchRowsInTable({ date, lunch: false })])
}

function processDailyResults(date: Date, [lunchResults, dinnerResults]: Array<Array<string>>): DayMenu {
    const lunchHeaderIndexes = getHeaderIndexes(lunchResults)
    const lunchEntrees = pullSectionFromRows("Entrees", lunchResults, lunchHeaderIndexes)
    if (date.getDay() === 0 && lunchEntrees.length !== 0) lunchEntrees.push("Brunch")

    const dinnerHeaderIndexes = getHeaderIndexes(dinnerResults)
    const dinnerEntrees = pullSectionFromRows("Entrees", dinnerResults, dinnerHeaderIndexes)
    const soup = pullSectionFromRows("Today's Soup", dinnerResults, dinnerHeaderIndexes)

    return {
        lunch: lunchEntrees,
        dinner: dinnerEntrees,
        soup,
        date,
    }
}

function fetchRowsInTable({ date, lunch }: { date: Date; lunch: boolean }): Promise<Array<string>> {
    // const meal =
    //     date.getDay() === 0
    //         ? lunch
    //             ? 0 // when sunday, lunch is meal 0
    //             : 1
    //         : lunch
    //         ? 1 // when not sunday, lunch is meal 1
    //         : 2
    const meal = lunch ? 1 : 2
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

function getHeaderIndexes(rows: Array<string>): { [key: string]: number } {
    const headerIndexes: { [key: string]: number } = {}
    POSSIBLE_HEADERS.forEach((header) => {
        headerIndexes[header] = rows.indexOf(header)
    })

    return headerIndexes
}

function pullSectionFromRows(
    header: string,
    rows: Array<string>,
    headerIndexes: { [key: string]: number },
): Array<string> {
    const headerIndex = headerIndexes[header]
    // console.log(headerIndex)
    if (headerIndex === -1) return []

    // console.log(headerIndexes)

    const sortedHeaderIndexes = Object.entries(headerIndexes)
        .map(([_, value]) => value)
        .sort((a, b) => a - b)

    // console.log(sortedHeaderIndexes)

    // If last header index, return the remaining rows
    if (sortedHeaderIndexes.indexOf(headerIndex) + 1 === sortedHeaderIndexes.length) return rows.slice(headerIndex + 1)

    // Otherwise, return rows between this and next header
    const nextHeaderIndex = sortedHeaderIndexes[sortedHeaderIndexes.indexOf(headerIndex) + 1]
    // console.log(nextHeaderIndex)
    if (nextHeaderIndex === -1) return []
    return rows.slice(headerIndex + 1, nextHeaderIndex)
}
