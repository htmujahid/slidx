"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useChrome } from "@/components/editor/editor-stores"
import { KeyframeEditor } from "@/components/editor/keyframes/keyframe-editor"

function KeyframeDialog() {
  const keyframeTarget = useChrome((state) =>
    typeof state.dialog === "object" && state.dialog ? state.dialog.id : null
  )
  const setDialog = useChrome((state) => state.setDialog)
  return (
    <Dialog
      open={keyframeTarget !== null}
      onOpenChange={(open) => {
        if (!open) setDialog(null)
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        {keyframeTarget ? <KeyframeEditor id={keyframeTarget} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { KeyframeDialog }
