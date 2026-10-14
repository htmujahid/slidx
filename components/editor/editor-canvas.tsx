"use client"

import * as React from "react"
import { Frame, useEditor } from "@craftjs/core"

import { INITIAL_SLIDE_JSON } from "@/lib/editor/slides"
import { useSlideSize } from "@/hooks/use-slide-size"
import { EditorContextMenu } from "@/components/editor/editor-context-menu"
import { useViewport } from "@/components/editor/editor-stores"

const WHEEL_ZOOM_STEP = 1.1

type Area = { width: number; height: number }

function measure(stage: HTMLElement): Area {
  const style = getComputedStyle(stage)
  const inset = (sides: string[]) =>
    sides.reduce(
      (sum, side) => sum + parseFloat(style.getPropertyValue(side)),
      0
    )
  return {
    width: stage.clientWidth - inset(["padding-left", "padding-right"]),
    height: stage.clientHeight - inset(["padding-top", "padding-bottom"]),
  }
}

function EditorCanvas() {
  const { actions } = useEditor()
  const zoom = useViewport((state) => state.zoom)
  const zoomBy = useViewport((state) => state.zoomBy)
  const fitMode = useViewport((state) => state.fitMode)
  const { width: SLIDE_WIDTH, height: SLIDE_HEIGHT } = useSlideSize()
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [area, setArea] = React.useState<Area | null>(null)

  React.useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    setArea(measure(stage))
    const observer = new ResizeObserver(() => setArea(measure(stage)))
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const width = area
    ? Math.max(
        Math.floor(
          Math.min(
            area.width,
            fitMode === "view"
              ? (area.height * SLIDE_WIDTH) / SLIDE_HEIGHT
              : Infinity
          ) *
            zoom -
            1
        ),
        1
      )
    : undefined

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
        className="editor-stage flex min-h-0 min-w-0 flex-1 [scrollbar-gutter:stable] overflow-auto bg-muted/50 p-3 sm:p-6 lg:p-10"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) actions.clearEvents()
        }}
      >
        <div
          className="m-auto shrink-0 ring-1 ring-border"
          style={{
            width,
            height: width && (width * SLIDE_HEIGHT) / SLIDE_WIDTH,
            visibility: width ? undefined : "hidden",
          }}
        >
          <Frame data={INITIAL_SLIDE_JSON} />
        </div>
      </div>
    </EditorContextMenu>
  )
}

export { EditorCanvas }
