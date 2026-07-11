import { useRef, useState } from "react"
import { ROOT_NODE } from "@craftjs/core"
import { LayersIcon } from "lucide-react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { usePlayback } from "../playback-context"
import { Playhead } from "./playhead"
import { RulerRow } from "./ruler-row"
import { TimelineToolbar } from "./toolbar"
import { useTimeline } from "./timeline-context"
import { TrackRow } from "./track-row"
import { useElementTracks } from "./use-element-tracks"

const RULER_HEIGHT_PX = 32
const ROW_HEIGHT_PX = 56

export function TimelineBody() {
  const { tracks, actions } = useElementTracks()
  const { pxPerSecond, rootRef } = useTimeline()
  const { duration } = usePlayback()
  const laneWidth = duration * pxPerSecond

  const draggedTrack = useRef<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const handleTrackDragOver = (event: React.DragEvent, index: number) => {
    if (!draggedTrack.current) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const before = event.clientY < rect.top + rect.height / 2
    setDropIndex(before ? index : index + 1)
  }

  const handleTrackDragEnd = () => {
    if (draggedTrack.current && dropIndex !== null) {
      actions.move(draggedTrack.current, ROOT_NODE, dropIndex)
    }
    draggedTrack.current = null
    setDropIndex(null)
  }

  return (
    <div ref={rootRef} className="flex h-full flex-col">
      <TimelineToolbar />

      <ScrollArea className="min-h-0 flex-1">
        <div className="relative w-fit min-w-full">
          <RulerRow laneWidth={laneWidth} />
          {tracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              laneWidth={laneWidth}
              onTrackDragStart={(id) => {
                draggedTrack.current = id
              }}
              onTrackDragOver={handleTrackDragOver}
              onTrackDragEnd={handleTrackDragEnd}
            />
          ))}

          {tracks.length === 0 ? (
            <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LayersIcon className="size-4" />
              Drop shapes on the canvas — each one becomes a track here.
            </div>
          ) : null}

          {dropIndex !== null ? (
            <div
              className="pointer-events-none absolute right-0 left-0 z-30 h-0.5 bg-primary"
              style={{ top: RULER_HEIGHT_PX + dropIndex * ROW_HEIGHT_PX - 1 }}
            />
          ) : null}

          <Playhead />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
