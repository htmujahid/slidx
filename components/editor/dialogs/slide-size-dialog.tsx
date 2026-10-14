"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SlideSizeForm } from "@/components/editor/dialogs/slide-size-form"
import { useChrome } from "@/components/editor/editor-stores"

function SlideSizeDialog() {
  const open = useChrome((state) => state.dialog === "size")
  const setDialog = useChrome((state) => state.setDialog)
  const close = () => setDialog(null)

  return (
    <Dialog open={open} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Slide size</DialogTitle>
          <DialogDescription>
            Every slide in the presentation takes the new size. Undo history is
            cleared when it changes.
          </DialogDescription>
        </DialogHeader>
        {open ? <SlideSizeForm onDone={close} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { SlideSizeDialog }
