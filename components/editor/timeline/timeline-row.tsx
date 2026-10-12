import * as React from "react"
import { ROOT_NODE } from "@craftjs/core"
import { DiamondIcon } from "lucide-react"

import type {
  AnimationEasing,
  AnimationPreset,
  TimelineEntry,
  TransitionSide,
} from "@/lib/editor/animation"
import { ElementIcon } from "@/lib/editor/labels"
import type { SpanEdge } from "@/lib/editor/timeline-edit"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LABEL_WIDTH, ROW_HEIGHT } from "@/components/editor/timeline/constants"
import { RowReset } from "@/components/editor/timeline/row-reset"
import { TimelineBar } from "@/components/editor/timeline/timeline-bar"
import type { TimelineRowData } from "@/components/editor/timeline/use-timeline-data"

/** One element: its label on the left, when it is on the slide on the right. */
function TimelineRow({
  row,
  entry,
  timed,
  selected,
  pxPerMs,
  trackWidth,
  gridWidth,
  onSelect,
  onReset,
  onEditKeyframes,
  onMove,
  onNudgeSpan,
  onTrim,
  onNudge,
  onTransition,
  onEasing,
  onTransitionDrag,
  onRemove,
}: {
  row: TimelineRowData
  entry: TimelineEntry
  /** Whether it has been trimmed or given a transition. */
  timed: boolean
  selected: boolean
  pxPerMs: number
  trackWidth: number
  /** Width of one second, for the lane's grid lines. */
  gridWidth: number
  onSelect: () => void
  onReset: () => void
  onEditKeyframes: () => void
  onMove: (
    event: React.PointerEvent,
    entry: TimelineEntry,
    index: number
  ) => void
  onNudgeSpan: (
    event: React.KeyboardEvent,
    entry: TimelineEntry,
    index: number
  ) => void
  onTrim: (
    event: React.PointerEvent,
    entry: TimelineEntry,
    index: number,
    edge: SpanEdge
  ) => void
  onNudge: (
    event: React.KeyboardEvent,
    entry: TimelineEntry,
    index: number,
    edge: SpanEdge
  ) => void
  onTransition: (
    entry: TimelineEntry,
    index: number,
    side: TransitionSide,
    preset: AnimationPreset
  ) => void
  onEasing: (
    entry: TimelineEntry,
    index: number,
    side: TransitionSide,
    easing: AnimationEasing
  ) => void
  onTransitionDrag: (
    event: React.PointerEvent,
    entry: TimelineEntry,
    index: number,
    side: TransitionSide
  ) => void
  onRemove: (entry: TimelineEntry, index: number) => void
}) {
  // The slide itself is always there for the whole slide: it only has an
  // entrance and an exit, and no keyframes.
  const fixed = row.id === ROOT_NODE
  return (
    <div
      role="listitem"
      className="flex cursor-pointer"
      style={{ height: ROW_HEIGHT }}
      onClick={onSelect}
    >
      <div
        className={cn(
          "sticky left-0 z-10 flex shrink-0 items-center gap-1 border-r border-b bg-background pr-1 pl-2",
          selected && "bg-muted"
        )}
        style={{ width: LABEL_WIDTH }}
      >
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs"
        >
          <ElementIcon
            name={row.name}
            props={row.props}
            className="size-3.5 shrink-0"
          />
          <span className="truncate">{row.label}</span>
        </button>
        {fixed ? null : (
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-5 text-muted-foreground"
            aria-label={`Edit keyframes of ${row.label}`}
            onClick={(event) => {
              event.stopPropagation()
              onEditKeyframes()
            }}
          >
            <DiamondIcon />
          </Button>
        )}
        <RowReset label={row.label} timed={timed} onReset={onReset} />
      </div>
      <div
        data-timeline-lane={row.id}
        className={cn("relative shrink-0 border-b", selected && "bg-muted/50")}
        style={{
          width: trackWidth,
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px)",
          backgroundSize: `${gridWidth}px 100%`,
        }}
      >
        {[
          ...new Set(
            entry.tracks.flatMap((track) =>
              track.keyframes.map((point) => point.at)
            )
          ),
        ].map((at) => (
          <span
            key={at}
            data-timeline-keyframe-mark=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0.5 z-[1] size-1.5 -translate-x-1/2 rotate-45 bg-foreground/70"
            style={{ left: at * pxPerMs }}
          />
        ))}
        {entry.spans.map((_, index) => (
          <TimelineBar
            key={index}
            entry={entry}
            index={index}
            label={row.label}
            fixed={fixed}
            pxPerMs={pxPerMs}
            onMove={onMove}
            onNudgeSpan={onNudgeSpan}
            onTrim={onTrim}
            onNudge={onNudge}
            onTransition={onTransition}
            onEasing={onEasing}
            onTransitionDrag={onTransitionDrag}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

export { TimelineRow }
