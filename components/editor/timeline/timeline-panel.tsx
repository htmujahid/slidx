"use client"

import * as React from "react"

import { Sortable } from "@/components/reui/sortable"
import { useEditorLayout } from "@/components/editor/editor-layout"
import {
  DEFAULT_ZOOM,
  LABEL_WIDTH,
  MIN_LENGTH_MS,
  ROW_HEIGHT,
  RULER_HEIGHT,
  TAIL_MS,
  ZOOMS,
} from "@/components/editor/timeline/constants"
import { TimelineHeader } from "@/components/editor/timeline/timeline-header"
import { TimelineRow } from "@/components/editor/timeline/timeline-row"
import { TimelineRuler } from "@/components/editor/timeline/timeline-ruler"
import { useTimelineData } from "@/components/editor/timeline/use-timeline-data"
import { useTimelineEditing } from "@/components/editor/timeline/use-timeline-editing"
import { useTimelinePlayback } from "@/components/editor/timeline/use-timeline-playback"

/**
 * Every animation on the slide laid out in time: a row per element, bars to
 * move and resize, a ruler to scrub, and a playhead to place new animations.
 */
function TimelinePanel() {
  const { setTimelineOpen } = useEditorLayout()
  const { rows, entries, timeline, selected } = useTimelineData()
  const [zoomIndex, setZoomIndex] = React.useState(DEFAULT_ZOOM)

  const pxPerMs = ZOOMS[zoomIndex] / 1000
  const lengthMs = Math.max(timeline.totalMs + TAIL_MS, MIN_LENGTH_MS)
  const trackWidth = lengthMs * pxPerMs

  const playback = useTimelinePlayback({
    totalMs: timeline.totalMs,
    lengthMs,
    pxPerMs,
  })
  const editing = useTimelineEditing({
    pxPerMs,
    playhead: playback.playhead,
    rowIds: rows.map((row) => row.id),
  })

  const hasRows = rows.length > 0

  return (
    <section
      aria-label="Timeline"
      className="flex h-full min-h-0 flex-col bg-background"
    >
      <TimelineHeader
        playing={playback.playing}
        canPlay={timeline.entries.length > 0}
        playheadMs={playback.playhead}
        totalMs={timeline.totalMs}
        canZoomOut={zoomIndex > 0}
        canZoomIn={zoomIndex < ZOOMS.length - 1}
        onTogglePlay={playback.togglePlay}
        onReset={playback.reset}
        onZoomOut={() => setZoomIndex((index) => index - 1)}
        onZoomIn={() => setZoomIndex((index) => index + 1)}
        onClose={() => setTimelineOpen(false)}
      />

      <div className="relative min-h-0 flex-1 overflow-auto">
        <div
          className="relative"
          style={{ width: LABEL_WIDTH + trackWidth, minWidth: "100%" }}
        >
          <TimelineRuler
            rulerRef={playback.rulerRef}
            trackWidth={trackWidth}
            pxPerMs={pxPerMs}
            lengthMs={lengthMs}
            playheadMs={playback.playhead}
            showPlayhead={hasRows}
            onPointerDown={playback.startScrub}
            onKeyDown={playback.scrubKey}
          />

          {hasRows ? (
            <Sortable
              value={rows}
              getItemValue={(row) => row.id}
              onValueChange={() => {}}
              onMove={editing.reorder}
              render={<div role="list" aria-label="Animation order" />}
            >
              {rows.map((row) => (
                <TimelineRow
                  key={row.id}
                  row={row}
                  entry={entries.get(row.id)}
                  selected={selected.includes(row.id)}
                  pxPerMs={pxPerMs}
                  trackWidth={trackWidth}
                  gridWidth={ZOOMS[zoomIndex]}
                  onSelect={() => editing.selectElement(row.id)}
                  onAdd={(preset) => editing.addAnimation(row.id, preset)}
                  onRemove={() => editing.removeAnimation(row.id)}
                  onEditBar={editing.startEdit}
                  onNudgeBar={editing.nudge}
                />
              ))}
            </Sortable>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              This slide has no elements to animate.
            </p>
          )}

          {hasRows && timeline.entries.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Press + on a row to add an animation, or pick a preset in the
              Animation section.
            </p>
          ) : null}

          {hasRows ? (
            <div
              data-timeline-playhead=""
              className="pointer-events-none absolute z-[5] w-px bg-primary"
              style={{
                left: LABEL_WIDTH + playback.playhead * pxPerMs,
                top: RULER_HEIGHT,
                height: rows.length * ROW_HEIGHT,
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { TimelinePanel }
