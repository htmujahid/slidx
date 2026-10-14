import { PRESETS_BY_ID } from "@/lib/editor/animation/presets"
import {
  MIN_VISIBLE_MS,
  resolveTiming,
  type ElementSpan,
  type ElementTiming,
  type Transition,
  type TransitionSide,
} from "@/lib/editor/animation/timing"
import type { ChartKind } from "@/lib/editor/chart"
import type { AnimationTrack, ElementValues } from "@/lib/editor/tracks/types"

export type ChartMeta = { kind: ChartKind; categories: number }

export type TimelineInput = {
  id: string
  name: string
  timing?: Partial<ElementTiming>
  text?: string
  chart?: ChartMeta
  values?: ElementValues
}

export type ResolvedSpan = Omit<ElementSpan, "end"> & {
  end: number
  toEnd: boolean
}

export type TimelineEntry = {
  id: string
  name: string
  spans: ResolvedSpan[]
  tracks: AnimationTrack[]
  values?: ElementValues
  text?: string
  chart?: ChartMeta
}

export function buildTimeline(inputs: TimelineInput[], durationMs: number) {
  const entries: TimelineEntry[] = inputs.map((input) => {
    const timing = resolveTiming(input.timing)
    const valid = (side: TransitionSide, transition: Transition) => {
      const definition =
        transition.preset === "none"
          ? undefined
          : PRESETS_BY_ID[transition.preset]
      return definition &&
        definition.group === side &&
        (!definition.only || definition.only.includes(input.name))
        ? transition
        : { ...transition, preset: "none" as const }
    }
    const spans: ResolvedSpan[] = []
    let floor = 0
    for (const span of [...timing.spans].sort((a, b) => a.start - b.start)) {
      const start = Math.min(
        Math.max(span.start, floor),
        Math.max(durationMs - MIN_VISIBLE_MS, 0)
      )
      const end =
        span.end === null
          ? durationMs
          : Math.min(Math.max(span.end, start + MIN_VISIBLE_MS), durationMs)
      if (end <= start) continue
      spans.push({
        start,
        end,
        toEnd: span.end === null || end >= durationMs,
        enter: valid("enter", span.enter),
        exit: valid("exit", span.exit),
      })
      floor = end
    }
    return {
      id: input.id,
      name: input.name,
      spans,
      tracks: timing.tracks,
      values: input.values,
      text: input.text,
      chart: input.chart,
    }
  })
  return { entries, durationMs }
}

export type Timeline = ReturnType<typeof buildTimeline>

export const isTimed = (entry: TimelineEntry, durationMs: number) =>
  entry.tracks.length > 0 ||
  entry.spans.length !== 1 ||
  entry.spans[0].start > 0 ||
  entry.spans[0].end < durationMs ||
  entry.spans[0].enter.preset !== "none" ||
  entry.spans[0].exit.preset !== "none"
