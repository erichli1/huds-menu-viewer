"use client"

import { CircularProgress, Container, Divider, Grid, List, ListItem, Typography } from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import axios from "axios"
import { useState, useEffect } from "react"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type DayMenu = {
    id: number
    date: Date
    lunch: Array<string>
    dinner: Array<string>
    soup: Array<string>
}

const dateIsToday = (date: Date) => {
    const today = new Date()
    return (
        date.getUTCFullYear() === today.getFullYear() &&
        date.getUTCMonth() === today.getMonth() &&
        date.getUTCDate() === today.getDate()
    )
}

const getDateString = (date: Date) => {
    return DAYS_OF_WEEK[date.getUTCDay()].concat(
        " ",
        (date.getUTCMonth() + 1).toString(),
        "/",
        date.getUTCDate().toString(),
    )
}

const renderDate = (date: Date) => {
    if (dateIsToday(date)) return <strong>{getDateString(date)}</strong>
    
    return getDateString(date)
}

const RenderDishesCell = ({ date, dishes }: { date: Date, dishes: Array<string> }) => {
    return (
        <List>
            {dishes.map((item: string, index: number) => (
                <ListItem disablePadding key={index}>
                    {dateIsToday(date) ? <strong>- {item}</strong> : <>- {item}</>}
                </ListItem>
            ))}
        </List>
    )
}

const columns: GridColDef<DayMenu>[] = [
    {
        field: "date",
        headerName: "Date",
        flex: 1,
        renderCell: ({ row }) => renderDate(row.date),
        valueGetter: ({ row }) => row.date.getTime(),
        sortable: false,
    },
    {
        field: "lunch",
        headerName: "Lunch",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell date={row.date} dishes={row.lunch} />,
        sortable: false,
    },
    {
        field: "dinner",
        headerName: "Dinner",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell date={row.date} dishes={row.dinner} />,
        sortable: false,
    },
    {
        field: "soup",
        headerName: "Soup",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell date={row.date} dishes={row.soup} />,
        sortable: false,
    },
]

function getWindowDimensions() {
    if (typeof window === "undefined") return { width: 0, height: 0 }

    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height,
    }
}

function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return windowDimensions
}

const RenderDishesForMobile = ({ title, dishes }: { title: string; dishes: Array<string> }) => (
    <Grid container direction="row">
        <Grid item xs={3}>
            <Typography variant="body2" fontStyle="italic">
                {title}
            </Typography>
        </Grid>
        <Grid item xs={9}>
            {dishes.map((item: string, index: number) => (
                <Typography variant="body2" key={index}>
                    {item}
                </Typography>
            ))}
        </Grid>
    </Grid>
)

const RenderMobileDayComponent = ({ day }: { day: DayMenu }) => (
    <Container>
        <Typography variant="body1" fontWeight="bold">
            {renderDate(day.date)}
        </Typography>
        <Grid container direction="column" gap={1}>
            <Grid container direction="row">
                <RenderDishesForMobile title="Soup" dishes={day.soup} />
            </Grid>
            <Grid container direction="row">
                <RenderDishesForMobile title="Lunch" dishes={day.lunch} />
            </Grid>
            <Grid container direction="row">
                <RenderDishesForMobile title="Dinner" dishes={day.dinner} />
            </Grid>
            <Divider />
        </Grid>
    </Container>
)

export default function Home() {
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<Array<DayMenu>>([])
    const { width } = useWindowDimensions()

    if (loading) {
        axios
            .get("/api/dynamic-menu")
            .then((res) => {
                const processedDays = res.data.body.map((jsonDay: any, index: number) => {
                    const day: DayMenu = {
                        id: index,
                        date: new Date(jsonDay.date),
                        lunch: jsonDay.lunch,
                        dinner: jsonDay.dinner,
                        soup: jsonDay.soup,
                    }
                    return day
                })

                setData(processedDays)
                setLoading(false)
            })
            .catch((err) => console.log(err.message))

        // setData([
        //     {
        //         id: 1,
        //         date: new Date("10-23-2023"),
        //         lunch: ["chicken", "soup"],
        //         dinner: ["beef", "brisket"],
        //         soup: [],
        //     },
        //     {
        //         id: 2,
        //         date: new Date("10-24-2023"),
        //         lunch: ["chicken", "soup"],
        //         dinner: ["beef", "brisket"],
        //         soup: [],
        //     },
        //     {
        //         id: 3,
        //         date: new Date("10-25-2023"),
        //         lunch: ["chicken", "soup"],
        //         dinner: ["beef", "brisket"],
        //         soup: [],
        //     },
        // ])
        // setLoading(false)
    }

    return (
        <main>
            <Container maxWidth="md" sx={{ padding: "5px" }}>
                <Typography variant="h2">HUDS Menu</Typography>
                {loading ? (
                    <Grid container gap={1} direction="column" justifyContent="center" alignItems="center">
                        <CircularProgress />
                        <Typography variant="body1">Loading...</Typography>
                    </Grid>
                ) : width < 600 ? (
                    <Grid container gap={1} direction="column">
                        <Divider />
                        {data.map((day: DayMenu, index: number) => (
                            <RenderMobileDayComponent day={day} key={index} />
                        ))}
                    </Grid>
                ) : (
                    <DataGrid
                        rows={data}
                        columns={columns}
                        disableRowSelectionOnClick
                        hideFooter
                        disableColumnMenu
                        disableColumnFilter
                        getRowHeight={() => "auto"}
                    />
                )}
            </Container>
        </main>
    )
}
