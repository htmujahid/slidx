import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import {
  BRAND_COLOR,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toast"
import { ConvexProvider } from "@/components/convex-provider"
import { StorageProvider } from "@/components/storage-provider"
import { ThemeProvider } from "@/components/theme-provider"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `${SITE_NAME} · ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "presentation maker",
    "slide editor",
    "online slides",
    "animated presentations",
    "AI presentation assistant",
    "export slides to PDF",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ConvexProvider>
          <ThemeProvider>
            <StorageProvider>{children}</StorageProvider>
            <Toaster />
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  )
}
