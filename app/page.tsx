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
        valueGetter: ({ row }) =>
            DAYS_OF_WEEK[row.date.getUTCDay()].concat(
                " ",
                (row.date.getUTCMonth() + 1).toString(),
                "/",
                row.date.getUTCDate().toString(),
            ),
    },
    {
        field: "lunch",
        headerName: "Lunch",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell dishes={row.lunch} />,
    },
    {
        field: "dinner",
        headerName: "Dinner",
        flex: 2,
        renderCell: ({ row }) => <RenderDishesCell dishes={row.dinner} />,
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
        //         date: new Date(),
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
                        <Typography variant="body2" fontStyle="italic">
                            This typically takes ~10 seconds.
                        </Typography>
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
