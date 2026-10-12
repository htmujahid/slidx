"use client"

import * as React from "react"
import { Frame, useEditor } from "@craftjs/core"

import { SLIDE_ASPECT_RATIO } from "@/lib/editor/constants"
import { INITIAL_SLIDE_JSON } from "@/lib/editor/slides"
import { EditorContextMenu } from "@/components/editor/editor-context-menu"
import { useEditorLayout } from "@/components/editor/editor-layout"

const WHEEL_ZOOM_STEP = 1.1

function EditorCanvas() {
  const { actions } = useEditor()
  const { zoom, zoomBy } = useEditorLayout()
  const stageRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      zoomBy(event.deltaY < 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP)
    }
    stage.addEventListener("wheel", onWheel, { passive: false })
    return () => stage.removeEventListener("wheel", onWheel)
  }, [zoomBy])

  return (
    <EditorContextMenu>
      <div
        ref={stageRef}
        className="editor-stage flex min-h-0 flex-1 overflow-auto bg-muted/50 p-6 lg:p-10"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) actions.clearEvents()
        }}
      >
        <div
          className="m-auto shrink-0 ring-1 ring-border"
          style={{
            aspectRatio: SLIDE_ASPECT_RATIO,
            width: `${zoom * 100}%`,
            maxWidth: `calc((100svh - var(--header-height) - var(--footer-height) - 5rem) * ${SLIDE_ASPECT_RATIO * zoom})`,
          }}
        >
          <Frame data={INITIAL_SLIDE_JSON} />
        </div>
      </div>
    </EditorContextMenu>
  )
}

export { EditorCanvas }
