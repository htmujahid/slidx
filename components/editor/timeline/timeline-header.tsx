import {
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { formatTime } from "@/lib/editor/timeline-edit"
import { Button } from "@/components/ui/button"

function TimelineHeader({
  playing,
  canPlay,
  playheadMs,
  totalMs,
  canZoomOut,
  canZoomIn,
  onTogglePlay,
  onReset,
  onZoomOut,
  onZoomIn,
  onClose,
}: {
  playing: boolean
  canPlay: boolean
  playheadMs: number
  totalMs: number
  canZoomOut: boolean
  canZoomIn: boolean
  onTogglePlay: () => void
  onReset: () => void
  onZoomOut: () => void
  onZoomIn: () => void
  onClose: () => void
}) {
  return (
    <header className="flex h-9 shrink-0 items-center gap-1 border-b px-2">
      <h2 className="mr-2 text-sm font-medium">Timeline</h2>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={playing ? "Stop" : "Play"}
        disabled={!canPlay}
        onClick={onTogglePlay}
      >
        {playing ? <SquareIcon /> : <PlayIcon />}
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Reset to the finished slide"
        onClick={onReset}
      >
        <RotateCcwIcon />
      </Button>
      <span
        aria-live="off"
        className="ml-1 min-w-24 text-xs text-muted-foreground tabular-nums"
      >
        {formatTime(playheadMs)} / {formatTime(totalMs)}
      </span>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Zoom out"
          disabled={!canZoomOut}
          onClick={onZoomOut}
        >
          <ZoomOutIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Zoom in"
          disabled={!canZoomIn}
          onClick={onZoomIn}
        >
          <ZoomInIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Close timeline"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>
    </header>
  )
}

export { TimelineHeader }
