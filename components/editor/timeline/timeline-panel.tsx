"use client"

import * as React from "react"

import { isTimed, MIN_VISIBLE_MS } from "@/lib/editor/animation"
import { useEditorLayout } from "@/components/editor/editor-layout"
import {
  DEFAULT_ZOOM,
  LABEL_WIDTH,
  ROW_HEIGHT,
  RULER_HEIGHT,
  ZOOMS,
} from "@/components/editor/timeline/constants"
import { TimelineHeader } from "@/components/editor/timeline/timeline-header"
import { TimelineRow } from "@/components/editor/timeline/timeline-row"
import { TimelineRuler } from "@/components/editor/timeline/timeline-ruler"
import { useTimelineData } from "@/components/editor/timeline/use-timeline-data"
import { useTimelineEditing } from "@/components/editor/timeline/use-timeline-editing"
import { useTimelinePlayback } from "@/components/editor/timeline/use-timeline-playback"

/**
 * The slide laid out in time: a row per element showing when it is on the
 * slide, trim handles at each end, and the entrance and exit at the edges.
 */
function TimelinePanel() {
  const { setTimelineOpen, setKeyframeTarget } = useEditorLayout()
  const { rows, entries, timeline, selected } = useTimelineData()
  const [zoomIndex, setZoomIndex] = React.useState(DEFAULT_ZOOM)

  const { durationMs } = timeline
  const pxPerMs = ZOOMS[zoomIndex] / 1000
  const trackWidth = durationMs * pxPerMs

  const playback = useTimelinePlayback({ durationMs, pxPerMs })
  const editing = useTimelineEditing({ pxPerMs, durationMs })

  const hasRows = rows.length > 0
  const selectedEntries = selected
    .map((id) => entries.get(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const splittable = selectedEntries.filter((entry) =>
    entry.spans.some(
      (span) =>
        playback.playhead >= span.start + MIN_VISIBLE_MS &&
        playback.playhead <= span.end - MIN_VISIBLE_MS
    )
  )
  const canPlay = timeline.entries.some((entry) => isTimed(entry, durationMs))

  return (
    <section
      aria-label="Timeline"
      className="flex h-full min-h-0 flex-col bg-background"
    >
      <TimelineHeader
        playing={playback.playing}
        canPlay={canPlay}
        canSplit={splittable.length > 0}
        onSplit={() => editing.split(splittable, playback.playhead)}
        playheadMs={playback.playhead}
        durationMs={durationMs}
        canZoomOut={zoomIndex > 0}
        canZoomIn={zoomIndex < ZOOMS.length - 1}
        onTogglePlay={playback.togglePlay}
        onReset={playback.reset}
        onDurationChange={editing.setDuration}
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
            lengthMs={durationMs}
            playheadMs={playback.playhead}
            showPlayhead={hasRows}
            onPointerDown={playback.startScrub}
            onKeyDown={playback.scrubKey}
          />

          {hasRows ? (
            <div role="list" aria-label="Elements">
              {rows.map((row) => {
                const entry = entries.get(row.id)
                if (!entry) return null
                return (
                  <TimelineRow
                    key={row.id}
                    row={row}
                    entry={entry}
                    timed={isTimed(entry, durationMs)}
                    selected={selected.includes(row.id)}
                    pxPerMs={pxPerMs}
                    trackWidth={trackWidth}
                    gridWidth={ZOOMS[zoomIndex]}
                    onSelect={() => editing.selectElement(row.id)}
                    onReset={() => editing.resetTiming(row.id)}
                    onEditKeyframes={() => setKeyframeTarget(row.id)}
                    onMove={editing.startMove}
                    onNudgeSpan={editing.nudgeSpan}
                    onTrim={editing.startTrim}
                    onNudge={editing.nudgeEdge}
                    onTransition={editing.setTransition}
                    onEasing={editing.setEasing}
                    onTransitionDrag={editing.startTransitionDrag}
                    onRemove={editing.remove}
                  />
                )
              })}
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              This slide has no elements yet.
            </p>
          )}

          {hasRows ? (
            <p className="sticky left-0 w-fit px-3 py-2 text-xs text-muted-foreground">
              Drag a bar to move it and its ends to trim it. Right-click it to
              set an entrance or exit, then click that label to set its easing.
              Split cuts it in two. The diamond opens an element&apos;s property
              keyframes.
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
