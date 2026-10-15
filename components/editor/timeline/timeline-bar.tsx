import * as React from "react"

import { presetsFor } from "@/lib/editor/animation/presets"
import { type TimelineEntry } from "@/lib/editor/animation/timeline"
import {
  type AnimationPreset,
  type TransitionSide,
} from "@/lib/editor/animation/timing"
import { type AnimationEasing } from "@/lib/editor/easing"
import { formatTime, type SpanEdge } from "@/lib/editor/timeline-edit"
import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { TransitionChip } from "@/components/editor/timeline/transition-chip"

function EdgeHandle({
  edge,
  label,
  ms,
  onPointerDown,
  onKeyDown,
}: {
  edge: SpanEdge
  label: string
  ms: number
  onPointerDown: (event: React.PointerEvent) => void
  onKeyDown: (event: React.KeyboardEvent) => void
}) {
  return (
    <span
      role="slider"
      tabIndex={0}
      data-timeline-handle={edge}
      aria-label={`${edge === "start" ? "Appears" : "Disappears"} · ${label}`}
      aria-valuenow={Math.round(ms)}
      aria-valuetext={formatTime(ms)}
      className={cn(
        "absolute inset-y-0 z-10 w-2 cursor-ew-resize rounded-sm bg-foreground/25 outline-none hover:bg-foreground/50 focus-visible:ring-2 focus-visible:ring-ring",
        edge === "start" ? "left-0" : "right-0"
      )}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  )
}

function TransitionSubmenu({
  side,
  entry,
  index,
  onChange,
}: {
  side: TransitionSide
  entry: TimelineEntry
  index: number
  onChange: (preset: AnimationPreset) => void
}) {
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        {side === "enter" ? "Entrance" : "Exit"}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-48">
        <ContextMenuRadioGroup
          value={entry.spans[index][side].preset}
          onValueChange={(value) => onChange(value as AnimationPreset)}
        >
          <ContextMenuRadioItem value="none" closeOnClick>
            None
          </ContextMenuRadioItem>
          {presetsFor(entry.name, side).map((preset) => (
            <ContextMenuRadioItem
              key={preset.id}
              value={preset.id}
              closeOnClick
            >
              {preset.label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

function TimelineBar({
  entry,
  index,
  label,
  fixed,
  pxPerMs,
  onMove,
  onNudgeSpan,
  onTrim,
  onNudge,
  onTransition,
  onEasing,
  onTransitionDrag,
  onRemove,
}: {
  entry: TimelineEntry
  index: number
  label: string
  fixed?: boolean
  pxPerMs: number
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
  const span = entry.spans[index]
  const name = entry.spans.length > 1 ? `${label} (part ${index + 1})` : label
  const width = Math.max((span.end - span.start) * pxPerMs, 12)

  return (
    <ContextMenu>
      <ContextMenuTrigger
        role="group"
        tabIndex={0}
        data-timeline-bar={entry.id}
        data-span={index}
        aria-label={`${name}, on the slide from ${formatTime(span.start)} to ${formatTime(span.end)}`}
        className={cn(
          "absolute top-1 h-6 rounded-md border bg-secondary text-xs text-secondary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !fixed && "cursor-grab active:cursor-grabbing"
        )}
        style={{ left: span.start * pxPerMs, width }}
        onPointerDown={(event) => {
          if (fixed) return
          event.currentTarget.focus()
          onMove(event, entry, index)
        }}
        onKeyDown={(event) => {
          if (fixed || event.target !== event.currentTarget) return
          if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault()
            event.stopPropagation()
            onRemove(entry, index)
          } else {
            onNudgeSpan(event, entry, index)
          }
        }}
      >
        {fixed ? null : (
          <EdgeHandle
            edge="start"
            label={name}
            ms={span.start}
            onPointerDown={(event) => onTrim(event, entry, index, "start")}
            onKeyDown={(event) => onNudge(event, entry, index, "start")}
          />
        )}
        <TransitionChip
          side="enter"
          entry={entry}
          index={index}
          pxPerMs={pxPerMs}
          barWidth={width}
          onEasing={(easing) => onEasing(entry, index, "enter", easing)}
          onDragStart={(event) =>
            onTransitionDrag(event, entry, index, "enter")
          }
        />
        <TransitionChip
          side="exit"
          entry={entry}
          index={index}
          pxPerMs={pxPerMs}
          barWidth={width}
          onEasing={(easing) => onEasing(entry, index, "exit", easing)}
          onDragStart={(event) => onTransitionDrag(event, entry, index, "exit")}
        />
        {fixed ? null : (
          <EdgeHandle
            edge="end"
            label={name}
            ms={span.end}
            onPointerDown={(event) => onTrim(event, entry, index, "end")}
            onKeyDown={(event) => onNudge(event, entry, index, "end")}
          />
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <TransitionSubmenu
          side="enter"
          entry={entry}
          index={index}
          onChange={(preset) => onTransition(entry, index, "enter", preset)}
        />
        {fixed ? null : (
          <TransitionSubmenu
            side="exit"
            entry={entry}
            index={index}
            onChange={(preset) => onTransition(entry, index, "exit", preset)}
          />
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={fixed || entry.spans.length < 2}
          onClick={() => onRemove(entry, index)}
        >
          Delete part
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export { TimelineBar }
