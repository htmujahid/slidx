import * as React from "react"
import { GripVerticalIcon } from "lucide-react"

import type { AnimationPreset, TimelineEntry } from "@/lib/editor/animation"
import { ElementIcon } from "@/lib/editor/labels"
import type { BarEditMode } from "@/lib/editor/timeline-edit"
import { cn } from "@/lib/utils"
import { SortableItem, SortableItemHandle } from "@/components/reui/sortable"
import { LABEL_WIDTH, ROW_HEIGHT } from "@/components/editor/timeline/constants"
import { RowAction } from "@/components/editor/timeline/row-action"
import { TimelineBar } from "@/components/editor/timeline/timeline-bar"
import type { TimelineRowData } from "@/components/editor/timeline/use-timeline-data"

/** One element: its label and action on the left, its animation on the right. */
function TimelineRow({
  row,
  entry,
  selected,
  pxPerMs,
  trackWidth,
  gridWidth,
  onSelect,
  onAdd,
  onRemove,
  onEditBar,
  onNudgeBar,
}: {
  row: TimelineRowData
  /** The element's animation, if it has one. */
  entry?: TimelineEntry
  selected: boolean
  pxPerMs: number
  trackWidth: number
  /** Width of one second, for the lane's grid lines. */
  gridWidth: number
  onSelect: () => void
  onAdd: (preset: AnimationPreset) => void
  onRemove: () => void
  onEditBar: (
    event: React.PointerEvent,
    entry: TimelineEntry,
    mode: BarEditMode
  ) => void
  onNudgeBar: (event: React.KeyboardEvent, entry: TimelineEntry) => void
}) {
  return (
    <SortableItem
      value={row.id}
      role="listitem"
      tabIndex={-1}
      className="group/row flex data-[dragging=true]:bg-accent"
      style={{ height: ROW_HEIGHT }}
      render={<div />}
    >
      <div
        className={cn(
          "sticky left-0 z-10 flex shrink-0 items-center gap-1 border-r border-b bg-background pr-1 pl-1",
          selected && "bg-muted"
        )}
        style={{ width: LABEL_WIDTH }}
      >
        <SortableItemHandle
          cursor={false}
          render={
            <button
              type="button"
              aria-label={`Reorder ${row.label}`}
              className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-muted"
            />
          }
        >
          <GripVerticalIcon className="size-3.5" />
        </SortableItemHandle>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs"
          onClick={onSelect}
        >
          <ElementIcon
            name={row.name}
            props={row.props}
            className="size-3.5 shrink-0"
          />
          <span className={cn("truncate", !entry && "text-muted-foreground")}>
            {row.label}
          </span>
        </button>
        <RowAction
          name={row.name}
          label={row.label}
          animated={Boolean(entry)}
          onAdd={onAdd}
          onRemove={onRemove}
        />
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
        {entry ? (
          <TimelineBar
            entry={entry}
            pxPerMs={pxPerMs}
            selected={selected}
            onEdit={onEditBar}
            onKeyDown={onNudgeBar}
          />
        ) : (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground/70">
            No animation
          </span>
        )}
      </div>
    </SortableItem>
  )
}

export { TimelineRow }
