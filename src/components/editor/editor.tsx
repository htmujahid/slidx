import { Editor as CraftEditor } from "@craftjs/core"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CanvasPanel } from "./canvas/canvas-panel"
import { editorResolver } from "./craft/resolver"
import { EditorHeader } from "./header/editor-header"
import { EditorShortcuts } from "./editor-shortcuts"
import { ElementsPanel } from "./elements/elements-panel"
import { PlaybackProvider } from "./playback-provider"
import { PropertiesPanel } from "./properties/properties-panel"
import { Timeline } from "./timeline/timeline"

export function Editor() {
  return (
    <CraftEditor
      resolver={editorResolver}
      indicator={{ success: "var(--primary)", error: "var(--destructive)" }}
    >
      <PlaybackProvider>
        <TooltipProvider>
          <EditorShortcuts />
          <div className="flex h-svh flex-col bg-background">
            <EditorHeader />
            <ResizablePanelGroup
              orientation="vertical"
              className="min-h-0 flex-1"
            >
              <ResizablePanel defaultSize="65%" minSize="30%">
                <ResizablePanelGroup orientation="horizontal">
                  <ResizablePanel defaultSize="22%" minSize="16%" maxSize="35%">
                    <ElementsPanel />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize="56%" minSize="30%">
                    <CanvasPanel />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize="22%" minSize="16%" maxSize="35%">
                    <PropertiesPanel />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize="35%" minSize="20%">
                <Timeline />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </TooltipProvider>
      </PlaybackProvider>
    </CraftEditor>
  )
}
