import * as React from "react"

import { formatTime } from "@/lib/editor/timeline-edit"
import {
  LABEL_WIDTH,
  RULER_HEIGHT,
} from "@/components/editor/timeline/constants"

const TICK_MS = 500

/** The seconds ruler, which is also the playhead's slider. */
function TimelineRuler({
  rulerRef,
  trackWidth,
  pxPerMs,
  lengthMs,
  playheadMs,
  showPlayhead,
  onPointerDown,
  onKeyDown,
}: {
  rulerRef: React.RefObject<HTMLDivElement | null>
  trackWidth: number
  pxPerMs: number
  lengthMs: number
  playheadMs: number
  showPlayhead: boolean
  onPointerDown: (event: React.PointerEvent) => void
  onKeyDown: (event: React.KeyboardEvent) => void
}) {
  const ticks = Array.from(
    { length: Math.floor(lengthMs / TICK_MS) + 1 },
    (_, index) => index * TICK_MS
  )

  return (
    <div className="sticky top-0 z-20 flex bg-background">
      <div
        className="sticky left-0 z-30 shrink-0 border-r border-b bg-background"
        style={{ width: LABEL_WIDTH, height: RULER_HEIGHT }}
      />
      <div
        ref={rulerRef}
        data-timeline-ruler=""
        role="slider"
        tabIndex={0}
        aria-label="Playhead position"
        aria-valuemin={0}
        aria-valuemax={Math.round(lengthMs)}
        aria-valuenow={Math.round(playheadMs)}
        aria-valuetext={formatTime(playheadMs)}
        className="relative shrink-0 cursor-col-resize border-b outline-none select-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ width: trackWidth, height: RULER_HEIGHT }}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        {ticks.map((ms) => (
          <div
            key={ms}
            className="absolute bottom-0 border-l border-border"
            style={{ left: ms * pxPerMs, height: ms % 1000 === 0 ? 12 : 6 }}
          >
            {ms % 1000 === 0 ? (
              <span className="absolute -top-4 left-1 text-[10px] text-muted-foreground tabular-nums">
                {ms / 1000}s
              </span>
            ) : null}
          </div>
        ))}
        {showPlayhead ? (
          <div
            data-timeline-playhead-head=""
            className="absolute bottom-0 h-3 w-3 -translate-x-1/2 rounded-b-sm bg-primary"
            style={{ left: playheadMs * pxPerMs }}
          />
        ) : null}
      </div>
    </div>
  )
}

export { TimelineRuler }
