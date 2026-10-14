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
import { useChrome, useDeck } from "@/components/editor/editor-stores"

function ResetPresentationDialog() {
  const open = useChrome((state) => state.dialog === "reset")
  const setDialog = useChrome((state) => state.setDialog)
  const resetPresentation = useDeck((state) => state.reset)

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && setDialog(null)}>
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
