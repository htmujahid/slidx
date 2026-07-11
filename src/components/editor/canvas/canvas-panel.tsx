import { useEffect, useRef, useState } from "react"
import { Frame, ROOT_NODE, useEditor } from "@craftjs/core"
import { ShapesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { defaultScene } from "../craft/default-scene"
import { readSharedState } from "../craft/share"
import { lastDragPosition } from "../craft/svg-coords"
import { canvasDefaults } from "../data"
import { TransportBar } from "./transport-bar"

export function CanvasPanel() {
  const { actions, rootSelected, width, height, isEmpty } = useEditor(
    (state, query) => {
      const root = state.nodes[ROOT_NODE]
      const props = root?.data.props as
        | { width?: number; height?: number }
        | undefined
      return {
        rootSelected: query.getEvent("selected").first() === ROOT_NODE,
        width: props?.width ?? canvasDefaults.width,
        height: props?.height ?? canvasDefaults.height,
        isEmpty: (root?.data.nodes ?? []).length === 0,
      }
    }
  )

  const viewportRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<string>("fit")
  const [fitScale, setFitScale] = useState(1)
  const [sharedState] = useState(() => readSharedState() ?? undefined)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const compute = () => {
      const padding = 48
      const scale = Math.min(
        (viewport.clientWidth - padding) / width,
        (viewport.clientHeight - padding) / height
      )
      setFitScale(Math.max(0.05, Math.min(scale, 4)))
    }
    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [width, height])

  const scale = zoom === "fit" ? fitScale : Number(zoom) / 100

  return (
    <div className="flex h-full flex-col">
      <div
        ref={viewportRef}
        className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/30 p-4"
        onDragOver={(event) => {
          lastDragPosition.x = event.clientX
          lastDragPosition.y = event.clientY
        }}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) actions.selectNode()
        }}
      >
        <div
          className="relative shrink-0"
          style={{ width: width * scale, height: height * scale }}
        >
          <div
            className={cn(
              "border shadow-sm",
              rootSelected && "ring-2 ring-ring"
            )}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              backgroundColor: "#FFFFFF",
              backgroundImage:
                "conic-gradient(rgba(0,0,0,0.08) 90deg, transparent 90deg 180deg, rgba(0,0,0,0.08) 180deg 270deg, transparent 270deg)",
              backgroundSize: "16px 16px",
            }}
          >
            <Frame data={sharedState}>{defaultScene}</Frame>
          </div>

          {isEmpty ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex flex-col items-center gap-2 border border-dashed border-black/20 p-6">
                <ShapesIcon className="size-8 text-black/30" />
                <span className="text-sm font-medium text-black/60">
                  Drag SVG elements here
                </span>
                <span className="text-xs text-black/40">
                  Shapes and animations from the left panel
                </span>
              </span>
            </span>
          ) : null}

          <Badge
            variant="secondary"
            className="pointer-events-none absolute top-2 right-2"
          >
            {width} × {height}
          </Badge>
        </div>
      </div>

      <TransportBar
        zoom={zoom}
        onZoomChange={setZoom}
        onFullscreen={() => viewportRef.current?.requestFullscreen()}
      />
    </div>
  )
}
