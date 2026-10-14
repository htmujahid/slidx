import * as React from "react"

import { hasEasing, PRESET_LABELS } from "@/lib/editor/animation/presets"
import { type TimelineEntry } from "@/lib/editor/animation/timeline"
import { type TransitionSide } from "@/lib/editor/animation/timing"
import { EASINGS, type AnimationEasing } from "@/lib/editor/easing"
import { cn } from "@/lib/utils"
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

export function TransitionChip({
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
