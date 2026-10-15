"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ConvexError } from "convex/values"

import { DECK_LIMIT_CODE, DECK_LIMIT_MESSAGE } from "@/lib/ai/errors"
import { DEFAULT_TITLE } from "@/lib/editor/presentation"
import { BLANK_SLIDE_JSON, createSlideId } from "@/lib/editor/slides"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { useStorage } from "@/components/storage-provider"

function NewPresentation() {
  const storage = useStorage()
  const router = useRouter()
  const startedRef = React.useRef(false)

  React.useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    storage
      .create({
        title: DEFAULT_TITLE,
        slides: [{ id: createSlideId(), json: BLANK_SLIDE_JSON }],
      })
      .then((id) => router.replace(`/editor/${id}`))
      .catch((error) => {
        const limitReached =
          error instanceof ConvexError && error.data === DECK_LIMIT_CODE
        toast.add(
          limitReached
            ? {
                type: "error",
                title: "Presentation limit reached",
                description: DECK_LIMIT_MESSAGE,
              }
            : { type: "error", title: "Could not create the presentation" }
        )
        router.replace("/dashboard")
      })
  }, [storage, router])

  return (
    <main className="flex min-h-svh items-center justify-center">
      <Spinner />
    </main>
  )
}

export { NewPresentation }
