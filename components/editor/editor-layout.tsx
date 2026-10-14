"use client"

import * as React from "react"

import { useChrome } from "@/lib/editor/stores/chrome-store"
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
import { EditorCanvas } from "@/components/editor/editor-canvas"
import { EditorFooter } from "@/components/editor/editor-footer"
import { EditorHeader } from "@/components/editor/editor-header"
import { EditorSidebar } from "@/components/editor/editor-sidebar"
import { PropertiesPanel } from "@/components/editor/properties-panel"
import { PropertiesSidebar } from "@/components/editor/properties-sidebar"
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
  const timelineOpen = useChrome((state) => state.timelineOpen)
  return (
    <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
      <ResizablePanel id="canvas" minSize={100} className="flex flex-col">
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

function EditorLayout() {
  return (
    <div className="[--footer-height:calc(--spacing(10))] [--header-height:calc(--spacing(22))] sm:[--header-height:calc(--spacing(12))]">
      <SidebarProvider
        className="h-dvh min-h-0 flex-col overflow-hidden"
        style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
      >
        <WorkspaceSidebarShortcut />
        <EditorHeader />
        <div className="flex min-h-0 flex-1">
          <EditorSidebar />
          <PropertiesSidebar>
            <SidebarInset className="min-h-0 min-w-0">
              <EditorWorkspace />
              <EditorFooter />
            </SidebarInset>
            <PropertiesPanel />
          </PropertiesSidebar>
        </div>
      </SidebarProvider>
    </div>
  )
}

export { EditorLayout }
