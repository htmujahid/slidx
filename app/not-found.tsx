import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ErrorScreen } from "@/components/error-screen"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Page not found"
      description="The page you’re looking for doesn’t exist, or the presentation was moved or deleted."
    >
      <Button render={<Link href="/" />} nativeButton={false}>
        Back to Slidx
      </Button>
    </ErrorScreen>
  )
}
