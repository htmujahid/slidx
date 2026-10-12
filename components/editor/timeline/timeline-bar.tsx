import * as React from "react"

import { PRESET_LABELS, type TimelineEntry } from "@/lib/editor/animation"
import { formatTime, type BarEditMode } from "@/lib/editor/timeline-edit"
import { cn } from "@/lib/utils"

/** One animation: drag it to move, drag its edges to resize. */
function TimelineBar({
  entry,
  pxPerMs,
  selected,
  onEdit,
  onKeyDown,
}: {
  entry: TimelineEntry
  pxPerMs: number
  selected: boolean
  onEdit: (
    event: React.PointerEvent,
    entry: TimelineEntry,
    mode: BarEditMode
  ) => void
  onKeyDown: (event: React.KeyboardEvent, entry: TimelineEntry) => void
}) {
  const label = PRESET_LABELS[entry.animation.preset]
  const emphasis = entry.animation.preset === "pulse"
  return (
    <div
      role="button"
      tabIndex={0}
      data-timeline-bar={entry.id}
      aria-label={`${label}, starts ${formatTime(entry.start)}, lasts ${formatTime(entry.end - entry.start)}`}
      title={`${label} · ${formatTime(entry.start)} to ${formatTime(entry.end)}`}
      className={cn(
        "absolute top-1 flex h-6 cursor-grab items-center overflow-hidden rounded-md text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        emphasis
          ? "border bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground",
        selected && "ring-2 ring-ring"
      )}
      style={{
        left: entry.start * pxPerMs,
        width: Math.max((entry.end - entry.start) * pxPerMs, 12),
      }}
      onPointerDown={(event) => onEdit(event, entry, "move")}
      onKeyDown={(event) => onKeyDown(event, entry)}
    >
      <span
        data-timeline-handle="start"
        className="absolute inset-y-0 left-0 z-10 w-1.5 cursor-ew-resize"
        onPointerDown={(event) => onEdit(event, entry, "start")}
      />
      <span className="truncate px-2">{label}</span>
      <span
        data-timeline-handle="end"
        className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-ew-resize"
        onPointerDown={(event) => onEdit(event, entry, "end")}
      />
    </div>
  )
}

export { TimelineBar }
