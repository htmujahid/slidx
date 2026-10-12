"use client"

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
import { useEditorLayout } from "@/components/editor/editor-layout"
import { useSlides } from "@/components/editor/slides-context"

function NewPresentationDialog() {
  const { dialog, setDialog } = useEditorLayout()
  const { newPresentation } = useSlides()

  return (
    <AlertDialog
      open={dialog === "new"}
      onOpenChange={(open) => !open && setDialog(null)}
    >
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
              newPresentation()
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
