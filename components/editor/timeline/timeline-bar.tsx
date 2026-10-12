import * as React from "react"

import {
  EASINGS,
  hasEasing,
  PRESET_LABELS,
  presetsFor,
  type AnimationEasing,
  type AnimationPreset,
  type TimelineEntry,
  type TransitionSide,
} from "@/lib/editor/animation"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MIN_CHIP_PX = 40

/**
 * The entrance or exit at one end of the bar, when it has one: its name, and
 * a handle on its inner edge that sets how long it takes. It is chosen from
 * the bar's context menu.
 */
function TransitionChip({
  side,
  entry,
  index,
  pxPerMs,
  barWidth,
  onEasing,
  onDragStart,
}: {
  side: TransitionSide
  entry: TimelineEntry
  /** Which of the element's spans this is. */
  index: number
  pxPerMs: number
  barWidth: number
  onEasing: (easing: AnimationEasing) => void
  onDragStart: (event: React.PointerEvent) => void
}) {
  const transition = entry.spans[index][side]
  if (transition.preset === "none") return null

  const width = Math.min(
    Math.max(transition.duration * pxPerMs, MIN_CHIP_PX),
    barWidth / 2 - 8
  )

  return (
    <div
      data-timeline-chip={side}
      aria-label={`${side === "enter" ? "Entrance" : "Exit"}: ${PRESET_LABELS[transition.preset]}`}
      title={`${PRESET_LABELS[transition.preset]}${hasEasing(transition.preset) ? ` · ${EASINGS[transition.easing].label} (click to change easing)` : ""}`}
      className={cn(
        "absolute inset-y-0.5 flex",
        side === "enter" ? "left-2" : "right-2 flex-row-reverse"
      )}
      style={{ width }}
    >
      {hasEasing(transition.preset) ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${PRESET_LABELS[transition.preset]} easing`}
            className="min-w-0 flex-1 cursor-pointer truncate rounded-sm bg-background px-1.5 text-left text-xs leading-5 text-foreground shadow-xs outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {PRESET_LABELS[transition.preset]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Easing</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={transition.easing}
                onValueChange={(value) => onEasing(value as AnimationEasing)}
              >
                {(Object.keys(EASINGS) as AnimationEasing[]).map((easing) => (
                  <DropdownMenuRadioItem
                    key={easing}
                    value={easing}
                    closeOnClick
                  >
                    {EASINGS[easing].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="pointer-events-none min-w-0 flex-1 truncate rounded-sm bg-background px-1.5 text-xs leading-5 text-foreground shadow-xs">
          {PRESET_LABELS[transition.preset]}
        </span>
      )}
      <span
        data-timeline-chip-handle={side}
        className="w-1.5 shrink-0 cursor-ew-resize rounded-sm bg-foreground/30 hover:bg-foreground/50"
        onPointerDown={onDragStart}
      />
    </div>
  )
}

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
      aria-label={`${edge === "start" ? "Appears" : "Disappears"} — ${label}`}
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

/**
 * One stretch of time an element is on the slide. Drag the bar to move it and
 * either end to trim it; the element is hidden outside. Right-click for the
 * entrance and exit that play at its ends.
 */
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
  /** Which of the element's spans this bar is. */
  index: number
  label: string
  /** The slide's own bar: it can't be moved, trimmed or removed. */
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
