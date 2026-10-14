import * as React from "react"
import { useEditor } from "@craftjs/core"

import { resolveTiming } from "@/lib/editor/animation/timing"
import type { AnimationEasing } from "@/lib/editor/easing"
import { trackPointer } from "@/lib/editor/geometry"
import {
  keyframeIndexAt,
  moveKeyframe,
  removeKeyframeAt,
  setKeyframeAt,
  setKeyframeEasing,
} from "@/lib/editor/keyframes"
import { snapTime } from "@/lib/editor/timeline-edit"
import { restValue } from "@/lib/editor/tracks/properties"
import {
  type AnimationTrack,
  type ElementValues,
  type TrackProperty,
} from "@/lib/editor/tracks/types"
import {
  NUDGE_LARGE_MS,
  NUDGE_MS,
} from "@/components/editor/timeline/constants"

export function useKeyframeEditing({
  id,
  tracks,
  values,
  playhead,
  pxPerMs,
  durationMs,
}: {
  id: string
  tracks: AnimationTrack[]
  values: ElementValues
  playhead: number
  pxPerMs: number
  durationMs: number
}) {
  const { actions } = useEditor()

  const write = (next: AnimationTrack[], merge = false) =>
    (merge ? actions.history.throttle(400) : actions).setProp(id, (props) => {
      props.timing = {
        ...resolveTiming(props.timing),
        tracks: next.filter((track) => track.keyframes.length > 0),
      }
    })

  const trackOf = (property: TrackProperty) =>
    tracks.find((track) => track.property === property)
  const sortedPoints = (property: TrackProperty) =>
    [...(trackOf(property)?.keyframes ?? [])].sort((a, b) => a.at - b.at)
  const moment = () => Math.min(Math.max(snapTime(playhead), 0), durationMs)

  const toggle = (property: TrackProperty) => {
    const at = moment()
    write(
      keyframeIndexAt(trackOf(property), at) >= 0
        ? removeKeyframeAt(tracks, property, at)
        : setKeyframeAt(tracks, property, at, restValue(property, values))
    )
  }

  const setValue = (property: TrackProperty, value: number) =>
    write(
      setKeyframeAt(
        tracks,
        property,
        moment(),
        restValue(property, values),
        value
      ),
      true
    )

  const setEasing = (
    property: TrackProperty,
    index: number,
    easing: AnimationEasing
  ) => write(setKeyframeEasing(tracks, property, index, easing))

  const startDrag = (
    event: React.PointerEvent,
    property: TrackProperty,
    index: number,
    onGrab?: () => void
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    onGrab?.()
    const origin = event.clientX
    const from = sortedPoints(property)[index]?.at
    if (from === undefined) return
    const snapshot = tracks
    trackPointer(
      (move) =>
        write(
          moveKeyframe(
            snapshot,
            property,
            index,
            snapTime(from + (move.clientX - origin) / pxPerMs),
            durationMs
          ),
          true
        ),
      undefined,
      event.pointerId
    )
  }

  const remove = (property: TrackProperty, index: number) => {
    const point = sortedPoints(property)[index]
    if (point) write(removeKeyframeAt(tracks, property, point.at))
  }

  const keyDown = (
    event: React.KeyboardEvent,
    property: TrackProperty,
    index: number
  ) => {
    const point = sortedPoints(property)[index]
    if (!point) return
    const direction =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault()
      event.stopPropagation()
      remove(property, index)
    } else if (direction) {
      event.preventDefault()
      event.stopPropagation()
      const step = event.shiftKey ? NUDGE_LARGE_MS : NUDGE_MS
      write(
        moveKeyframe(
          tracks,
          property,
          index,
          point.at + direction * step,
          durationMs
        ),
        true
      )
    }
  }

  return {
    trackOf,
    toggle,
    setValue,
    setEasing,
    startDrag,
    remove,
    keyDown,
    clear: () => write([]),
  }
}
