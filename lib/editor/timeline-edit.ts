import {
  DEFAULT_SPAN,
  MIN_VISIBLE_MS,
  type ElementSpan,
  type TimelineEntry,
  type TransitionSide,
} from "@/lib/editor/animation"

export const MIN_TRANSITION_MS = 100
export const TIME_STEP = 50

/** Rounds a time to the grid; `step` of 0 leaves it exact. */
export const snapTime = (ms: number, step = TIME_STEP) =>
  step > 0 ? Math.round(ms / step) * step : Math.round(ms)

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max))

/** Which edge of a span. */
export type SpanEdge = "start" | "end"

/** The entry's spans as they are stored: a span to the slide's end has no end. */
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

/** Drag a span's left edge: it can't pass the span before or its own end. */
export function trimStart(entry: TimelineEntry, index: number, ms: number) {
  const floor = entry.spans[index - 1]?.end ?? 0
  const start = clamp(
    snapTime(ms),
    floor,
    entry.spans[index].end - MIN_VISIBLE_MS
  )
  return replace(entry, index, (span) => ({ ...span, start }))
}

/** Drag a span's right edge. The slide's end, reached by the last span, is no trim. */
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

/**
 * Drag a whole span: it keeps its length and stops at the span before, the
 * span after, and the slide's ends.
 */
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

/** How long a transition takes, from where its inner edge was dragged to. */
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

/**
 * Cuts the span at `ms` in two. The first keeps the entrance and the second
 * the exit, so the element looks the same until one of them is trimmed.
 */
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

/** Takes a span out, leaving a gap where the element is hidden. The last one stays. */
export function removeSpan(entry: TimelineEntry, index: number) {
  if (entry.spans.length < 2) return null
  return storedSpans(entry).filter((_, position) => position !== index)
}

export const formatTime = (ms: number) => `${(ms / 1000).toFixed(2)}s`
