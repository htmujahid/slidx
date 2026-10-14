"use client"

import { NewPresentationDialog } from "@/components/editor/dialogs/new-presentation-dialog"
import { RenameDialog } from "@/components/editor/dialogs/rename-dialog"
import { ResetPresentationDialog } from "@/components/editor/dialogs/reset-presentation-dialog"
import { SlideSizeDialog } from "@/components/editor/dialogs/slide-size-dialog"
import { KeyframeDialog } from "@/components/editor/keyframes/keyframe-dialog"

function EditorDialogs() {
  return (
    <>
      <RenameDialog />
      <KeyframeDialog />
      <NewPresentationDialog />
      <ResetPresentationDialog />
      <SlideSizeDialog />
    </>
  )
}

export { EditorDialogs }
