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

function ResetPresentationDialog() {
  const { dialog, setDialog } = useEditorLayout()
  const { resetPresentation } = useSlides()

  return (
    <AlertDialog
      open={dialog === "reset"}
      onOpenChange={(open) => !open && setDialog(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Reset to the welcome presentation?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The current presentation and its saved draft will be discarded. Use
            File → Save to a file first if you want to keep it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetPresentation()
              setDialog(null)
            }}
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ResetPresentationDialog }
