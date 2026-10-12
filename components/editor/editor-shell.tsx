"use client"

import * as React from "react"
import { DefaultEventHandlers, Editor } from "@craftjs/core"

import { resolver } from "@/lib/editor/resolver"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { NewPresentationDialog } from "@/components/editor/dialogs/new-presentation-dialog"
import { RenameDialog } from "@/components/editor/dialogs/rename-dialog"
import { ResetPresentationDialog } from "@/components/editor/dialogs/reset-presentation-dialog"
import { EditorCanvas } from "@/components/editor/editor-canvas"
import { EditorFooter } from "@/components/editor/editor-footer"
import { EditorHeader } from "@/components/editor/editor-header"
import { EditorLayoutProvider } from "@/components/editor/editor-layout"
import { EditorShortcuts } from "@/components/editor/editor-shortcuts"
import { EditorSidebar } from "@/components/editor/editor-sidebar"
import { PresentationProvider } from "@/components/editor/presentation-mode"
import {
  PropertiesPanel,
  PropertiesSidebarProvider,
} from "@/components/editor/properties-panel"
import { SlidesProvider } from "@/components/editor/slides-context"

function WorkspaceSidebarShortcut() {
  const { toggleSidebar } = useSidebar()
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault()
        event.stopPropagation()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [toggleSidebar])
  return null
}

function EditorShell() {
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
      <SlidesProvider>
        <EditorLayoutProvider>
          <PresentationProvider>
            <EditorShortcuts />
            <RenameDialog />
            <NewPresentationDialog />
            <ResetPresentationDialog />
            <Toaster />
            <div className="[--footer-height:calc(--spacing(10))] [--header-height:calc(--spacing(12))]">
              <SidebarProvider
                className="h-svh flex-col overflow-hidden"
                style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
              >
                <WorkspaceSidebarShortcut />
                <EditorHeader />
                <div className="flex min-h-0 flex-1">
                  <EditorSidebar />
                  <PropertiesSidebarProvider>
                    <SidebarInset className="min-h-0 min-w-0">
                      <EditorCanvas />
                      <EditorFooter />
                    </SidebarInset>
                    <PropertiesPanel />
                  </PropertiesSidebarProvider>
                </div>
              </SidebarProvider>
            </div>
          </PresentationProvider>
        </EditorLayoutProvider>
      </SlidesProvider>
    </Editor>
  )
}

export { EditorShell }
