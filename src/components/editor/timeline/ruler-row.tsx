import { usePlayback } from "../playback-context"
import { useTimeline } from "./timeline-context"
import { RailCell } from "./rail-cell"

export function RulerRow({ laneWidth }: { laneWidth: number }) {
  const { pxPerSecond } = useTimeline()
  const { duration, seek } = usePlayback()

  const step = pxPerSecond >= 60 ? 1 : pxPerSecond >= 25 ? 2 : 5
  const markers = Array.from(
    { length: Math.floor(duration / step) + 1 },
    (_, i) => i * step
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const lane = event.currentTarget
    const scrub = (clientX: number) => {
      const rect = lane.getBoundingClientRect()
      seek(
        Math.min(Math.max(0, (clientX - rect.left) / pxPerSecond), duration)
      )
    }
    scrub(event.clientX)
    const onMove = (e: PointerEvent) => scrub(e.clientX)
    const onUp = () => window.removeEventListener("pointermove", onMove)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp, { once: true })
  }

  return (
    <div className="flex h-8 border-b">
      <RailCell />
      <div
        className="relative h-full cursor-ew-resize touch-none"
        style={{ width: laneWidth }}
        onPointerDown={handlePointerDown}
      >
        {markers.map((seconds) => (
          <div
            key={seconds}
            className="pointer-events-none absolute inset-y-0 flex flex-col justify-end"
            style={{ left: seconds * pxPerSecond }}
          >
            <span className="pl-1 font-mono text-[10px] text-muted-foreground tabular-nums">
              {seconds}s
            </span>
            <div className="h-1.5 w-px bg-border" />
          </div>
        ))}
      </div>
    </div>
  )
}
