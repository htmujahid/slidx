import { usePlaybackTime } from "../playback-context"
import { RAIL_WIDTH_PX } from "./constants"
import { useTimeline } from "./timeline-context"

export function Playhead() {
  const time = usePlaybackTime()
  const { pxPerSecond } = useTimeline()

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-primary"
      style={{ left: RAIL_WIDTH_PX + time * pxPerSecond }}
    >
      <div className="absolute top-0 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-primary" />
    </div>
  )
}
