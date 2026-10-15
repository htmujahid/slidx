"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ErrorScreen } from "@/components/error-screen"

export default function Error({
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
    <ErrorScreen
      title="Something went wrong"
      description={
        error.digest
          ? `An unexpected error occurred. Reference: ${error.digest}`
          : "An unexpected error occurred. Your saved work is safe."
      }
    >
      <Button onClick={() => retry()}>Try again</Button>
      <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
        Back to Slidx
      </Button>
    </ErrorScreen>
  )
}
