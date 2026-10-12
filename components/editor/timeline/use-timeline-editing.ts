import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"

import {
  DEFAULT_TIMING,
  resolveTiming,
  type AnimationEasing,
  type AnimationPreset,
  type ElementSpan,
  type TimelineEntry,
  type TransitionSide,
} from "@/lib/editor/animation"
import { trackPointer } from "@/lib/editor/geometry"
import {
  moveSpan,
  removeSpan,
  snapTime,
  splitAt,
  transitionDuration,
  trimEnd,
  trimStart,
  setTransition as withTransition,
  type SpanEdge,
} from "@/lib/editor/timeline-edit"
import {
  NUDGE_LARGE_MS,
  NUDGE_MS,
} from "@/components/editor/timeline/constants"

/** Every change the timeline makes to the slide: spans, transitions, length. */
export function useTimelineEditing({
  pxPerMs,
  durationMs,
}: {
  pxPerMs: number
  durationMs: number
}) {
  const { actions } = useEditor()

  // Dragging produces a stream of changes, merged into one undo step.
  const writeSpans = (id: string, spans: ElementSpan[], merge = true) =>
    (merge ? actions.history.throttle(400) : actions).setProp(id, (props) => {
      props.timing = { ...resolveTiming(props.timing), spans }
    })

  const trimmed = (
    entry: TimelineEntry,
    index: number,
    edge: SpanEdge,
    ms: number
  ) =>
    edge === "start"
      ? trimStart(entry, index, ms)
      : trimEnd(entry, index, ms, durationMs)

  const startTrim = (
    event: React.PointerEvent,
    entry: TimelineEntry,
    index: number,
    edge: SpanEdge
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    actions.selectNode(entry.id)
    const origin = event.clientX
    const span = entry.spans[index]
    const from = edge === "start" ? span.start : span.end
    trackPointer(
      (move) =>
        writeSpans(
          entry.id,
          trimmed(entry, index, edge, from + (move.clientX - origin) / pxPerMs)
        ),
      undefined,
      event.pointerId
    )
  }

  /** Drag a whole span along the timeline. */
  const startMove = (
    event: React.PointerEvent,
    entry: TimelineEntry,
    index: number
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    actions.selectNode(entry.id)
    const origin = event.clientX
    const from = entry.spans[index].start
    trackPointer(
      (move) =>
        writeSpans(
          entry.id,
          moveSpan(
            entry,
            index,
            from + (move.clientX - origin) / pxPerMs,
            durationMs
          )
        ),
      undefined,
      event.pointerId
    )
  }

  const nudgeSpan = (
    event: React.KeyboardEvent,
    entry: TimelineEntry,
    index: number
  ) => {
    const direction =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (!direction) return
    event.preventDefault()
    event.stopPropagation()
    const step = event.shiftKey ? NUDGE_LARGE_MS : NUDGE_MS
    writeSpans(
      entry.id,
      moveSpan(
        entry,
        index,
        entry.spans[index].start + direction * step,
        durationMs
      )
    )
  }

  const nudgeEdge = (
    event: React.KeyboardEvent,
    entry: TimelineEntry,
    index: number,
    edge: SpanEdge
  ) => {
    const direction =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (!direction) return
    event.preventDefault()
    event.stopPropagation()
    const step = event.shiftKey ? NUDGE_LARGE_MS : NUDGE_MS
    const span = entry.spans[index]
    const from = edge === "start" ? span.start : span.end
    writeSpans(entry.id, trimmed(entry, index, edge, from + direction * step))
  }

  const setTransition = (
    entry: TimelineEntry,
    index: number,
    side: TransitionSide,
    preset: AnimationPreset
  ) => {
    actions.selectNode(entry.id)
    writeSpans(entry.id, withTransition(entry, index, side, { preset }), false)
  }

  const setEasing = (
    entry: TimelineEntry,
    index: number,
    side: TransitionSide,
    easing: AnimationEasing
  ) =>
    writeSpans(entry.id, withTransition(entry, index, side, { easing }), false)

  /** Drag the inner edge of a transition to change how long it takes. */
  const startTransitionDrag = (
    event: React.PointerEvent,
    entry: TimelineEntry,
    index: number,
    side: TransitionSide
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    actions.selectNode(entry.id)
    const origin = event.clientX
    const span = entry.spans[index]
    const from =
      side === "enter"
        ? span.start + span.enter.duration
        : span.end - span.exit.duration
    trackPointer(
      (move) =>
        writeSpans(
          entry.id,
          withTransition(entry, index, side, {
            duration: transitionDuration(
              entry,
              index,
              side,
              from + (move.clientX - origin) / pxPerMs
            ),
          })
        ),
      undefined,
      event.pointerId
    )
  }

  /** Cuts the span under `ms` in two on every given element that has one there. */
  const split = (entries: TimelineEntry[], ms: number) => {
    for (const entry of entries) {
      const spans = splitAt(entry, ms)
      if (spans) writeSpans(entry.id, spans, false)
    }
  }

  const remove = (entry: TimelineEntry, index: number) => {
    const spans = removeSpan(entry, index)
    if (spans) writeSpans(entry.id, spans, false)
  }

  const resetTiming = (id: string) =>
    actions.setProp(id, (props) => {
      props.timing = DEFAULT_TIMING
    })

  const setDuration = (ms: number) =>
    actions.history.throttle(400).setProp(ROOT_NODE, (props) => {
      props.duration = Math.max(1000, snapTime(ms))
    })

  return {
    selectElement: (id: string) => actions.selectNode(id),
    startTrim,
    startMove,
    nudgeSpan,
    nudgeEdge,
    setTransition,
    setEasing,
    startTransitionDrag,
    split,
    remove,
    resetTiming,
    setDuration,
  }
}
