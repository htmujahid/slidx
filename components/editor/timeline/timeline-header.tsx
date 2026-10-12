import {
  PlayIcon,
  RotateCcwIcon,
  ScissorsIcon,
  SquareIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { formatTime } from "@/lib/editor/timeline-edit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function TimelineHeader({
  playing,
  canPlay,
  canSplit,
  onSplit,
  playheadMs,
  durationMs,
  canZoomOut,
  canZoomIn,
  onTogglePlay,
  onReset,
  onDurationChange,
  onZoomOut,
  onZoomIn,
  onClose,
}: {
  playing: boolean
  canPlay: boolean
  canSplit: boolean
  onSplit: () => void
  playheadMs: number
  durationMs: number
  onDurationChange: (ms: number) => void
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
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Split selected layers at the playhead"
        title="Split at the playhead"
        disabled={!canSplit}
        onClick={onSplit}
      >
        <ScissorsIcon />
      </Button>
      <span
        aria-live="off"
        className="ml-1 min-w-24 text-xs text-muted-foreground tabular-nums"
      >
        {formatTime(playheadMs)} / {formatTime(durationMs)}
      </span>
      <label className="ml-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        Slide length
        <Input
          type="number"
          aria-label="Slide length in seconds"
          className="h-6 w-16 px-1.5 text-xs"
          min={1}
          step={0.5}
          value={+(durationMs / 1000).toFixed(2)}
          onChange={(event) => {
            const seconds = event.target.valueAsNumber
            if (!Number.isNaN(seconds)) onDurationChange(seconds * 1000)
          }}
        />
        s
      </label>
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
