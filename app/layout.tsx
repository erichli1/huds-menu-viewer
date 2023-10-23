import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Weekly HUDS Entrees",
    description: "See this week's HUDS entrees, at a glance",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
