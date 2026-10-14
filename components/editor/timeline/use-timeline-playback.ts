import * as React from "react"

import { trackPointer } from "@/lib/editor/geometry"
import { usePreview } from "@/lib/editor/stores/preview-store"
import {
  PLAY_TAIL_MS,
  SCRUB_STEP_LARGE_MS,
  SCRUB_STEP_MS,
} from "@/components/editor/timeline/constants"

export function useTimelinePlayback({
  durationMs,
  pxPerMs,
}: {
  durationMs: number
  pxPerMs: number
}) {
  const mode = usePreview((state) => state.mode)
  const time = usePreview((state) => state.time)
  const startedAt = usePreview((state) => state.startedAt)
  const playAnimationPreview = usePreview((state) => state.play)
  const scrubAnimationPreview = usePreview((state) => state.scrub)
  const stopAnimationPreview = usePreview((state) => state.stop)
  const [clock, setClock] = React.useState(0)
  const rulerRef = React.useRef<HTMLDivElement | null>(null)

  const playing = mode === "play"
  const playhead = mode === "scrub" ? time : clock

  React.useEffect(() => {
    if (mode !== "play") return
    let frame = 0
    const tick = () => {
      setClock(Math.min(performance.now() - startedAt, durationMs))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [mode, startedAt, durationMs])

  React.useEffect(() => stopAnimationPreview, [stopAnimationPreview])

  const reset = () => {
    stopAnimationPreview()
    setClock(0)
  }

  const togglePlay = () => {
    if (playing) {
      stopAnimationPreview()
      return
    }
    setClock(0)
    playAnimationPreview(durationMs + PLAY_TAIL_MS)
  }

  const scrubToMs = (ms: number) => {
    const clamped = Math.min(Math.max(ms, 0), durationMs)
    setClock(clamped)
    scrubAnimationPreview(clamped)
  }

  const scrubToX = (clientX: number) => {
    const left = rulerRef.current?.getBoundingClientRect().left ?? 0
    scrubToMs((clientX - left) / pxPerMs)
  }

  const startScrub = (event: React.PointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    scrubToX(event.clientX)
    trackPointer((move) => scrubToX(move.clientX), undefined, event.pointerId)
  }

  const scrubKey = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? SCRUB_STEP_LARGE_MS : SCRUB_STEP_MS
    const next =
      event.key === "ArrowRight"
        ? playhead + step
        : event.key === "ArrowLeft"
          ? playhead - step
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? durationMs
              : null
    if (next === null) return
    event.preventDefault()
    scrubToMs(next)
  }

  return {
    rulerRef,
    playhead,
    playing,
    reset,
    togglePlay,
    startScrub,
    scrubKey,
  }
}
