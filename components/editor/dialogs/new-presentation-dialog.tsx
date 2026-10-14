"use client"

import { useRouter } from "next/navigation"

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
import { useChrome, useDeck } from "@/components/editor/editor-stores"
import { useStorage } from "@/components/storage-provider"

function NewPresentationDialog() {
  const open = useChrome((state) => state.dialog === "new")
  const setDialog = useChrome((state) => state.setDialog)
  const load = useDeck((state) => state.load)
  const service = useStorage()
  const router = useRouter()

  const newPresentation = () => {
    if (service.kind === "cloud") router.push("/editor/new")
    else load(DEFAULT_TITLE, [BLANK_SLIDE_JSON])
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
