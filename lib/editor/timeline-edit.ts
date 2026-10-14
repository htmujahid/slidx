import { type TimelineEntry } from "@/lib/editor/animation/timeline"
import {
  DEFAULT_SPAN,
  MIN_VISIBLE_MS,
  type ElementSpan,
  type TransitionSide,
} from "@/lib/editor/animation/timing"

export const MIN_TRANSITION_MS = 100
export const TIME_STEP = 50

export const snapTime = (ms: number, step = TIME_STEP) =>
  step > 0 ? Math.round(ms / step) * step : Math.round(ms)

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max))

export type SpanEdge = "start" | "end"

export const storedSpans = (entry: TimelineEntry): ElementSpan[] =>
  entry.spans.map(({ toEnd, end, ...span }) => ({
    ...span,
    end: toEnd ? null : end,
  }))

const replace = (
  entry: TimelineEntry,
  index: number,
  change: (span: ElementSpan) => ElementSpan
) =>
  storedSpans(entry).map((span, position) =>
    position === index ? change(span) : span
  )

export function trimStart(entry: TimelineEntry, index: number, ms: number) {
  const floor = entry.spans[index - 1]?.end ?? 0
  const start = clamp(
    snapTime(ms),
    floor,
    entry.spans[index].end - MIN_VISIBLE_MS
  )
  return replace(entry, index, (span) => ({ ...span, start }))
}

export function trimEnd(
  entry: TimelineEntry,
  index: number,
  ms: number,
  durationMs: number
) {
  const ceiling = entry.spans[index + 1]?.start ?? durationMs
  const end = clamp(
    snapTime(ms),
    entry.spans[index].start + MIN_VISIBLE_MS,
    ceiling
  )
  return replace(entry, index, (span) => ({
    ...span,
    end: end >= durationMs ? null : end,
  }))
}

export function moveSpan(
  entry: TimelineEntry,
  index: number,
  startMs: number,
  durationMs: number
) {
  const span = entry.spans[index]
  const length = span.end - span.start
  const floor = entry.spans[index - 1]?.end ?? 0
  const ceiling = entry.spans[index + 1]?.start ?? durationMs
  const start = clamp(snapTime(startMs), floor, ceiling - length)
  const end = start + length
  return replace(entry, index, (current) => ({
    ...current,
    start,
    end: end >= durationMs ? null : end,
  }))
}

export function transitionDuration(
  entry: TimelineEntry,
  index: number,
  side: TransitionSide,
  ms: number
) {
  const span = entry.spans[index]
  return clamp(
    snapTime(side === "enter" ? ms - span.start : span.end - ms),
    MIN_TRANSITION_MS,
    span.end - span.start
  )
}

export function setTransition(
  entry: TimelineEntry,
  index: number,
  side: TransitionSide,
  patch: Partial<ElementSpan["enter"]>
) {
  return replace(entry, index, (span) => ({
    ...span,
    [side]: { ...span[side], ...patch },
  }))
}

export function splitAt(entry: TimelineEntry, ms: number) {
  const at = snapTime(ms)
  const index = entry.spans.findIndex(
    (span) =>
      at >= span.start + MIN_VISIBLE_MS && at <= span.end - MIN_VISIBLE_MS
  )
  if (index < 0) return null
  const spans = storedSpans(entry)
  const span = spans[index]
  return [
    ...spans.slice(0, index),
    { ...span, end: at, exit: DEFAULT_SPAN.exit },
    { ...span, start: at, enter: DEFAULT_SPAN.enter },
    ...spans.slice(index + 1),
  ]
}

export function removeSpan(entry: TimelineEntry, index: number) {
  if (entry.spans.length < 2) return null
  return storedSpans(entry).filter((_, position) => position !== index)
}

export const formatTime = (ms: number) => `${(ms / 1000).toFixed(2)}s`
