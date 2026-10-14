import { chartBuildCss } from "@/lib/editor/animation/chart-build"
import {
  DRAW_FILL_FRAMES,
  DRAW_STROKE_FRAMES,
} from "@/lib/editor/animation/frames"
import {
  PRESETS_BY_ID,
  type PresetDefinition,
} from "@/lib/editor/animation/presets"
import type { TimelineEntry } from "@/lib/editor/animation/timeline"
import { EASINGS } from "@/lib/editor/easing"
import { compileTracks } from "@/lib/editor/tracks/compile"

const MAX_TYPEWRITER_STEPS = 80

export type AnimationParts = {
  classes: Record<string, string>
  keyframes: Map<string, string>
  registrations: Map<string, string>
  wrapper: Map<string, string[]>
  declared: Map<string, string[]>
  strokes: Map<string, string[]>
  drawn: Map<string, string[]>
  chartPieces: Map<string, { declarations: Set<string>; animations: string[] }>
}

export type EntryContext = {
  scope: string
  durationMs: number
  at: (ms: number) => number
}

export function createParts(): AnimationParts {
  return {
    classes: {},
    keyframes: new Map(),
    registrations: new Map(),
    wrapper: new Map(),
    declared: new Map(),
    strokes: new Map(),
    drawn: new Map(),
    chartPieces: new Map(),
  }
}

const push = (map: Map<string, string[]>, id: string, value: string) =>
  map.set(id, [...(map.get(id) ?? []), value])

const stepCount = (text = "") =>
  Math.min(
    Math.max(Array.from(text.replace(/\s+/g, " ").trim()).length, 4),
    MAX_TYPEWRITER_STEPS
  )

function visibilityFrames(entry: TimelineEntry, durationMs: number) {
  const states = new Map<number, "visible" | "hidden">([[0, "hidden"]])
  for (const span of entry.spans) {
    states.set(span.start, "visible")
    if (span.end < durationMs) states.set(span.end, "hidden")
  }
  const times = [...states.keys()].sort((a, b) => a - b)
  const last = states.get(times[times.length - 1])!
  const frame = (percent: number, state: string) =>
    `${+percent.toFixed(4)}%{visibility:${state};animation-timing-function:step-end}`
  return [
    ...times.map((time) => frame((time / durationMs) * 100, states.get(time)!)),
    ...(times[times.length - 1] < durationMs ? [frame(100, last)] : []),
  ].join("")
}

export function addTracks(
  parts: AnimationParts,
  entry: TimelineEntry,
  { scope, durationMs, at }: EntryContext
) {
  if (entry.tracks.length === 0) return
  const compiled = compileTracks({
    scope,
    id: entry.id,
    tracks: entry.tracks,
    values: entry.values ?? {},
    durationMs,
    delay: at(0),
  })
  for (const [name, body] of compiled.keyframes) parts.keyframes.set(name, body)
  for (const [name, body] of compiled.registrations)
    parts.registrations.set(name, body)
  for (const value of compiled.animations) push(parts.wrapper, entry.id, value)
  for (const value of compiled.declarations)
    push(parts.declared, entry.id, value)
  for (const value of compiled.drawn) push(parts.strokes, entry.id, value)
}

export function addVisibility(
  parts: AnimationParts,
  entry: TimelineEntry,
  { scope, durationMs, at }: EntryContext
) {
  const visible =
    entry.spans.length === 1 &&
    entry.spans[0].start === 0 &&
    entry.spans[0].toEnd
  if (visible) return
  const name = `vx-${scope}-visible-${entry.id}`
  parts.keyframes.set(name, visibilityFrames(entry, durationMs))
  push(
    parts.wrapper,
    entry.id,
    `${name} ${durationMs}ms linear ${at(0)}ms 1 forwards`
  )
}

export function addTransitions(
  parts: AnimationParts,
  entry: TimelineEntry,
  { scope, at }: EntryContext
) {
  const className = parts.classes[entry.id]
  entry.spans.forEach((span, index) => {
    const sides = [
      { side: "enter", transition: span.enter },
      { side: "exit", transition: span.exit },
    ] as const
    for (const { side, transition } of sides) {
      if (transition.preset === "none") continue
      const definition =
        PRESETS_BY_ID[transition.preset as PresetDefinition["id"]]
      const duration = Math.min(transition.duration, span.end - span.start)
      const start = side === "enter" ? span.start : span.end - duration
      const easing = definition.stepped
        ? `steps(${stepCount(entry.text)},end)`
        : EASINGS[transition.easing].css
      const fill =
        side === "enter"
          ? index === 0
            ? "backwards"
            : "none"
          : span.toEnd && index === entry.spans.length - 1
            ? "forwards"
            : "none"
      const timing = `${duration}ms ${easing} ${at(start)}ms 1 ${fill}`

      if (definition.frames) {
        const name = `vx-${scope}-${definition.id}`
        parts.keyframes.set(name, definition.frames)
        push(parts.wrapper, entry.id, `${name} ${timing}`)
      }
      if (definition.build && entry.chart) {
        const built = chartBuildCss(
          scope,
          `${entry.id}-${index}`,
          `.vx-${scope} .${className}`,
          entry.chart,
          {
            duration,
            easing,
            start: at(start),
            fill: fill as "backwards" | "none",
          }
        )
        for (const piece of built.pieces) {
          const merged = parts.chartPieces.get(piece.selector) ?? {
            declarations: new Set<string>(),
            animations: [] as string[],
          }
          if (piece.declarations) merged.declarations.add(piece.declarations)
          if (piece.animation) merged.animations.push(piece.animation)
          parts.chartPieces.set(piece.selector, merged)
        }
        for (const [name, body] of built.keyframes)
          parts.keyframes.set(name, body)
      }
      if (definition.draw) {
        const stroke = `vx-${scope}-draw-stroke`
        const fillName = `vx-${scope}-draw-fill`
        parts.keyframes.set(stroke, DRAW_STROKE_FRAMES)
        parts.keyframes.set(fillName, DRAW_FILL_FRAMES)
        push(parts.drawn, entry.id, `${stroke} ${timing}`)
        push(parts.drawn, entry.id, `${fillName} ${timing}`)
      }
    }
  })
}
