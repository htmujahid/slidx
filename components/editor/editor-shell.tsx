"use client"

import * as React from "react"
import { DefaultEventHandlers, Editor } from "@craftjs/core"

import { resolver } from "@/lib/editor/resolver"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { NewPresentationDialog } from "@/components/editor/dialogs/new-presentation-dialog"
import { RenameDialog } from "@/components/editor/dialogs/rename-dialog"
import { ResetPresentationDialog } from "@/components/editor/dialogs/reset-presentation-dialog"
import { SlideSizeDialog } from "@/components/editor/dialogs/slide-size-dialog"
import { EditorCanvas } from "@/components/editor/editor-canvas"
import { EditorFooter } from "@/components/editor/editor-footer"
import { EditorHeader } from "@/components/editor/editor-header"
import {
  EditorLayoutProvider,
  useEditorLayout,
} from "@/components/editor/editor-layout"
import { EditorShortcuts } from "@/components/editor/editor-shortcuts"
import { EditorSidebar } from "@/components/editor/editor-sidebar"
import { KeyframeDialog } from "@/components/editor/keyframes/keyframe-dialog"
import { PresentationProvider } from "@/components/editor/presentation-mode"
import {
  PropertiesPanel,
  PropertiesSidebarProvider,
} from "@/components/editor/properties-panel"
import { SlidesProvider } from "@/components/editor/slides-context"
import { TimelinePanel } from "@/components/editor/timeline/timeline-panel"

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

function EditorWorkspace() {
  const { timelineOpen } = useEditorLayout()
  return (
    <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
      <ResizablePanel id="canvas" minSize={240} className="flex flex-col">
        <EditorCanvas />
      </ResizablePanel>
      {timelineOpen ? (
        <>
          <ResizableHandle />
          <ResizablePanel
            id="timeline"
            defaultSize={260}
            minSize={140}
            maxSize="70%"
            className="flex flex-col"
          >
            <TimelinePanel />
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  )
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
            <KeyframeDialog />
            <NewPresentationDialog />
            <ResetPresentationDialog />
            <SlideSizeDialog />
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
                      <EditorWorkspace />
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
