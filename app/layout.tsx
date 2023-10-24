import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
    title: "Weekly HUDS Entrees",
    description: "See this week's HUDS entrees, at a glance",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-GSRZTW3LQY" />
            <Script id="google-analytics">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-GSRZTW3LQY');
        `}
            </Script>
            <body>{children}</body>
        </html>
    )
}
