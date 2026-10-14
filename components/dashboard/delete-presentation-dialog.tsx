"use client"

import * as React from "react"

import type { PresentationSummary } from "@/lib/storage/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

function DeletePresentationDialog({
  presentation,
  onOpenChange,
  onConfirm,
}: {
  presentation: PresentationSummary | null
  onOpenChange: (open: boolean) => void
  onConfirm: (presentation: PresentationSummary) => Promise<void>
}) {
  const [pending, setPending] = React.useState(false)
  const [lastShown, setLastShown] = React.useState(presentation)
  if (presentation && presentation !== lastShown) setLastShown(presentation)
  const shown = presentation ?? lastShown

  return (
    <AlertDialog
      open={presentation !== null}
      onOpenChange={(open) => !pending && onOpenChange(open)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this presentation?</AlertDialogTitle>
          <AlertDialogDescription>
            “{shown?.title}” and its images will be permanently deleted. This
            can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              if (!presentation) return
              setPending(true)
              try {
                await onConfirm(presentation)
              } finally {
                setPending(false)
              }
            }}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeletePresentationDialog }
