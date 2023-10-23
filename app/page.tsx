"use client"

import { CircularProgress, Container, Grid, List, ListItem, Typography } from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import axios from "axios"
import { useState } from "react"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

type DayMenu = {
    id: number
    date: Date
    lunch: Array<string>
    dinner: Array<string>
}

const RenderDishesCell = ({ dishes }: { dishes: Array<string> }) => {
    return (
        <List>
            {dishes.map((item: string, index: number) => (
                <ListItem disablePadding key={index}>
                    - {item}
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
        renderCell: ({ row }) =>
            DAYS_OF_WEEK[row.date.getUTCDay()].concat(
                " ",
                (row.date.getUTCMonth() + 1).toString(),
                "/",
                row.date.getUTCDate().toString(),
            ),
        valueGetter: ({ row }) => row.date.getTime(),
        sortable: false,
    },
    {
        field: "lunch",
        headerName: "Lunch",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell dishes={row.lunch} />,
        sortable: false,
    },
    {
        field: "dinner",
        headerName: "Dinner",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell dishes={row.dinner} />,
        sortable: false,
    },
]

export default function Home() {
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<Array<DayMenu>>([])

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
        //     },
        //     {
        //         id: 2,
        //         date: new Date("10-24-2023"),
        //         lunch: ["chicken", "soup"],
        //         dinner: ["beef", "brisket"],
        //     },
        //     {
        //         id: 3,
        //         date: new Date("10-25-2023"),
        //         lunch: ["chicken", "soup"],
        //         dinner: ["beef", "brisket"],
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
