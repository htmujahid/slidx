import * as React from "react"

import { trackPointer } from "@/lib/editor/geometry"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { useSlides } from "@/components/editor/slides-context"
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
  const {
    animationPreview,
    playAnimationPreview,
    scrubAnimationPreview,
    stopAnimationPreview,
  } = useEditorLayout()
  const { activeId } = useSlides()
  const [clock, setClock] = React.useState(0)
  const rulerRef = React.useRef<HTMLDivElement | null>(null)

  const playing = animationPreview.mode === "play"
  const playhead =
    animationPreview.mode === "scrub" ? animationPreview.time : clock

  React.useEffect(() => {
    if (animationPreview.mode !== "play") return
    let frame = 0
    const tick = () => {
      setClock(
        Math.min(performance.now() - animationPreview.startedAt, durationMs)
      )
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animationPreview.mode, animationPreview.startedAt, durationMs])

  React.useEffect(() => {
    stopAnimationPreview()
    return stopAnimationPreview
  }, [activeId, stopAnimationPreview])

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
