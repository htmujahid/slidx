import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

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
