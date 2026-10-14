"use client"

import { DefaultEventHandlers, Editor } from "@craftjs/core"

import { resolver } from "@/lib/editor/resolver"
import { LOCAL_PRESENTATION_ID } from "@/lib/storage/types"
import {
  ActiveSlideSync,
  CraftBridge,
  EditorBootstrap,
} from "@/components/editor/editor-bootstrap"
import { EditorDialogs } from "@/components/editor/editor-dialogs"
import { EditorLayout } from "@/components/editor/editor-layout"
import { EditorShortcuts } from "@/components/editor/editor-shortcuts"
import { EditorStoresProvider } from "@/components/editor/editor-stores"
import { PresentationPlayer } from "@/components/editor/presentation-player"

function EditorShell({
  presentationId = LOCAL_PRESENTATION_ID,
}: {
  presentationId?: string
}) {
  return (
    <Editor
      resolver={resolver}
      handlers={(store) =>
        new DefaultEventHandlers({
          store,
          removeHoverOnMouseleave: false,
          isMultiSelectEnabled: (event: MouseEvent) =>
            event.shiftKey || event.metaKey || event.ctrlKey,
        })
      }
    >
      <EditorStoresProvider
        key={presentationId}
        presentationId={presentationId}
      >
        {/* CraftBridge must mount before EditorBootstrap: hydrate() needs craft bound. */}
        <CraftBridge />
        <ActiveSlideSync />
        <EditorBootstrap />
        <EditorShortcuts />
        <EditorDialogs />
        <PresentationPlayer />
        <EditorLayout />
      </EditorStoresProvider>
    </Editor>
  )
}

export { EditorShell }
