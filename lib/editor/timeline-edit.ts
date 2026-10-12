import type { ElementAnimation, TimelineEntry } from "@/lib/editor/animation"

export const MIN_DURATION = 100
export const TIME_STEP = 50

/** Rounds a time to the grid; `step` of 0 leaves it exact. */
export const snapTime = (ms: number, step = TIME_STEP) =>
  step > 0 ? Math.round(ms / step) * step : Math.round(ms)

/** What the trigger measures the delay from: 0, or the previous animation. */
const base = (entry: TimelineEntry) => entry.start - entry.animation.delay

/** Emphasis animations repeat; their bar covers every cycle. */
const cycles = (entry: TimelineEntry) =>
  entry.animation.duration > 0
    ? Math.max(
        1,
        Math.round((entry.end - entry.start) / entry.animation.duration)
      )
    : 1

/** Drag the whole bar: only the delay changes. */
export function moveBar(entry: TimelineEntry, startMs: number) {
  return { delay: Math.max(0, snapTime(startMs) - base(entry)) }
}

/** Drag the right edge: only the duration changes (per cycle). */
export function resizeBarEnd(entry: TimelineEntry, endMs: number) {
  const total = Math.max(
    snapTime(endMs) - entry.start,
    MIN_DURATION * cycles(entry)
  )
  return { duration: snapTime(total / cycles(entry)) }
}

/** Drag the left edge: the end stays put, so delay and duration both change. */
export function resizeBarStart(entry: TimelineEntry, startMs: number) {
  const latest = entry.end - MIN_DURATION * cycles(entry)
  const start = Math.min(Math.max(snapTime(startMs), base(entry)), latest)
  return {
    delay: start - base(entry),
    duration: snapTime((entry.end - start) / cycles(entry)),
  }
}

/**
 * Orders element ids for animation: those in `saved` first, in that order,
 * then any others in their layer order (so new elements join the end).
 */
export function orderIds(layerIds: string[], saved: string[] = []) {
  const present = new Set(layerIds)
  const listed = saved.filter(
    (id, index) => present.has(id) && saved.indexOf(id) === index
  )
  const listedSet = new Set(listed)
  return [...listed, ...layerIds.filter((id) => !listedSet.has(id))]
}

/** Which part of a bar is being dragged. */
export type BarEditMode = "move" | "start" | "end"

/** The animation change for dragging a bar's `mode` by `deltaMs`. */
export function editBar(
  entry: TimelineEntry,
  mode: BarEditMode,
  deltaMs: number
): Partial<ElementAnimation> {
  if (mode === "move") return moveBar(entry, entry.start + deltaMs)
  if (mode === "end") return resizeBarEnd(entry, entry.end + deltaMs)
  return resizeBarStart(entry, entry.start + deltaMs)
}

export const formatTime = (ms: number) => `${(ms / 1000).toFixed(2)}s`
