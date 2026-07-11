import { useEditor } from "@craftjs/core"
import { RepeatIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePlayback } from "../playback-context"
import { MIN_CLIP_SECONDS, clipStyles } from "./constants"
import { useTimeline } from "./timeline-context"
import type { ClipModel, TrackModel } from "./use-element-tracks"

export function Clip({
  clip,
  kind,
  locked,
  laneWidth,
}: {
  clip: ClipModel
  kind: TrackModel["kind"]
  locked: boolean
  laneWidth: number
}) {
  const { actions } = useEditor()
  const { pxPerSecond, snapSeconds } = useTimeline()
  const { duration } = usePlayback()

  const left = clip.begin * pxPerSecond
  const width = Math.max(clip.dur * pxPerSecond, 18)

  const snapTo = (value: number) =>
    Math.round(Math.round(value / snapSeconds) * snapSeconds * 1000) / 1000

  const handlePointerDown = (
    event: React.PointerEvent,
    mode: "move" | "resize"
  ) => {
    event.stopPropagation()
    if (event.button !== 0) return

    const startX = event.clientX
    const startBegin = clip.begin
    const startDur = clip.dur
    let moved = false

    const onMove = (e: PointerEvent) => {
      if (locked) return
      if (!moved && Math.abs(e.clientX - startX) < 3) return
      moved = true
      const deltaSeconds = (e.clientX - startX) / pxPerSecond

      if (mode === "move") {
        const maxBegin = Math.max(0, duration - startDur)
        const next = Math.min(
          Math.max(0, snapTo(startBegin + deltaSeconds)),
          maxBegin
        )
        actions.history.throttle(300).setProp(clip.id, (props) => {
          props.begin = next
        })
      } else {
        const next = Math.min(
          Math.max(MIN_CLIP_SECONDS, snapTo(startDur + deltaSeconds)),
          Math.max(MIN_CLIP_SECONDS, duration - startBegin)
        )
        actions.history.throttle(300).setProp(clip.id, (props) => {
          props.dur = next
        })
      }
    }

    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      if (!moved) actions.selectNode(clip.id)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp, { once: true })
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            actions.selectNode(clip.id)
          }
        }}
        onPointerDown={(event) => handlePointerDown(event, "move")}
        className={cn(
          "absolute inset-y-1.5 flex touch-none items-center gap-1 overflow-hidden rounded-md border px-2 select-none",
          locked ? "cursor-default" : "cursor-grab",
          clipStyles[kind],
          clip.selected && "border-ring ring-1 ring-ring"
        )}
        style={{ left, width }}
      >
        <span className="truncate font-mono text-xs">{clip.label}</span>
        {clip.indefinite ? (
          <RepeatIcon className="size-3 shrink-0 text-muted-foreground" />
        ) : null}
        {locked ? null : (
          <div
            onPointerDown={(event) => handlePointerDown(event, "resize")}
            className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize"
          />
        )}
      </div>
      {clip.indefinite && left + width < laneWidth ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-y-1.5 rounded-r-md border border-l-0 border-dashed opacity-40",
            clipStyles[kind]
          )}
          style={{ left: left + width, width: laneWidth - left - width }}
        />
      ) : null}
    </>
  )
}
