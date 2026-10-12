import {
  type AnimationTrack,
  type Keyframe,
  type TrackProperty,
} from "@/lib/editor/tracks"

/** Keyframes closer together than this are the same moment. */
export const SAME_MOMENT_MS = 25

const byTime = (a: Keyframe, b: Keyframe) => a.at - b.at

/** A track's value at a moment: held before and after, linear between. */
export function valueAt(
  track: AnimationTrack | undefined,
  rest: number,
  ms: number
) {
  const points = [...(track?.keyframes ?? [])].sort(byTime)
  if (points.length === 0) return rest
  if (ms <= points[0].at) return points[0].value
  const last = points[points.length - 1]
  if (ms >= last.at) return last.value
  const index = points.findIndex((point) => point.at > ms)
  const [from, to] = [points[index - 1], points[index]]
  return (
    from.value + ((to.value - from.value) * (ms - from.at)) / (to.at - from.at)
  )
}

export const keyframeIndexAt = (
  track: AnimationTrack | undefined,
  ms: number
) =>
  [...(track?.keyframes ?? [])]
    .sort(byTime)
    .findIndex((point) => Math.abs(point.at - ms) < SAME_MOMENT_MS)

const withTrack = (
  tracks: AnimationTrack[],
  property: TrackProperty,
  change: (track: AnimationTrack) => AnimationTrack
) => {
  const existing = tracks.find((track) => track.property === property)
  const next = change(existing ?? { property, keyframes: [] })
  return existing
    ? tracks.map((track) => (track === existing ? next : track))
    : [...tracks, next]
}

/**
 * Sets a keyframe at a moment, adding it when the track has none there. A
 * new keyframe starts at the value the track already has at that moment, so
 * adding one changes nothing until it is edited.
 */
export function setKeyframeAt(
  tracks: AnimationTrack[],
  property: TrackProperty,
  ms: number,
  rest: number,
  value?: number
) {
  return withTrack(tracks, property, (track) => {
    const sorted = [...track.keyframes].sort(byTime)
    const index = keyframeIndexAt(track, ms)
    if (index >= 0) {
      return {
        ...track,
        keyframes: sorted.map((point, position) =>
          position === index && value !== undefined
            ? { ...point, value }
            : point
        ),
      }
    }
    const created: Keyframe = {
      at: ms,
      value: value ?? valueAt(track, rest, ms),
      easing: "ease-in-out",
    }
    return { ...track, keyframes: [...sorted, created] }
  })
}

/** Removes the keyframe at a moment; a track left with none is dropped. */
export function removeKeyframeAt(
  tracks: AnimationTrack[],
  property: TrackProperty,
  ms: number
) {
  return withTrack(tracks, property, (track) => {
    const index = keyframeIndexAt(track, ms)
    return {
      ...track,
      keyframes: [...track.keyframes]
        .sort(byTime)
        .filter((_, position) => position !== index),
    }
  }).filter((track) => track.keyframes.length > 0)
}

/** Moves one keyframe, keeping it between its neighbours and within the slide. */
export function moveKeyframe(
  tracks: AnimationTrack[],
  property: TrackProperty,
  index: number,
  ms: number,
  durationMs: number
) {
  return withTrack(tracks, property, (track) => {
    const sorted = [...track.keyframes].sort(byTime)
    const low = sorted[index - 1] ? sorted[index - 1].at + SAME_MOMENT_MS : 0
    const high = sorted[index + 1]
      ? sorted[index + 1].at - SAME_MOMENT_MS
      : durationMs
    const at = Math.min(Math.max(ms, low), Math.max(low, high))
    return {
      ...track,
      keyframes: sorted.map((point, position) =>
        position === index ? { ...point, at } : point
      ),
    }
  })
}

/** Sets how the animation eases from one keyframe to the next. */
export function setKeyframeEasing(
  tracks: AnimationTrack[],
  property: TrackProperty,
  index: number,
  easing: Keyframe["easing"]
) {
  return withTrack(tracks, property, (track) => ({
    ...track,
    keyframes: [...track.keyframes]
      .sort(byTime)
      .map((point, position) =>
        position === index ? { ...point, easing } : point
      ),
  }))
}
