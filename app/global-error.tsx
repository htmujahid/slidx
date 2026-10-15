"use client"

import "./globals.css"

import * as React from "react"

// Replaces the root layout, so it brings its own <html>, <body> and styles
// and cannot rely on providers or the app's fonts.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-background p-6 font-sans text-foreground antialiased">
        <main className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            {error.digest
              ? `An unexpected error occurred. Reference: ${error.digest}`
              : "An unexpected error occurred. Your saved work is safe."}
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="h-8 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
