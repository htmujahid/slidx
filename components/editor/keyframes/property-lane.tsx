import * as React from "react"
import { DiamondIcon } from "lucide-react"

import { keyframeIndexAt, valueAt } from "@/lib/editor/keyframes"
import { TRACK_PROPERTIES } from "@/lib/editor/tracks/properties"
import {
  type AnimationTrack,
  type TrackProperty,
} from "@/lib/editor/tracks/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LABEL_WIDTH,
  LANE_HEIGHT,
} from "@/components/editor/timeline/constants"

const round = (value: number) => Math.round(value * 100) / 100

function PropertyLane({
  property,
  track,
  rest,
  playhead,
  pxPerMs,
  trackWidth,
  gridWidth,
  selectedIndex,
  onToggle,
  onSetValue,
  onKeyframePointerDown,
  onKeyframeKeyDown,
}: {
  property: TrackProperty
  track?: AnimationTrack
  rest: number
  playhead: number
  pxPerMs: number
  trackWidth: number
  gridWidth: number
  selectedIndex?: number
  onToggle: () => void
  onSetValue: (value: number) => void
  onKeyframePointerDown: (event: React.PointerEvent, index: number) => void
  onKeyframeKeyDown: (event: React.KeyboardEvent, index: number) => void
}) {
  const meta = TRACK_PROPERTIES[property]
  const keyed = keyframeIndexAt(track, playhead) >= 0
  const current = valueAt(track, rest, playhead)
  const points = [...(track?.keyframes ?? [])].sort((a, b) => a.at - b.at)

  return (
    <div className="flex" style={{ height: LANE_HEIGHT }}>
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center gap-1.5 border-r border-b bg-background pr-1 pl-3"
        style={{ width: LABEL_WIDTH }}
      >
        <span className="min-w-0 flex-1 truncate text-xs">{meta.label}</span>
        <Input
          type="number"
          aria-label={`${meta.label} at playhead`}
          className="h-6 w-[4.5rem] px-1.5 text-xs"
          value={round(current)}
          step={meta.step}
          min={meta.min}
          max={meta.max}
          onChange={(event) => {
            const next = event.target.valueAsNumber
            if (!Number.isNaN(next)) onSetValue(next)
          }}
        />
        <span className="w-4 shrink-0 text-xs text-muted-foreground">
          {meta.unit}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn("size-5", !keyed && "text-muted-foreground")}
          aria-pressed={keyed}
          aria-label={`${keyed ? "Remove" : "Add"} ${meta.label} keyframe at playhead`}
          onClick={onToggle}
        >
          <DiamondIcon className={cn(keyed && "fill-current")} />
        </Button>
      </div>
      <div
        data-timeline-property={property}
        className="relative shrink-0 border-b"
        style={{
          width: trackWidth,
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px)",
          backgroundSize: `${gridWidth}px 100%`,
        }}
      >
        {points.map((point, index) => (
          <button
            key={index}
            type="button"
            data-timeline-keyframe=""
            aria-label={`${meta.label} keyframe at ${(point.at / 1000).toFixed(2)}s`}
            aria-pressed={selectedIndex === index}
            className={cn(
              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-ew-resize rounded-[2px] bg-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedIndex === index && "ring-2 ring-ring"
            )}
            style={{ left: point.at * pxPerMs }}
            onPointerDown={(event) => onKeyframePointerDown(event, index)}
            onKeyDown={(event) => onKeyframeKeyDown(event, index)}
          />
        ))}
      </div>
    </div>
  )
}

export { PropertyLane }
