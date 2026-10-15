"use client"

import { DEFAULT_TITLE } from "@/lib/editor/presentation"
import { BLANK_SLIDE_JSON } from "@/lib/editor/slides"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreatePresentationDialog } from "@/components/create-presentation-dialog"
import { useDeckActions } from "@/components/editor/deck-actions-provider"
import { useChrome } from "@/components/editor/editor-stores"
import { useStorage } from "@/components/storage-provider"

function NewPresentationDialog() {
  const open = useChrome((state) => state.dialog === "new")
  const setDialog = useChrome((state) => state.setDialog)
  const { load } = useDeckActions()
  const service = useStorage()

  if (service.kind === "cloud") {
    return (
      <CreatePresentationDialog
        open={open}
        onOpenChange={(open) => !open && setDialog(null)}
      />
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && setDialog(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new presentation?</AlertDialogTitle>
          <AlertDialogDescription>
            The current presentation will be discarded. Use File → Save to a
            file first if you want to keep it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              load(DEFAULT_TITLE, [BLANK_SLIDE_JSON])
              setDialog(null)
            }}
          >
            New presentation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { NewPresentationDialog }
