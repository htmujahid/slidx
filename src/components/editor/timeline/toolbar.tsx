import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  MagnetIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TIMELINE_MAX_DURATION } from "../data"
import { usePlayback } from "../playback-context"
import {
  MAX_PX_PER_SECOND,
  MIN_PX_PER_SECOND,
  RAIL_WIDTH_PX,
} from "./constants"
import { useTimeline } from "./timeline-context"

export function TimelineToolbar() {
  const { snap, setSnap, pxPerSecond, setPxPerSecond, rootRef } = useTimeline()
  const { duration, setDuration } = usePlayback()
  const { actions, selectedId, deletable } = useEditor((_state, query) => {
    const id = query.getEvent("selected").first()
    return {
      selectedId: id,
      deletable: !!id && id !== ROOT_NODE && query.node(id).isDeletable(),
    }
  })

  const fit = () => {
    const root = rootRef.current
    if (!root) return
    const available = root.clientWidth - RAIL_WIDTH_PX - 16
    setPxPerSecond(
      Math.min(
        Math.max(available / duration, MIN_PX_PER_SECOND),
        MAX_PX_PER_SECOND
      )
    )
  }

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b px-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!deletable}
              onClick={() => selectedId && actions.delete(selectedId)}
            >
              <Trash2Icon />
              <span className="sr-only">Delete selected</span>
            </Button>
          }
        />
        <TooltipContent>Delete selected track or clip</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              size="sm"
              aria-label="Toggle snapping"
              pressed={snap}
              onPressedChange={setSnap}
            >
              <MagnetIcon />
            </Toggle>
          }
        />
        <TooltipContent>Snap clips to 0.5s grid</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={TIMELINE_MAX_DURATION}
            value={duration}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (!Number.isNaN(next) && next > 0) {
                setDuration(Math.min(next, TIMELINE_MAX_DURATION))
              }
            }}
            aria-label="Timeline duration in seconds"
            className="h-7 w-16 text-right font-mono text-xs"
          />
          <span className="text-xs text-muted-foreground">s</span>
        </div>

        <ZoomOutIcon className="size-3.5 text-muted-foreground" />
        <div className="w-48">
          <Slider
            value={pxPerSecond}
            min={MIN_PX_PER_SECOND}
            max={MAX_PX_PER_SECOND}
            onValueChange={(value) =>
              setPxPerSecond(Array.isArray(value) ? value[0] : value)
            }
            aria-label="Timeline zoom"
          />
        </div>
        <ZoomInIcon className="size-3.5 text-muted-foreground" />
        <Button variant="outline" size="xs" onClick={fit}>
          Fit
        </Button>
      </div>
    </div>
  )
}
